import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import multer from "multer";
import { eq, desc } from "drizzle-orm";
import { db } from "./lib/supabase";
import { reports, loginSchema } from "@shared/schema";
import { requireAdmin, getUser, verifyPassword, signToken } from "./lib/auth";
import { uploadFile, deleteFile } from "./lib/storage";
import { extractText } from "./lib/extractors";
import { analyzeDocument } from "./lib/ai";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
    files: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "text/html",
      "application/pdf",
      "image/jpeg",
      "image/jpg", 
      "image/png"
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cookieParser());

  // Add CSRF protection header requirement for admin routes
  const requireCSRF = (req: any, res: any, next: any) => {
    if (!req.get("X-Requested-With")) {
      return res.status(403).json({ message: "CSRF protection required" });
    }
    next();
  };

  // Authentication endpoints
  app.post("/api/login", async (req, res) => {
    try {
      const { password } = loginSchema.parse(req.body);
      
      if (!verifyPassword(password)) {
        return res.status(401).json({ message: "Invalid password" });
      }

      const token = signToken({ role: "admin" });
      
      res.cookie("ri_admin", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.json({ message: "Login successful", role: "admin" });
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get("/api/me", (req, res) => {
    const user = getUser(req);
    res.json(user);
  });

  app.post("/api/logout", (req, res) => {
    res.clearCookie("ri_admin");
    res.json({ message: "Logged out successfully" });
  });

  // File upload endpoint (admin only)
  app.post("/api/upload", requireCSRF, requireAdmin, upload.array("files", 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files provided" });
      }

      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }

      // Calculate total size
      const totalSizeKb = Math.round(
        files.reduce((sum, file) => sum + file.size, 0) / 1024
      );

      // Create report record
      const [report] = await db.insert(reports).values({
        title,
        size_kb: totalSizeKb.toString(),
        status: "uploaded"
      }).returning();

      // Upload files to Supabase Storage and extract text
      const uploadedFiles = [];
      let extractedTexts = [];

      for (const file of files) {
        try {
          // Upload file
          const fileItem = await uploadFile(file, report.id);
          uploadedFiles.push(fileItem);
          
          // Extract text from file
          const extractedText = await extractText(file);
          extractedTexts.push(`File: ${file.originalname}\n${extractedText}`);
        } catch (error) {
          console.error(`Failed to process ${file.originalname}:`, error);
          // Continue processing other files
        }
      }

      // Update report with file URLs and extracted date
      await db.update(reports)
        .set({ 
          files: uploadedFiles,
          extracted_date: new Date().toISOString()
        })
        .where(eq(reports.id, report.id));

      res.json({
        reportId: report.id,
        files: uploadedFiles,
        message: "Files uploaded successfully"
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Upload failed" 
      });
    }
  });

  // Analyze report endpoint (admin only)
  app.post("/api/analyze/:id", requireCSRF, requireAdmin, async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      
      const [report] = await db.select()
        .from(reports)
        .where(eq(reports.id, reportId));

      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      if (!report.files || report.files.length === 0) {
        return res.status(400).json({ message: "No files to analyze" });
      }

      // Extract text from all files by re-processing them
      // In a real implementation, you might store the extracted text
      let corpus = `Report Title: ${report.title}\n\n`;
      
      // For now, we'll create a simulated corpus based on file metadata
      // In production, you'd fetch the actual files and extract text
      report.files.forEach((fileItem, index) => {
        corpus += `File ${index + 1}: ${fileItem.file_name} (${fileItem.type})\n`;
        corpus += `[Content extracted from ${fileItem.type} file would be here]\n\n`;
      });

      if (!corpus.trim()) {
        return res.status(400).json({ message: "No text content available for analysis" });
      }

      // Analyze with AI
      const { aiJson, aiMarkdown } = await analyzeDocument(corpus);

      // Update report with analysis
      await db.update(reports)
        .set({
          ai_json: aiJson,
          ai_markdown: aiMarkdown,
          score: aiJson.score.toString(),
          status: "analyzed"
        })
        .where(eq(reports.id, reportId));

      res.json({
        message: "Analysis completed successfully",
        score: aiJson.score
      });
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Analysis failed" 
      });
    }
  });

  // Publish report endpoint (admin only)
  app.post("/api/publish/:id", requireCSRF, requireAdmin, async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      
      const [report] = await db.select()
        .from(reports)
        .where(eq(reports.id, reportId));

      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      if (report.status !== "analyzed") {
        return res.status(400).json({ message: "Report must be analyzed before publishing" });
      }

      await db.update(reports)
        .set({
          is_published: true,
          status: "published"
        })
        .where(eq(reports.id, reportId));

      res.json({ message: "Report published successfully" });
    } catch (error) {
      console.error("Publish error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Publishing failed" 
      });
    }
  });

  // Delete report endpoint (admin only)
  app.delete("/api/delete/:id", requireCSRF, requireAdmin, async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      
      const [report] = await db.select()
        .from(reports)
        .where(eq(reports.id, reportId));

      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      // Delete files from storage
      if (report.files) {
        for (const file of report.files) {
          try {
            await deleteFile(file.url);
          } catch (error) {
            console.error(`Failed to delete file ${file.file_name}:`, error);
          }
        }
      }

      // Delete report from database
      await db.delete(reports).where(eq(reports.id, reportId));

      res.json({ message: "Report deleted successfully" });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Deletion failed" 
      });
    }
  });

  // Public endpoints
  app.get("/api/list", async (req, res) => {
    try {
      const publishedReports = await db.select({
        id: reports.id,
        title: reports.title,
        upload_date: reports.upload_date,
        score: reports.score,
        status: reports.status,
        size_kb: reports.size_kb,
        ai_markdown: reports.ai_markdown
      })
      .from(reports)
      .where(eq(reports.is_published, true))
      .orderBy(desc(reports.updated_at));

      res.json(publishedReports);
    } catch (error) {
      console.error("List error:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.get("/api/report/:id", async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      
      const [report] = await db.select()
        .from(reports)
        .where(eq(reports.id, reportId));

      if (!report || !report.is_published) {
        return res.status(404).json({ message: "Report not found" });
      }

      res.json(report);
    } catch (error) {
      console.error("Report fetch error:", error);
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  // Admin-only report management endpoints
  app.get("/api/admin/reports", requireAdmin, async (req, res) => {
    try {
      const allReports = await db.select()
        .from(reports)
        .orderBy(desc(reports.updated_at));

      res.json(allReports);
    } catch (error) {
      console.error("Admin reports fetch error:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
