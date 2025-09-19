import { FileItem } from "@shared/schema";

export async function extractTextFromFiles(files: FileItem[]): Promise<string> {
  const textParts: string[] = [];

  for (const file of files) {
    try {
      if (file.extracted_text) {
        textParts.push(file.extracted_text);
        continue;
      }

      // For client-side, we'll rely on server-side extraction
      // This is a placeholder for the actual extraction logic
      const response = await fetch(`/api/extract-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file })
      });

      if (response.ok) {
        const { text } = await response.json();
        textParts.push(text);
      }
    } catch (error) {
      console.warn('Failed to extract text from file:', file.file_name);
    }
  }

  return textParts.join('\n\n');
}

// Server-side extraction functions (for reference)
export function extractTextFromHTML(html: string): string {
  // Remove script and style tags
  const cleanHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                       .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Extract title
  const titleMatch = cleanHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : '';
  
  // Strip all HTML tags and decode entities
  const text = cleanHtml.replace(/<[^>]+>/g, ' ')
                       .replace(/&nbsp;/g, ' ')
                       .replace(/&amp;/g, '&')
                       .replace(/&lt;/g, '<')
                       .replace(/&gt;/g, '>')
                       .replace(/&quot;/g, '"')
                       .replace(/&#39;/g, "'")
                       .replace(/\s+/g, ' ')
                       .trim();
  
  return title ? `${title}\n\n${text}` : text;
}

export function sanitizeHTML(html: string): string {
  // This woul# thoughts

I need to build a production-ready Report Intelligence platform based on the detailed requirements and design reference. This is a comprehensive full-stack application with:

1. **Authentication System**: Admin-only access with JWT cookies and password protection
2. **File Management**: Upload system for HTML, PDF, and images using Supabase storage
3. **AI Integration**: Document analysis with text extraction and structured JSON output using OpenAI
4. **Public Interface**: Dashboard for browsing published reports with search/filtering
5. **Admin Panel**: Complete management interface for upload, analyze, publish workflows
6. **Data Visualization**: Interactive charts using Recharts from AI analysis
7. **Responsive Design**: Clean Tailwind CSS implementation matching the design reference

Key technical requirements:
- React 18 + Vite frontend with Wouter routing
- Express.js backend with Vercel serverless API support
- Supabase for PostgreSQL database and file storage
- OpenAI API for AI-powered document analysis
- JWT authentication with HttpOnly secure cookies
- File upload with validation and processing pipeline

The design reference shows a clean, professional interface with:
- Primary blue theme (hsl(214 88% 42%))
- Accent green (hsl(158 68% 38%))
- Card-based layout with rounded corners
- Tabbed navigation for report details
- Admin panel with upload interface

I'll need to implement the complete data model, API endpoints, authentication middleware, file processing pipeline, and frontend components.

# useful_guidelines_from_blueprints

From the OpenAI blueprint:
- Use "gpt-5" as the newest OpenAI model (released August 7, 2025)
- Use response_format: { type: "json_object" } for structured output
- gpt-5 doesn't support temperature parameter
- Use vision capabilities for image analysis

From the Supabase blueprint:
- Connect directly to Supabase PostgreSQL using Drizzle ORM
- Don't install @supabase/supabase-js package
- Use DATABASE_URL from Supabase connection string

# directory_structure

```json
[
    {"path": "shared/schema.ts", "status": "overwritten"},
    {"path": "server/lib/auth.ts", "status": "new"},
    {"path": "server/lib/supabase.ts", "status": "new"},
    {"path": "server/lib/storage.ts", "status": "new"},
    {"path": "server/lib/ai.ts", "status": "new"},
    {"path": "server/lib/extractors.ts", "status": "new"},
    {"path": "server/lib/jsonSafeParse.ts", "status": "new"},
    {"path": "server/routes.ts", "status": "overwritten"},
    {"path": "server/storage.ts", "status": "overwritten"},
    {"path": "client/src/lib/api.ts", "status": "new"},
    {"path": "client/src/components/Dashboard.tsx", "status": "new"},
    {"path": "client/src/components/ReportView.tsx", "status": "new"},
    {"path": "client/src/components/AdminPanel.tsx", "status": "new"},
    {"path": "client/src/components/AdminLogin.tsx", "status": "new"},
    {"path": "client/src/components/ReportCard.tsx", "status": "new"},
    {"path": "client/src/components/FileUploader.tsx", "status": "new"},
    {"path": "client/src/components/ChartsBoard.tsx", "status": "new"},
    {"path": "client/src/components/ThemeProvider.tsx", "status": "new"},
    {"path": "client/src/pages/dashboard.tsx", "status": "new"},
    {"path": "client/src/pages/report.tsx", "status": "new"},
    {"path": "client/src/pages/admin.tsx", "status": "new"},
    {"path": "client/src/App.tsx", "status": "overwritten"},
    {"path": "client/src/index.css", "status": "overwritten"},
    {"path": "tailwind.config.ts", "status": "overwritten"},
    {"path": ".env.example", "status": "new"},
    {"path": "README.md", "status": "new"}
]
