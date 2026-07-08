import { pgTable, serial, varchar, timestamp, integer, date, text, json, boolean, real } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 80 }).unique().notNull(),
  email: varchar("email", { length: 120 }).unique().notNull(),
  phone: varchar("phone", { length: 20 }).unique(),
  passwordHash: varchar("password_hash", { length: 256 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  ageGroup: varchar("age_group", { length: 20 }),
  avatarUrl: varchar("avatar_url", { length: 255 }),
  xp: integer("xp").default(0),
  level: integer("level").default(1),
  coins: integer("coins").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const streaks = pgTable("streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  currentStreak: integer("current_streak").default(0),
  highestStreak: integer("highest_streak").default(0),
  lastLoginDate: date("last_login_date"),
});

export const knowledgeTree = pgTable("knowledge_tree", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  stage: integer("stage").default(1),
  growthPoints: integer("growth_points").default(0),
});

export const vocabulary = pgTable("vocabulary", {
  id: serial("id").primaryKey(),
  word: varchar("word", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }),
  meaning: text("meaning").notNull(),
  meaningTamil: text("meaning_tamil"),
  emoji: varchar("emoji", { length: 50 }),
  pronunciation: varchar("pronunciation", { length: 100 }),
  exampleSentence: text("example_sentence"),
});

export const userVocabularyProgress = pgTable("user_vocabulary_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  vocabularyId: integer("vocabulary_id").references(() => vocabulary.id).notNull(),
  status: varchar("status", { length: 20 }).default('learning'),
  nextReviewDate: timestamp("next_review_date"),
  reviewStage: integer("review_stage").default(0),
});

export const codingLessons = pgTable("coding_lessons", {
  id: serial("id").primaryKey(),
  language: varchar("language", { length: 50 }).default('Python'),
  topic: varchar("topic", { length: 100 }).notNull(),
  content: text("content").notNull(),
  xpReward: integer("xp_reward").default(30),
  order: integer("order").notNull(),
});

export const codingProgress = pgTable("coding_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  lessonId: integer("lesson_id").references(() => codingLessons.id).notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }),
  xpReward: integer("xp_reward").default(20),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  quizId: integer("quiz_id").references(() => quizzes.id).notNull(),
  score: integer("score").default(0),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  iconUrl: varchar("icon_url", { length: 255 }),
  criteria: varchar("criteria", { length: 100 }),
  xpReward: integer("xp_reward").default(50),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const studyPlans = pgTable("study_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: date("date").notNull(),
  planData: json("plan_data").notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  vocabularyId: integer("vocabulary_id").references(() => vocabulary.id).notNull(),
  reviewedAt: timestamp("reviewed_at").defaultNow(),
  performance: integer("performance"),
});

export const buddyConversations = pgTable("buddy_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  mode: varchar("mode", { length: 50 }),
  message: text("message").notNull(),
  sender: varchar("sender", { length: 20 }),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const emotionLogs = pgTable("emotion_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  emotion: varchar("emotion", { length: 50 }),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const dailyChallenges = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  description: text("description").notNull(),
  xpReward: integer("xp_reward").default(50),
});

export const rewardBoxes = pgTable("reward_boxes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }),
  opened: boolean("opened").default(false),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const userGameScores = pgTable("user_game_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  gameKey: varchar("game_key", { length: 50 }).notNull(),
  highScore: integer("high_score").default(0),
  gamesPlayed: integer("games_played").default(0),
  lastPlayed: timestamp("last_played").defaultNow(),
});

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  titleEn: varchar("title_en", { length: 255 }).notNull(),
  titleTa: varchar("title_ta", { length: 255 }),
  contentEn: text("content_en").notNull(),
  contentTa: text("content_ta"),
  category: varchar("category", { length: 50 }).notNull(),
  readingTime: integer("reading_time"),
  summaryEn: text("summary_en"),
  summaryTa: text("summary_ta"),
  illustrationEmoji: varchar("illustration_emoji", { length: 50 }),
  isCyoa: boolean("is_cyoa").default(false),
  cyoaData: json("cyoa_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userStoryInteractions = pgTable("user_story_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  storyId: integer("story_id").references(() => stories.id).notNull(),
  isFavorite: boolean("is_favorite").default(false),
  isLiked: boolean("is_liked").default(false),
  readProgress: real("read_progress").default(0.0),
  lastRead: timestamp("last_read").defaultNow(),
});

export const musicTracks = pgTable("music_tracks", {
  id: serial("id").primaryKey(),
  titleEn: varchar("title_en", { length: 255 }).notNull(),
  titleTa: varchar("title_ta", { length: 255 }),
  artist: varchar("artist", { length: 100 }),
  category: varchar("category", { length: 50 }).notNull(),
  audioUrl: varchar("audio_url", { length: 500 }),
  isRhyme: boolean("is_rhyme").default(false),
  illustrationEmoji: varchar("illustration_emoji", { length: 50 }),
  lyricsEn: text("lyrics_en"),
  lyricsTa: text("lyrics_ta"),
  lyricsSync: json("lyrics_sync"),
  melodyNotes: json("melody_notes"),
  playCount: integer("play_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userMusicInteractions = pgTable("user_music_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  trackId: integer("track_id").references(() => musicTracks.id).notNull(),
  isFavorite: boolean("is_favorite").default(false),
  isLiked: boolean("is_liked").default(false),
  playProgress: real("play_progress").default(0.0),
  lastPlayed: timestamp("last_played").defaultNow(),
});

export const musicPlaylists = pgTable("music_playlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const musicPlaylistTracks = pgTable("music_playlist_tracks", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").references(() => musicPlaylists.id).notNull(),
  trackId: integer("track_id").references(() => musicTracks.id).notNull(),
});

export const kidsLessons = pgTable("kids_lessons", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 50 }).notNull(),
  titleEn: varchar("title_en", { length: 255 }).notNull(),
  titleTa: varchar("title_ta", { length: 255 }),
  contentData: json("content_data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userKidsProgress = pgTable("user_kids_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  lessonId: integer("lesson_id").references(() => kidsLessons.id).notNull(),
  starsEarned: integer("stars_earned").default(0),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at").defaultNow(),
});
