import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { reports } from "../shared/schema";
import path from "path";

const dbPath = path.resolve(process.cwd(), 'data', 'reports.db');
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema: { reports } });

// Create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    upload_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    size_kb TEXT NOT NULL,
    extracted_date TEXT,
    extracted_text TEXT,
    status TEXT NOT NULL DEFAULT 'uploaded',
    content_url TEXT,
    files TEXT NOT NULL DEFAULT '[]',
    ai_json TEXT,
    ai_markdown TEXT,
    score TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_published INTEGER NOT NULL DEFAULT 0
  );
`);

console.log("Database migration completed successfully");
sqlite.close();
