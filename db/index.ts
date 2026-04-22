import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('sqlite.db');

// Ensure tables exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    profile TEXT NOT NULL,
    consent_level TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    timestamp TEXT NOT NULL,
    user_input TEXT NOT NULL,
    generated_exercises TEXT NOT NULL,
    sources TEXT,
    calm_image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS mood_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    rating INTEGER NOT NULL,
    timestamp TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS journal_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    text TEXT NOT NULL,
    timestamp TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS exercise_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    exercise_id TEXT NOT NULL,
    exercise_title TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    rating INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS app_feedback (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    timestamp TEXT NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL
  );
`);

export const db = drizzle(sqlite, { schema });
