import { db } from "./lib/supabase";
import { reports, type Report, type InsertReport, type FileItem } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Report methods
  createReport(report: InsertReport): Promise<Report>;
  getReport(id: number): Promise<Report | undefined>;
  getPublishedReports(): Promise<Report[]>;
  getAllReports(): Promise<Report[]>;
  updateReport(id: number, updates: Partial<Report>): Promise<Report | undefined>;
  deleteReport(id: number): Promise<boolean>;
}

export interface IFileStorage {
  uploadFile(file: Express.Multer.File, reportId: number): Promise<FileItem>;
  deleteFile(url: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createReport(report: InsertReport): Promise<Report> {
    const [created] = await db.insert(reports).values(report).returning();
    return created;
  }

  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }

  async getPublishedReports(): Promise<Report[]> {
    return await db.select()
      .from(reports)
      .where(eq(reports.is_published, true))
      .orderBy(desc(reports.updated_at));
  }

  async getAllReports(): Promise<Report[]> {
    return await db.select()
      .from(reports)
      .orderBy(desc(reports.updated_at));
  }

  async updateReport(id: number, updates: Partial<Report>): Promise<Report | undefined> {
    const [updated] = await db.update(reports)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(reports.id, id))
      .returning();
    return updated;
  }

  async deleteReport(id: number): Promise<boolean> {
    try {
      const result = await db.delete(reports).where(eq(reports.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error("Database delete error:", error);
      return false;
    }
  }
}

export class MemStorage implements IStorage {
  private reports: Map<number, Report> = new Map();
  private nextId = 1;

  async createReport(report: InsertReport): Promise<Report> {
    const now = new Date();
    const newReport: Report = {
      id: this.nextId++,
      upload_date: now,
      updated_at: now,
      ...report
    };
    this.reports.set(newReport.id, newReport);
    return newReport;
  }

  async getReport(id: number): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async getPublishedReports(): Promise<Report[]> {
    return Array.from(this.reports.values())
      .filter(report => report.is_published)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  async getAllReports(): Promise<Report[]> {
    return Array.from(this.reports.values())
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  async updateReport(id: number, updates: Partial<Report>): Promise<Report | undefined> {
    const existing = this.reports.get(id);
    if (!existing) return undefined;
    
    const updated: Report = {
      ...existing,
      ...updates,
      updated_at: new Date()
    };
    this.reports.set(id, updated);
    return updated;
  }

  async deleteReport(id: number): Promise<boolean> {
    return this.reports.delete(id);
  }
}

export class MemoryFileStorage implements IFileStorage {
  private files: Map<string, Buffer> = new Map();

  async uploadFile(file: Express.Multer.File, reportId: number): Promise<FileItem> {
    const fileName = `${reportId}/${Date.now()}-${file.originalname}`;
    const url = `/uploads/${fileName}`;
    
    // Store file buffer in memory
    this.files.set(fileName, file.buffer);
    
    const fileType = this.getFileType(file.mimetype);
    
    return {
      type: fileType,
      url,
      file_name: file.originalname,
      size_kb: Math.round(file.size / 1024)
    };
  }

  async deleteFile(url: string): Promise<void> {
    const fileName = url.replace('/uploads/', '');
    this.files.delete(fileName);
  }

  // Method to serve files (for Express route)
  getFile(fileName: string): Buffer | undefined {
    return this.files.get(fileName);
  }

  private getFileType(mimetype: string): "html" | "pdf" | "image" {
    if (mimetype === "text/html") return "html";
    if (mimetype === "application/pdf") return "pdf";
    if (mimetype.startsWith("image/")) return "image";
    throw new Error(`Unsupported file type: ${mimetype}`);
  }
}

// Create storage instances with safe fallbacks
function createStorage(): IStorage {
  // Prefer in-memory storage by default unless explicitly requested to use database
  if (process.env.USE_DATABASE === 'true' && process.env.DATABASE_URL) {
    try {
      console.log("Using database storage");
      return new DatabaseStorage();
    } catch (error) {
      console.warn("Database connection failed, falling back to in-memory storage:", error);
      return new MemStorage();
    }
  }
  console.log("Using in-memory storage");
  return new MemStorage();
}

function createFileStorage(): IFileStorage {
  // Use in-memory file storage by default
  return new MemoryFileStorage();
}

export const storage = createStorage();
export const fileStorage = createFileStorage();
