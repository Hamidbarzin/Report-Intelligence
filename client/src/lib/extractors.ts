import type { FileItem } from "@/types";

export async function extractTextFromFile(file: File): Promise<FileItem> {
  const buf = await file.arrayBuffer();
  // ... هر لاجیک واقعی خودت
  const text = await fakeOcrOrPdf(buf); // فرضی؛ متد خودت را صدا بزن

  const item: FileItem = {
    file_name: file.name,
    size_kb: Math.round(file.size / 1024),
    type: file.type || "application/octet-stream",
    extracted_text: text ?? ""
  };
  return item;
}

// اگر آرایه برمی‌گردانی، صراحتاً Promise<FileItem[]>
export async function extractMany(files: File[]): Promise<FileItem[]> {
  const out: FileItem[] = [];
  for (const f of files) out.push(await extractTextFromFile(f));
  return out;
}

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

// Helper function for text extraction
async function fakeOcrOrPdf(buf: ArrayBuffer): Promise<string> {
  // Placeholder implementation
  return "Extracted text from file";
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
  // Remove script and style tags and potentially harmful content
  const cleanHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                       .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                       .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
                       .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
                       .replace(/javascript:/gi, ''); // Remove javascript: urls

  return cleanHtml;
}
