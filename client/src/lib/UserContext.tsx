import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Profile } from "@shared/schema";
import * as api from "./api";

type WeeklySchedule = {
  [key: string]: string;
};

type UserProfile = {
  age: number;
  weight: number;
  heightFt: number;
  heightIn: number;
  goal: "muscle" | "fatloss" | "maintain";
  position: "defense" | "wing" | "center" | "goalie";
  level: "house" | "a" | "aa" | "aaa" | "junior";
  schedule: WeeklySchedule;
  workoutDuration: number;
  xp: number;
  tier: "Bronze" | "Silver" | "Gold" | "Diamond" | "Elite";
  workoutHistory: string[];
};

type UserContextType = {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  };
  recommendedMacros: {
    protein: number;
    calories: number;
  };
  consumedMeals: Record<string, boolean>;
  toggleConsumedMeal: (mealId: string) => void;
  setConsumedMeals: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  consumedMacros: {
    protein: number;
    calories: number;
    carbs: number;
    fats: number;
  };
  selectedMeals: Record<string, string>;
  setSelectedMeals: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  updateDailyStats: (stats: { protein: number; calories: number; carbs: number; fats: number }) => void;
  addXp: (amount: number) => void;
  promoteTier: () => void;
  logWorkout: () => void;
  undoWorkout: () => void;
  isLoading: boolean;
};

const defaultProfile: UserProfile = {
  age: 16,
  weight: 175,
  heightFt: 5,
  heightIn: 10,
  goal: "muscle",
  position: "defense",
  level: "aa",
  schedule: {},
  workoutDuration: 60,
  xp: 0,
  tier: "Bronze",
  workoutHistory: []
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  
  // Fetch profile from backend
  const { data: backendProfile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: api.fetchProfile,
  });

  // Fetch workout logs
  const { data: workoutLogs = [] } = useQuery({
    queryKey: ["workouts"],
    queryFn: api.fetchWorkoutLogs,
  });

  // Profile update mutation
  const updateMutation = useMutation({
    mutationFn: api.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  // Workout log mutation
  const workoutMutation = useMutation({
    mutationFn: ({ date, workoutType }: { date: string; workoutType: string }) =>
      api.logWorkout(date, workoutType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  // Promote tier mutation
  const promoteMutation = useMutation({
    mutationFn: api.promoteTier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  // Undo workout mutation
  const undoWorkoutMutation = useMutation({
    mutationFn: (date: string) => api.deleteWorkout(date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  // Local state for meals (can be synced with backend later if needed)
  const [consumedMeals, setConsumedMeals] = useState<Record<string, boolean>>({
    breakfast: false,
    lunch: false,
    snack: false,
    dinner: false
  });

  const [selectedMeals, setSelectedMeals] = useState<Record<string, string>>({
    breakfast: "oatmeal",
    lunch: "chicken_rice",
    snack: "protein_shake",
    dinner: "salmon"
  });

  const [consumedMacros, setConsumedMacros] = useState({
    protein: 0,
    calories: 0,
    carbs: 0,
    fats: 0
  });

  // Convert backend profile to frontend format
  const profile: UserProfile = backendProfile
    ? {
        age: backendProfile.age,
        weight: backendProfile.weight,
        heightFt: backendProfile.heightFt,
        heightIn: backendProfile.heightIn,
        goal: backendProfile.goal as any,
        position: backendProfile.position as any,
        level: backendProfile.level as any,
        schedule: backendProfile.schedule as WeeklySchedule,
        workoutDuration: backendProfile.workoutDuration,
        xp: backendProfile.xp,
        tier: backendProfile.tier as any,
        workoutHistory: workoutLogs.map(log => log.date),
      }
    : defaultProfile;

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    updateMutation.mutate(updates as any);
  }, [updateMutation]);

  const addXp = useCallback((amount: number) => {
    if (!backendProfile) return;
    const newXp = Math.min(100, backendProfile.xp + amount);
    updateMutation.mutate({ xp: newXp });
  }, [backendProfile, updateMutation]);

  const promoteTier = useCallback(() => {
    promoteMutation.mutate();
  }, [promoteMutation]);

  const logWorkout = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const dayIndex = new Date().getDay();
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayName = dayNames[dayIndex];
    const workoutType = profile.schedule[dayName] || "rest";
    
    workoutMutation.mutate({ date: today, workoutType });
  }, [profile.schedule, workoutMutation]);

  const undoWorkout = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    undoWorkoutMutation.mutate(today);
  }, [undoWorkoutMutation]);

  const toggleConsumedMeal = useCallback((mealId: string) => {
    setConsumedMeals(prev => {
      const newState = !prev[mealId];
      if (newState && backendProfile) {
        // Add 5 XP when marking a meal as consumed
        const newXp = Math.min(100, backendProfile.xp + 5);
        updateMutation.mutate({ xp: newXp });
      }
      return { ...prev, [mealId]: newState };
    });
  }, [backendProfile, updateMutation]);

  const updateDailyStats = useCallback((stats: { protein: number; calories: number; carbs: number; fats: number }) => {
    setConsumedMacros(stats);
  }, []);

  // Calculate macros using proper formulas for youth hockey athletes
  // Research shows young hockey players need 2,750-3,000+ calories/day
  // Using Mifflin-St Jeor equation with high activity multiplier for athletes
  
  const weightKg = profile.weight * 0.453592; // Convert lbs to kg
  const heightCm = (profile.heightFt * 12 + profile.heightIn) * 2.54; // Convert to cm
  
  // BMR using Mifflin-St Jeor (assumes male hockey player)
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * profile.age + 5;
  
  // Activity multiplier: 1.8 for hockey athletes (high activity level)
  // Youth athletes need extra calories for growth (add 10-15% for ages under 18)
  const activityMultiplier = profile.age < 18 ? 1.9 : 1.8;
  let baseCalories = bmr * activityMultiplier;
  
  // Minimum calorie floors for young athletes (safety measure)
  const minCalories = profile.age <= 13 ? 2400 : profile.age <= 16 ? 2600 : 2200;
  baseCalories = Math.max(baseCalories, minCalories);
  
  // Smaller goal adjustments for young athletes (±200-300 instead of ±500)
  // Young athletes should not be in large deficits
  if (profile.goal === "muscle") baseCalories += 300;
  if (profile.goal === "fatloss") {
    // More conservative deficit for youth - only 10% reduction, minimum floor applies
    const deficit = profile.age < 16 ? 200 : 300;
    baseCalories = Math.max(baseCalories - deficit, minCalories);
  }
  
  const calories = Math.round(baseCalories);
  
  // Protein: 1.4-1.7 g/kg for hockey players (using ~1.5 g/kg = 0.68 g/lb)
  const protein = Math.round(profile.weight * 0.7);
  
  // Fat: 25-30% of calories
  const fats = Math.round((calories * 0.25) / 9);
  
  // Carbs: Remaining calories (6-8 g/kg for athletes)
  const caloriesFromProtein = protein * 4;
  const caloriesFromFat = fats * 9;
  const remainingCalories = calories - caloriesFromProtein - caloriesFromFat;
  const carbs = Math.max(0, Math.round(remainingCalories / 4));

  const recommendedProtein = Math.round(profile.weight * 0.7);
  const recommendedCalories = Math.round(bmr * activityMultiplier);

  return (
    <UserContext.Provider
      value={{
        profile,
        updateProfile,
        macros: { protein, carbs, fats, calories },
        recommendedMacros: { protein: recommendedProtein, calories: recommendedCalories },
        consumedMeals,
        toggleConsumedMeal,
        setConsumedMeals,
        selectedMeals,
        setSelectedMeals,
        consumedMacros,
        updateDailyStats,
        addXp,
        promoteTier,
        logWorkout,
        undoWorkout,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
