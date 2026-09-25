import { api } from "@/lib/api";
import {
  AuthResponse,
  storeSession,
  clearSession,
  getCurrentUser,
  isAuthenticated
} from "@/lib/auth-storage";

export { getCurrentUser, isAuthenticated };
export type { AuthResponse };

export async function register(input: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
  acceptedPrivacyPolicy: boolean;
}): Promise<void> {
  await api.post("/auth/register", input);
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  storeSession(data);
  return data;
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch (e) {
    // Ignore error if already expired
  }
  clearSession();
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post("/auth/forgot-password", { email });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await api.post("/auth/reset-password", { token, newPassword });
}

export async function verifyEmail(email: string, otp: string): Promise<void> {
  await api.post("/auth/verify-email", { email, otp });
}

export async function resendOtp(email: string): Promise<void> {
  await api.post("/auth/resend-otp", null, { params: { email } });
}
