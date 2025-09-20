import { createClient } from "@supabase/supabase-js";
import type { FileItem } from "@shared/schema";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

export async function uploadFile(
  file: Express.Multer.File,
  reportId: number
): Promise<FileItem> {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }
  
  const fileName = `${reportId}/${Date.now()}-${file.originalname}`;
  
  const { data, error } = await supabase.storage
    .from("reports_files")
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from("reports_files")
    .getPublicUrl(data.path);

  const fileType = getFileType(file.mimetype);
  
  return {
    type: fileType,
    url: publicUrl,
    file_name: file.originalname,
    size_kb: Math.round(file.size / 1024)
  };
}

export async function deleteFile(url: string): Promise<void> {
  if (!supabase) {
    return; // Silently ignore if Supabase not configured
  }
  
  const path = extractPathFromUrl(url);
  if (!path) return;

  const { error } = await supabase.storage
    .from("reports_files")
    .remove([path]);

  if (error) {
    console.error(`Failed to delete file: ${error.message}`);
  }
}

function getFileType(mimetype: string): "html" | "pdf" | "image" {
  if (mimetype === "text/html") return "html";
  if (mimetype === "application/pdf") return "pdf";
  if (mimetype.startsWith("image/")) return "image";
  throw new Error(`Unsupported file type: ${mimetype}`);
}

function extractPathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/object\/public\/reports_files\/(.+)$/);
    return pathMatch ? pathMatch[1] : null;
  } catch {
    return null;
  }
}
