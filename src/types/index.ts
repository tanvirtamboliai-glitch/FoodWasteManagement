export type UserRole = "student" | "staff" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type MealType = "breakfast" | "lunch" | "dinner";

export interface Meal {
  id: string;
  type: MealType;
  date: string;
  startTime: string;
  endTime: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  mealId: string;
  mealType: MealType;
  date: string;
  scannedAt: string;
}

export interface WasteEntry {
  id: string;
  mealId: string;
  mealType: MealType;
  date: string;
  preparedQuantity: number;
  leftoverQuantity: number;
  wastePercentage: number;
  notes?: string;
}

export interface FoodPreparation {
  id: string;
  mealType: MealType;
  date: string;
  items: string[];
  quantity: number;
  preparedBy: string;
}

export interface DailyReport {
  date: string;
  totalAttendance: number;
  expectedAttendance: number;
  totalPrepared: number;
  totalLeftover: number;
  wastePercentage: number;
}

export interface ScanResult {
  success: boolean;
  message: string;
  attendance?: Attendance;
}
