import React, { createContext, useContext, useState, useEffect } from "react";

type UserProfile = {
  age: number;
  weight: number; // lbs
  heightFt: number;
  heightIn: number;
  goal: "muscle" | "fatloss";
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
};

const defaultProfile: UserProfile = {
  age: 16,
  weight: 175,
  heightFt: 5,
  heightIn: 10,
  goal: "muscle",
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  // In a real app, we'd load this from localStorage or an API
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

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
  
  const calories = Math.round(baseCalories);
  
  // Remaining calories split (simplified)
  // Fat: 0.4g per lb (standard athletic recommendation)
  const fats = Math.round(profile.weight * 0.4);
  
  // Carbs: The rest
  const caloriesFromProtein = protein * 4;
  const caloriesFromFat = fats * 9;
  const remainingCalories = calories - caloriesFromProtein - caloriesFromFat;
  const carbs = Math.max(0, Math.round(remainingCalories / 4));

  return (
    <UserContext.Provider
      value={{
        profile,
        updateProfile,
        macros: { protein, carbs, fats, calories },
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
