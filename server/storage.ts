import { db } from "./lib/supabase";
import { reports, type Report, type InsertReport } from "@shared/schema";
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
    const result = await db.delete(reports).where(eq(reports.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
