import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Profile } from "@shared/schema";
import * as api from "./api";

type WeeklySchedule = {
  [key: string]: string;
};

type UserProfile = {
  firstName: string | null;
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
  onboardingComplete: boolean;
};

type UserContextType = {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refetchProfile: () => Promise<void>;
  xp: number;
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
  firstName: null,
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
  livebarnRink: null,
  onboardingComplete: false
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

  // Fetch user schedule from separate table
  const { data: scheduleData = [] } = useQuery({
    queryKey: ["schedule"],
    queryFn: api.fetchSchedule,
  });

  // Fetch workout types for mapping IDs to codes
  const { data: workoutTypes = [] } = useQuery({
    queryKey: ["workoutTypes"],
    queryFn: api.fetchWorkoutTypes,
  });

  // Fetch lookup tables for mapping IDs
  const { data: goals = [] } = useQuery({
    queryKey: ["goals"],
    queryFn: api.fetchGoals,
  });

  const { data: positions = [] } = useQuery({
    queryKey: ["positions"],
    queryFn: api.fetchPositions,
  });

  const { data: levels = [] } = useQuery({
    queryKey: ["levels"],
    queryFn: api.fetchLevels,
  });

  const { data: tiers = [] } = useQuery({
    queryKey: ["tiers"],
    queryFn: api.fetchTiers,
  });

  // Fetch user progress (xp/tier)
  const { data: userProgress } = useQuery({
    queryKey: ["progress"],
    queryFn: api.fetchProgress,
  });

  // Profile update mutation
  const updateMutation = useMutation({
    mutationFn: api.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  // Schedule update mutation
  const scheduleMutation = useMutation({
    mutationFn: (scheduleObj: Record<string, string>) => 
      api.updateSchedule(scheduleObj, workoutTypes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
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

  // Sync state from backend meal logs when they load (only on initial load)
  useEffect(() => {
    if (!initialLoadComplete && mealLogs.length > 0) {
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
        // Only use mealId from database if it's a valid meal ID (not the mealType itself)
        if (log.mealId && log.mealId !== log.mealType) {
          newSelected[log.mealType] = log.mealId;
        }
      });
      
      setConsumedMeals(newConsumed);
      setSelectedMeals(newSelected);
      setInitialLoadComplete(true);
    } else if (!initialLoadComplete && mealLogs.length === 0) {
      setInitialLoadComplete(true);
    }
  }, [mealLogs, initialLoadComplete]);

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
      // Skip if mealId starts with "saved_" or "custom_" - those are saved by Diet.tsx directly
      if (prevMealId !== newMealId && newMealId && !newMealId.startsWith("saved_") && !newMealId.startsWith("custom_")) {
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

  // Build schedule from the separate schedule data
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const buildSchedule = (): WeeklySchedule => {
    const schedule: WeeklySchedule = {};
    
    if (scheduleData.length > 0 && workoutTypes.length > 0) {
      scheduleData.forEach((item: any) => {
        const dayName = dayNames[item.dayOfWeek];
        if (item.isRestDay) {
          schedule[dayName] = "rest";
        } else if (item.workoutTypeId) {
          const wt = workoutTypes.find((w: any) => w.id === item.workoutTypeId);
          schedule[dayName] = wt?.code || "rest";
        } else {
          schedule[dayName] = "rest";
        }
      });
    }
    
    return schedule;
  };

  // Helper functions to map IDs to codes
  const getGoalCode = (goalId: number | null): "muscle" | "fatloss" | "maintain" => {
    if (!goalId) return "muscle";
    const goal = goals.find((g: any) => g.id === goalId);
    return (goal?.code || "muscle") as any;
  };

  const getPositionCode = (positionId: number | null): "defense" | "wing" | "center" | "goalie" => {
    if (!positionId) return "defense";
    const position = positions.find((p: any) => p.id === positionId);
    return (position?.code || "defense") as any;
  };

  const getLevelCode = (levelId: number | null): "house" | "a" | "aa" | "aaa" | "junior" => {
    if (!levelId) return "aa";
    const level = levels.find((l: any) => l.id === levelId);
    return (level?.code || "aa") as any;
  };

  const getTierName = (tierId: number | null): "Bronze" | "Silver" | "Gold" | "Diamond" | "Elite" => {
    if (!tierId) return "Bronze";
    const tier = tiers.find((t: any) => t.id === tierId);
    return (tier?.name || "Bronze") as any;
  };

  // Convert backend profile to frontend format
  const profile: UserProfile = backendProfile
    ? {
        firstName: (backendProfile as any).firstName ?? null,
        age: backendProfile.age,
        weight: backendProfile.weight,
        heightFt: backendProfile.heightFt,
        heightIn: backendProfile.heightIn,
        goal: getGoalCode(backendProfile.goalId),
        position: getPositionCode(backendProfile.positionId),
        level: getLevelCode(backendProfile.levelId),
        schedule: buildSchedule(),
        workoutDuration: backendProfile.workoutDuration,
        xp: userProgress?.totalXp || 0,
        tier: getTierName(userProgress?.tierId),
        workoutHistory: workoutLogs.map(log => log.date),
        livebarnConnected: backendProfile.livebarnConnected ?? false,
        livebarnRink: backendProfile.livebarnRink ?? null,
        onboardingComplete: (backendProfile as any).onboardingComplete ?? false,
      }
    : defaultProfile;

  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<void> => {
    const { schedule, ...profileUpdates } = updates;
    
    // If schedule is included, update it separately
    if (schedule) {
      scheduleMutation.mutate(schedule);
    }
    
    // If there are other profile updates, send them to profile API
    if (Object.keys(profileUpdates).length > 0) {
      return new Promise((resolve, reject) => {
        updateMutation.mutate(profileUpdates as any, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error)
        });
      });
    }
    
    return Promise.resolve();
  }, [updateMutation, scheduleMutation]);

  const refetchProfile = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
  }, [queryClient]);

  const addXp = useCallback((amount: number) => {
    // XP is now managed automatically by the server when logging workouts/meals
    // Just invalidate the progress query to refresh the data
    queryClient.invalidateQueries({ queryKey: ["progress"] });
  }, [queryClient]);

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
    // Use selected meal ID, with sensible defaults that match baseMeals
    const defaultMeals: Record<string, string> = {
      breakfast: "oatmeal",
      lunch: "chicken_rice",
      snack: "protein_shake",
      dinner: "salmon"
    };
    const currentMealId = selectedMeals[mealType] || defaultMeals[mealType] || "oatmeal";
    const newConsumed = !consumedMeals[mealType];
    
    // Optimistically update local state first
    setConsumedMeals(prev => ({ ...prev, [mealType]: newConsumed }));
    
    // Save with the new consumed state directly
    saveMealMutation.mutate({
      date: today,
      mealType,
      mealId: currentMealId,
      consumed: newConsumed
    });
  }, [getTodayDate, selectedMeals, consumedMeals, saveMealMutation]);

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
        refetchProfile,
        xp: profile.xp,
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
