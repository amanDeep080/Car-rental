import { create } from "zustand";
import { getCurrentUser, isAuthenticated, logout as apiLogout } from "@/services/authService";

interface AuthState {
  user: ReturnType<typeof getCurrentUser>;
  isAuth: boolean;
  refresh: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getCurrentUser(),
  isAuth: isAuthenticated(),
  refresh: () => set({ user: getCurrentUser(), isAuth: isAuthenticated() }),
  logout: () => {
    apiLogout();
    set({ user: null, isAuth: false });
  },
}));
