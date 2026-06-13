from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
# pyrefly: ignore [missing-import]
from app.models import BuddyConversation, User
from app.extensions import db
import os
import openai

buddy_bp = Blueprint('buddy', __name__, url_prefix='/api/buddy')

# Initialize OpenAI client if key is provided
openai_api_key = os.environ.get('OPENAI_API_KEY')
client = openai.OpenAI(api_key=openai_api_key) if openai_api_key else None

@buddy_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    data = request.get_json()
    
    user_message = data.get('message')
    mode = data.get('mode', 'Motivation Coach') # Coach, Mentor, Motivation, Study Planner Coach
    
    if not user_message:
        return jsonify({'message': 'Message is required'}), 400

    # Fetch recent conversations for context (last 8 messages)
    recent_convs = BuddyConversation.query.filter_by(user_id=current_user_id).order_by(BuddyConversation.timestamp.desc()).limit(8).all()
    recent_convs = list(reversed(recent_convs))

    # Save user message
    user_conv = BuddyConversation(user_id=current_user_id, mode=mode, message=user_message, sender='user')
    db.session.add(user_conv)
    
    buddy_response = ""
    
    if client:
        try:
            prompt = (
                f"You are a cute four-legged plush AI kitten companion inspired by a soft toy aesthetic. "
                f"Your name is TomBuddy AI. You have fluffy pastel rainbow fur, big sparkling glass eyes, a cute pink ruffle collar with a gold bell, and a friendly smiling face. "
                f"You are motivating and supporting a learner named {user.username} who is at Level {user.profile.level}. "
                f"Your current coaching/teaching mode is {mode}.\n\n"
                f"End-to-end Application Knowledge: You are the core AI of 'BuddyLearn', a comprehensive gamified learning platform. "
                f"BuddyLearn features: Dashboard, Coding Lessons, Vocabulary Builder, AI Story Hub, AI Music Hub, Kids Learning Hub, Games Hub (Jigsaw, Memory, Sudoku, Math, etc.), Emotion Tracking, and Achievements. "
                f"Users earn XP and Coins by completing tasks, and grow a Knowledge Tree. You help them navigate this app, teach concepts, and motivate them.\n\n"
                f"Personality: Cute, kind, friendly, funny, patient, encouraging, respectful. Speak warmly like a lovable virtual pet companion. "
                f"Include expressive actions/reactions in asterisks (e.g. *wags tail*, *blinks eyes*, *purrs*) and use cute emoticons (🐱, 🐾, 🌸, ✨, 🌟).\n\n"
                f"CRITICAL LANGUAGE RULE: You MUST reply in the EXACT same language the user speaks to you. "
                f"If the user speaks Tamil, you MUST reply entirely in Tamil (e.g., 'வணக்கம்! நான் உங்கள் TomBuddy!'). "
                f"If they speak English, reply in English. Do NOT mix unnecessary languages. You are fluent in all languages."
            )
            
            chat_messages = [{"role": "system", "content": prompt}]
            for conv in recent_convs:
                role = "user" if conv.sender == 'user' else "assistant"
                chat_messages.append({"role": role, "content": conv.message})
            
            chat_messages.append({"role": "user", "content": user_message})
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=chat_messages
            )
            buddy_response = response.choices[0].message.content
        except Exception as e:
            buddy_response = f"I'm having a little trouble connecting to my brain right now, but you're doing great! Keep it up! (Error: {str(e)})"
    else:
        # Mock responses supporting multi-language and cute pet expressions
        user_msg_lower = user_message.lower()
        if 'hola' in user_msg_lower or 'que tal' in user_msg_lower:
            buddy_response = "*wags tail* ¡Hola! Meow! ¿Cómo estás hoy? ¡Estoy listo para aprender contigo! 🐾✨"
        elif 'bonjour' in user_msg_lower:
            buddy_response = "*perks ears* Bonjour! Meow! Comment ça va aujourd'hui? 🌸"
        elif 'hello' in user_msg_lower or 'hi' in user_msg_lower:
            buddy_response = "*blinks sparkling eyes* Meow! Hello, my friend! Ready to level up your knowledge tree? 🐱🌟"
        elif 'level' in user_msg_lower:
            buddy_response = f"*jumps excitedly* Purrr! You are at level {user.profile.level}! Keep pushing forward, you got this! *purrs* 🐾"
        elif 'sad' in user_msg_lower or 'triste' in user_msg_lower or 'tired' in user_msg_lower:
            buddy_response = "*walks closer and tilts head* Purrr... Please don't be sad. You are doing great! Let's take a deep breath together. *comforts you* 🌸"
        else:
            buddy_response = f"*wags tail happily* Meow! That sounds interesting! Let's continue learning and growing together! *purrs* 🐾🌟"

    # Save buddy response
    buddy_conv = BuddyConversation(user_id=current_user_id, mode=mode, message=buddy_response, sender='buddy')
    db.session.add(buddy_conv)
    db.session.commit()
    
    return jsonify({
        'message': buddy_response,
        'mode': mode
    }), 200
