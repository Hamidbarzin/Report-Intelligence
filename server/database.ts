import Database from 'better-sqlite3';
import path from 'path';
import { Report, FileItem, AIAnalysis } from '../shared/schema';

const dbPath = path.resolve(process.cwd(), 'data', 'reports.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    upload_date TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    size_kb TEXT NOT NULL,
    extracted_date TEXT,
    extracted_text TEXT,
    status TEXT NOT NULL DEFAULT 'uploaded',
    content_url TEXT,
    ai_json TEXT,
    ai_markdown TEXT,
    score TEXT,
    is_published BOOLEAN NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    size_kb INTEGER NOT NULL,
    FOREIGN KEY (report_id) REFERENCES reports (id) ON DELETE CASCADE
  );
`);

// Database operations
export class DatabaseStorage {
  async createReport(report: Omit<Report, 'id' | 'files'>): Promise<Report> {
    const stmt = db.prepare(`
      INSERT INTO reports (title, upload_date, updated_at, size_kb, extracted_date, extracted_text, status, content_url, ai_json, ai_markdown, score, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      report.title,
      report.upload_date.toISOString(),
      report.updated_at.toISOString(),
      report.size_kb,
      report.extracted_date?.toISOString() || null,
      report.extracted_text || null,
      report.status,
      report.content_url || null,
      report.ai_json ? JSON.stringify(report.ai_json) : null,
      report.ai_markdown || null,
      report.score || null,
      report.is_published ? 1 : 0
    );

    const newReport = this.getReportById(result.lastInsertRowid as number);
    return newReport!;
  }

  async getReportById(id: number): Promise<Report | null> {
    const stmt = db.prepare('SELECT * FROM reports WHERE id = ?');
    const report = stmt.get(id) as any;
    
    if (!report) return null;

    const filesStmt = db.prepare('SELECT * FROM files WHERE report_id = ?');
    const files = filesStmt.all(id) as FileItem[];

    return {
      ...report,
      upload_date: new Date(report.upload_date),
      updated_at: new Date(report.updated_at),
      extracted_date: report.extracted_date ? new Date(report.extracted_date) : null,
      ai_json: report.ai_json ? JSON.parse(report.ai_json) : null,
      is_published: Boolean(report.is_published),
      files: files.map(f => ({
        type: f.type,
        url: f.url,
        file_name: f.file_name,
        size_kb: f.size_kb
      }))
    };
  }

  async getAllReports(): Promise<Report[]> {
    const stmt = db.prepare('SELECT * FROM reports ORDER BY upload_date DESC');
    const reports = stmt.all() as any[];

    return reports.map(report => ({
      ...report,
      upload_date: new Date(report.upload_date),
      updated_at: new Date(report.updated_at),
      extracted_date: report.extracted_date ? new Date(report.extracted_date) : null,
      ai_json: report.ai_json ? JSON.parse(report.ai_json) : null,
      is_published: Boolean(report.is_published),
      files: [] // Will be loaded separately if needed
    }));
  }

  async updateReport(id: number, updates: Partial<Report>): Promise<Report | null> {
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'files')
      .map(key => `${key} = ?`)
      .join(', ');

    if (setClause) {
      const values = Object.entries(updates)
        .filter(([key]) => key !== 'id' && key !== 'files')
        .map(([key, value]) => {
          if (key === 'upload_date' || key === 'updated_at' || key === 'extracted_date') {
            return value instanceof Date ? value.toISOString() : value;
          }
          if (key === 'ai_json') {
            return value ? JSON.stringify(value) : null;
          }
          if (key === 'is_published') {
            return value ? 1 : 0;
          }
          return value;
        });

      const stmt = db.prepare(`UPDATE reports SET ${setClause} WHERE id = ?`);
      stmt.run(...values, id);
    }

    // Update files if provided
    if (updates.files) {
      const deleteStmt = db.prepare('DELETE FROM files WHERE report_id = ?');
      deleteStmt.run(id);

      const insertStmt = db.prepare(`
        INSERT INTO files (report_id, type, url, file_name, size_kb)
        VALUES (?, ?, ?, ?, ?)
      `);

      for (const file of updates.files) {
        insertStmt.run(id, file.type, file.url, file.file_name, file.size_kb);
      }
    }

    return this.getReportById(id);
  }

  async deleteReport(id: number): Promise<boolean> {
    const stmt = db.prepare('DELETE FROM reports WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export const databaseStorage = new DatabaseStorage();
