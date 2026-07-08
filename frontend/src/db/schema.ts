import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").unique().notNull(),
  email: text("email").unique().notNull(),
  phone: text("phone").unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }),
});

export const userProfiles = sqliteTable("user_profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  ageGroup: text("age_group"),
  avatarUrl: text("avatar_url"),
  xp: integer("xp").default(0),
  level: integer("level").default(1),
  coins: integer("coins").default(0),
  updatedAt: integer("updated_at", { mode: 'timestamp' }),
});

export const streaks = sqliteTable("streaks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  currentStreak: integer("current_streak").default(0),
  highestStreak: integer("highest_streak").default(0),
  lastLoginDate: text("last_login_date"),
});

export const knowledgeTree = sqliteTable("knowledge_tree", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  stage: integer("stage").default(1),
  growthPoints: integer("growth_points").default(0),
});

export const vocabulary = sqliteTable("vocabulary", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  word: text("word").notNull(),
  category: text("category"),
  meaning: text("meaning").notNull(),
  meaningTamil: text("meaning_tamil"),
  emoji: text("emoji"),
  pronunciation: text("pronunciation"),
  exampleSentence: text("example_sentence"),
});

export const userVocabularyProgress = sqliteTable("user_vocabulary_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  vocabularyId: integer("vocabulary_id").references(() => vocabulary.id).notNull(),
  status: text("status").default('learning'),
  nextReviewDate: integer("next_review_date", { mode: 'timestamp' }),
  reviewStage: integer("review_stage").default(0),
});

export const codingLessons = sqliteTable("coding_lessons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  language: text("language").default('Python'),
  topic: text("topic").notNull(),
  content: text("content").notNull(),
  xpReward: integer("xp_reward").default(30),
  order: integer("order").notNull(),
});

export const codingProgress = sqliteTable("coding_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  lessonId: integer("lesson_id").references(() => codingLessons.id).notNull(),
  completedAt: integer("completed_at", { mode: 'timestamp' }),
});

export const quizzes = sqliteTable("quizzes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type"),
  xpReward: integer("xp_reward").default(20),
});

export const quizAttempts = sqliteTable("quiz_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  quizId: integer("quiz_id").references(() => quizzes.id).notNull(),
  score: integer("score").default(0),
  completedAt: integer("completed_at", { mode: 'timestamp' }),
});

export const achievements = sqliteTable("achievements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url"),
  criteria: text("criteria"),
  xpReward: integer("xp_reward").default(50),
});

export const userAchievements = sqliteTable("user_achievements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  earnedAt: integer("earned_at", { mode: 'timestamp' }),
});

export const studyPlans = sqliteTable("study_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: text("date").notNull(),
  planData: text("plan_data", { mode: 'json' }).notNull(),
});

export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  vocabularyId: integer("vocabulary_id").references(() => vocabulary.id).notNull(),
  reviewedAt: integer("reviewed_at", { mode: 'timestamp' }),
  performance: integer("performance"),
});

export const buddyConversations = sqliteTable("buddy_conversations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  mode: text("mode"),
  message: text("message").notNull(),
  sender: text("sender"),
  timestamp: integer("timestamp", { mode: 'timestamp' }),
});

export const emotionLogs = sqliteTable("emotion_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  emotion: text("emotion"),
  timestamp: integer("timestamp", { mode: 'timestamp' }),
});

export const dailyChallenges = sqliteTable("daily_challenges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  description: text("description").notNull(),
  xpReward: integer("xp_reward").default(50),
});

export const rewardBoxes = sqliteTable("reward_boxes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type"),
  opened: integer("opened", { mode: 'boolean' }).default(false),
  earnedAt: integer("earned_at", { mode: 'timestamp' }),
});

export const userGameScores = sqliteTable("user_game_scores", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  gameKey: text("game_key").notNull(),
  highScore: integer("high_score").default(0),
  gamesPlayed: integer("games_played").default(0),
  lastPlayed: integer("last_played", { mode: 'timestamp' }),
});

export const stories = sqliteTable("stories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  titleEn: text("title_en").notNull(),
  titleTa: text("title_ta"),
  contentEn: text("content_en").notNull(),
  contentTa: text("content_ta"),
  category: text("category").notNull(),
  readingTime: integer("reading_time"),
  summaryEn: text("summary_en"),
  summaryTa: text("summary_ta"),
  illustrationEmoji: text("illustration_emoji"),
  isCyoa: integer("is_cyoa", { mode: 'boolean' }).default(false),
  cyoaData: text("cyoa_data", { mode: 'json' }),
  createdAt: integer("created_at", { mode: 'timestamp' }),
});

export const userStoryInteractions = sqliteTable("user_story_interactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  storyId: integer("story_id").references(() => stories.id).notNull(),
  isFavorite: integer("is_favorite", { mode: 'boolean' }).default(false),
  isLiked: integer("is_liked", { mode: 'boolean' }).default(false),
  readProgress: real("read_progress").default(0.0),
  lastRead: integer("last_read", { mode: 'timestamp' }),
});

export const musicTracks = sqliteTable("music_tracks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  titleEn: text("title_en").notNull(),
  titleTa: text("title_ta"),
  artist: text("artist"),
  category: text("category").notNull(),
  audioUrl: text("audio_url"),
  isRhyme: integer("is_rhyme", { mode: 'boolean' }).default(false),
  illustrationEmoji: text("illustration_emoji"),
  lyricsEn: text("lyrics_en"),
  lyricsTa: text("lyrics_ta"),
  lyricsSync: text("lyrics_sync", { mode: 'json' }),
  melodyNotes: text("melody_notes", { mode: 'json' }),
  playCount: integer("play_count").default(0),
  createdAt: integer("created_at", { mode: 'timestamp' }),
});

export const userMusicInteractions = sqliteTable("user_music_interactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  trackId: integer("track_id").references(() => musicTracks.id).notNull(),
  isFavorite: integer("is_favorite", { mode: 'boolean' }).default(false),
  isLiked: integer("is_liked", { mode: 'boolean' }).default(false),
  playProgress: real("play_progress").default(0.0),
  lastPlayed: integer("last_played", { mode: 'timestamp' }),
});

export const musicPlaylists = sqliteTable("music_playlists", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }),
});

export const musicPlaylistTracks = sqliteTable("music_playlist_tracks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  playlistId: integer("playlist_id").references(() => musicPlaylists.id).notNull(),
  trackId: integer("track_id").references(() => musicTracks.id).notNull(),
});

export const kidsLessons = sqliteTable("kids_lessons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  category: text("category").notNull(),
  titleEn: text("title_en").notNull(),
  titleTa: text("title_ta"),
  contentData: text("content_data", { mode: 'json' }).notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }),
});

export const userKidsProgress = sqliteTable("user_kids_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  lessonId: integer("lesson_id").references(() => kidsLessons.id).notNull(),
  starsEarned: integer("stars_earned").default(0),
  isCompleted: integer("is_completed", { mode: 'boolean' }).default(false),
  completedAt: integer("completed_at", { mode: 'timestamp' }),
});
