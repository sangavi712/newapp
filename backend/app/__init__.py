from flask import Flask
from flask_cors import CORS
from app.extensions import db, migrate, jwt
import os

def create_app():
    app = Flask(__name__)
    CORS(app)

    import datetime
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///buddylearn.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev-secret-key-change-in-prod')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=30)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Initialize MongoDB sync client and register SQLAlchemy listeners
    from app.sync import init_mongodb, register_sync_listeners
    init_mongodb(app)
    register_sync_listeners(db)

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

    @app.before_request
    def ensure_user_cached():
        from flask import request
        from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
        from app.models import User
        from app.sync import sync_mongo_to_sql
        
        # Bypass for registration, login, health checks, options preflights
        if request.path.startswith('/api/auth/login') or request.path.startswith('/api/auth/register') or request.path.startswith('/api/auth/forgot-password') or request.path.startswith('/api/auth/reset-password') or request.path.startswith('/api/health') or request.method == 'OPTIONS':
            return
            
        try:
            verify_jwt_in_request(optional=True)
            identity = get_jwt_identity()
            if identity:
                user_id = int(identity)
                user = User.query.get(user_id)
                if not user:
                    print(f"SQLite cache miss for user_id={user_id}. Syncing from MongoDB Atlas...")
                    sync_mongo_to_sql(user_id)
        except Exception as e:
            # Bypass and let jwt_required() handle validation failures
            pass

    return app
