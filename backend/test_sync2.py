import os
from dotenv import load_dotenv
from pathlib import Path
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)

# pyrefly: ignore [missing-import]
from app import create_app
app = create_app()

with app.app_context():
    # pyrefly: ignore [missing-import]
    from app.sync import sync_mongo_to_sql, mongo_db
    
    # pyrefly: ignore [missing-import]
    from app.models import User
    
    if mongo_db is not None:
        print("Connected to MongoDB!")
        users = list(mongo_db['users'].find())
        print(f"Found {len(users)} users in MongoDB")
        for u in users:
            uid = u['_id']
            print(f"Syncing user {uid}...")
            res = sync_mongo_to_sql(uid)
            print(f"Sync result for {uid}: {res}")
            
            user_in_sqlite = User.query.get(int(uid))
            print(f"User in SQLite after sync: {user_in_sqlite}")
    else:
        print("mongo_db is None :(")
