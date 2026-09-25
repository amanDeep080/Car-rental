import { api } from "@/lib/api";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  roles: string[];
}

export async function getMyProfile(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>("/users/me");
  return data;
}

export async function updateMyProfile(input: {
  fullName: string;
  phone: string;
  dateOfBirth?: string | null;
}): Promise<UserProfile> {
  const { data } = await api.put<UserProfile>("/users/me", input);
  return data;
}
