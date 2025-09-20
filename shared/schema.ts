import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const reports = sqliteTable("reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  upload_date: text("upload_date").default(sql`CURRENT_TIMESTAMP`).notNull(),
  size_kb: text("size_kb").notNull(),
  extracted_date: text("extracted_date"),
  extracted_text: text("extracted_text"),
  status: text("status", { enum: ["uploaded", "analyzed", "published"] }).default("uploaded").notNull(),
  content_url: text("content_url"),
  files: text("files", { mode: "json" }).$type<FileItem[]>().default([]).notNull(),
  ai_json: text("ai_json", { mode: "json" }).$type<AIAnalysis | null>(),
  ai_markdown: text("ai_markdown"),
  score: text("score"),
  updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  is_published: integer("is_published", { mode: "boolean" }).default(false).notNull()
});

export type FileItem = {
  file_name: string;
  size_kb: number;
  type: string;
  url: string;
  extracted_text?: string;
};

export interface KPI {
  name: string;
  value: string;
  description: string;
  trend: "up" | "down" | "stable";
  percentage: number;
}

export interface Chart {
  type: "line" | "bar" | "pie" | "area";
  title: string;
  data: Array<Record<string, any>>;
  xAxisKey?: string;
  yAxisKey?: string;
}

export interface WeeklyGoal {
  title: string;
  description: string;
  metrics?: string[];
}

export interface Milestone {
  title: string;
  date: string;
  completed: boolean;
}

export interface RiskMitigation {
  title: string;
  mitigation: string;
  severity: "high" | "medium" | "low";
}

export interface AIAnalysis {
  kpis: KPI[];
  trend_summary: string;
  insights: string[];
  score: number;
  charts: Chart[];
  next_month_plan: {
    weekly_plan: WeeklyGoal[][];
    milestones: Milestone[];
    risks_mitigations: RiskMitigation[];
  };
}

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  upload_date: true,
  updated_at: true
});

export const updateReportSchema = insertReportSchema.partial();

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
export type UpdateReport = z.infer<typeof updateReportSchema>;

// Explicit Report type for better type safety
export type ReportType = {
  id: number;
  title: string;
  upload_date: Date;
  size_kb: string;
  extracted_date?: string | null;
  extracted_text?: string | null;
  status: "uploaded" | "analyzed" | "published";
  content_url?: string | null;
  files: FileItem[];
  ai_json?: AIAnalysis | null;
  ai_markdown?: string | null;
  score?: string | null;
  updated_at: Date;
  is_published: boolean;
  summary?: string;
  kpis?: KPI[];
  created_at?: Date;
};

// Auth schemas
export const loginSchema = z.object({
  password: z.string().min(1, "Password is required")
});

export type LoginRequest = z.infer<typeof loginSchema>;

export interface AdminUser {
  role: "admin";
}

export interface PublicUser {
  role: "public";
}

export type User = AdminUser | PublicUser;
