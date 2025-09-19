import { apiRequest } from "./queryClient";

export interface AuthUser {
  role: 'admin' | 'public';
}

export async function login(password: string): Promise<void> {
  await apiRequest("POST", "/api/login", { password });
}

export async function logout(): Promise<void> {
  await apiRequest("POST", "/api/logout");
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiRequest("GET", "/api/me");
  return await response.json();
}

export function requireAdminHeaders() {
  return {
    'X-Requested-With': 'XMLHttpRequest'
  };
}
