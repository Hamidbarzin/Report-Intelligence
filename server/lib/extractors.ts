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
  const html = buffer.toString("utf-8");
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // Remove script and style elements
  const scripts = document.querySelectorAll("script, style");
  scripts.forEach(el => el.remove());
  
  // Extract title
  const title = document.querySelector("title")?.textContent || "";
  
  // Extract body text
  const bodyText = document.body?.textContent || document.documentElement.textContent || "";
  
  return `${title}\n\n${bodyText}`.trim();
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
