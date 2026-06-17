from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
# pyrefly: ignore [missing-import]
from app.models import KidsLesson, UserKidsProgress, User, Streak
# pyrefly: ignore [missing-import]
from app.extensions import db
# pyrefly: ignore [missing-import]
from app.gamification import award_xp, award_coins
from datetime import datetime, date, timedelta
import os
import openai
import json
import random

kids_bp = Blueprint('kids', __name__, url_prefix='/api/kids')

openai_api_key = os.environ.get('OPENAI_API_KEY')
client = openai.OpenAI(api_key=openai_api_key) if openai_api_key else None

@kids_bp.route('/lessons', methods=['GET'])
@jwt_required()
def get_lessons():
    category = request.args.get('category', 'All')
    if category != 'All':
        lessons = KidsLesson.query.filter_by(category=category).all()
    else:
        lessons = KidsLesson.query.all()
        
    result = [{
        'id': l.id,
        'category': l.category,
        'title_en': l.title_en,
        'title_ta': l.title_ta,
        'content_data': l.content_data
    } for l in lessons]
    
    return jsonify(result), 200

@kids_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_lesson():
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}
    lesson_id = data.get('lesson_id')
    stars = data.get('stars_earned', 5)

    if not lesson_id:
        return jsonify({'message': 'lesson_id is required'}), 400

    lesson = KidsLesson.query.get(lesson_id)
    if not lesson:
        return jsonify({'message': 'Lesson not found'}), 404

    progress = UserKidsProgress.query.filter_by(user_id=current_user_id, lesson_id=lesson_id).first()
    if not progress:
        progress = UserKidsProgress(user_id=current_user_id, lesson_id=lesson_id, stars_earned=stars, is_completed=True)
        db.session.add(progress)
    else:
        progress.stars_earned = max(progress.stars_earned, stars)
        progress.is_completed = True
        progress.completed_at = datetime.utcnow()

    award_xp(current_user_id, 30)
    award_coins(current_user_id, 10)

    streak = Streak.query.filter_by(user_id=current_user_id).first()
    if not streak:
        streak = Streak(user_id=current_user_id, current_streak=1)
        db.session.add(streak)
    else:
        today = date.today()
        if streak.last_login_date is None or streak.last_login_date < today:
            yesterday = today - timedelta(days=1)
            if streak.last_login_date == yesterday:
                streak.current_streak += 1
                streak.highest_streak = max(streak.highest_streak, streak.current_streak)
            else:
                streak.current_streak = 1
            streak.last_login_date = today

    db.session.commit()

    return jsonify({
        'message': f'Lesson completed! +30 XP, +10 Coins, and +{stars} Stars awarded.',
        'xp_reward': 30,
        'coin_reward': 10,
        'stars_reward': stars,
        'streak': streak.current_streak if streak else 1
    }), 200

@kids_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    current_user_id = get_jwt_identity()
    
    user = User.query.get(int(current_user_id))
    profile = user.profile if user else None
    streak = user.streaks if user else None
    
    xp = profile.xp if profile else 0
    level = profile.level if profile else 1
    coins = profile.coins if profile else 0
    current_streak = streak.current_streak if streak else 0
    
    progress_list = UserKidsProgress.query.filter_by(user_id=current_user_id, is_completed=True).all()
    total_stars = sum([p.stars_earned for p in progress_list])
    
    recent_activity = []
    for p in progress_list[-5:]:
        l = KidsLesson.query.get(p.lesson_id)
        if l:
            recent_activity.append({
                'lesson_id': l.id,
                'title_en': l.title_en,
                'category': l.category,
                'stars': p.stars_earned,
                'completed_at': p.completed_at.isoformat()
            })
            
    categories = ['english', 'tamil', 'numbers', 'pictures']
    breakdown = {}
    for c in categories:
        total_category_lessons = KidsLesson.query.filter_by(category=c).count()
        completed_category_lessons = UserKidsProgress.query.join(KidsLesson).filter(
            UserKidsProgress.user_id == current_user_id,
            UserKidsProgress.is_completed == True,
            KidsLesson.category == c
        ).count()
        
        pct = int((completed_category_lessons / total_category_lessons * 100)) if total_category_lessons > 0 else 0
        breakdown[c] = {
            'total': total_category_lessons,
            'completed': completed_category_lessons,
            'percentage': pct
        }

    return jsonify({
        'xp': xp,
        'level': level,
        'coins': coins,
        'streak': current_streak,
        'total_stars': total_stars,
        'lessons_completed': len(progress_list),
        'recent_activity': recent_activity[::-1],
        'subject_breakdown': breakdown
    }), 200

@kids_bp.route('/ai-story', methods=['POST'])
@jwt_required()
def generate_story():
    data = request.get_json() or {}
    topic = data.get('topic', 'friendly dragon').strip()
    
    title_en = f"The Story of the {topic.title()}"
    title_ta = f"{topic} இன் குட்டி கதை"
    content_en = f"Once upon a time, there was a little {topic} who lived in a magical forest. The {topic} loved to pick fresh strawberries and share them with the birds. Together, they sang happy songs under the big old oak tree."
    content_ta = f"முன்னொரு காலத்தில், ஒரு மந்திரக் காட்டில் ஒரு சிறிய {topic} வாழ்ந்து வந்தது. அந்த {topic} புதிய ஸ்ட்ராபெர்ரிகளை பறித்து பறவைகளுடன் பகிர்ந்து கொள்ள விரும்பியது."
    
    if client:
        try:
            prompt_instruction = (
                f"Write a very short, cute kids story (about 80 words) in English and Tamil about '{topic}'. "
                f"Keep the language very simple, suitable for 5 year olds. "
                f"Format your response strictly as a JSON object with keys: "
                f"'title_en', 'title_ta', 'content_en', 'content_ta'."
            )
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "system", "content": prompt_instruction}],
                temperature=0.8
            )
            parsed = json.loads(response.choices[0].message.content)
            title_en = parsed.get('title_en', title_en)
            title_ta = parsed.get('title_ta', title_ta)
            content_en = parsed.get('content_en', content_en)
            content_ta = parsed.get('content_ta', content_ta)
        except Exception as e:
            print("Failed to contact OpenAI, using cute fallback template:", e)

    return jsonify({
        'title_en': title_en,
        'title_ta': title_ta,
        'content_en': content_en,
        'content_ta': content_ta
    }), 200
