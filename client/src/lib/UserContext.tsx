import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type WeeklySchedule = {
  [key: string]: string; // "monday": "Legs - Strength"
};

type UserProfile = {
  age: number;
  weight: number; // lbs
  heightFt: number;
  heightIn: number;
  goal: "muscle" | "fatloss" | "maintain";
  position: "defense" | "wing" | "center" | "goalie";
  level: "house" | "a" | "aa" | "aaa" | "junior";
  schedule: WeeklySchedule;
  workoutDuration: number; // minutes
  // Gamification state
  xp: number; // 0-100
  tier: "Bronze" | "Silver" | "Gold" | "Diamond" | "Elite";
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
  // New: Lifted state for consumed meals tracking
  consumedMeals: Record<string, boolean>;
  toggleConsumedMeal: (mealId: string) => void;
  setConsumedMeals: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  // New: Consumed totals derived from selection
  consumedMacros: {
    protein: number;
    calories: number;
    carbs: number;
    fats: number;
  };
  // We need to know WHICH meals are selected to calculate consumed macros
  selectedMeals: Record<string, string>;
  setSelectedMeals: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  updateDailyStats: (stats: { protein: number; calories: number; carbs: number; fats: number }) => void;
  // Gamification methods
  addXp: (amount: number) => void;
  promoteTier: () => void;
};

const defaultSchedule: WeeklySchedule = {
  monday: "legs_strength",
  tuesday: "upper_body",
  wednesday: "skills_cardio",
  thursday: "legs_explosive",
  friday: "full_body",
  saturday: "active_recovery",
  sunday: "rest",
};

const defaultProfile: UserProfile = {
  age: 16,
  weight: 175,
  heightFt: 5,
  heightIn: 10,
  goal: "muscle",
  position: "defense",
  level: "aa",
  schedule: defaultSchedule,
  workoutDuration: 60,
  xp: 0,
  tier: "Bronze"
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(() => {
    // Load from localStorage on initialization
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("puckpro_profile");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return { 
            ...defaultProfile, 
            ...parsed, 
            schedule: parsed.schedule || defaultSchedule,
            workoutDuration: parsed.workoutDuration || 60,
            xp: parsed.xp || 0,
            tier: parsed.tier || "Bronze"
          };
        } catch (e) {
          console.error("Failed to parse profile", e);
        }
      }
    }
    return defaultProfile;
  });

  // Track consumed meals state here so it persists across navigation
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

  // Track the calculated totals
  const [consumedMacros, setConsumedMacros] = useState({
    protein: 0,
    calories: 0,
    carbs: 0,
    fats: 0
  });

  // Save to localStorage whenever profile changes
  useEffect(() => {
    localStorage.setItem("puckpro_profile", JSON.stringify(profile));
  }, [profile]);

  // WRAPPED IN USECALLBACK TO PREVENT INFINITE LOOPS
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  const addXp = useCallback((amount: number) => {
    setProfile(prev => {
      const newXp = Math.min(100, prev.xp + amount);
      return { ...prev, xp: newXp };
    });
  }, []);

  const promoteTier = useCallback(() => {
    setProfile(prev => {
      if (prev.xp < 100) return prev;
      
      const tiers: UserProfile['tier'][] = ["Bronze", "Silver", "Gold", "Diamond", "Elite"];
      const currentIndex = tiers.indexOf(prev.tier);
      const nextTier = currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : prev.tier;
      
      return { ...prev, xp: 0, tier: nextTier };
    });
  }, []);

  const toggleConsumedMeal = useCallback((mealId: string) => {
    setConsumedMeals(prev => {
      const newState = !prev[mealId];
      if (newState) {
        // Add 5 XP when marking a meal as consumed
        // We need to call addXp, but addXp is defined in the component scope.
        // To avoid dependency issues or complex refs, we can do it here if we had access to setProfile.
        // Better: useEffect in Diet.tsx or just update profile here.
        // Let's update profile here directly to keep logic centralized
        setProfile(p => ({ ...p, xp: Math.min(100, p.xp + 5) }));
      }
      return { ...prev, [mealId]: newState };
    });
  }, []);

  const updateDailyStats = useCallback((stats: { protein: number; calories: number; carbs: number; fats: number }) => {
    setConsumedMacros(stats);
  }, []);

  // Simple calculation logic
  const protein = Math.round(profile.weight * 1); // 1g per lb
  
  let baseCalories = profile.weight * 15; // Maintenance approximation
  if (profile.goal === "muscle") baseCalories += 500;
  if (profile.goal === "fatloss") baseCalories -= 500;
  
  const calories = Math.round(baseCalories);
  const fats = Math.round(profile.weight * 0.4);
  
  const caloriesFromProtein = protein * 4;
  const caloriesFromFat = fats * 9;
  const remainingCalories = calories - caloriesFromProtein - caloriesFromFat;
  const carbs = Math.max(0, Math.round(remainingCalories / 4));

  const recommendedProtein = Math.round(profile.weight * 1);
  const recommendedCalories = Math.round(profile.weight * 15);

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
        promoteTier
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
