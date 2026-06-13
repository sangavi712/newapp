from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import UserGameScore, User, Streak
from app.extensions import db
from app.gamification import award_xp, award_coins
from datetime import datetime, date, timedelta

games_bp = Blueprint('games', __name__, url_prefix='/api/games')

@games_bp.route('/scores', methods=['GET'])
@jwt_required()
def get_scores():
    current_user_id = get_jwt_identity()
    scores = UserGameScore.query.filter_by(user_id=current_user_id).all()
    return jsonify([{
        'game_key': s.game_key,
        'high_score': s.high_score,
        'games_played': s.games_played,
        'last_played': s.last_played.isoformat()
    } for s in scores]), 200

@games_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_score():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    game_key = data.get('game_key')
    score = data.get('score', 0)
    
    if not game_key:
        return jsonify({'message': 'Missing game_key'}), 400
        
    s = UserGameScore.query.filter_by(user_id=current_user_id, game_key=game_key).first()
    new_high_score = False
    
    if not s:
        s = UserGameScore(user_id=current_user_id, game_key=game_key, high_score=score, games_played=1)
        db.session.add(s)
        new_high_score = True
    else:
        s.games_played += 1
        s.last_played = datetime.utcnow()
        if score > s.high_score:
            s.high_score = score
            new_high_score = True
            
    # Award gamification points
    award_xp(current_user_id, 30)
    award_coins(current_user_id, 15)
    
    # Process study streaks
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
        'message': 'Score submitted successfully!',
        'new_high_score': new_high_score,
        'high_score': s.high_score,
        'xp_reward': 30,
        'coin_reward': 15,
        'streak': streak.current_streak
    }), 200

@games_bp.route('/leaderboard', methods=['GET'])
@jwt_required()
def get_leaderboard():
    game_key = request.args.get('game_key', 'total')
    
    if game_key == 'total':
        results = db.session.query(
            UserGameScore.user_id,
            db.func.sum(UserGameScore.high_score).label('total_score')
        ).group_by(UserGameScore.user_id).order_by(db.desc('total_score')).limit(10).all()
        
        leaderboard = []
        for r in results:
            user = User.query.get(r.user_id)
            if user:
                leaderboard.append({
                    'username': user.username,
                    'score': int(r.total_score),
                    'avatar': user.profile.avatar_url if user.profile else None
                })
        return jsonify(leaderboard), 200
    else:
        results = UserGameScore.query.filter_by(game_key=game_key).order_by(UserGameScore.high_score.desc()).limit(10).all()
        leaderboard = []
        for r in results:
            user = User.query.get(r.user_id)
            if user:
                leaderboard.append({
                    'username': user.username,
                    'score': r.high_score,
                    'avatar': user.profile.avatar_url if user.profile else None
                })
        return jsonify(leaderboard), 200

@games_bp.route('/challenges', methods=['GET'])
@jwt_required()
def get_challenges():
    return jsonify([
        {
            'id': 'chall_1',
            'description': 'Solve 1 Memory Match game on Medium difficulty!',
            'xp_reward': 50,
            'coin_reward': 20,
            'completed': False
        },
        {
            'id': 'chall_2',
            'description': 'Score 100+ points in Math Challenge!',
            'xp_reward': 40,
            'coin_reward': 15,
            'completed': False
        },
        {
            'id': 'chall_3',
            'description': 'Play Chess vs AI and test your strategy!',
            'xp_reward': 60,
            'coin_reward': 25,
            'completed': False
        }
    ]), 200
