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
  livebarnConnected: boolean;
  livebarnRink: string | null;
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
  workoutHistory: [],
  livebarnConnected: false,
  livebarnRink: null
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
        livebarnConnected: backendProfile.livebarnConnected ?? false,
        livebarnRink: backendProfile.livebarnRink ?? null,
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

  // Calculate macros for youth hockey athletes based on age and goal
  // Guidelines for 13-year-old active teen athletes:
  // - Maintain: 2,300-2,600 cal, protein 0.5-0.7g/lb (70-95g)
  // - Muscle: 2,500-2,900 cal (+200-300 surplus), protein 90-110g
  // - Fat loss: 2,000-2,300 cal (small 200-300 deficit)
  
  const weightKg = profile.weight * 0.453592;
  const heightCm = (profile.heightFt * 12 + profile.heightIn) * 2.54;
  
  // BMR using Mifflin-St Jeor equation
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * profile.age + 5;
  
  // Activity multiplier based on hockey level
  const levelMultiplier = {
    house: 1.55,
    a: 1.65,
    aa: 1.725,
    aaa: 1.8,
    junior: 1.9
  };
  const activityMultiplier = levelMultiplier[profile.level] || 1.65;
  
  // Calculate base maintenance calories
  let baseCalories = bmr * activityMultiplier;
  
  // Apply age-specific calorie ranges based on goal
  let goalCalories: number;
  let proteinGrams: number;
  
  if (profile.age <= 14) {
    // 13-14 year old ranges
    if (profile.goal === "maintain") {
      // Maintain: 2,300-2,600 cal
      goalCalories = Math.min(Math.max(baseCalories, 2300), 2600);
      // Protein: 0.5-0.7g/lb (70-95g for ~130lb teen)
      proteinGrams = Math.round(profile.weight * 0.6);
    } else if (profile.goal === "muscle") {
      // Muscle: 2,500-2,900 cal (+200-300 surplus)
      goalCalories = Math.min(Math.max(baseCalories + 250, 2500), 2900);
      // Protein: 90-110g range (upper safe range for teens)
      proteinGrams = Math.round(Math.min(Math.max(profile.weight * 0.75, 90), 110));
    } else {
      // Fat loss: 2,000-2,300 cal (gentle deficit)
      goalCalories = Math.min(Math.max(baseCalories - 250, 2000), 2300);
      // Protein: 0.6-0.7g/lb to preserve muscle
      proteinGrams = Math.round(profile.weight * 0.65);
    }
  } else if (profile.age <= 16) {
    // 15-16 year old ranges (slightly higher)
    if (profile.goal === "maintain") {
      goalCalories = Math.min(Math.max(baseCalories, 2400), 2800);
      proteinGrams = Math.round(profile.weight * 0.65);
    } else if (profile.goal === "muscle") {
      goalCalories = Math.min(Math.max(baseCalories + 300, 2600), 3100);
      proteinGrams = Math.round(Math.min(Math.max(profile.weight * 0.8, 100), 130));
    } else {
      goalCalories = Math.min(Math.max(baseCalories - 300, 2200), 2500);
      proteinGrams = Math.round(profile.weight * 0.7);
    }
  } else {
    // 17+ year old ranges
    if (profile.goal === "maintain") {
      goalCalories = Math.round(baseCalories);
      proteinGrams = Math.round(profile.weight * 0.7);
    } else if (profile.goal === "muscle") {
      goalCalories = Math.round(baseCalories + 350);
      proteinGrams = Math.round(profile.weight * 0.85);
    } else {
      goalCalories = Math.round(Math.max(baseCalories - 350, 2000));
      proteinGrams = Math.round(profile.weight * 0.8);
    }
  }
  
  const calories = Math.round(goalCalories);
  const protein = proteinGrams;
  
  // Fat: 25-30% of calories (essential for growth and hormones)
  const fats = Math.round((calories * 0.28) / 9);
  
  // Carbs: Remaining calories (primary fuel for hockey)
  const caloriesFromProtein = protein * 4;
  const caloriesFromFat = fats * 9;
  const remainingCalories = calories - caloriesFromProtein - caloriesFromFat;
  const carbs = Math.max(0, Math.round(remainingCalories / 4));

  const recommendedProtein = Math.round(profile.weight * 0.6);
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
