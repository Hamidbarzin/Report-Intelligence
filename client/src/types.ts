// client/src/types.ts
export type FileItem = {
  file_name: string;
  size_kb: number;
  type: string;           // mime type مثل "application/pdf" | "image/png" | "text/plain"
  extracted_text?: string; // ← خطای قبلی بابت نبودن این فیلد بود
};

export type KPI = {
  key: string;
  value: number;
  target?: number;
  unit?: string;
};

export type TrendPoint = { 
  label: string; 
  value: number; 
};

export type Report = {
  id: string;
  title: string;
  summary: string;
  kpis: KPI[];
  trends?: TrendPoint[];
  created_at: string; // ISO
  files?: FileItem[];
};

