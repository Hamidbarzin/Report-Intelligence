import { sql } from "drizzle-orm";
import { pgTable, text, varchar, bigint, timestamp, numeric, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const reports = pgTable("reports", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  title: text("title").notNull(),
  upload_date: timestamp("upload_date").defaultNow().notNull(),
  size_kb: numeric("size_kb").notNull(),
  extracted_date: text("extracted_date"),
  extracted_text: text("extracted_text"),
  status: text("status", { enum: ["uploaded", "analyzed", "published"] }).default("uploaded").notNull(),
  content_url: text("content_url"),
  files: jsonb("files").$type<FileItem[]>().default([]).notNull(),
  ai_json: jsonb("ai_json").$type<AIAnalysis | null>(),
  ai_markdown: text("ai_markdown"),
  score: numeric("score"),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  is_published: boolean("is_published").default(false).notNull()
});

export interface FileItem {
  type: "html" | "pdf" | "image";
  url: string;
  file_name: string;
  size_kb: number;
}

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
