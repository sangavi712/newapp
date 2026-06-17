import os
from dotenv import load_dotenv
from pathlib import Path
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)

from app import create_app
app = create_app()

with app.app_context():
    from app.sync import mongo_db, sync_mongo_to_sql
    from app.models import User
    
    print("mongo_db is:", mongo_db)
    
    if mongo_db:
        print("Users in MongoDB:")
        users = list(mongo_db['users'].find())
        for doc in users:
            print(f" - {doc['_id']}: {doc['email']}")
            
        if users:
            user_id = users[0]['_id']
            print(f"Trying to sync user_id={user_id} type={type(user_id)}")
            res = sync_mongo_to_sql(user_id)
            print(f"sync result: {res}")
            
            u = User.query.get(user_id)
            print(f"User in SQLite after sync: {u}")
    else:
        print("mongo_db is None!")
