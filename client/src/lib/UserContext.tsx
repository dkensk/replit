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

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Fetch today's meal logs from backend
  const { data: mealLogs = [] } = useQuery({
    queryKey: ["meals", getTodayDate()],
    queryFn: () => api.fetchMealLogs(getTodayDate()),
  });

  // Meal log mutations
  const saveMealMutation = useMutation({
    mutationFn: (data: { date: string; mealType: string; mealId: string; consumed: boolean }) =>
      api.saveMealLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
    },
  });

  const toggleMealMutation = useMutation({
    mutationFn: (data: { date: string; mealType: string }) =>
      api.toggleMeal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  // Initialize meal state from backend data
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

  // Track whether we've loaded initial data from backend
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Sync state from backend meal logs when they load
  useEffect(() => {
    if (mealLogs.length > 0) {
      const newConsumed: Record<string, boolean> = {
        breakfast: false,
        lunch: false,
        snack: false,
        dinner: false
      };
      const newSelected: Record<string, string> = {
        breakfast: "oatmeal",
        lunch: "chicken_rice",
        snack: "protein_shake",
        dinner: "salmon"
      };
      
      mealLogs.forEach((log: any) => {
        newConsumed[log.mealType] = log.consumed;
        newSelected[log.mealType] = log.mealId;
      });
      
      setConsumedMeals(newConsumed);
      setSelectedMeals(newSelected);
    }
    setInitialLoadComplete(true);
  }, [mealLogs]);

  // Save meal selection when user changes it (after initial load)
  const prevSelectedMeals = React.useRef(selectedMeals);
  useEffect(() => {
    if (!initialLoadComplete) return;
    
    const today = getTodayDate();
    const mealTypes = ["breakfast", "lunch", "snack", "dinner"];
    
    mealTypes.forEach((mealType) => {
      const prevMealId = prevSelectedMeals.current[mealType];
      const newMealId = selectedMeals[mealType];
      
      // Only save if the meal selection actually changed
      if (prevMealId !== newMealId && newMealId) {
        saveMealMutation.mutate({
          date: today,
          mealType,
          mealId: newMealId,
          consumed: consumedMeals[mealType] || false
        });
      }
    });
    
    prevSelectedMeals.current = selectedMeals;
  }, [selectedMeals, initialLoadComplete, getTodayDate, saveMealMutation, consumedMeals]);

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

  const toggleConsumedMeal = useCallback((mealType: string) => {
    const today = getTodayDate();
    const currentMealId = selectedMeals[mealType] || mealType;
    const currentConsumed = consumedMeals[mealType] || false;
    
    // First ensure the meal log exists, then toggle
    saveMealMutation.mutate(
      { date: today, mealType, mealId: currentMealId, consumed: currentConsumed },
      {
        onSuccess: () => {
          // Now toggle the consumed status
          toggleMealMutation.mutate({ date: today, mealType });
        }
      }
    );
    
    // Optimistically update local state
    setConsumedMeals(prev => ({ ...prev, [mealType]: !prev[mealType] }));
  }, [getTodayDate, selectedMeals, consumedMeals, saveMealMutation, toggleMealMutation]);

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
      goalCalories = Math.min(Math.max(baseCalories, 2300), 2600);
    } else if (profile.goal === "muscle") {
      goalCalories = Math.min(Math.max(baseCalories + 250, 2500), 2900);
    } else {
      goalCalories = Math.min(Math.max(baseCalories - 250, 2000), 2300);
    }
  } else if (profile.age <= 16) {
    // 15-16 year old ranges (slightly higher)
    if (profile.goal === "maintain") {
      goalCalories = Math.min(Math.max(baseCalories, 2400), 2800);
    } else if (profile.goal === "muscle") {
      goalCalories = Math.min(Math.max(baseCalories + 300, 2600), 3100);
    } else {
      goalCalories = Math.min(Math.max(baseCalories - 300, 2200), 2500);
    }
  } else {
    // 17+ year old ranges
    if (profile.goal === "maintain") {
      goalCalories = Math.round(baseCalories);
    } else if (profile.goal === "muscle") {
      goalCalories = Math.round(baseCalories + 350);
    } else {
      goalCalories = Math.round(Math.max(baseCalories - 350, 2000));
    }
  }
  
  // Protein: 0.8-1g per pound of body weight for all goals
  // Muscle/fat loss: 1g per lb, Maintain: 0.9g per lb
  if (profile.goal === "muscle" || profile.goal === "fatloss") {
    proteinGrams = Math.round(profile.weight * 1.0);
  } else {
    proteinGrams = Math.round(profile.weight * 0.9);
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
