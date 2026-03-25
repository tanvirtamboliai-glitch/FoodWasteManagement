import { create } from "zustand";
import type { Attendance, WasteEntry, DailyReport } from "@/types";

// Mock data generators
function generateAttendance(): Attendance[] {
  const data: Attendance[] = [];
  const names = ["Alex Chen", "Sam Rivera", "Priya Patel", "Jordan Kim", "Taylor Nguyen"];
  for (let d = 6; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().slice(0, 10);
    for (const meal of ["breakfast", "lunch", "dinner"] as const) {
      const count = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < count; i++) {
        data.push({
          id: `att-${dateStr}-${meal}-${i}`,
          studentId: `s${i + 1}`,
          studentName: names[i % names.length],
          mealId: `meal-${meal}-${dateStr}`,
          mealType: meal,
          date: dateStr,
          scannedAt: new Date(date.getTime() + Math.random() * 3600000).toISOString(),
        });
      }
    }
  }
  return data;
}

function generateWaste(): WasteEntry[] {
  const data: WasteEntry[] = [];
  for (let d = 6; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().slice(0, 10);
    for (const meal of ["breakfast", "lunch", "dinner"] as const) {
      const prepared = Math.floor(Math.random() * 50) + 80;
      const leftover = Math.floor(Math.random() * 20) + 5;
      data.push({
        id: `waste-${dateStr}-${meal}`,
        mealId: `meal-${meal}-${dateStr}`,
        mealType: meal,
        date: dateStr,
        preparedQuantity: prepared,
        leftoverQuantity: leftover,
        wastePercentage: Math.round((leftover / prepared) * 100 * 10) / 10,
      });
    }
  }
  return data;
}

function generateReports(): DailyReport[] {
  const reports: DailyReport[] = [];
  for (let d = 6; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const totalAttendance = Math.floor(Math.random() * 100) + 150;
    const totalPrepared = Math.floor(Math.random() * 100) + 250;
    const totalLeftover = Math.floor(Math.random() * 40) + 15;
    reports.push({
      date: date.toISOString().slice(0, 10),
      totalAttendance,
      expectedAttendance: 300,
      totalPrepared,
      totalLeftover,
      wastePercentage: Math.round((totalLeftover / totalPrepared) * 100 * 10) / 10,
    });
  }
  return reports;
}

interface DashboardState {
  attendance: Attendance[];
  waste: WasteEntry[];
  reports: DailyReport[];
  isLoading: boolean;
  loadData: () => Promise<void>;
  addAttendance: (a: Attendance) => void;
  addWaste: (w: WasteEntry) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  attendance: [],
  waste: [],
  reports: [],
  isLoading: false,

  loadData: async () => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 500));
    set({
      attendance: generateAttendance(),
      waste: generateWaste(),
      reports: generateReports(),
      isLoading: false,
    });
  },

  addAttendance: (a) => set((s) => ({ attendance: [a, ...s.attendance] })),
  addWaste: (w) => set((s) => ({ waste: [w, ...s.waste] })),
}));
