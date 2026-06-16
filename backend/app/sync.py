import os
import pymongo
import logging
from datetime import datetime, date
from sqlalchemy import event

logger = logging.getLogger(__name__)

mongo_client = None
mongo_db = None

def init_mongodb(app):
    """
    Initializes the MongoDB client. Reads MONGODB_URI and MONGODB_DB from the environment.
    Falls back gracefully if not configured.
    """
    global mongo_client, mongo_db
    
    # Read environment variables
    mongo_uri = os.environ.get('MONGODB_URI')
    db_name = os.environ.get('MONGODB_DB', 'buddylearn')
    
    if not mongo_uri:
        print("\n" + "="*80)
        print("WARNING: MONGODB_URI environment variable is not set!")
        print("Application will run in LOCAL-ONLY mode using SQLite.")
        print("="*80 + "\n")
        return False

    try:
        # Connect to MongoDB Atlas (with a 5 second connection timeout)
        mongo_client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        # Verify connection by pinging
        mongo_client.admin.command('ping')
        mongo_db = mongo_client[db_name]
        
        print("\n" + "="*80)
        print(f"SUCCESS: Connected to MongoDB Atlas! Database: '{db_name}'")
        print("All user data updates will be synced to the cloud.")
        print("="*80 + "\n")
        return True
    except Exception as e:
        print("\n" + "="*80)
        print(f"ERROR: Failed to connect to MongoDB Atlas at: {mongo_uri}")
        print(f"Detail: {e}")
        import traceback
        traceback.print_exc()
        print("Application will run in LOCAL-ONLY mode using SQLite.")
        print("="*80 + "\n")
        mongo_client = None
        mongo_db = None
        return False

def get_next_sequence_value(db, name):
    """
    Sequence generator for MongoDB documents to obtain a auto-incrementing integer key.
    """
    if db is None:
        return None
    try:
        result = db.counters.find_one_and_update(
            {'_id': name},
            {'$inc': {'sequence_value': 1}},
            upsert=True,
            return_document=pymongo.ReturnDocument.AFTER
        )
        return result['sequence_value']
    except Exception as e:
        print(f"Error generating sequence value for {name}: {e}")
        # Return a timestamp-based integer fallback if MongoDB counter fails
        import time
        return int(time.time())

def is_user_data_model(obj):
    """
    Checks if a model table is user-specific and needs to be synced to MongoDB.
    """
    user_tables = {
        'users', 'user_profiles', 'streaks', 'knowledge_tree', 
        'user_vocabulary_progress', 'coding_progress', 'quiz_attempts', 
        'user_achievements', 'study_plans', 'reviews', 'buddy_conversations', 
        'emotion_logs', 'reward_boxes', 'user_game_scores', 
        'user_story_interactions', 'user_music_interactions', 
        'music_playlists', 'music_playlist_tracks', 'user_kids_progress'
    }
    return hasattr(obj, '__tablename__') and obj.__tablename__ in user_tables

def model_to_dict(obj):
    """
    Converts a SQLAlchemy model instance to a JSON-serializable dictionary.
    """
    data = {}
    for col in obj.__table__.columns:
        val = getattr(obj, col.name)
        if isinstance(val, (datetime, date)):
            val = val.isoformat()
        data[col.name] = val
    return data

def register_sync_listeners(db):
    """
    Registers SQLAlchemy session listeners to automatically replicate committed
    changes (inserts, updates, deletes) in SQLite to MongoDB Atlas.
    """
    
    @event.listens_for(db.session, 'before_commit')
    def before_commit(session):
        # We queue sync actions into the session.info dictionary before the transaction closes.
        if 'pending_sync' not in session.info:
            session.info['pending_sync'] = []
            
        # Capture additions
        for obj in session.new:
            if is_user_data_model(obj):
                session.info['pending_sync'].append({
                    'table': obj.__tablename__,
                    'action': 'upsert',
                    'data': model_to_dict(obj),
                    'id': obj.id
                })
                
        # Capture updates
        for obj in session.dirty:
            if is_user_data_model(obj):
                session.info['pending_sync'].append({
                    'table': obj.__tablename__,
                    'action': 'upsert',
                    'data': model_to_dict(obj),
                    'id': obj.id
                })
                
        # Capture deletions
        for obj in session.deleted:
            if is_user_data_model(obj):
                session.info['pending_sync'].append({
                    'table': obj.__tablename__,
                    'action': 'delete',
                    'id': obj.id
                })

    @event.listens_for(db.session, 'after_commit')
    def after_commit(session):
        # Once the local transaction successfully commits, write all updates to MongoDB.
        pending = session.info.get('pending_sync', [])
        session.info['pending_sync'] = []  # Clear
        
        if mongo_db is None or not pending:
            return
            
        for item in pending:
            try:
                collection = mongo_db[item['table']]
                if item['action'] == 'delete':
                    collection.delete_one({'_id': item['id']})
                else:
                    data = item['data']
                    data['_id'] = item['id']
                    collection.replace_one({'_id': item['id']}, data, upsert=True)
            except Exception as e:
                print(f"Error syncing table '{item['table']}' to MongoDB Atlas: {e}")

def sync_mongo_to_sql(user_id):
    """
    Clears local SQLite user data cache tables and inserts the user's data fetched from MongoDB Atlas.
    Ensures absolute persistence consistency across browsers and systems.
    """
    if mongo_db is None:
        return False
        
    from app.models import (
        User, UserProfile, Streak, KnowledgeTree, UserVocabularyProgress, 
        CodingProgress, QuizAttempt, UserAchievement, StudyPlan, Review, 
        BuddyConversation, EmotionLog, RewardBox, UserGameScore, 
        UserStoryInteraction, UserMusicInteraction, MusicPlaylist, 
        MusicPlaylistTrack, UserKidsProgress
    )
    from app.extensions import db

    try:
        # 1. Fetch the user playlist IDs to delete matching tracks first
        local_playlists = MusicPlaylist.query.filter_by(user_id=user_id).all()
        local_playlist_ids = [p.id for p in local_playlists]
        if local_playlist_ids:
            db.session.query(MusicPlaylistTrack).filter(
                MusicPlaylistTrack.playlist_id.in_(local_playlist_ids)
            ).delete(synchronize_session=False)
            
        # 2. Clear all other user-specific records from SQLite
        db.session.query(UserVocabularyProgress).filter_by(user_id=user_id).delete(synchronize_session=False)
        db.session.query(CodingProgress).filter_by(user_id=user_id).delete(synchronize_session=False)
        db.session.query(QuizAttempt).filter_by(user_id=user_id).delete(synchronize_session=False)
        db.session.query(UserAchievement).filter_by(user_id=user_id).delete(synchronize_session=False)
        db.session.query(StudyPlan).filter_by(user_id=user_id).delete(synchronize_session=False)
        db.session.query(Review).filter_by(user_id=user_id).delete(synchronize_session=False)
        db.session.query(BuddyConversation).filter_by(user_id=user_id).delete(synchronize_session=False)
        db.session.query(EmotionLog).filter_by(user_id=user_id).delete(synchronize_session=False)
        db.session.query(RewardBox).filter_by(user_id=user_id).delete(synchronize_session=False)
        db.session.query(UserGameScore).filter_by(user_id=user_id).delete(synchronize_session=False)
        db.session.query(UserStoryInteraction).filter_by(user_id=user_id).delete(synchronize_session=False)
        db.session.query(UserMusicInteraction).filter_by(user_id=user_id).delete(synchronize_session=False)
        db.session.query(MusicPlaylist).filter_by(user_id=user_id).delete(synchronize_session=False)
        db.session.query(UserKidsProgress).filter_by(user_id=user_id).delete(synchronize_session=False)
        db.session.query(UserProfile).filter_by(user_id=user_id).delete(synchronize_session=False)
        db.session.query(Streak).filter_by(user_id=user_id).delete(synchronize_session=False)
        db.session.query(KnowledgeTree).filter_by(user_id=user_id).delete(synchronize_session=False)
        db.session.query(User).filter_by(id=user_id).delete(synchronize_session=False)
        db.session.commit()
        
        # Helper to convert MongoDB document to SQLAlchemy model object
        def insert_doc_to_sql(model_cls, doc):
            kwargs = {}
            for col in model_cls.__table__.columns:
                val = doc.get(col.name)
                if val is not None:
                    # Convert ISO formatted string back to DateTime or Date object if required
                    if col.type.python_type in (datetime, date) and isinstance(val, str):
                        try:
                            if col.type.python_type is date:
                                val = date.fromisoformat(val)
                            else:
                                # Handle milliseconds if present
                                val = datetime.fromisoformat(val.replace("Z", "+00:00"))
                        except Exception as parse_err:
                            print(f"Error parsing date/datetime value '{val}': {parse_err}")
                            pass
                    kwargs[col.name] = val
            obj = model_cls(**kwargs)
            db.session.add(obj)
            return obj
            
        # 3. Pull User record from MongoDB Atlas
        user_doc = mongo_db['users'].find_one({'_id': user_id})
        if not user_doc:
            return False
            
        insert_doc_to_sql(User, user_doc)
        
        # 4. Pull Profile, Streak, and Knowledge Tree records
        for model_cls, table_name in [
            (UserProfile, 'user_profiles'),
            (Streak, 'streaks'),
            (KnowledgeTree, 'knowledge_tree')
        ]:
            doc = mongo_db[table_name].find_one({'user_id': user_id})
            if doc:
                insert_doc_to_sql(model_cls, doc)
                
        # 5. Pull user progress collections
        user_tables_mapping = [
            (UserVocabularyProgress, 'user_vocabulary_progress'),
            (CodingProgress, 'coding_progress'),
            (QuizAttempt, 'quiz_attempts'),
            (UserAchievement, 'user_achievements'),
            (StudyPlan, 'study_plans'),
            (Review, 'reviews'),
            (BuddyConversation, 'buddy_conversations'),
            (EmotionLog, 'emotion_logs'),
            (RewardBox, 'reward_boxes'),
            (UserGameScore, 'user_game_scores'),
            (UserStoryInteraction, 'user_story_interactions'),
            (UserMusicInteraction, 'user_music_interactions'),
            (MusicPlaylist, 'music_playlists'),
            (UserKidsProgress, 'user_kids_progress')
        ]
        
        for model_cls, table_name in user_tables_mapping:
            cursor = mongo_db[table_name].find({'user_id': user_id})
            for doc in cursor:
                insert_doc_to_sql(model_cls, doc)
                
        # 6. Pull playlist tracks
        mongo_playlists = list(mongo_db['music_playlists'].find({'user_id': user_id}))
        mongo_playlist_ids = [p['id'] for p in mongo_playlists]
        if mongo_playlist_ids:
            cursor = mongo_db['music_playlist_tracks'].find({'playlist_id': {'$in': mongo_playlist_ids}})
            for doc in cursor:
                insert_doc_to_sql(MusicPlaylistTrack, doc)
                
        db.session.commit()
        print(f"Successfully synced user_id={user_id} data from MongoDB Atlas to local SQLite Cache.")
        return True
    except Exception as e:
        print(f"Error during MongoDB-to-SQLite sync: {e}")
        db.session.rollback()
        return False
