import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { reports } from "@shared/schema";

let db: any = null;

if (process.env.DATABASE_URL) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql, { schema: { reports } });
  } catch (error) {
    console.warn("Database connection failed, using null db:", error);
    db = null;
  }
}

export { db };
