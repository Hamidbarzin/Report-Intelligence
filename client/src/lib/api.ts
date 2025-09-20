import { queryClient } from "./queryClient";
import type { ReportType } from "@shared/schema";

export interface ApiError {
  message: string;
  status: number;
}

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(endpoint, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function uploadFiles(title: string, files: FileList): Promise<any> {
  const formData = new FormData();
  formData.append("title", title);
  
  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch("/api/upload", {
    method: "POST",
    credentials: "include",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${errorText}`);
  }

  return response.json();
}

// Auth functions
export async function login(password: string) {
  return apiCall("/api/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export async function logout() {
  return apiCall("/api/logout", { method: "POST" });
}

export async function getCurrentUser() {
  return apiCall("/api/me");
}

// Report functions
export async function getPublishedReports() {
  return apiCall("/api/list");
}

export async function getReport(id: string): Promise<ReportType> {
  return apiCall(`/api/report/${id}`);
}

export async function analyzeReport(id: string) {
  return apiCall(`/api/analyze/${id}`, { method: "POST" });
}

export async function publishReport(id: string) {
  return apiCall(`/api/publish/${id}`, { method: "POST" });
}

export async function deleteReport(id: string) {
  return apiCall(`/api/delete/${id}`, { method: "DELETE" });
}

export async function getAdminReports() {
  return apiCall("/api/admin/reports");
}

// Cache invalidation helpers
export function invalidateReports() {
  queryClient.invalidateQueries({ queryKey: ["/api/list"] });
  queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
}

export function invalidateReport(id: string) {
  queryClient.invalidateQueries({ queryKey: ["/api/report", id] });
}
