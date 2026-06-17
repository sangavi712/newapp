from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
# pyrefly: ignore [missing-import]
from app.models import User, Vocabulary, DailyChallenge, Achievement, UserAchievement, UserVocabularyProgress, CodingProgress, StudyPlan
from datetime import date
# pyrefly: ignore [missing-import]
from app.extensions import db
# pyrefly: ignore [missing-import]
from app.gamification import award_xp

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

def check_and_unlock_achievements(user):
    user_id = user.id
    # Get current progress metrics
    words_learned_count = UserVocabularyProgress.query.filter_by(user_id=user_id).count()
    lessons_completed_count = CodingProgress.query.filter_by(user_id=user_id).count()
    current_streak = user.streaks.current_streak if user.streaks else 0
    
    # Get achievements already earned
    earned_achievements = UserAchievement.query.filter_by(user_id=user_id).all()
    earned_ids = {ua.achievement_id for ua in earned_achievements}
    
    all_ach = Achievement.query.all()
    
    for ach in all_ach:
        if ach.id in earned_ids:
            continue
            
        unlocked = False
        if ach.criteria == "1_words_learned" and words_learned_count >= 1:
            unlocked = True
        elif ach.criteria == "5_words_learned" and words_learned_count >= 5:
            unlocked = True
        elif ach.criteria == "1_lessons_completed" and lessons_completed_count >= 1:
            unlocked = True
        elif ach.criteria == "3_lessons_completed" and lessons_completed_count >= 3:
            unlocked = True
        elif ach.criteria == "streak_3" and current_streak >= 3:
            unlocked = True
            
        if unlocked:
            new_earned = UserAchievement(user_id=user_id, achievement_id=ach.id)
            db.session.add(new_earned)
            # Award XP
            award_xp(user_id, ach.xp_reward)
            
    db.session.commit()

@dashboard_bp.route('/', methods=['GET'])
@jwt_required()
def get_dashboard():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Auto-check achievements
    check_and_unlock_achievements(user)

    # Re-fetch user in case XP/level changed
    user = User.query.get(int(current_user_id))

    # Dummy data for daily words - in production this would come from a tailored query
    daily_words = Vocabulary.query.limit(5).all()
    words_data = [{'id': w.id, 'word': w.word, 'category': w.category} for w in daily_words]
    
    daily_challenge = DailyChallenge.query.first()

    today = date.today()
    existing_plan = StudyPlan.query.filter_by(user_id=current_user_id, date=today).first()

    return jsonify({
        'user': {
            'username': user.username,
            'level': user.profile.level,
            'xp': user.profile.xp,
            'avatar': user.profile.avatar_url
        },
        'streak': user.streaks.current_streak if user.streaks else 0,
        'knowledge_tree': {
            'stage': user.knowledge_tree.stage if user.knowledge_tree else 1,
            'points': user.knowledge_tree.growth_points if user.knowledge_tree else 0
        },
        'daily_words': words_data,
        'daily_challenge': {
            'description': daily_challenge.description if daily_challenge else "Complete a coding lesson today!",
            'xp_reward': daily_challenge.xp_reward if daily_challenge else 50
        },
        'study_plan': existing_plan.plan_data if existing_plan else None
    }), 200

@dashboard_bp.route('/achievements', methods=['GET'])
@jwt_required()
def get_achievements():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    check_and_unlock_achievements(user)
    
    all_achievements = Achievement.query.all()
    earned_ach_ids = {ua.achievement_id for ua in UserAchievement.query.filter_by(user_id=current_user_id).all()}
    
    achievements_data = []
    for ach in all_achievements:
        achievements_data.append({
            'id': ach.id,
            'name': ach.name,
            'description': ach.description,
            'icon_url': ach.icon_url,
            'xp_reward': ach.xp_reward,
            'unlocked': ach.id in earned_ach_ids
        })
        
    return jsonify(achievements_data), 200

