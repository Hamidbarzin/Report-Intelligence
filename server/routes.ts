import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import multer from "multer";
import jwt from 'jsonwebtoken'; // Assuming jwt is available
import { loginSchema } from "@shared/schema";
import { requireAdmin, getUser, verifyPassword, signToken } from "./lib/auth";
import { storage, fileStorage } from "./storage";
import { extractText } from "./lib/extractors";
import { analyzeDocument } from "./lib/ai";

// Define JWT_SECRET, assuming it's available in the environment or imported
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required for secure authentication");
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
    files: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "text/html"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("فقط فایل‌های HTML پذیرفته می‌شوند"));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cookieParser());

  // Serve object storage files 
  app.get("/objects/:objectPath(*)", requireAdmin, async (req, res) => {
    try {
      const objectPath = req.params.objectPath || "";
      const buffer = await fileStorage.getFile(objectPath);

      if (!buffer) {
        return res.status(404).json({ message: "File not found" });
      }

      // Set appropriate content type and security headers
      const ext = objectPath.split('.').pop()?.toLowerCase() || '';
      const contentType = ext === 'html' ? 'text/plain' : 'application/octet-stream';

      // Force download for HTML files to prevent same-origin execution
      if (ext === 'html') {
        res.set('Content-Disposition', 'attachment; filename=' + objectPath.split('/').pop());
      }
      
      res.set('Content-Type', contentType);
      res.set('X-Content-Type-Options', 'nosniff');
      res.send(buffer);
    } catch (error) {
      console.error('Object file serving error:', error);
      res.status(500).json({ message: "Failed to serve file" });
    }
  });

  // Serve in-memory uploaded files
  app.get("/uploads/:fileName(*)", async (req, res) => {
    try {
      const fileName = req.params.fileName || "";
      const buffer = await fileStorage.getFile(fileName);

      if (!buffer) {
        return res.status(404).json({ message: "File not found" });
      }

      // Set appropriate content type and security headers
      const ext = fileName.split('.').pop()?.toLowerCase() || '';
      const contentType = ext === 'html' ? 'text/plain' : 'application/octet-stream';

      // Force download for HTML files to prevent same-origin execution
      if (ext === 'html') {
        res.set('Content-Disposition', 'attachment; filename=' + fileName);
      }
      
      res.set('Content-Type', contentType);
      res.set('X-Content-Type-Options', 'nosniff');
      res.send(buffer);
    } catch (error) {
      console.error('File serving error:', error);
      res.status(500).json({ message: "Failed to serve file" });
    }
  });

  // Add CSRF protection header requirement for admin routes
  const requireCSRF = (req: any, res: any, next: any) => {
    // Check for X-Requested-With header
    if (!req.get("X-Requested-With")) {
      return res.status(403).json({ message: "CSRF protection required" });
    }
    
    // Additional origin validation for admin requests
    const origin = req.get('Origin');
    const referer = req.get('Referer');
    const host = req.get('Host');
    
    // Allow requests from exact same origin only
    const expectedOrigin = `https://${host}`;
    const expectedOriginHttp = `http://${host}`;
    
    if (origin && (origin === expectedOrigin || origin === expectedOriginHttp)) {
      return next();
    }
    if (referer && (referer.startsWith(expectedOrigin) || referer.startsWith(expectedOriginHttp))) {
      return next();
    }
    
    // For requests without origin/referer (like API tools), allow if X-Requested-With is present
    if (!origin && !referer) {
      return next();
    }
    
    return res.status(403).json({ message: "Invalid request origin" });
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
      const report = await storage.createReport({
        title,
        size_kb: totalSizeKb.toString(),
        status: "uploaded"
      });

      // Upload files to Supabase Storage and extract text
      const uploadedFiles = [];
      let extractedTexts = [];

      for (const file of files) {
        try {
          // Upload file
          const fileItem = await fileStorage.uploadFile(file, report.id);
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
      await storage.updateReport(report.id, {
        files: uploadedFiles,
        extracted_date: new Date().toISOString()
      });

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

      const report = await storage.getReport(reportId);

      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      if (!report.files || report.files.length === 0) {
        return res.status(400).json({ message: "No files to analyze" });
      }

      // Extract text from all files by re-processing them
      let corpus = `Report Title: ${report.title}\n\n`;
      let extractedTexts = [];

      // Process each file to extract text content
      for (const fileItem of report.files) {
        try {
          // Fetch the file from storage
          const fileName = fileItem.url.replace('uploads/', '');
          const fileBuffer = await fileStorage.getFile(fileName);
          if (fileBuffer) {
            // Create a mock file object for text extraction
            const mockFile = {
              buffer: fileBuffer,
              originalname: fileItem.file_name,
              mimetype: fileItem.type
            } as Express.Multer.File;

            const extractedText = await extractText(mockFile);
            extractedTexts.push(`File: ${fileItem.file_name}\n${extractedText}`);
          } else {
            // Fallback to metadata if file can't be retrieved
            extractedTexts.push(`File: ${fileItem.file_name} (${fileItem.type})\n[File content not accessible for analysis]\n`);
          }
        } catch (error) {
          console.error(`Failed to extract text from ${fileItem.file_name}:`, error);
          // Continue with other files
          extractedTexts.push(`File: ${fileItem.file_name} (${fileItem.type})\n[Text extraction failed]\n`);
        }
      }

      corpus += extractedTexts.join('\n\n');

      if (!corpus.trim()) {
        return res.status(400).json({ message: "No text content available for analysis" });
      }

      // Analyze with AI
      const { aiJson, aiMarkdown } = await analyzeDocument(corpus);

      // Update report with analysis
      await storage.updateReport(reportId, {
        ai_json: aiJson,
        ai_markdown: aiMarkdown,
        score: aiJson.score?.toString() || "0",
        status: "analyzed"
      });

      res.json({
        message: "Analysis completed successfully",
        score: aiJson.score || 0,
        ai_json: aiJson,
        ai_markdown: aiMarkdown
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

      const report = await storage.getReport(reportId);

      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      if (report.status !== "analyzed") {
        return res.status(400).json({ message: "Report must be analyzed before publishing" });
      }

      await storage.updateReport(reportId, {
        is_published: true,
        status: "published"
      });

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

      const report = await storage.getReport(reportId);

      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      // Delete files from storage
      if (report.files) {
        for (const file of report.files) {
          try {
            await fileStorage.deleteFile(file.url);
          } catch (error) {
            console.error(`Failed to delete file ${file.file_name}:`, error);
          }
        }
      }

      // Delete report from database
      await storage.deleteReport(reportId);

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
      const publishedReports = await storage.getPublishedReports();

      res.json(publishedReports);
    } catch (error) {
      console.error("List error:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  // Get single report endpoint (public read for published, admin for all)
  app.get("/api/report/:id", async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);

      const report = await storage.getReport(reportId);

      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      // Check if report is published for public access, or if user is admin
      const user = getUser(req);
      const isAdmin = user.role === "admin";

      // Allow access if published OR if admin
      if (!report.is_published && !isAdmin) {
        return res.status(404).json({ message: "Report not found" });
      }

      res.json(report);
    } catch (error) {
      console.error("Get report error:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to get report"
      });
    }
  });

  // Admin-only report management endpoints
  app.get("/api/admin/reports", requireAdmin, async (req, res) => {
    try {
      const allReports = await storage.getAllReports();

      res.json(allReports);
    } catch (error) {
      console.error("Admin reports fetch error:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}