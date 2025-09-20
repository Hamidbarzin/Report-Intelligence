import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { reports } from "@shared/schema";
import path from "path";

let db: any = null;

try {
  // Use SQLite database for persistence
  const dbPath = path.resolve(process.cwd(), 'data', 'reports.db');
  const sqlite = new Database(dbPath);
  db = drizzle(sqlite, { schema: { reports } });
  console.log("SQLite database connected successfully");
} catch (error) {
  console.warn("Database connection failed, using null db:", error);
  db = null;
}

export { db };
