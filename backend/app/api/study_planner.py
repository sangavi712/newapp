from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, StudyPlan
from app.extensions import db
from datetime import date
import json

planner_bp = Blueprint('planner', __name__, url_prefix='/api/planner')

@planner_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_plan():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    # Check if plan already exists for today
    today = date.today()
    existing_plan = StudyPlan.query.filter_by(user_id=current_user_id, date=today).first()
    
    if existing_plan:
        return jsonify({'message': 'Plan already exists for today', 'plan': existing_plan.plan_data}), 200

    # Logic to generate personalized plan based on user level and progress
    level = user.profile.level
    
    plan_details = {
        'tasks': []
    }
    
    if level <= 3: # Beginner
        plan_details['tasks'] = [
            {'title': 'Intro to Coding (Variables)', 'duration_mins': 15},
            {'title': 'Basic Vocabulary Session', 'duration_mins': 10},
            {'title': 'Interactive Topic Quiz', 'duration_mins': 10}
        ]
    elif level <= 7: # Intermediate
        plan_details['tasks'] = [
            {'title': 'Intermediate Coding Challenge', 'duration_mins': 25},
            {'title': 'Active Vocabulary Spaced Review', 'duration_mins': 15},
            {'title': 'Review & Practice Quiz', 'duration_mins': 15}
        ]
    else: # Advanced
        plan_details['tasks'] = [
            {'title': 'Advanced Software Design / OOP', 'duration_mins': 35},
            {'title': 'Workplace Vocabulary Mastery', 'duration_mins': 15},
            {'title': 'Full Implementation Challenge', 'duration_mins': 20}
        ]

    new_plan = StudyPlan(
        user_id=current_user_id,
        date=today,
        plan_data=plan_details
    )
    
    db.session.add(new_plan)
    db.session.commit()
    
    return jsonify({'message': 'Study plan generated', 'plan': plan_details}), 201
