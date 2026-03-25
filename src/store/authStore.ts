import { create } from "zustand";
import type { User, UserRole } from "@/types";
import { DEMO_USERS } from "@/constants";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginAs: (role: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, _password: string) => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 800));
    const role = email.includes("admin") ? "admin" : email.includes("staff") ? "staff" : "student";
    set({ user: DEMO_USERS[role], isAuthenticated: true, isLoading: false });
    return true;
  },

  loginAs: (role: UserRole) => {
    set({ user: DEMO_USERS[role], isAuthenticated: true });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
