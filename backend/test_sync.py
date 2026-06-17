import os
from dotenv import load_dotenv
from pathlib import Path
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)

# pyrefly: ignore [missing-import]
from app import create_app
# pyrefly: ignore [missing-import]
from app.sync import sync_mongo_to_sql, mongo_db
# pyrefly: ignore [missing-import]
from app.extensions import db
# pyrefly: ignore [missing-import]
from app.models import User

app = create_app()
with app.app_context():
    print("Users in SQLite:")
    for u in User.query.all():
        print(f" - {u.id}: {u.email}")
    
    if mongo_db is not None:
        print("Users in MongoDB:")
        for doc in mongo_db['users'].find():
            print(f" - {doc['_id']}: {doc['email']}")
            # try to sync the first user
            user_id = doc['_id']
            print(f"Trying to sync user_id={user_id} of type {type(user_id)}")
            success = sync_mongo_to_sql(user_id)
            print(f"Sync success: {success}")
            
            # Check if user exists in SQLite now
            u = User.query.get(int(user_id))
            print(f"User in SQLite after sync: {u}")
