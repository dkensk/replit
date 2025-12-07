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
