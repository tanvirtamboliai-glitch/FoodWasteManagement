import { supabase } from "@/services/supabase";
import type { Attendance, WasteEntry, FoodPreparation, DailyReport, ScanResult, MealType } from "@/types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Scan QR code for meal attendance */
export async function scanQR(studentId: string, mealId: string): Promise<ScanResult> {
  // Real Supabase implementation
  try {
    const { data: attendance, error } = await supabase
      .from("attendance")
      .insert([
        {
          student_id: studentId,
          meal_id: mealId,
          meal_type: "lunch", // This should ideally be dynamic
          date: new Date().toISOString().slice(0, 10),
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") { // Unique violation
        return { success: false, message: "Already scanned for this meal." };
      }
      throw error;
    }

    // Map DB fields back to frontend Attendance type
    const result: Attendance = {
      id: attendance.id,
      studentId: attendance.student_id,
      studentName: "Student", // Would normally fetch from profiles table
      mealId: attendance.meal_id,
      mealType: attendance.meal_type as MealType,
      date: attendance.date,
      scannedAt: attendance.created_at,
    };

    return { success: true, message: "Attendance recorded successfully!", attendance: result };
  } catch (error) {
    console.error("Supabase scan error:", error);
    return { success: false, message: "Failed to record attendance. Please try again." };
  }
}

/** Get attendance records */
export async function getAttendance(studentId?: string): Promise<Attendance[]> {
  try {
    let query = supabase.from("attendance").select("*");
    if (studentId) {
      query = query.eq("student_id", studentId);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;

    return data.map((att) => ({
      id: att.id,
      studentId: att.student_id,
      studentName: "Student",
      mealId: att.meal_id,
      mealType: att.meal_type as MealType,
      date: att.date,
      scannedAt: att.created_at,
    }));
  } catch (error) {
    console.error("Supabase fetch error:", error);
    return [];
  }
}

/** Submit food preparation record */
export async function submitFood(data: Omit<FoodPreparation, "id">): Promise<FoodPreparation> {
  await delay(500);
  return { ...data, id: `fp-${Date.now()}` };
}

/** Submit waste entry */
export async function submitWaste(data: {
  mealType: MealType;
  preparedQuantity: number;
  leftoverQuantity: number;
  notes?: string;
}): Promise<WasteEntry> {
  await delay(500);
  const wastePercentage = Math.round((data.leftoverQuantity / data.preparedQuantity) * 100 * 10) / 10;
  return {
    id: `waste-${Date.now()}`,
    mealId: `meal-${data.mealType}-${new Date().toISOString().slice(0, 10)}`,
    mealType: data.mealType,
    date: new Date().toISOString().slice(0, 10),
    preparedQuantity: data.preparedQuantity,
    leftoverQuantity: data.leftoverQuantity,
    wastePercentage,
    notes: data.notes,
  };
}

/** Get reports */
export async function getReports(): Promise<DailyReport[]> {
  await delay(400);
  return [];
}
