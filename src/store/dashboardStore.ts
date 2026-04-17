import { create } from "zustand";
import type { Attendance, WasteEntry, DailyReport } from "@/types";
import { getAttendance, getReports } from "@/services/api";
import { supabase } from "@/services/supabase";

interface DashboardState {
  attendance: Attendance[];
  waste: WasteEntry[];
  reports: DailyReport[];
  isLoading: boolean;
  loadData: (studentId?: string) => Promise<void>;
  addAttendance: (a: Attendance) => void;
  addWaste: (w: WasteEntry) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  attendance: [],
  waste: [],
  reports: [],
  isLoading: false,

  loadData: async (studentId) => {
    set({ isLoading: true });
    try {
      const [att, reports, wasteRes] = await Promise.all([
        getAttendance(studentId),
        getReports(),
        supabase.from("waste_entry").select("*").order("date", { ascending: false })
      ]);

      const wasteData: WasteEntry[] = (wasteRes.data || []).map(w => ({
        id: w.id,
        mealId: w.meal_id,
        mealType: w.meal_type,
        date: w.date,
        preparedQuantity: Number(w.prepared_quantity),
        leftoverQuantity: Number(w.leftover_quantity),
        wastePercentage: Number(w.waste_percentage),
        notes: w.notes
      }));

      set({
        attendance: att,
        reports: reports,
        waste: wasteData,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      set({ isLoading: false });
    }
  },

  addAttendance: (a) => set((s) => ({ attendance: [a, ...s.attendance] })),
  addWaste: (w) => set((s) => ({ waste: [w, ...s.waste] })),
}));
