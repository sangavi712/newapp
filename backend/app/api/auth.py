from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity  # type: ignore
from app.api import auth_bp
from app.extensions import db
from app.models import User, UserProfile, KnowledgeTree, Streak

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400

    if User.query.filter_by(username=data['username']).first() or User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'User already exists'}), 409

    hashed_password = generate_password_hash(data['password'])
    new_user = User(username=data['username'], email=data['email'], password_hash=hashed_password)  # type: ignore
    db.session.add(new_user)
    db.session.flush() # Get the new_user.id

    # Create related profile entries
    new_profile = UserProfile(user_id=new_user.id, age_group=data.get('age_group', 'General'))  # type: ignore
    new_streak = Streak(user_id=new_user.id)  # type: ignore
    new_tree = KnowledgeTree(user_id=new_user.id)  # type: ignore

    db.session.add_all([new_profile, new_streak, new_tree])
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404

    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'profile': {
            'age_group': user.profile.age_group,
            'xp': user.profile.xp,
            'level': user.profile.level,
            'avatar_url': user.profile.avatar_url
        },
        'streak': {
            'current': user.streaks.current_streak,
            'highest': user.streaks.highest_streak
        },
        'knowledge_tree': {
            'stage': user.knowledge_tree.stage,
            'growth_points': user.knowledge_tree.growth_points
        }
    }), 200
