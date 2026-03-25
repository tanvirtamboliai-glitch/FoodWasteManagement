import type { Meal, MealType } from "@/types";

export const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
];

export const MEAL_TIMES: Record<MealType, { start: string; end: string }> = {
  breakfast: { start: "07:00", end: "09:30" },
  lunch: { start: "12:00", end: "14:30" },
  dinner: { start: "18:00", end: "21:00" },
};

export const DEMO_USERS = {
  student: { id: "s1", name: "Alex Chen", email: "alex@university.edu", role: "student" as const },
  staff: { id: "st1", name: "Maria Lopez", email: "maria@university.edu", role: "staff" as const },
  admin: { id: "a1", name: "Dr. James Wilson", email: "james@university.edu", role: "admin" as const },
};

export function getCurrentMeal(): Meal | null {
  const now = new Date();
  const hours = now.getHours();
  const mins = now.getMinutes();
  const time = hours * 60 + mins;

  for (const [type, t] of Object.entries(MEAL_TIMES)) {
    const [sh, sm] = t.start.split(":").map(Number);
    const [eh, em] = t.end.split(":").map(Number);
    if (time >= sh * 60 + sm && time <= eh * 60 + em) {
      return {
        id: `meal-${type}-${now.toISOString().slice(0, 10)}`,
        type: type as MealType,
        date: now.toISOString().slice(0, 10),
        startTime: t.start,
        endTime: t.end,
      };
    }
  }
  return null;
}

/** For demo: always allow scanning */
export function isMealTime(): boolean {
  return true;
}
