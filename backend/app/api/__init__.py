from flask import Blueprint

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# pyrefly: ignore [missing-import]
from app.api import auth
