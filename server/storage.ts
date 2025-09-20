import { db } from "./lib/supabase";
import { reports, type Report, type InsertReport, type FileItem } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import * as supabaseStorage from "./lib/storage";
import { ObjectStorageService, objectStorageClient } from "./objectStorage";
import { setObjectAclPolicy } from "./objectAcl";

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
  getFile(fileName: string): Promise<Buffer | null>; // Added getFile method signature
}

export class DatabaseStorage implements IStorage {
  async createReport(report: InsertReport): Promise<Report> {
    const [created] = await db.insert(reports).values([report]).returning();
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
      files: [] as FileItem[],
      status: "uploaded" as const,
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

export class ObjectFileStorage implements IFileStorage {
  private objectStorage = new ObjectStorageService();

  async uploadFile(file: Express.Multer.File, reportId: number): Promise<FileItem> {
    const privateDir = this.objectStorage.getPrivateObjectDir();
    const fileName = `uploads/${reportId}/${Date.now()}-${file.originalname}`;
    const fullPath = `${privateDir}/${fileName}`;
    
    const { bucketName, objectName } = this.parseObjectPath(fullPath);
    const bucket = objectStorageClient.bucket(bucketName);
    const objectFile = bucket.file(objectName);

    // Upload file buffer to object storage
    await objectFile.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    // Set ACL policy for the file (make it accessible to admin)
    await setObjectAclPolicy(objectFile, {
      owner: "admin",
      visibility: "private"
    });

    const fileType = this.getFileType(file.mimetype);
    const url = `/objects/${fileName}`;

    return {
      type: fileType,
      url,
      file_name: file.originalname,
      size_kb: Math.round(file.size / 1024)
    };
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const objectFile = await this.objectStorage.getObjectEntityFile(url);
      await objectFile.delete();
    } catch (error) {
      console.error("Failed to delete object file:", error);
    }
  }

  async getFile(fileName: string): Promise<Buffer | null> {
    try {
      const objectPath = `/objects/${fileName}`;
      const objectFile = await this.objectStorage.getObjectEntityFile(objectPath);
      const [fileBuffer] = await objectFile.download();
      return fileBuffer;
    } catch (error) {
      console.error("Failed to get object file:", error);
      return null;
    }
  }

  private parseObjectPath(path: string): { bucketName: string; objectName: string } {
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }
    const pathParts = path.split("/");
    if (pathParts.length < 3) {
      throw new Error("Invalid path: must contain at least a bucket name");
    }

    const bucketName = pathParts[1];
    const objectName = pathParts.slice(2).join("/");

    return { bucketName, objectName };
  }

  private getFileType(mimetype: string): "html" | "pdf" | "image" {
    if (mimetype === "text/html") return "html";
    if (mimetype === "application/pdf") return "pdf";
    if (mimetype.startsWith("image/")) return "image";
    throw new Error(`Unsupported file type: ${mimetype}`);
  }
}

export class SupabaseFileStorage implements IFileStorage {
  async uploadFile(file: Express.Multer.File, reportId: number): Promise<FileItem> {
    return await supabaseStorage.uploadFile(file, reportId);
  }

  async deleteFile(url: string): Promise<void> {
    return await supabaseStorage.deleteFile(url);
  }

  async getFile(fileName: string): Promise<Buffer | null> {
    // For Supabase storage, files are served directly via public URLs
    // This method is not used for Supabase but needed for interface compatibility
    return null;
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
  async getFile(fileName: string): Promise<Buffer | null> {
    return this.files.get(fileName) || null;
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
  // Use database storage if available, fallback to memory storage
  if (process.env.DATABASE_URL) {
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
  // Try to use Object Storage first (persistent storage)
  if (process.env.PRIVATE_OBJECT_DIR && process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID) {
    try {
      console.log("Using Object Storage for file storage");
      return new ObjectFileStorage();
    } catch (error) {
      console.warn("Object Storage failed, trying alternatives:", error);
    }
  }

  // Try to use Supabase storage if configured
  if (process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      console.log("Using Supabase file storage");
      return new SupabaseFileStorage();
    } catch (error) {
      console.warn("Supabase file storage failed, falling back to memory storage:", error);
    }
  }
  
  console.log("Using in-memory file storage");
  return new MemoryFileStorage();
}

export const storage = createStorage();
export const fileStorage = createFileStorage();