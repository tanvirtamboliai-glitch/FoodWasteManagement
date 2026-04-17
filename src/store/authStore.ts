import { create } from "zustand";
import type { User, UserRole } from "@/types";
import { DEMO_USERS } from "@/constants";
import { saveUserProfile, getUserProfile } from "@/services/userService";
import { supabase } from "@/services/supabase";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; needsVerification: boolean; message?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  updatePassword: (password: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    
    // Check for demo login first
    const demoUser = Object.values(DEMO_USERS).find(u => u.email === email && (u as any).password === password);
    if (demoUser) {
      await saveUserProfile(demoUser);
      set({ user: demoUser, isAuthenticated: true, isLoading: false });
      return true;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("No user found");

      // Fetch profile from 'user' table
      const profile = await getUserProfile(data.user.id);
      if (!profile) {
        // Fallback: create profile if missing (should normally be handled by signup)
        const role = email.includes("admin") ? "admin" : email.includes("staff") ? "staff" : "student";
        const newUser: User = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.full_name || email.split("@")[0],
          role: (data.user.user_metadata?.role as UserRole) || role,
        };
        await saveUserProfile(newUser);
        set({ user: newUser, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: profile, isAuthenticated: true, isLoading: false });
      }
      return true;
    } catch (error: any) {
      console.error("Login error:", error.message);
      set({ isLoading: false });
      return false;
    }
  },

  signup: async (email: string, password: string, name: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: "student",
          },
        },
      });

      // Special handling for email rate limits - allow the user to proceed as a "Guest" locally
      if (error && error.message.includes("email rate limit exceeded")) {
        console.warn("[Supabase] Email rate limit exceeded. Creating local-only profile.");
        const localId = `local-${Date.now()}`;
        const newUser: User = {
          id: localId,
          email,
          name,
          role: "student",
        };
        await saveUserProfile(newUser);
        set({ user: newUser, isAuthenticated: true, isLoading: false });
        return { success: true, needsVerification: false };
      }

      if (error) throw error;
      if (!data.user) throw new Error("Signup failed");

      // Sync with 'user' table
      const newUser: User = {
        id: data.user.id,
        email: data.user.email || email,
        name: name,
        role: "student",
      };
      
      const success = await saveUserProfile(newUser);
      if (!success) {
        console.warn("[Supabase] Failed to sync user profile after signup.");
      }

      // If session exists, user is auto-confirmed. Otherwise, they need verification.
      const needsVerification = !data.session;
      
      if (!needsVerification) {
        set({ user: newUser, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }

      return { success: true, needsVerification };
    } catch (error: any) {
      console.error("Signup error:", error.message);
      set({ isLoading: false });
      
      if (error.code === '23505' || error.message?.includes('duplicate key')) {
        return { success: false, needsVerification: false, message: "An account with this email already exists. Please log in instead." };
      }
      
      return { success: false, needsVerification: false, message: error.message };
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      set({ isLoading: false });
      return { success: true };
    } catch (error: any) {
      console.error("Reset password error:", error.message);
      set({ isLoading: false });
      return { success: false, message: error.message };
    }
  },

  updatePassword: async (password: string) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      console.error("Update password error:", error.message);
      set({ isLoading: false });
      return false;
    }
  },
}));
