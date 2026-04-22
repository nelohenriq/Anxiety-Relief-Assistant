import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  profile: text('profile').notNull(), // JSON string of UserProfile
  consentLevel: text('consent_level').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const plans = sqliteTable('plans', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  timestamp: text('timestamp').notNull(),
  userInput: text('user_input').notNull(),
  generatedExercises: text('generated_exercises').notNull(), // JSON string of Exercise[]
  sources: text('sources'), // JSON string
  calmImageUrl: text('calm_image_url'),
});

export const moodLogs = sqliteTable('mood_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  rating: integer('rating').notNull(),
  timestamp: text('timestamp').notNull(),
});

export const journalEntries = sqliteTable('journal_entries', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  text: text('text').notNull(),
  timestamp: text('timestamp').notNull(),
});

export const exerciseLogs = sqliteTable('exercise_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  exerciseId: text('exercise_id').notNull(),
  exerciseTitle: text('exercise_title').notNull(),
  completedAt: text('completed_at').notNull(),
  rating: integer('rating').notNull(),
});

export const appFeedback = sqliteTable('app_feedback', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  timestamp: text('timestamp').notNull(),
  type: text('type').notNull(),
  message: text('message').notNull(),
});
