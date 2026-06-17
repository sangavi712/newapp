from flask_sqlalchemy import SQLAlchemy
# pyrefly: ignore [untyped-import]
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
# pyrefly: ignore [missing-import]
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["1000 per day", "200 per hour"]
)
