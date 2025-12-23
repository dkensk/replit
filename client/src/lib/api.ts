import type { Profile, UpdateProfile, WorkoutLog, MealLog } from "@shared/schema";

const API_BASE = "/api";

export async function fetchProfile(): Promise<Profile> {
  const res = await fetch(`${API_BASE}/profile`);
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function updateProfile(updates: UpdateProfile): Promise<Profile> {
  const res = await fetch(`${API_BASE}/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

export async function fetchWorkoutLogs(): Promise<WorkoutLog[]> {
  const res = await fetch(`${API_BASE}/workouts`);
  if (!res.ok) throw new Error("Failed to fetch workout logs");
  return res.json();
}

export async function logWorkout(date: string, workoutType: string): Promise<WorkoutLog> {
  const res = await fetch(`${API_BASE}/workouts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, workoutType }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to log workout");
  }
  return res.json();
}

export async function deleteWorkout(date: string): Promise<void> {
  const res = await fetch(`${API_BASE}/workouts/${date}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete workout");
  }
}

export async function fetchMealLogs(date: string): Promise<MealLog[]> {
  const res = await fetch(`${API_BASE}/meals/${date}`);
  if (!res.ok) throw new Error("Failed to fetch meal logs");
  return res.json();
}

export async function upsertMealLog(
  date: string,
  mealType: string,
  mealId: string,
  consumed: boolean
): Promise<MealLog> {
  const res = await fetch(`${API_BASE}/meals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, mealType, mealId, consumed }),
  });
  if (!res.ok) throw new Error("Failed to save meal log");
  return res.json();
}

export async function toggleMealConsumed(date: string, mealType: string): Promise<MealLog> {
  const res = await fetch(`${API_BASE}/meals/toggle`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, mealType }),
  });
  if (!res.ok) throw new Error("Failed to toggle meal");
  return res.json();
}

export async function promoteTier(): Promise<Profile> {
  const res = await fetch(`${API_BASE}/profile/promote`, {
    method: "POST",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to promote tier");
  }
  return res.json();
}

// Wrapper for saving meal log with object param (includes optional nutrition data)
export async function saveMealLog(data: {
  date: string;
  mealType: string;
  mealId: string;
  consumed: boolean;
  mealName?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}): Promise<MealLog> {
  const res = await fetch(`${API_BASE}/meals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save meal log");
  return res.json();
}

// Wrapper for toggling meal with object param
export async function toggleMeal(data: { date: string; mealType: string }): Promise<MealLog> {
  return toggleMealConsumed(data.date, data.mealType);
}

// Fetch user schedule
export async function fetchSchedule(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/schedule`);
  if (!res.ok) throw new Error("Failed to fetch schedule");
  return res.json();
}

// Update user schedule - converts object format to array format
export async function updateSchedule(
  scheduleObj: Record<string, string>,
  workoutTypes: any[]
): Promise<any[]> {
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  
  const scheduleArray = dayNames.map((dayName, index) => {
    const workoutCode = scheduleObj[dayName] || "rest";
    const isRestDay = workoutCode === "rest" || workoutCode === "active_recovery";
    const workoutType = workoutTypes.find((wt: any) => wt.code === workoutCode);
    
    return {
      dayOfWeek: index,
      workoutTypeId: workoutType?.id || null,
      isRestDay
    };
  });
  
  const res = await fetch(`${API_BASE}/schedule`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ schedule: scheduleArray }),
  });
  if (!res.ok) throw new Error("Failed to update schedule");
  return res.json();
}

// Fetch workout types
export async function fetchWorkoutTypes(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/lookups/workout-types`);
  if (!res.ok) throw new Error("Failed to fetch workout types");
  return res.json();
}

// Fetch goals lookup
export async function fetchGoals(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/lookups/goals`);
  if (!res.ok) throw new Error("Failed to fetch goals");
  return res.json();
}

// Fetch positions lookup
export async function fetchPositions(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/lookups/positions`);
  if (!res.ok) throw new Error("Failed to fetch positions");
  return res.json();
}

// Fetch levels lookup
export async function fetchLevels(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/lookups/levels`);
  if (!res.ok) throw new Error("Failed to fetch levels");
  return res.json();
}

// Fetch tiers lookup
export async function fetchTiers(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/lookups/tiers`);
  if (!res.ok) throw new Error("Failed to fetch tiers");
  return res.json();
}

// Fetch user progress (xp/tier)
export async function fetchProgress(): Promise<any> {
  const res = await fetch(`${API_BASE}/progress`);
  if (!res.ok) throw new Error("Failed to fetch progress");
  return res.json();
}

export async function sendChatMessage(
  messages: { role: string; content: string }[],
  profile: { position: string; level: string; age: number; weight: number } | null
): Promise<string> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, profile }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to get AI response");
  }
  const data = await res.json();
  return data.response;
}
