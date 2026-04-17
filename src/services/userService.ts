import { supabase } from "./supabase";
import type { User, UserRole } from "@/types";

export interface UserProfile extends User {
  created_at?: string;
  updated_at?: string;
}

/** Fetch user profile from Supabase */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      console.error(`[Supabase] Error fetching user profile for ${userId}:`, error.message, error);
      throw error;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role as UserRole,
      avatar: data.avatar_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

/** Save or update user profile in Supabase */
export async function saveUserProfile(user: UserProfile): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("students")
      .upsert({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar_url: user.avatar,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      if (error.code === '23505' || error.message?.includes('duplicate key')) {
        console.warn(`[Supabase] User ${user.email} already exists, skipping profile save.`);
        return true;
      }
      console.error(`[Supabase] Error saving user profile for ${user.id}:`, error.message, error);
      return false;
    }
    return true;
  } catch (error: any) {
    if (error.code === '23505' || error.message?.includes('duplicate key')) {
      console.warn(`[Supabase] User ${user.email} already exists, skipping profile save.`);
      return true;
    }
    console.error("Error saving user profile:", error.message || error);
    return false;
  }
}

/** Get all users (admin only) */
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;

    return data.map((d: any) => ({
      id: d.id,
      email: d.email,
      name: d.name,
      role: d.role as UserRole,
      avatar: d.avatar_url,
      created_at: d.created_at,
      updated_at: d.updated_at,
    }));
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
}
