export interface AuthUser {
  userId: string;
  fullName: string;
  email: string;
  roles: string[];
}

export interface AuthResponse {
  userId: string;
  fullName: string;
  email: string;
  roles: string[];
  accessToken: string;
  refreshToken: string;
}

export const ACCESS_KEY = "velocira_access_token";
export const REFRESH_KEY = "velocira_refresh_token";
export const USER_KEY = "velocira_user";

export function storeSession(auth: AuthResponse) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, auth.accessToken);
  localStorage.setItem(REFRESH_KEY, auth.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify({
    userId: auth.userId,
    fullName: auth.fullName,
    email: auth.email,
    roles: auth.roles
  }));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function isAuthenticated() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(ACCESS_KEY);
}
