from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Story, UserStoryInteraction, User, Streak
from app.extensions import db
from app.gamification import award_xp, award_coins
from datetime import datetime, date, timedelta
import os
import openai
import json

stories_bp = Blueprint('stories', __name__, url_prefix='/api/stories')

# Initialize OpenAI client if key is provided
openai_api_key = os.environ.get('OPENAI_API_KEY')
client = openai.OpenAI(api_key=openai_api_key) if openai_api_key else None

@stories_bp.route('', methods=['GET'])
@jwt_required()
def get_stories():
    category = request.args.get('category', 'All')
    duration = request.args.get('duration', 'All') # Short, Medium, Long
    search = request.args.get('search', '').strip().lower()

    query = Story.query

    if category != 'All':
        query = query.filter_by(category=category)

    if duration != 'All':
        if duration == 'Short':
            query = query.filter(Story.reading_time <= 3)
        elif duration == 'Medium':
            query = query.filter(Story.reading_time > 3, Story.reading_time <= 8)
        else:
            query = query.filter(Story.reading_time > 8)

    all_stories = query.all()

    # Search filter
    if search:
        all_stories = [s for s in all_stories if (
            search in s.title_en.lower() or 
            (s.title_ta and search in s.title_ta.lower()) or 
            search in s.content_en.lower() or 
            (s.content_ta and search in s.content_ta.lower())
        )]

    # Dynamic trending, most read sections
    story_list = [{
        'id': s.id,
        'title_en': s.title_en,
        'title_ta': s.title_ta,
        'content_en': s.content_en,
        'content_ta': s.content_ta,
        'category': s.category,
        'reading_time': s.reading_time,
        'summary_en': s.summary_en,
        'summary_ta': s.summary_ta,
        'illustration_emoji': s.illustration_emoji,
        'is_cyoa': s.is_cyoa,
        'cyoa_data': s.cyoa_data
    } for s in all_stories]

    # Split into sections
    story_of_the_day = story_list[0] if len(story_list) > 0 else None
    trending = story_list[::-1] # Reverse
    latest = story_list # Natural order

    return jsonify({
        'story_of_the_day': story_of_the_day,
        'stories': story_list,
        'trending': trending,
        'latest': latest
    }), 200

@stories_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_story():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    word = data.get('word', '').strip()
    emoji = data.get('emoji', '').strip()
    category = data.get('category', 'Sci-Fi')
    style = data.get('style', 'Fantasy') # rewrite style

    prompt_subject = word if word else emoji
    if not prompt_subject:
        return jsonify({'message': 'Please provide a word or emoji prompt'}), 400

    title_en = f"The Legend of the {prompt_subject}"
    title_ta = f"{prompt_subject} இன் புராணக்கதை"
    content_en = f"Once upon a time, in a high-tech city, a scientist crafted the legendary {prompt_subject}. Everyone was amazed by its glowing light and high-energy pulses. It was the key to unlocking the ancient portals."
    content_ta = f"முன்னொரு காலத்தில், ஒரு தொழில்நுட்ப நகரத்தில், ஒரு விஞ்ஞானி புகழ்பெற்ற {prompt_subject} தயாரித்தார். அதன் ஒளிரும் ஒளி மற்றும் அதிக ஆற்றல் துடிப்புகளால் அனைவரும் ஆச்சரியப்பட்டனர்."
    summary_en = f"A short story about the discovery of the legendary {prompt_subject} in a cyber-future."
    summary_ta = f"{prompt_subject} கண்டுபிடிப்பு பற்றிய ஒரு சிறிய அறிவியல் புனைகதை."
    illustration = "✨"

    # Dynamic templates based on input keywords
    lower_prompt = prompt_subject.lower()
    if 'alien' in lower_prompt or 'space' in lower_prompt or '👽' in lower_prompt:
        title_en = "The Visitor from Sector 9"
        title_ta = "செக்டார் 9 இன் பார்வையாளர்"
        content_en = "A small metallic capsule crashed in Clara's backyard. Inside was a tiny alien shaped like a glowing green tree, clutching a star map. It whispered, 'Help me rebuild my spaceship!'"
        content_ta = "கிளாராவின் கொல்லைப்புறத்தில் ஒரு சிறிய உலோக உறை மோதியது. உள்ளே ஒரு ஒளிரும் பச்சை மரம் போன்ற ஒரு சிறிய ஏலியன் இருந்தது. அது, 'எனது விண்கலத்தை மீண்டும் கட்டியெழுப்ப உதவுங்கள்!' என்று கிசுகிசுத்தது."
        summary_en = "Clara helps a stranded tree-like alien rebuild its ship."
        summary_ta = "கிளாரா தவித்துக் கொண்டிருந்த மரம் போன்ற ஏலியனுக்கு அதன் விண்கலத்தை சரிசெய்ய உதவுகிறார்."
        illustration = "👽"
    elif 'ghost' in lower_prompt or 'dark' in lower_prompt or '👻' in lower_prompt:
        title_en = "The Shadow in the Library"
        title_ta = "நூலகத்தில் இருந்த நிழல்"
        content_en = "Leo stayed late in the school library. When the grandfather clock struck midnight, he noticed his shadow in the glass wall was reading a different book. It pointed to a hidden drawer in the shelf."
        content_ta = "லியோ பள்ளி நூலகத்தில் தாமதமாக தங்கி இருந்தான். தாத்தா கடிகாரம் நள்ளிரவை அடித்தபோது, ​​கண்ணாடிச் சுவரில் இருந்த அவனது நிழல் வேறொரு புத்தகத்தைப் படிப்பதை அவன் கவனித்தான். அது ஒரு ரகசிய அலமாரியைக் காட்டியது."
        summary_en = "Leo encounters a reading shadow in the school library at midnight."
        summary_ta = "நள்ளிரவில் பள்ளி நூலகத்தில் லியோ தனது நிழல் வேறொரு புத்தகம் படிப்பதை காண்கிறார்."
        illustration = "👻"
    elif 'magic' in lower_prompt or 'wizard' in lower_prompt or '🧙' in lower_prompt:
        title_en = "The Sorcerer's Amulet"
        title_ta = "மந்திரவாதியின் தாயத்து"
        content_en = "Deep in the misty mountains, a young apprentice found a golden amulet. As she wore it, she could understand the language of the birds, who warned her of a coming storm."
        content_ta = "மூடுபனி மலைகளுக்கு நடுவே, ஒரு இளம் மந்திரவாதி ஒரு தங்க தாயத்தை கண்டெடுத்தாள். அதை அணிந்ததும், பறவைகளின் மொழியை அவளால் புரிந்து கொள்ள முடிந்தது."
        summary_en = "A young apprentice wizard learns to speak with birds using a magical golden amulet."
        summary_ta = "ஒரு மந்திர தாயத்தின் மூலம் பறவைகளின் மொழியைப் புரிந்து கொள்ளும் இளம் மந்திரவாதி."
        illustration = "🧙‍♂️"

    if client:
        try:
            prompt_instruction = (
                f"Generate a beautiful, engaging short story (about 120 words) based on the prompt '{prompt_subject}'. "
                f"The story category is '{category}' and style is '{style}'. Provide it in both English and Tamil. "
                f"Format your response STRICTLY as a JSON object with keys: "
                f"'title_en', 'title_ta', 'content_en', 'content_ta', 'summary_en', 'summary_ta', 'emoji'."
            )
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "system", "content": prompt_instruction}],
                temperature=0.7
            )
            parsed = json.loads(response.choices[0].message.content)
            title_en = parsed.get('title_en', title_en)
            title_ta = parsed.get('title_ta', title_ta)
            content_en = parsed.get('content_en', content_en)
            content_ta = parsed.get('content_ta', content_ta)
            summary_en = parsed.get('summary_en', summary_en)
            summary_ta = parsed.get('summary_ta', summary_ta)
            illustration = parsed.get('emoji', illustration)
        except Exception as e:
            print("Failed to call OpenAI, using template fallback:", e)

    # Save to database
    new_story = Story(
        title_en=title_en,
        title_ta=title_ta,
        content_en=content_en,
        content_ta=content_ta,
        category=category,
        reading_time=max(1, len(content_en.split()) // 150),
        summary_en=summary_en,
        summary_ta=summary_ta,
        illustration_emoji=illustration,
        is_cyoa=False
    )
    db.session.add(new_story)
    db.session.commit()

    return jsonify({
        'id': new_story.id,
        'title_en': new_story.title_en,
        'title_ta': new_story.title_ta,
        'content_en': new_story.content_en,
        'content_ta': new_story.content_ta,
        'category': new_story.category,
        'reading_time': new_story.reading_time,
        'summary_en': new_story.summary_en,
        'summary_ta': new_story.summary_ta,
        'illustration_emoji': new_story.illustration_emoji,
        'is_cyoa': new_story.is_cyoa
    }), 200

@stories_bp.route('/interaction', methods=['POST'])
@jwt_required()
def save_interaction():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    story_id = data.get('story_id')
    is_favorite = data.get('is_favorite')
    is_liked = data.get('is_liked')
    progress = data.get('read_progress')

    if not story_id:
        return jsonify({'message': 'story_id is required'}), 400

    inter = UserStoryInteraction.query.filter_by(user_id=current_user_id, story_id=story_id).first()
    if not inter:
        inter = UserStoryInteraction(user_id=current_user_id, story_id=story_id)
        db.session.add(inter)

    if is_favorite is not None:
        inter.is_favorite = is_favorite
    if is_liked is not None:
        inter.is_liked = is_liked
    if progress is not None:
        inter.read_progress = float(progress)
    
    inter.last_read = datetime.utcnow()
    db.session.commit()

    return jsonify({'message': 'Story progress updated successfully!'}), 200

@stories_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    current_user_id = get_jwt_identity()
    history = UserStoryInteraction.query.filter_by(user_id=current_user_id).order_by(UserStoryInteraction.last_read.desc()).all()
    
    data = []
    for h in history:
        s = Story.query.get(h.story_id)
        if s:
            data.append({
                'story_id': s.id,
                'title_en': s.title_en,
                'title_ta': s.title_ta,
                'category': s.category,
                'illustration_emoji': s.illustration_emoji,
                'is_favorite': h.is_favorite,
                'is_liked': h.is_liked,
                'read_progress': h.read_progress,
                'last_read': h.last_read.isoformat()
            })
    return jsonify(data), 200

@stories_bp.route('/quiz', methods=['GET'])
@jwt_required()
def get_story_quiz():
    story_id = request.args.get('story_id')
    if not story_id:
        return jsonify({'message': 'story_id is required'}), 400
    
    s = Story.query.get(story_id)
    if not s:
        return jsonify({'message': 'Story not found'}), 404

    # Generate a dynamic story comprehension question
    question_en = f"What is the core subject of the story '{s.title_en}'?"
    question_ta = f"'{s.title_ta}' கதையின் முக்கிய நோக்கம் என்ன?"
    options_en = [s.summary_en]
    options_ta = [s.summary_ta]

    # Add wrong options
    options_en.extend([
        "A story about building a large gold mine.",
        "A comedy about a flying cat that lost its tail.",
        "A drama about sailing across the stormy ocean."
    ])
    options_ta.extend([
        "தங்க சுரங்கம் கட்டுவது பற்றிய கதை.",
        "வாலை இழந்த ஒரு பறக்கும் பூனை பற்றிய நகைச்சுவை கதை.",
        "புயல் வீசும் கடலைக் கடந்து பயணம் செய்வது பற்றிய நாடகம்."
    ])

    return jsonify({
        'question_en': question_en,
        'question_ta': question_ta,
        'options_en': options_en,
        'options_ta': options_ta,
        'answer_en': s.summary_en,
        'answer_ta': s.summary_ta
    }), 200

@stories_bp.route('/submit-challenge', methods=['POST'])
@jwt_required()
def submit_challenge():
    current_user_id = get_jwt_identity()
    
    # Award gamification points
    award_xp(current_user_id, 40)
    award_coins(current_user_id, 15)

    # Process streaks
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
        'message': 'Story challenge completed! +40 XP and +15 Coins awarded.',
        'xp_reward': 40,
        'coin_reward': 15,
        'streak': streak.current_streak if streak else 1
    }), 200
