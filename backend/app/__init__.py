# pyrefly: ignore [missing-import]
from flask import Flask
# pyrefly: ignore [missing-import]
from flask_cors import CORS
# pyrefly: ignore [missing-import]
from app.extensions import db, migrate, jwt
import os

def create_app():
    app = Flask(__name__)
    
    import logging
    logger = logging.getLogger(__name__)

    # Configure CORS to support multiple custom client origins
    client_urls_env = os.environ.get('CLIENT_URL', '*')
    if client_urls_env == '*':
        origins = '*'
    else:
        origins = [url.strip() for url in client_urls_env.split(',')]
        
    CORS(app, resources={r"/api/*": {"origins": origins}}, supports_credentials=True)

    import datetime
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///buddylearn.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    jwt_secret = os.environ.get('JWT_SECRET_KEY')
    if not jwt_secret:
        logger.warning("WARNING: JWT_SECRET_KEY environment variable not set. Using insecure dev key!")
        jwt_secret = 'dev-secret-key-change-in-prod'
    app.config['JWT_SECRET_KEY'] = jwt_secret
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=30)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Initialize MongoDB sync client and register SQLAlchemy listeners
    # pyrefly: ignore [missing-import]
    from app.sync import init_mongodb, register_sync_listeners
    init_mongodb(app)
    register_sync_listeners(db)

    @app.route('/api/health')
    def health_check():
        return {'status': 'ok', 'message': 'BuddyLearn AI Backend is running!'}

    # pyrefly: ignore [missing-import]
    from app.api.auth import auth_bp
    # pyrefly: ignore [missing-import]
    from app.api.dashboard import dashboard_bp
    # pyrefly: ignore [missing-import]
    from app.api.vocabulary import vocab_bp
    # pyrefly: ignore [missing-import]
    from app.api.coding import coding_bp
    # pyrefly: ignore [missing-import]
    from app.api.study_planner import planner_bp
    # pyrefly: ignore [missing-import]
    from app.api.buddy import buddy_bp
    # pyrefly: ignore [missing-import]
    from app.api.emotion import emotion_bp
    # pyrefly: ignore [missing-import]
    from app.api.games import games_bp
    # pyrefly: ignore [missing-import]
    from app.api.stories import stories_bp
    # pyrefly: ignore [missing-import]
    from app.api.music import music_bp
    # pyrefly: ignore [missing-import]
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
        # pyrefly: ignore [missing-import]
        from flask import request
        # pyrefly: ignore [missing-import]
        from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
        # pyrefly: ignore [missing-import]
        from app.models import User
        # pyrefly: ignore [missing-import]
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
