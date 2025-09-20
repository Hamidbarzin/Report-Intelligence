import { JSDOM } from "jsdom";
// analyzeImage function will be implemented separately

// Lazy import pdf-parse to avoid startup issues
let pdfParse: any = null;
async function getPdfParse() {
  if (!pdfParse) {
    try {
      const pdfModule = await import("pdf-parse");
      pdfParse = pdfModule.default;
    } catch (error) {
      console.warn("pdf-parse not available:", error);
      pdfParse = null;
    }
  }
  return pdfParse;
}

export async function extractText(file: Express.Multer.File): Promise<string> {
  switch (file.mimetype) {
    case "text/html":
      return extractFromHTML(file.buffer);
    case "application/pdf":
      return extractFromPDF(file.buffer);
    case "image/jpeg":
    case "image/jpg":
    case "image/png":
      return extractFromImage(file.buffer);
    default:
      throw new Error(`Unsupported file type: ${file.mimetype}`);
  }
}

function extractFromHTML(buffer: Buffer): string {
  try {
    // Try to detect encoding from BOM or meta tags
    let html = '';
    
    // Check for BOM (Byte Order Mark)
    if (buffer.length >= 3) {
      const bom = buffer.subarray(0, 3);
      if (bom[0] === 0xEF && bom[1] === 0xBB && bom[2] === 0xBF) {
        // UTF-8 BOM detected
        html = buffer.subarray(3).toString("utf-8");
      } else if (buffer.length >= 2) {
        const bom2 = buffer.subarray(0, 2);
        if ((bom2[0] === 0xFF && bom2[1] === 0xFE) || (bom2[0] === 0xFE && bom2[1] === 0xFF)) {
          // UTF-16 BOM detected
          html = buffer.toString("utf16le");
        } else {
          // No BOM, try UTF-8
          html = buffer.toString("utf-8");
        }
      } else {
        html = buffer.toString("utf-8");
      }
    } else {
      html = buffer.toString("utf-8");
    }

    // If UTF-8 decoding produced invalid characters, try other encodings
    if (html.includes('\uFFFD')) {
      console.log("Invalid UTF-8 characters detected, trying alternative encodings");
      try {
        html = buffer.toString("latin1");
      } catch (error) {
        console.warn("Latin1 encoding failed, falling back to UTF-8");
        html = buffer.toString("utf-8");
      }
    }

    // Clean up the HTML before parsing
    html = html.replace(/^\uFEFF/, ''); // Remove BOM if present
    
    // Parse with JSDOM
    const dom = new JSDOM(html, {
      contentType: "text/html",
      includeNodeLocations: false,
      storageQuota: 10000000
    });
    const document = dom.window.document;
    
    // Remove script and style elements
    const scripts = document.querySelectorAll("script, style, noscript");
    scripts.forEach(el => el.remove());
    
    // Extract title
    const title = document.querySelector("title")?.textContent?.trim() || "";
    
    // Extract meta description as additional context
    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || "";
    
    // Extract body text with better handling
    let bodyText = "";
    if (document.body) {
      bodyText = document.body.textContent || "";
    } else if (document.documentElement) {
      bodyText = document.documentElement.textContent || "";
    }
    
    // Clean up extracted text
    bodyText = bodyText
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();
    
    // Combine extracted parts
    let result = '';
    if (title) result += `Title: ${title}\n\n`;
    if (metaDesc) result += `Description: ${metaDesc}\n\n`;
    if (bodyText) result += `Content: ${bodyText}`;
    
    return result.trim() || "No readable content found in HTML file";
    
  } catch (error) {
    console.error("HTML extraction error:", error);
    
    // Fallback: try simple text extraction without JSDOM
    try {
      let html = buffer.toString("utf-8");
      
      // Remove HTML tags with regex as fallback
      html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                 .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                 .replace(/<[^>]+>/g, ' ')
                 .replace(/&nbsp;/g, ' ')
                 .replace(/&amp;/g, '&')
                 .replace(/&lt;/g, '<')
                 .replace(/&gt;/g, '>')
                 .replace(/&quot;/g, '"')
                 .replace(/&#39;/g, "'")
                 .replace(/\s+/g, ' ')
                 .trim();
                 
      return html || "Failed to extract content from HTML file";
      
    } catch (fallbackError) {
      console.error("HTML fallback extraction failed:", fallbackError);
      return `HTML file processing failed. Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}

async function extractFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfParser = await getPdfParse();
    if (!pdfParser) {
      console.warn("PDF parser not available, falling back to OCR");
      return extractFromImage(buffer);
    }
    const data = await pdfParser(buffer);
    return data.text;
  } catch (error) {
    // If PDF parsing fails, fall back to OCR via AI vision
    console.warn("PDF parsing failed, falling back to OCR:", error);
    return extractFromImage(buffer);
  }
}

async function extractFromImage(buffer: Buffer): Promise<string> {
  const base64 = buffer.toString("base64");
  // For now, return a placeholder until AI vision is implemented
  return "Image content extracted (OCR functionality to be implemented)";
}
