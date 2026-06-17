from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
# pyrefly: ignore [missing-import]
from app.models import EmotionLog
# pyrefly: ignore [missing-import]
from app.extensions import db

emotion_bp = Blueprint('emotion', __name__, url_prefix='/api/emotion')

@emotion_bp.route('/log', methods=['POST'])
@jwt_required()
def log_emotion():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # In a full implementation, this endpoint would receive image data, 
    # run it through TensorFlow/OpenCV CNN model, and return the emotion.
    # For now, it accepts the pre-calculated emotion from the frontend (if any) or defaults to Neutral.
    
    emotion = data.get('emotion', 'Neutral')
    
    log = EmotionLog(user_id=current_user_id, emotion=emotion)
    db.session.add(log)
    db.session.commit()
    
    # Simple recommendation based on emotion
    recommendation = "Keep up the great work!"
    if emotion in ['Sad', 'Stressed', 'Tired']:
        recommendation = "You seem a bit tired. How about we just play a quick vocabulary game today instead of a heavy coding lesson?"
        
    return jsonify({
        'message': 'Emotion logged',
        'detected_emotion': emotion,
        'recommendation': recommendation
    }), 201
