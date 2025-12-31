import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Check, Target, Info, Plus, ChefHat, Camera, Loader2, History, Image } from "lucide-react";
import foodImage from "@assets/generated_images/healthy_meal_prep_food.png";
import { useUser } from "@/lib/UserContext";
import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type SavedCustomMeal = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealType: string;
  createdAt?: string;
};

type MealOption = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  recipe?: string; 
};

type MealSection = {
  id: string;
  title: string;
  options: MealOption[];
};

export default function Diet() {
  const { profile, updateProfile, macros, recommendedMacros, consumedMeals, toggleConsumedMeal, selectedMeals, setSelectedMeals, updateDailyStats } = useUser();
  
  // State for custom meal entry
  const [customMeals, setCustomMeals] = useState<Record<string, MealOption[]>>({
    breakfast: [],
    lunch: [],
    snack: [],
    dinner: []
  });
  
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState("");
  const [newMeal, setNewMeal] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: ""
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Get today's date
  const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch today's meal logs to restore custom meals
  const { data: mealLogs = [] } = useQuery<any[]>({
    queryKey: ["/api/meals", getTodayDate()],
    queryFn: async () => {
      const res = await fetch(`/api/meals/${getTodayDate()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch meal logs");
      return res.json();
    },
  });

  // Restore custom meals from meal logs on load
  useEffect(() => {
    if (mealLogs.length > 0) {
      const restoredCustomMeals: Record<string, MealOption[]> = {
        breakfast: [],
        lunch: [],
        snack: [],
        dinner: []
      };
      
      mealLogs.forEach((log: any) => {
        // If this is a custom meal (has nutrition data stored), add it to customMeals
        if (log.mealId?.startsWith("custom_") && log.mealName && log.calories != null) {
          const meal: MealOption = {
            id: log.mealId,
            name: log.mealName,
            calories: log.calories,
            protein: log.protein || 0,
            carbs: log.carbs || 0,
            fats: log.fats || 0,
            recipe: "Custom meal - no recipe instructions."
          };
          
          // Only add if not already in the list
          if (!restoredCustomMeals[log.mealType].some(m => m.id === log.mealId)) {
            restoredCustomMeals[log.mealType].push(meal);
          }
        }
      });
      
      // Merge with existing custom meals (don't overwrite user's current session additions)
      setCustomMeals(prev => ({
        breakfast: [...restoredCustomMeals.breakfast, ...prev.breakfast.filter(m => !restoredCustomMeals.breakfast.some(r => r.id === m.id))],
        lunch: [...restoredCustomMeals.lunch, ...prev.lunch.filter(m => !restoredCustomMeals.lunch.some(r => r.id === m.id))],
        snack: [...restoredCustomMeals.snack, ...prev.snack.filter(m => !restoredCustomMeals.snack.some(r => r.id === m.id))],
        dinner: [...restoredCustomMeals.dinner, ...prev.dinner.filter(m => !restoredCustomMeals.dinner.some(r => r.id === m.id))],
      }));
    }
  }, [mealLogs]);

  // Fetch saved custom meals from database
  const { data: savedCustomMeals = [] } = useQuery<SavedCustomMeal[]>({
    queryKey: ["/api/custom-meals"],
    queryFn: async () => {
      const res = await fetch("/api/custom-meals", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch custom meals");
      return res.json();
    },
  });

  // Mutation to save custom meal
  const saveCustomMealMutation = useMutation({
    mutationFn: async (meal: { name: string; calories: number; protein: number; carbs: number; fats: number; mealType: string }) => {
      const res = await fetch("/api/custom-meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meal),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save custom meal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-meals"] });
    },
  });

  // Mutation to save meal log
  const saveMealMutation = useMutation({
    mutationFn: async (data: { date: string; mealType: string; mealId: string; consumed: boolean; mealName?: string; calories?: number; protein?: number; carbs?: number; fats?: number; customMealId?: string }) => {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save meal log");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
    },
  });

  // Get saved custom meals for a specific meal type (most recent first, limit to 3)
  const getSavedMealsForType = (mealType: string) => {
    return [...savedCustomMeals]
      .filter(m => m.mealType === mealType)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 3);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      
      try {
        const response = await fetch("/api/analyze-food", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64 }),
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          setNewMeal({
            name: data.name || "",
            calories: String(data.calories || 0),
            protein: String(data.protein || 0),
            carbs: String(data.carbs || 0),
            fats: String(data.fats || 0),
          });
        } else {
          console.error("Failed to analyze food:", response.status);
          alert("Could not analyze the photo. Please try again or enter the details manually.");
        }
      } catch (error) {
        console.error("Error analyzing food:", error);
        alert("Could not analyze the photo. Please try again or enter the details manually.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Base meals with simple names AND recipes - Expanded for all ages
  const baseMeals: MealSection[] = [
    {
      id: "breakfast",
      title: "Breakfast",
      options: [
        { 
          id: "oatmeal", 
          name: "Oatmeal & Berries", 
          calories: 550, 
          protein: 35, 
          carbs: 75, 
          fats: 12,
          recipe: "1. Mix 1 cup oats with 1 scoop whey protein.\n2. Add hot water or milk and stir well.\n3. Top with 1/2 cup mixed berries and a tbsp of chia seeds."
        },
        { 
          id: "eggs_toast", 
          name: "Eggs & Toast", 
          calories: 520, 
          protein: 40, 
          carbs: 30, 
          fats: 25,
          recipe: "1. Scramble or fry 3 large eggs.\n2. Toast 2 slices of whole wheat bread.\n3. Serve with a side of spinach or fruit."
        },
        { 
          id: "yogurt_parfait", 
          name: "Yogurt Parfait", 
          calories: 450, 
          protein: 35, 
          carbs: 50, 
          fats: 10,
          recipe: "1. Fill bowl with 1 cup Greek Yogurt (0% or 2%).\n2. Layer with 1/2 cup granola and honey.\n3. Top with fresh strawberries."
        },
        { 
          id: "pancakes_protein", 
          name: "Protein Pancakes", 
          calories: 480, 
          protein: 38, 
          carbs: 55, 
          fats: 14,
          recipe: "1. Mix 1 cup pancake mix with 1 scoop protein powder.\n2. Add 1 egg and 3/4 cup milk, stir until smooth.\n3. Cook on griddle and top with fresh fruit and maple syrup."
        },
        { 
          id: "avocado_toast", 
          name: "Avocado Toast & Eggs", 
          calories: 490, 
          protein: 28, 
          carbs: 35, 
          fats: 28,
          recipe: "1. Toast 2 slices whole grain bread.\n2. Mash 1 ripe avocado and spread on toast.\n3. Top with 2 poached eggs and everything seasoning."
        },
        { 
          id: "smoothie_bowl", 
          name: "Protein Smoothie Bowl", 
          calories: 520, 
          protein: 40, 
          carbs: 60, 
          fats: 15,
          recipe: "1. Blend frozen berries, banana, Greek yogurt, and protein powder.\n2. Pour into bowl.\n3. Top with granola, chia seeds, and sliced almonds."
        },
        { 
          id: "breakfast_burrito", 
          name: "Breakfast Burrito", 
          calories: 600, 
          protein: 42, 
          carbs: 45, 
          fats: 28,
          recipe: "1. Scramble 3 eggs with diced peppers.\n2. Add black beans and shredded cheese.\n3. Wrap in large tortilla with salsa."
        },
        { 
          id: "overnight_oats", 
          name: "Overnight Oats", 
          calories: 480, 
          protein: 30, 
          carbs: 65, 
          fats: 14,
          recipe: "1. Mix 1 cup oats with 1 cup milk and Greek yogurt.\n2. Add chia seeds and honey, refrigerate overnight.\n3. Top with fresh fruit in the morning."
        },
        { 
          id: "french_toast", 
          name: "French Toast", 
          calories: 540, 
          protein: 32, 
          carbs: 60, 
          fats: 18,
          recipe: "1. Dip bread slices in beaten eggs with cinnamon.\n2. Cook on buttered griddle until golden.\n3. Serve with fruit and a drizzle of maple syrup."
        },
        { 
          id: "egg_muffins", 
          name: "Egg Muffin Cups", 
          calories: 420, 
          protein: 35, 
          carbs: 15, 
          fats: 26,
          recipe: "1. Whisk 6 eggs with diced veggies and cheese.\n2. Pour into muffin tin and bake at 350°F for 20 mins.\n3. Store extras in fridge for quick breakfasts."
        },
        { 
          id: "power_breakfast", 
          name: "Power Breakfast Platter", 
          calories: 750, 
          protein: 55, 
          carbs: 65, 
          fats: 32,
          recipe: "1. Scramble 4 eggs with cheese.\n2. Add 2 strips bacon and 2 turkey sausage links.\n3. Serve with 2 slices toast and a banana."
        },
        { 
          id: "mega_oatmeal", 
          name: "Mega Muscle Oatmeal", 
          calories: 700, 
          protein: 50, 
          carbs: 90, 
          fats: 18,
          recipe: "1. Cook 1.5 cups oats with milk.\n2. Add 2 scoops protein powder and peanut butter.\n3. Top with banana, honey, and walnuts."
        }
      ]
    },
    {
      id: "lunch",
      title: "Lunch",
      options: [
        { 
          id: "chicken_rice", 
          name: "Chicken & Rice", 
          calories: 650, 
          protein: 50, 
          carbs: 70, 
          fats: 18,
          recipe: "1. Grill 6oz chicken breast with salt/pepper.\n2. Cook 1 cup of jasmine or brown rice.\n3. Serve with steamed broccoli."
        },
        { 
          id: "turkey_wrap", 
          name: "Turkey Wrap", 
          calories: 580, 
          protein: 45, 
          carbs: 55, 
          fats: 20,
          recipe: "1. Lay out large whole wheat tortilla.\n2. Add 5oz sliced turkey, lettuce, tomato, and avocado.\n3. Roll tight and slice in half."
        },
        { 
          id: "beef_stirfry", 
          name: "Beef Stir Fry", 
          calories: 600, 
          protein: 55, 
          carbs: 10, 
          fats: 35,
          recipe: "1. Sauté sliced lean beef strips in pan.\n2. Add bell peppers, onions, and snap peas.\n3. Season with soy sauce and garlic. Serve over cauliflower rice or regular rice."
        },
        { 
          id: "tuna_salad", 
          name: "Tuna Power Salad", 
          calories: 520, 
          protein: 48, 
          carbs: 25, 
          fats: 28,
          recipe: "1. Mix 2 cans tuna with light mayo and mustard.\n2. Serve over mixed greens with cherry tomatoes.\n3. Add hard-boiled egg and olive oil dressing."
        },
        { 
          id: "chicken_caesar", 
          name: "Chicken Caesar Salad", 
          calories: 580, 
          protein: 52, 
          carbs: 20, 
          fats: 32,
          recipe: "1. Grill and slice 6oz chicken breast.\n2. Toss romaine with Caesar dressing and parmesan.\n3. Top with chicken and croutons."
        },
        { 
          id: "quinoa_bowl", 
          name: "Quinoa Power Bowl", 
          calories: 620, 
          protein: 45, 
          carbs: 65, 
          fats: 22,
          recipe: "1. Cook 1 cup quinoa according to package.\n2. Top with grilled chicken, chickpeas, and cucumber.\n3. Drizzle with tahini dressing."
        },
        { 
          id: "burrito_bowl", 
          name: "Burrito Bowl", 
          calories: 680, 
          protein: 48, 
          carbs: 70, 
          fats: 24,
          recipe: "1. Layer brown rice in bowl.\n2. Add grilled chicken, black beans, corn, and salsa.\n3. Top with cheese, sour cream, and guacamole."
        },
        { 
          id: "grilled_cheese_soup", 
          name: "Grilled Cheese & Soup", 
          calories: 550, 
          protein: 28, 
          carbs: 50, 
          fats: 28,
          recipe: "1. Make grilled cheese with whole grain bread and cheddar.\n2. Heat up tomato soup.\n3. Serve together for a classic combo."
        },
        { 
          id: "teriyaki_chicken", 
          name: "Teriyaki Chicken Bowl", 
          calories: 640, 
          protein: 52, 
          carbs: 68, 
          fats: 18,
          recipe: "1. Cook chicken thighs in teriyaki sauce.\n2. Serve over white rice with steamed edamame.\n3. Garnish with sesame seeds and green onion."
        },
        { 
          id: "turkey_sandwich", 
          name: "Turkey Club Sandwich", 
          calories: 560, 
          protein: 42, 
          carbs: 45, 
          fats: 24,
          recipe: "1. Layer turkey, bacon, lettuce, tomato on toasted bread.\n2. Add light mayo.\n3. Serve with side of fruit or chips."
        },
        { 
          id: "shrimp_tacos", 
          name: "Shrimp Tacos", 
          calories: 520, 
          protein: 40, 
          carbs: 48, 
          fats: 20,
          recipe: "1. Sauté shrimp with taco seasoning.\n2. Serve in corn tortillas with cabbage slaw.\n3. Top with lime crema and cilantro."
        },
        { 
          id: "double_chicken", 
          name: "Double Chicken Bowl", 
          calories: 850, 
          protein: 75, 
          carbs: 80, 
          fats: 24,
          recipe: "1. Grill 10oz chicken breast with seasoning.\n2. Serve over 1.5 cups rice with black beans.\n3. Top with salsa, cheese, and guacamole."
        },
        { 
          id: "steak_bowl", 
          name: "Steak Power Bowl", 
          calories: 780, 
          protein: 65, 
          carbs: 65, 
          fats: 30,
          recipe: "1. Grill 8oz flank steak to medium.\n2. Slice and serve over quinoa with roasted peppers.\n3. Top with chimichurri sauce."
        }
      ]
    },
    {
      id: "snack",
      title: "Snack",
      options: [
        { 
          id: "protein_shake", 
          name: "Protein Shake", 
          calories: 350, 
          protein: 40, 
          carbs: 40, 
          fats: 5,
          recipe: "1. Add 1 scoop whey isolate to shaker.\n2. Add 1 banana and 1 cup almond milk.\n3. Shake or blend with ice."
        },
        { 
          id: "rice_cakes_pb", 
          name: "PB & Rice Cakes", 
          calories: 300, 
          protein: 10, 
          carbs: 35, 
          fats: 14,
          recipe: "1. Take 3 plain rice cakes.\n2. Spread 1 tbsp peanut butter across them.\n3. Top with sliced banana if desired."
        },
        { 
          id: "protein_bar", 
          name: "Protein Bar", 
          calories: 240, 
          protein: 20, 
          carbs: 25, 
          fats: 9,
          recipe: "1. Unwrap and enjoy.\n2. Drink 500ml water with it for digestion."
        },
        { 
          id: "trail_mix", 
          name: "Trail Mix & Fruit", 
          calories: 320, 
          protein: 12, 
          carbs: 35, 
          fats: 18,
          recipe: "1. Mix almonds, walnuts, and dried cranberries.\n2. Add a handful of dark chocolate chips.\n3. Pair with an apple or banana."
        },
        { 
          id: "greek_yogurt", 
          name: "Greek Yogurt & Honey", 
          calories: 280, 
          protein: 25, 
          carbs: 30, 
          fats: 8,
          recipe: "1. Scoop 1 cup Greek yogurt into bowl.\n2. Drizzle with 1 tbsp honey.\n3. Sprinkle with cinnamon and walnuts."
        },
        { 
          id: "cottage_cheese", 
          name: "Cottage Cheese & Fruit", 
          calories: 260, 
          protein: 28, 
          carbs: 22, 
          fats: 8,
          recipe: "1. Scoop 1 cup cottage cheese into bowl.\n2. Top with pineapple chunks or peaches.\n3. Add a drizzle of honey."
        },
        { 
          id: "apple_almond", 
          name: "Apple & Almond Butter", 
          calories: 290, 
          protein: 8, 
          carbs: 35, 
          fats: 16,
          recipe: "1. Slice 1 medium apple.\n2. Serve with 2 tbsp almond butter for dipping.\n3. Sprinkle with cinnamon."
        },
        { 
          id: "hard_boiled_eggs", 
          name: "Hard Boiled Eggs", 
          calories: 210, 
          protein: 18, 
          carbs: 2, 
          fats: 14,
          recipe: "1. Boil 3 eggs for 10-12 minutes.\n2. Cool and peel.\n3. Season with salt and pepper."
        },
        { 
          id: "beef_jerky", 
          name: "Beef Jerky & Cheese", 
          calories: 280, 
          protein: 32, 
          carbs: 8, 
          fats: 14,
          recipe: "1. Grab 2oz beef jerky.\n2. Pair with 1oz cheese stick.\n3. Great grab-and-go option."
        },
        { 
          id: "hummus_veggies", 
          name: "Hummus & Veggies", 
          calories: 220, 
          protein: 8, 
          carbs: 25, 
          fats: 12,
          recipe: "1. Scoop 4 tbsp hummus into bowl.\n2. Cut carrots, celery, and cucumber.\n3. Dip and enjoy."
        },
        { 
          id: "smoothie", 
          name: "Fruit Smoothie", 
          calories: 340, 
          protein: 30, 
          carbs: 45, 
          fats: 6,
          recipe: "1. Blend 1 cup frozen berries with 1 scoop protein.\n2. Add 1 cup milk and banana.\n3. Blend until smooth."
        },
        { 
          id: "energy_balls", 
          name: "Energy Balls", 
          calories: 260, 
          protein: 12, 
          carbs: 28, 
          fats: 14,
          recipe: "1. Mix oats, peanut butter, honey, and chocolate chips.\n2. Roll into 6 balls.\n3. Refrigerate for 30 mins before eating."
        },
        { 
          id: "mass_gainer", 
          name: "Mass Gainer Shake", 
          calories: 650, 
          protein: 50, 
          carbs: 80, 
          fats: 18,
          recipe: "1. Blend 2 scoops protein powder with 2 cups whole milk.\n2. Add 1 banana, 2 tbsp peanut butter, and oats.\n3. Add honey and blend until smooth."
        },
        { 
          id: "pb_banana_toast", 
          name: "PB Banana Toast", 
          calories: 480, 
          protein: 18, 
          carbs: 55, 
          fats: 24,
          recipe: "1. Toast 2 slices of whole grain bread.\n2. Spread 3 tbsp peanut butter.\n3. Top with sliced banana and drizzle with honey."
        },
        { 
          id: "cheese_crackers", 
          name: "Cheese & Crackers Plate", 
          calories: 420, 
          protein: 22, 
          carbs: 35, 
          fats: 24,
          recipe: "1. Arrange variety of cheese slices on plate.\n2. Add whole grain crackers.\n3. Include some nuts and grapes."
        }
      ]
    },
    {
      id: "dinner",
      title: "Dinner",
      options: [
        { 
          id: "salmon", 
          name: "Salmon & Rice", 
          calories: 700, 
          protein: 45, 
          carbs: 60, 
          fats: 30,
          recipe: "1. Bake 6oz salmon fillet at 400°F for 12-15 mins.\n2. Serve with 1 cup wild rice.\n3. Add asparagus on the side."
        },
        { 
          id: "steak", 
          name: "Steak & Potato", 
          calories: 750, 
          protein: 60, 
          carbs: 50, 
          fats: 35,
          recipe: "1. Pan sear 8oz sirloin steak (medium rare).\n2. Bake or boil 1 medium sweet potato.\n3. Season simple with salt/pepper."
        },
        { 
          id: "pasta", 
          name: "Pasta Bolognese", 
          calories: 800, 
          protein: 50, 
          carbs: 90, 
          fats: 25,
          recipe: "1. Brown lean ground beef/turkey in pot.\n2. Add marinara sauce and simmer.\n3. Serve over 2 cups cooked pasta."
        },
        { 
          id: "chicken_breast", 
          name: "Baked Chicken Breast", 
          calories: 650, 
          protein: 55, 
          carbs: 45, 
          fats: 22,
          recipe: "1. Season chicken breast with herbs and olive oil.\n2. Bake at 400°F for 25 minutes.\n3. Serve with roasted vegetables and quinoa."
        },
        { 
          id: "pork_chops", 
          name: "Grilled Pork Chops", 
          calories: 680, 
          protein: 52, 
          carbs: 40, 
          fats: 32,
          recipe: "1. Season pork chops with garlic and rosemary.\n2. Grill 4-5 minutes per side.\n3. Serve with mashed potatoes and green beans."
        },
        { 
          id: "shrimp_pasta", 
          name: "Shrimp Alfredo", 
          calories: 720, 
          protein: 48, 
          carbs: 65, 
          fats: 30,
          recipe: "1. Sauté shrimp in garlic butter.\n2. Cook fettuccine and toss with alfredo sauce.\n3. Combine and top with parmesan."
        },
        { 
          id: "turkey_meatballs", 
          name: "Turkey Meatballs", 
          calories: 620, 
          protein: 50, 
          carbs: 55, 
          fats: 22,
          recipe: "1. Mix ground turkey with breadcrumbs and egg.\n2. Bake meatballs at 400°F for 20 mins.\n3. Serve over whole wheat pasta with marinara."
        },
        { 
          id: "fish_tacos", 
          name: "Fish Tacos", 
          calories: 580, 
          protein: 42, 
          carbs: 52, 
          fats: 24,
          recipe: "1. Season tilapia with cumin and grill.\n2. Serve in corn tortillas with cabbage slaw.\n3. Top with lime crema and fresh cilantro."
        },
        { 
          id: "chicken_stir_fry", 
          name: "Chicken Stir Fry", 
          calories: 640, 
          protein: 52, 
          carbs: 55, 
          fats: 20,
          recipe: "1. Slice chicken breast and stir fry with vegetables.\n2. Add soy sauce and sesame oil.\n3. Serve over brown rice."
        },
        { 
          id: "bbq_chicken", 
          name: "BBQ Chicken & Cornbread", 
          calories: 720, 
          protein: 55, 
          carbs: 65, 
          fats: 28,
          recipe: "1. Grill chicken thighs with BBQ sauce.\n2. Serve with baked beans and cornbread.\n3. Add coleslaw on the side."
        },
        { 
          id: "stuffed_peppers", 
          name: "Stuffed Bell Peppers", 
          calories: 580, 
          protein: 42, 
          carbs: 48, 
          fats: 24,
          recipe: "1. Mix ground turkey with rice and tomato sauce.\n2. Stuff into halved bell peppers.\n3. Bake at 375°F for 35 minutes with cheese on top."
        },
        { 
          id: "cod_veggies", 
          name: "Baked Cod & Veggies", 
          calories: 520, 
          protein: 48, 
          carbs: 35, 
          fats: 18,
          recipe: "1. Season cod with lemon and dill.\n2. Bake at 400°F with zucchini and tomatoes.\n3. Serve with a side of brown rice."
        },
        { 
          id: "mega_steak", 
          name: "Mega Steak Dinner", 
          calories: 950, 
          protein: 75, 
          carbs: 70, 
          fats: 42,
          recipe: "1. Grill 12oz ribeye steak to preference.\n2. Serve with loaded baked potato (butter, cheese, sour cream).\n3. Add Caesar salad on the side."
        },
        { 
          id: "double_pasta", 
          name: "Double Portion Pasta", 
          calories: 1000, 
          protein: 60, 
          carbs: 120, 
          fats: 30,
          recipe: "1. Cook 3 cups pasta with meat sauce.\n2. Add extra ground beef and parmesan.\n3. Serve with garlic bread."
        }
      ]
    }
  ];

  // Merge base meals with custom meals
  const meals = baseMeals.map(section => ({
    ...section,
    options: [...section.options, ...customMeals[section.id]]
  }));

  const handleAddCustomMeal = () => {
    if (!newMeal.name || !currentSectionId) return;
    
    const mealId = `custom_${Date.now()}`;
    const meal: MealOption = {
      id: mealId,
      name: newMeal.name,
      calories: parseInt(newMeal.calories) || 0,
      protein: parseInt(newMeal.protein) || 0,
      carbs: parseInt(newMeal.carbs) || 0,
      fats: parseInt(newMeal.fats) || 0,
      recipe: "Custom meal - no recipe instructions."
    };
    
    // Save to database
    saveCustomMealMutation.mutate({
      name: newMeal.name,
      calories: parseInt(newMeal.calories) || 0,
      protein: parseInt(newMeal.protein) || 0,
      carbs: parseInt(newMeal.carbs) || 0,
      fats: parseInt(newMeal.fats) || 0,
      mealType: currentSectionId,
    });
    
    setCustomMeals(prev => ({
      ...prev,
      [currentSectionId]: [...prev[currentSectionId], meal]
    }));
    
    // Auto-select the new custom meal
    setSelectedMeals(prev => ({
      ...prev,
      [currentSectionId]: mealId
    }));
    
    setIsCustomDialogOpen(false);
    setNewMeal({ name: "", calories: "", protein: "", carbs: "", fats: "" });
    setImagePreview(null);
  };

  // Quickly add a saved custom meal to the current section
  const handleQuickAddSavedMeal = (savedMeal: SavedCustomMeal, sectionId: string) => {
    // Use a unique ID for this meal instance
    const mealId = `saved_${savedMeal.id}_${Date.now()}`;
    const meal: MealOption = {
      id: mealId,
      name: savedMeal.name,
      calories: savedMeal.calories,
      protein: savedMeal.protein,
      carbs: savedMeal.carbs,
      fats: savedMeal.fats,
      recipe: "Custom meal - no recipe instructions."
    };
    
    // Add to custom meals UI immediately
    setCustomMeals(prev => ({
      ...prev,
      [sectionId]: [...prev[sectionId], meal]
    }));
    
    // Auto-select the meal
    setSelectedMeals(prev => ({
      ...prev,
      [sectionId]: mealId
    }));
  };

  const calculateTotalConsumed = () => {
    let total = { calories: 0, protein: 0, carbs: 0, fats: 0 };
    
    meals.forEach(section => {
      // Only count if checked
      if (consumedMeals[section.id]) {
        const selectedId = selectedMeals[section.id];
        const option = section.options.find(opt => opt.id === selectedId);
        if (option) {
          total.calories += option.calories;
          total.protein += option.protein;
          total.carbs += option.carbs;
          total.fats += option.fats;
        }
      }
    });
    
    return total;
  };

  const current = calculateTotalConsumed();

  // Sync totals to context whenever they change
  useEffect(() => {
    updateDailyStats(current);
  }, [JSON.stringify(current), updateDailyStats]);

  // Save meal selections with nutrition data when they change
  const prevSelectedRef = useRef(selectedMeals);
  useEffect(() => {
    const mealTypes = ["breakfast", "lunch", "snack", "dinner"];
    const today = getTodayDate();
    
    mealTypes.forEach(mealType => {
      const prevId = prevSelectedRef.current[mealType];
      const newId = selectedMeals[mealType];
      
      if (prevId !== newId && newId) {
        // Find the meal in our options
        const section = meals.find(s => s.id === mealType);
        const meal = section?.options.find(o => o.id === newId);
        
        if (meal) {
          // Save with nutrition data
          fetch("/api/meals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date: today,
              mealType,
              mealId: newId,
              consumed: consumedMeals[mealType] || false,
              mealName: meal.name,
              calories: meal.calories,
              protein: meal.protein,
              carbs: meal.carbs,
              fats: meal.fats,
            }),
            credentials: "include",
          }).catch(console.error);
        }
      }
    });
    
    prevSelectedRef.current = selectedMeals;
  }, [selectedMeals, meals, consumedMeals]);

  const toggleConsumed = (mealId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent accordion toggle
    toggleConsumedMeal(mealId);
  };

  return (
    <Layout>
      <div className="relative h-56 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent z-10" />
        <img src={foodImage} alt="Food" className="w-full h-full object-cover" />
        <div className="absolute bottom-6 left-6 right-6 z-20">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Meal Planning</p>
              <h1 className="text-4xl font-heading font-bold text-white leading-tight">NUTRITION</h1>
            </div>
            <div className="bg-black/40 backdrop-blur-md rounded-xl px-3 py-2 border border-white/10">
              <Select 
                value={profile.goal} 
                onValueChange={(val: any) => updateProfile({ goal: val })}
              >
                <SelectTrigger className="h-7 border-none bg-transparent text-white text-sm w-[120px] focus:ring-0 p-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="muscle">Build Muscle</SelectItem>
                  <SelectItem value="maintain">Maintain</SelectItem>
                  <SelectItem value="fatloss">Lose Fat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-4 text-xs font-medium text-white/90">
            <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <Target className="w-3.5 h-3.5 text-primary" />
              <span>Target: {macros.calories} kcal</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Rec: {recommendedMacros.calories}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* Macros Progress Section */}
        <section>
          <h2 className="text-lg font-heading font-semibold text-white tracking-wide mb-3">Today's Progress</h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-card/60 border-white/5 backdrop-blur-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center min-h-[100px]">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Protein</span>
                <span className="text-2xl font-bold font-heading text-white" data-testid="text-protein-consumed">{current.protein}g</span>
                <span className="text-[10px] text-muted-foreground mb-2">/ {macros.protein}g goal</span>
                <Progress value={(current.protein / macros.protein) * 100} className="h-2 bg-secondary/50 w-full" />
              </CardContent>
            </Card>
            <Card className="bg-card/60 border-white/5 backdrop-blur-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center min-h-[100px]">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Calories</span>
                <span className="text-2xl font-bold font-heading text-primary" data-testid="text-calories-consumed">{current.calories}</span>
                <span className="text-[10px] text-muted-foreground mb-2">/ {macros.calories} goal</span>
                <Progress value={(current.calories / macros.calories) * 100} className="h-2 bg-secondary/50 w-full" />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Meals Selection Accordion */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-heading font-semibold text-white tracking-wide">Today's Menu</h2>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {meals.map((section) => {
              const selectedOption = section.options.find(opt => opt.id === selectedMeals[section.id]);
              const isChecked = consumedMeals[section.id];
              
              return (
                <AccordionItem key={section.id} value={section.id} className={cn(
                  "rounded-xl overflow-hidden transition-all duration-200",
                  isChecked 
                    ? "bg-green-500/5 border border-green-500/20" 
                    : "bg-card border border-white/5"
                )}>
                  <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-white/5 group" data-testid={`accordion-${section.id}`}>
                    <div className="flex items-center w-full gap-4">
                      <div 
                        className={cn(
                          "h-7 w-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 z-20 flex-shrink-0",
                          isChecked 
                            ? "bg-green-500 border-green-500 shadow-lg shadow-green-500/25" 
                            : "border-muted-foreground/50 group-hover:border-primary group-hover:bg-primary/10"
                        )}
                        onClick={(e) => toggleConsumed(section.id, e)}
                        data-testid={`checkbox-${section.id}`}
                      >
                        {isChecked && <Check className="w-4 h-4 text-white font-bold" />}
                      </div>
                       
                      <div className="flex flex-col items-start text-left flex-1 min-w-0">
                        <div className="flex justify-between w-full pr-2">
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest transition-colors",
                            isChecked ? "text-green-400" : "text-muted-foreground"
                          )}>{section.title}</span>
                          <span className="text-xs text-muted-foreground font-medium">{selectedOption?.calories} kcal</span>
                        </div>
                        <span className={cn(
                          "text-base font-bold mt-0.5 transition-all truncate max-w-full",
                          isChecked ? "text-white/50 line-through" : "text-white"
                        )}>{selectedOption?.name}</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-5 pt-1 pl-[60px]">
                    {selectedOption?.recipe && (
                      <div className="bg-secondary/40 rounded-xl p-4 mb-5 border border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <ChefHat className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-white">Preparation</span>
                            <p className="text-[10px] text-muted-foreground">Quick recipe guide</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed pl-10">
                          {selectedOption.recipe}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-3">Swap Meal</p>
                      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                        {section.options.map((option) => (
                          <div 
                            key={option.id}
                            onClick={() => !isChecked && setSelectedMeals(prev => ({ ...prev, [section.id]: option.id }))}
                            className={cn(
                              "p-3 rounded-xl border transition-all flex justify-between items-center gap-3",
                              selectedMeals[section.id] === option.id 
                                ? "bg-primary/10 border-primary/50 shadow-sm" 
                                : "bg-secondary/40 border-white/5 hover:border-white/10",
                              !isChecked && "cursor-pointer",
                              isChecked && "opacity-50 cursor-not-allowed"
                            )}
                            data-testid={`meal-option-${option.id}`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "font-semibold text-sm truncate",
                                selectedMeals[section.id] === option.id ? "text-primary" : "text-white"
                              )}>
                                {option.name}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                <span className="text-yellow-400 font-semibold">{option.calories} cal</span>
                                <span className="mx-1.5">•</span>
                                <span className="text-primary font-semibold">{option.protein}g Protein</span>
                                <span className="mx-1.5">•</span>
                                <span>{option.carbs}g Carbs</span>
                                <span className="mx-1.5">•</span>
                                <span>{option.fats}g Fat</span>
                              </p>
                            </div>
                            {selectedMeals[section.id] === option.id && (
                              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                <Check className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full mt-4 border-dashed border-primary/40 text-primary hover:text-primary hover:bg-primary/10 hover:border-primary h-11"
                        onClick={() => {
                          setCurrentSectionId(section.id);
                          setIsCustomDialogOpen(true);
                        }}
                        disabled={isChecked}
                        data-testid={`button-add-custom-${section.id}`}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Custom Meal
                      </Button>
                      
                      {/* Saved Custom Meals - Quick Add */}
                      {getSavedMealsForType(section.id).length > 0 && (
                        <div className="mt-5 pt-5 border-t border-white/10">
                          <div className="bg-secondary/30 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                                <History className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">Recent Custom Meals</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Quick add</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {getSavedMealsForType(section.id).map((savedMeal) => (
                                <div
                                  key={savedMeal.id}
                                  onClick={() => !isChecked && handleQuickAddSavedMeal(savedMeal, section.id)}
                                  className={cn(
                                    "p-3 rounded-xl bg-card/80 border border-white/5 transition-all flex justify-between items-center group",
                                    !isChecked && "cursor-pointer hover:bg-primary/10 hover:border-primary/30",
                                    isChecked && "opacity-50 cursor-not-allowed"
                                  )}
                                  data-testid={`button-quick-add-${savedMeal.id}`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-white truncate group-hover:text-primary transition-colors">
                                      {savedMeal.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      <span className="text-primary font-semibold">{savedMeal.protein}g Protein</span>
                                      <span className="mx-1.5">•</span>
                                      <span>{savedMeal.calories} cal</span>
                                    </p>
                                  </div>
                                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all flex-shrink-0">
                                    <Plus className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </section>
      </div>

      {/* Custom Meal Dialog */}
      <Dialog open={isCustomDialogOpen} onOpenChange={(open) => {
        setIsCustomDialogOpen(open);
        if (!open) {
          setImagePreview(null);
          setNewMeal({ name: "", calories: "", protein: "", carbs: "", fats: "" });
        }
      }}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-white/10 text-white max-w-sm mx-4 rounded-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-heading font-bold text-center">Add Custom Meal</DialogTitle>
            <p className="text-sm text-muted-foreground text-center">Take a photo or enter details manually</p>
          </DialogHeader>
          
          <div className="space-y-5">
            {/* Photo Upload */}
            <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl border border-white/5">
              {imagePreview ? (
                <div className="relative w-20 h-20 flex-shrink-0">
                  <img 
                    src={imagePreview} 
                    alt="Food" 
                    className="w-20 h-20 object-cover rounded-xl border border-white/10"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-xl">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-3">
                  <label 
                    htmlFor="food-photo-camera" 
                    className="w-16 h-16 flex-shrink-0 border-2 border-dashed border-primary/50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 hover:border-primary transition-all gap-1"
                  >
                    <Camera className="w-5 h-5 text-primary" />
                    <span className="text-[10px] text-primary font-medium">Camera</span>
                  </label>
                  <label 
                    htmlFor="food-photo-gallery" 
                    className="w-16 h-16 flex-shrink-0 border-2 border-dashed border-primary/50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 hover:border-primary transition-all gap-1"
                  >
                    <Image className="w-5 h-5 text-primary" />
                    <span className="text-[10px] text-primary font-medium">Gallery</span>
                  </label>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">
                  {isAnalyzing ? "Analyzing photo..." : imagePreview ? "Photo captured!" : "Snap a photo"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {imagePreview ? (
                    <button 
                      className="text-primary hover:underline font-medium"
                      onClick={() => {
                        setImagePreview(null);
                        setNewMeal({ name: "", calories: "", protein: "", carbs: "", fats: "" });
                      }}
                    >
                      Clear & retry
                    </button>
                  ) : "AI detects nutrition automatically"}
                </p>
              </div>
              <input
                id="food-photo-camera"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageUpload}
                data-testid="input-food-photo-camera"
              />
              <input
                id="food-photo-gallery"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                data-testid="input-food-photo-gallery"
              />
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="uppercase tracking-wider font-medium">or enter manually</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            {/* Meal Name */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Meal Name</Label>
              <Input 
                placeholder="e.g., Turkey Sandwich" 
                className="bg-secondary/50 border-white/10 h-11 rounded-xl"
                value={newMeal.name}
                onChange={(e) => setNewMeal({...newMeal, name: e.target.value})}
                data-testid="input-meal-name"
              />
            </div>
            
            {/* Nutrition Grid */}
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium text-center block">Calories</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  className="bg-secondary/50 border-white/10 h-11 text-sm text-center rounded-xl"
                  value={newMeal.calories}
                  onChange={(e) => setNewMeal({...newMeal, calories: e.target.value})}
                  data-testid="input-meal-calories"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] text-primary uppercase tracking-wider font-medium text-center block">Protein</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  className="bg-primary/10 border-primary/30 h-11 text-sm text-center rounded-xl"
                  value={newMeal.protein}
                  onChange={(e) => setNewMeal({...newMeal, protein: e.target.value})}
                  data-testid="input-meal-protein"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium text-center block">Carbs</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  className="bg-secondary/50 border-white/10 h-11 text-sm text-center rounded-xl"
                  value={newMeal.carbs}
                  onChange={(e) => setNewMeal({...newMeal, carbs: e.target.value})}
                  data-testid="input-meal-carbs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium text-center block">Fats</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  className="bg-secondary/50 border-white/10 h-11 text-sm text-center rounded-xl"
                  value={newMeal.fats}
                  onChange={(e) => setNewMeal({...newMeal, fats: e.target.value})}
                  data-testid="input-meal-fats"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-5 gap-3 sm:gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsCustomDialogOpen(false)} 
              data-testid="button-cancel-meal" 
              className="flex-1 h-11 rounded-xl border-white/20 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddCustomMeal} 
              disabled={!newMeal.name || isAnalyzing} 
              data-testid="button-add-meal" 
              className="flex-1 h-11 rounded-xl font-semibold"
            >
              Add Meal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
