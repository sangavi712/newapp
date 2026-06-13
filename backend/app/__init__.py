from flask import Flask
from flask_cors import CORS
from app.extensions import db, migrate, jwt
import os

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///buddylearn.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev-secret-key-change-in-prod')

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    @app.route('/api/health')
    def health_check():
        return {'status': 'ok', 'message': 'BuddyLearn AI Backend is running!'}

    from app.api.auth import auth_bp
    from app.api.dashboard import dashboard_bp
    from app.api.vocabulary import vocab_bp
    from app.api.coding import coding_bp
    from app.api.study_planner import planner_bp
    from app.api.buddy import buddy_bp
    from app.api.emotion import emotion_bp
    from app.api.games import games_bp
    from app.api.stories import stories_bp
    from app.api.music import music_bp
    from app.api.kids import kids_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(vocab_bp)
    app.register_blueprint(coding_bp)
    app.register_blueprint(planner_bp)
    app.register_blueprint(buddy_bp)
    app.register_blueprint(emotion_bp)
    app.register_blueprint(games_bp)
    app.register_blueprint(stories_bp)
    app.register_blueprint(music_bp)
    app.register_blueprint(kids_bp)

    return app
