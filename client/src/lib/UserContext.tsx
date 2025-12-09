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
    // Use local date to avoid timezone issues
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    
    const dayIndex = now.getDay();
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayName = dayNames[dayIndex];
    const workoutType = profile.schedule[dayName] || "rest";
    
    workoutMutation.mutate({ date: today, workoutType });
  }, [profile.schedule, workoutMutation]);

  const undoWorkout = useCallback(() => {
    // Use local date to avoid timezone issues
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
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

  // Calculate macros using evidence-based formulas for youth hockey athletes
  // Sources: PMC research, ISSA, sports nutrition guidelines
  // Teen athletes (13-16): Maintenance 2,200-3,200 cal/day depending on size/activity
  
  const weightKg = profile.weight * 0.453592; // Convert lbs to kg
  const heightCm = (profile.heightFt * 12 + profile.heightIn) * 2.54; // Convert to cm
  
  // BMR using Mifflin-St Jeor equation
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * profile.age + 5;
  
  // Activity multiplier based on hockey level (moderate-high activity)
  // 1.55 = moderate active, 1.725 = very active, 1.9 = extremely active
  const levelMultiplier = {
    house: 1.55,
    a: 1.65,
    aa: 1.725,
    aaa: 1.8,
    junior: 1.9
  };
  const activityMultiplier = levelMultiplier[profile.level] || 1.65;
  
  // Calculate maintenance calories
  let maintenanceCalories = bmr * activityMultiplier;
  
  // Age-appropriate minimum floors (prevent underfueling during growth)
  const minCalories = profile.age <= 13 ? 2000 : profile.age <= 15 ? 2200 : profile.age <= 17 ? 2400 : 2000;
  maintenanceCalories = Math.max(maintenanceCalories, minCalories);
  
  // Goal adjustments based on research:
  // - Muscle gain: +300-500 cal surplus
  // - Fat loss: NOT recommended for teens, but if selected, very mild deficit with floor
  // - Maintain: maintenance calories
  let goalCalories = maintenanceCalories;
  
  if (profile.goal === "muscle") {
    goalCalories = maintenanceCalories + 350; // Moderate surplus for muscle gain
  } else if (profile.goal === "fatloss") {
    // Very conservative for youth - focus on body recomposition, not aggressive cuts
    // Only 10-15% reduction with strict minimums
    const mildDeficit = maintenanceCalories * 0.1;
    goalCalories = Math.max(maintenanceCalories - mildDeficit, minCalories);
  }
  
  const calories = Math.round(goalCalories);
  
  // Protein: 1.2-1.5 g/kg for teen athletes (0.55-0.68 g/lb)
  const protein = Math.round(profile.weight * 0.6);
  
  // Fat: 25-30% of calories (essential for growth and hormones)
  const fats = Math.round((calories * 0.28) / 9);
  
  // Carbs: Remaining calories (primary fuel for hockey)
  const caloriesFromProtein = protein * 4;
  const caloriesFromFat = fats * 9;
  const remainingCalories = calories - caloriesFromProtein - caloriesFromFat;
  const carbs = Math.max(0, Math.round(remainingCalories / 4));

  const recommendedProtein = Math.round(profile.weight * 0.6);
  const recommendedCalories = Math.round(maintenanceCalories);

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
