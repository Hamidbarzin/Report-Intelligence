import { JSDOM } from "jsdom";
import cheerio from 'cheerio';
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
  if (!file.buffer) {
    throw new Error("No file buffer available");
  }

  const mimeType = file.mimetype;
  const fileName = file.originalname.toLowerCase();

  try {
    if (mimeType === "text/html" || fileName.endsWith(".html")) {
      const html = file.buffer.toString("utf-8");

      // Remove script and style tags completely
      const cleanHtml = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

      // Parse HTML and extract text
      const $ = cheerio.load(cleanHtml);

      // Remove unwanted elements
      $('script, style, nav, header, footer, aside, .sidebar, .menu, .navigation').remove();

      // Extract structured data
      const extractedData = {
        title: $('title').text() || $('h1').first().text(),
        tables: extractTablesData($),
        lists: extractListsData($),
        paragraphs: extractParagraphsData($),
        numbers: extractNumbersData($),
        dates: extractDatesData($)
      };

      // Get text content and clean it up
      let text = $.text();

      // Clean up whitespace and normalize
      text = text
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();

      // Enhance with structured data
      let enhancedText = text;

      if (extractedData.title) {
        enhancedText = `عنوان: ${extractedData.title}\n\n${enhancedText}`;
      }

      if (extractedData.tables.length > 0) {
        enhancedText += '\n\nداده‌های جدول:\n' + extractedData.tables.join('\n');
      }

      if (extractedData.numbers.length > 0) {
        enhancedText += '\n\nاعداد مهم: ' + extractedData.numbers.join(', ');
      }

      if (extractedData.dates.length > 0) {
        enhancedText += '\n\nتاریخ‌ها: ' + extractedData.dates.join(', ');
      }

      if (!enhancedText || enhancedText.length < 10) {
        return "محتوای متنی قابل تحلیل در فایل HTML یافت نشد.";
      }

      return enhancedText;
    }

    // Handle other file types here if needed
    throw new Error(`نوع فایل پشتیبانی نمی‌شود: ${mimeType}`);

  } catch (error) {
    console.error(`استخراج متن برای ${file.originalname} ناموفق بود:`, error);
    return `استخراج متن برای فایل ناموفق بود: ${file.originalname}`;
  }
}

function extractTablesData($: any): string[] {
  const tables: string[] = [];
  $('table').each((i: number, table: any) => {
    const rows: string[] = [];
    $(table).find('tr').each((j: number, row: any) => {
      const cells = $(row).find('td, th').map((k: number, cell: any) => $(cell).text().trim()).get();
      if (cells.length > 0) {
        rows.push(cells.join(' | '));
      }
    });
    if (rows.length > 0) {
      tables.push(rows.join('\n'));
    }
  });
  return tables;
}

function extractListsData($: any): string[] {
  const lists: string[] = [];
  $('ul, ol').each((i: number, list: any) => {
    const items = $(list).find('li').map((j: number, item: any) => $(item).text().trim()).get();
    if (items.length > 0) {
      lists.push(items.join(', '));
    }
  });
  return lists;
}

function extractParagraphsData($: any): string[] {
  const paragraphs: string[] = [];
  $('p').each((i: number, p: any) => {
    const text = $(p).text().trim();
    if (text && text.length > 20) {
      paragraphs.push(text);
    }
  });
  return paragraphs;
}

function extractNumbersData($: any): string[] {
  const text = $.text();
  const numbers = text.match(/\d+(?:\.\d+)?(?:%|درصد|تومان|ریال|دلار|\$|€|£)?/g) || [];
  return [...new Set(numbers)]; // Remove duplicates
}

function extractDatesData($: any): string[] {
  const text = $.text();
  const dates = text.match(/\d{4}[-\/]\d{1,2}[-\/]\d{1,2}|\d{1,2}[-\/]\d{1,2}[-\/]\d{4}|\d{1,2}\s+(ژانویه|فوریه|مارس|آوریل|مه|ژوئن|ژوئیه|اوت|سپتامبر|اکتبر|نوامبر|دسامبر|\u06A9\u0647|\u0622\u0628\u0627\u0646|\u0622\u0630\u0631|\u062F\u06CC|\u0628\u0647\u0645\u0646|\u0627\u0633\u0641\u0646\u062F|\u0641\u0631\u0648\u0631\u062F\u06CC\u0646|\u0627\u0631\u062F\u06CC\u0628\u0647\u0634\u062A|\u062E\u0631\u062F\u0627\u062F|\u062A\u06CC\u0631|\u0645\u0631\u062F\u0627\u062F|\u0634\u0647\u0631\u06CC\u0648\u0631|\u0645\u0647\u0631)\s+\d{4}/g) || [];
  return [...new Set(dates)]; // Remove duplicates
}