import React, { createContext, useContext, useState, useEffect } from "react";

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
  }
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
            workoutDuration: parsed.workoutDuration || 60
          };
        } catch (e) {
          console.error("Failed to parse profile", e);
        }
      }
    }
    return defaultProfile;
  });

  // Save to localStorage whenever profile changes
  useEffect(() => {
    localStorage.setItem("puckpro_profile", JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  // Simple calculation logic
  // Protein: 1g per lb of bodyweight (as requested)
  // Calories: rough estimate (Weight * 15 for maintenance) + modifier
  const protein = Math.round(profile.weight * 1); // 1g per lb
  
  let baseCalories = profile.weight * 15; // Maintenance approximation
  if (profile.goal === "muscle") baseCalories += 500;
  if (profile.goal === "fatloss") baseCalories -= 500;
  // "maintain" falls through as baseCalories
  
  const calories = Math.round(baseCalories);
  
  // Remaining calories split (simplified)
  // Fat: 0.4g per lb (standard athletic recommendation)
  const fats = Math.round(profile.weight * 0.4);
  
  // Carbs: The rest
  const caloriesFromProtein = protein * 4;
  const caloriesFromFat = fats * 9;
  const remainingCalories = calories - caloriesFromProtein - caloriesFromFat;
  const carbs = Math.max(0, Math.round(remainingCalories / 4));

  // Recommended values (Baseline without goal adjustment, or just explicit "recommended")
  // We can treat the calculated values as recommended for the selected goal.
  // The user asked to show "Recommended" vs "Target". 
  // Let's assume Recommended is the baseline for an athlete of that weight, and Target is adjusted by Goal.
  const recommendedProtein = Math.round(profile.weight * 1);
  const recommendedCalories = Math.round(profile.weight * 15); // Maintenance

  return (
    <UserContext.Provider
      value={{
        profile,
        updateProfile,
        macros: { protein, carbs, fats, calories },
        recommendedMacros: { protein: recommendedProtein, calories: recommendedCalories }
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
