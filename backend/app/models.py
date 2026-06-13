from app.extensions import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    profile = db.relationship('UserProfile', backref='user', uselist=False, cascade="all, delete-orphan")
    streaks = db.relationship('Streak', backref='user', uselist=False, cascade="all, delete-orphan")
    knowledge_tree = db.relationship('KnowledgeTree', backref='user', uselist=False, cascade="all, delete-orphan")

class UserProfile(db.Model):
    __tablename__ = 'user_profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    age_group = db.Column(db.String(20)) # Kids, Teenagers, Young Adults
    avatar_url = db.Column(db.String(255))
    xp = db.Column(db.Integer, default=0)
    level = db.Column(db.Integer, default=1)
    coins = db.Column(db.Integer, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Streak(db.Model):
    __tablename__ = 'streaks'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    current_streak = db.Column(db.Integer, default=0)
    highest_streak = db.Column(db.Integer, default=0)
    last_login_date = db.Column(db.Date)

class KnowledgeTree(db.Model):
    __tablename__ = 'knowledge_tree'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    stage = db.Column(db.Integer, default=1) # 1: Seed, 2: Plant, 3: Young Tree, 4: Knowledge Tree, 5: Wisdom Tree
    growth_points = db.Column(db.Integer, default=0)

class Vocabulary(db.Model):
    __tablename__ = 'vocabulary'
    id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50)) # Beginner, Spoken, Workplace, IT
    meaning = db.Column(db.Text, nullable=False)
    meaning_tamil = db.Column(db.Text)
    emoji = db.Column(db.String(50))
    pronunciation = db.Column(db.String(100))
    example_sentence = db.Column(db.Text)

class UserVocabularyProgress(db.Model):
    __tablename__ = 'user_vocabulary_progress'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    vocabulary_id = db.Column(db.Integer, db.ForeignKey('vocabulary.id'), nullable=False)
    status = db.Column(db.String(20), default='learning') # learning, learned
    next_review_date = db.Column(db.DateTime)
    review_stage = db.Column(db.Integer, default=0) # For spaced repetition

class CodingLesson(db.Model):
    __tablename__ = 'coding_lessons'
    id = db.Column(db.Integer, primary_key=True)
    language = db.Column(db.String(50), default='Python')
    topic = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    xp_reward = db.Column(db.Integer, default=30)
    order = db.Column(db.Integer, nullable=False)

class CodingProgress(db.Model):
    __tablename__ = 'coding_progress'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    lesson_id = db.Column(db.Integer, db.ForeignKey('coding_lessons.id'), nullable=False)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)

class Quiz(db.Model):
    __tablename__ = 'quizzes'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(db.String(50)) # vocabulary, coding, general
    xp_reward = db.Column(db.Integer, default=20)

class QuizAttempt(db.Model):
    __tablename__ = 'quiz_attempts'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    score = db.Column(db.Integer, default=0)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)

class Achievement(db.Model):
    __tablename__ = 'achievements'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    icon_url = db.Column(db.String(255))
    criteria = db.Column(db.String(100)) # e.g., '10_words_learned', 'level_5'
    xp_reward = db.Column(db.Integer, default=50)

class UserAchievement(db.Model):
    __tablename__ = 'user_achievements'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    achievement_id = db.Column(db.Integer, db.ForeignKey('achievements.id'), nullable=False)
    earned_at = db.Column(db.DateTime, default=datetime.utcnow)

class StudyPlan(db.Model):
    __tablename__ = 'study_plans'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    plan_data = db.Column(db.JSON, nullable=False) # Store the generated plan details

class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    vocabulary_id = db.Column(db.Integer, db.ForeignKey('vocabulary.id'), nullable=False)
    reviewed_at = db.Column(db.DateTime, default=datetime.utcnow)
    performance = db.Column(db.Integer) # 1-5 score for spaced repetition

class BuddyConversation(db.Model):
    __tablename__ = 'buddy_conversations'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    mode = db.Column(db.String(50)) # Coach, Mentor, Motivation
    message = db.Column(db.Text, nullable=False)
    sender = db.Column(db.String(20)) # user, buddy
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class EmotionLog(db.Model):
    __tablename__ = 'emotion_logs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    emotion = db.Column(db.String(50)) # Happy, Neutral, Sad, Tired, Stressed
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class DailyChallenge(db.Model):
    __tablename__ = 'daily_challenges'
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    description = db.Column(db.Text, nullable=False)
    xp_reward = db.Column(db.Integer, default=50)

class RewardBox(db.Model):
    __tablename__ = 'reward_boxes'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(50)) # bronze, silver, gold
    opened = db.Column(db.Boolean, default=False)
    earned_at = db.Column(db.DateTime, default=datetime.utcnow)

class UserGameScore(db.Model):
    __tablename__ = 'user_game_scores'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    game_key = db.Column(db.String(50), nullable=False)
    high_score = db.Column(db.Integer, default=0)
    games_played = db.Column(db.Integer, default=0)
    last_played = db.Column(db.DateTime, default=datetime.utcnow)

class Story(db.Model):
    __tablename__ = 'stories'
    id = db.Column(db.Integer, primary_key=True)
    title_en = db.Column(db.String(255), nullable=False)
    title_ta = db.Column(db.String(255))
    content_en = db.Column(db.Text, nullable=False)
    content_ta = db.Column(db.Text)
    category = db.Column(db.String(50), nullable=False)
    reading_time = db.Column(db.Integer) # in minutes
    summary_en = db.Column(db.Text)
    summary_ta = db.Column(db.Text)
    illustration_emoji = db.Column(db.String(50))
    is_cyoa = db.Column(db.Boolean, default=False)
    cyoa_data = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class UserStoryInteraction(db.Model):
    __tablename__ = 'user_story_interactions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    story_id = db.Column(db.Integer, db.ForeignKey('stories.id'), nullable=False)
    is_favorite = db.Column(db.Boolean, default=False)
    is_liked = db.Column(db.Boolean, default=False)
    read_progress = db.Column(db.Float, default=0.0)
    last_read = db.Column(db.DateTime, default=datetime.utcnow)

class MusicTrack(db.Model):
    __tablename__ = 'music_tracks'
    id = db.Column(db.Integer, primary_key=True)
    title_en = db.Column(db.String(255), nullable=False)
    title_ta = db.Column(db.String(255))
    artist = db.Column(db.String(100))
    category = db.Column(db.String(50), nullable=False)
    audio_url = db.Column(db.String(500))
    is_rhyme = db.Column(db.Boolean, default=False)
    illustration_emoji = db.Column(db.String(50))
    lyrics_en = db.Column(db.Text)
    lyrics_ta = db.Column(db.Text)
    lyrics_sync = db.Column(db.JSON)
    melody_notes = db.Column(db.JSON)
    play_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class UserMusicInteraction(db.Model):
    __tablename__ = 'user_music_interactions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    track_id = db.Column(db.Integer, db.ForeignKey('music_tracks.id'), nullable=False)
    is_favorite = db.Column(db.Boolean, default=False)
    is_liked = db.Column(db.Boolean, default=False)
    play_progress = db.Column(db.Float, default=0.0)
    last_played = db.Column(db.DateTime, default=datetime.utcnow)

class MusicPlaylist(db.Model):
    __tablename__ = 'music_playlists'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class MusicPlaylistTrack(db.Model):
    __tablename__ = 'music_playlist_tracks'
    id = db.Column(db.Integer, primary_key=True)
    playlist_id = db.Column(db.Integer, db.ForeignKey('music_playlists.id'), nullable=False)
    track_id = db.Column(db.Integer, db.ForeignKey('music_tracks.id'), nullable=False)

class KidsLesson(db.Model):
    __tablename__ = 'kids_lessons'
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(50), nullable=False)
    title_en = db.Column(db.String(255), nullable=False)
    title_ta = db.Column(db.String(255))
    content_data = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class UserKidsProgress(db.Model):
    __tablename__ = 'user_kids_progress'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    lesson_id = db.Column(db.Integer, db.ForeignKey('kids_lessons.id'), nullable=False)
    stars_earned = db.Column(db.Integer, default=0)
    is_completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)
