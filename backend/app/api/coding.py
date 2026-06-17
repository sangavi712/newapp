from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
# pyrefly: ignore [missing-import]
from app.models import CodingLesson, CodingProgress
# pyrefly: ignore [missing-import]
from app.extensions import db
# pyrefly: ignore [missing-import]
from app.gamification import award_xp

coding_bp = Blueprint('coding', __name__, url_prefix='/api/coding')

@coding_bp.route('/lessons', methods=['GET'])
@jwt_required()
def get_lessons():
    lessons = CodingLesson.query.order_by(CodingLesson.order).all()
    return jsonify([{
        'id': l.id,
        'topic': l.topic,
        'language': l.language,
        'xp_reward': l.xp_reward,
        'order': l.order
    } for l in lessons]), 200

@coding_bp.route('/lessons/<int:lesson_id>', methods=['GET'])
@jwt_required()
def get_lesson(lesson_id):
    lesson = CodingLesson.query.get(lesson_id)
    if not lesson:
        return jsonify({'message': 'Lesson not found'}), 404
        
    return jsonify({
        'id': lesson.id,
        'topic': lesson.topic,
        'content': lesson.content,
        'xp_reward': lesson.xp_reward
    }), 200

@coding_bp.route('/complete', methods=['POST'])
@jwt_required()
def complete_lesson():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    lesson_id = data.get('lesson_id')
    
    if not lesson_id:
        return jsonify({'message': 'Missing lesson_id'}), 400

    lesson = CodingLesson.query.get(lesson_id)
    if not lesson:
        return jsonify({'message': 'Lesson not found'}), 404

    # Check if already completed
    existing_progress = CodingProgress.query.filter_by(user_id=current_user_id, lesson_id=lesson_id).first()
    if existing_progress:
        return jsonify({'message': 'Lesson already completed'}), 200

    progress = CodingProgress(user_id=current_user_id, lesson_id=lesson_id)
    db.session.add(progress)
    
    award_xp(current_user_id, lesson.xp_reward)
    
    return jsonify({'message': f'Lesson completed! +{lesson.xp_reward} XP'}), 200
