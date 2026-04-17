import { supabase } from "@/services/supabase";
import type { Attendance, WasteEntry, FoodPreparation, DailyReport, ScanResult, MealType } from "@/types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Scan QR code for meal attendance */
export async function scanQR(studentId: string, qrData: string): Promise<ScanResult> {
  try {
    // 1. Precise QR Parsing (consistent with server.js)
    const knownMeals = ["breakfast", "lunch", "dinner", "snack", "launch"];
    const qrLower = qrData.trim().toLowerCase();
    
    let mealType = null;
    let messId = "default_mess";

    if (qrData.includes('|')) {
        const parts = qrData.split('|');
        messId = parts[0].trim();
        const secondPart = parts[1].trim().toLowerCase();
        const match = knownMeals.find(m => secondPart.includes(m));
        if (match) {
            mealType = match === "launch" ? "lunch" : match;
        }
    }

    if (!mealType) {
        const match = knownMeals.find(m => qrLower.includes(m));
        if (match) {
            mealType = match === "launch" ? "lunch" : match;
            messId = (qrLower === match) ? "default_mess" : qrData.trim();
        }
    }

    if (!mealType) {
        return { 
            success: false, 
            message: "Invalid QR: No meal type (breakfast/lunch/dinner) detected. Ensure your QR contains a valid meal name." 
        };
    }

    // Fetch the student's name first
    const { data: studentData } = await supabase
        .from("students")
        .select("name")
        .eq("id", studentId)
        .single();

    const { data: attendance, error } = await supabase
      .from("attendance")
      .insert([
        {
          student_id: studentId,
          student_name: studentData?.name || "Unknown",
          mess_id: messId,
          meal_type: mealType,
          // Calculate the date in IST (Asia/Kolkata) to ensure correct day tracking
          date: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }),
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") { // Unique violation
        return { success: false, message: "Already scanned for this meal." };
      }
      console.error(`[Supabase] Scan error for student ${studentId} and QR ${qrData}:`, error.message, error);
      throw error;
    }

    // Map DB fields back to frontend Attendance type
    const result: Attendance = {
      id: attendance.id,
      studentId: attendance.student_id,
      studentName: attendance.student_name || "Student",
      mealId: attendance.mess_id,
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
    if (error) {
      console.error("[Supabase] Error fetching attendance records:", error.message, error);
      throw error;
    }

    return data.map((att) => ({
      id: att.id,
      studentId: att.student_id,
      studentName: att.student_name || "Student",
      mealId: att.mess_id,
      mealType: att.meal_type as MealType,
      date: att.date,
      scannedAt: att.created_at,
    }));
  } catch (error: any) {
    console.error("Supabase fetch error:", error.message || error);
    return [];
  }
}

/** Submit food preparation record */
export async function submitFood(data: Omit<FoodPreparation, "id">): Promise<FoodPreparation> {
  try {
    const { data: record, error } = await supabase
      .from("food_preparation")
      .insert([
        {
          meal_type: data.mealType,
          date: data.date,
          items: data.items,
          quantity: data.quantity,
          prepared_by: data.preparedBy,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[Supabase] Error submitting food preparation:", error.message, error);
      throw error;
    }

    return {
      id: record.id,
      mealType: record.meal_type as MealType,
      date: record.date,
      items: record.items,
      quantity: Number(record.quantity),
      preparedBy: record.prepared_by,
    };
  } catch (error: any) {
    console.error("Supabase submitFood error:", error.message || error);
    throw error;
  }
}

/** Submit waste entry */
export async function submitWaste(data: {
  mealType: MealType;
  preparedQuantity: number;
  leftoverQuantity: number;
  notes?: string;
}): Promise<WasteEntry> {
  try {
    const mealId = `meal-${data.mealType}-${new Date().toISOString().slice(0, 10)}`;
    const wastePercentage = Math.round((data.leftoverQuantity / data.preparedQuantity) * 100 * 10) / 10;
    
    const { data: record, error } = await supabase
      .from("waste_entry")
      .insert([
        {
          meal_id: mealId,
          meal_type: data.mealType,
          date: new Date().toISOString().slice(0, 10),
          prepared_quantity: data.preparedQuantity,
          leftover_quantity: data.leftoverQuantity,
          waste_percentage: wastePercentage,
          notes: data.notes,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[Supabase] Error submitting waste entry:", error.message, error);
      throw error;
    }

    return {
      id: record.id,
      mealId: record.meal_id,
      mealType: record.meal_type as MealType,
      date: record.date,
      preparedQuantity: Number(record.prepared_quantity),
      leftoverQuantity: Number(record.leftover_quantity),
      wastePercentage: Number(record.waste_percentage),
      notes: record.notes,
    };
  } catch (error: any) {
    console.error("Supabase submitWaste error:", error.message || error);
    throw error;
  }
}

/** Get reports */
export async function getReports(): Promise<DailyReport[]> {
  try {
    const { data: attendanceData, error: attendanceError } = await supabase.from("attendance").select("date");
    const { data: foodData, error: foodError } = await supabase.from("food_preparation").select("*");
    const { data: wasteData, error: wasteError } = await supabase.from("waste_entry").select("*");
    const { count: totalStudents, error: studentsError } = await supabase
      .from("students")
      .select("id", { count: 'exact', head: true })
      .eq("role", "student");

    if (attendanceError) console.warn("[Supabase] Attendance query error:", attendanceError.message);
    if (foodError) console.warn("[Supabase] Food prep query error:", foodError.message);
    if (wasteError) console.warn("[Supabase] Waste query error:", wasteError.message);
    if (studentsError) console.warn("[Supabase] Student count error:", studentsError.message);

    const reports: DailyReport[] = [];
    const dates = [...new Set([
      ...(attendanceData?.map(d => d.date) || []),
      ...(foodData?.map(d => d.date) || []),
      ...(wasteData?.map(d => d.date) || [])
    ])].sort().reverse().slice(0, 7);

    for (const date of dates) {
      const dayAttendance = attendanceData?.filter(d => d.date === date).length || 0;
      const dayFood = foodData?.filter(d => d.date === date) || [];
      const dayWaste = wasteData?.filter(d => d.date === date) || [];

      const totalPrepared = dayFood.reduce((sum, f) => sum + Number(f.quantity), 0);
      const totalLeftover = dayWaste.reduce((sum, w) => sum + Number(w.leftover_quantity), 0);
      const wastePercentage = totalPrepared > 0 ? (totalLeftover / totalPrepared) * 100 : 0;

      reports.push({
        date,
        totalAttendance: dayAttendance,
        expectedAttendance: totalStudents || 0,
        totalPrepared,
        totalLeftover,
        wastePercentage: Math.round(wastePercentage * 10) / 10,
      });
    }

    return reports;
  } catch (error: any) {
    console.error("Supabase getReports error:", error.message || error);
    return [];
  }
}
