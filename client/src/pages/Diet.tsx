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
import { AlertCircle, Check, Target, Info, Plus, ChefHat, Camera, Loader2 } from "lucide-react";
import foodImage from "@assets/generated_images/healthy_meal_prep_food.png";
import { useUser } from "@/lib/UserContext";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

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
    
    const meal: MealOption = {
      id: `custom_${Date.now()}`,
      name: newMeal.name,
      calories: parseInt(newMeal.calories) || 0,
      protein: parseInt(newMeal.protein) || 0,
      carbs: parseInt(newMeal.carbs) || 0,
      fats: parseInt(newMeal.fats) || 0,
      recipe: "Custom meal - no recipe instructions."
    };
    
    setCustomMeals(prev => ({
      ...prev,
      [currentSectionId]: [...prev[currentSectionId], meal]
    }));
    
    // Auto-select the new custom meal
    setSelectedMeals(prev => ({
      ...prev,
      [currentSectionId]: meal.id
    }));
    
    setIsCustomDialogOpen(false);
    setNewMeal({ name: "", calories: "", protein: "", carbs: "", fats: "" });
    setImagePreview(null);
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

  const toggleConsumed = (mealId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent accordion toggle
    toggleConsumedMeal(mealId);
  };

  return (
    <Layout>
      <div className="relative h-48 w-full overflow-hidden rounded-b-3xl shadow-xl mb-6">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
        <img src={foodImage} alt="Food" className="w-full h-full object-cover opacity-60" />
        <div className="absolute bottom-4 left-6 z-20 w-[90%]">
          <div className="flex justify-between items-end mb-2">
            <h1 className="text-3xl font-heading font-bold text-white uppercase">Nutrition</h1>
            <div className="bg-black/30 backdrop-blur-md rounded-lg p-1 border border-white/10">
              <Select 
                value={profile.goal} 
                onValueChange={(val: any) => updateProfile({ goal: val })}
              >
                <SelectTrigger className="h-8 border-none bg-transparent text-white w-[130px] focus:ring-0">
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
          
          <div className="flex gap-4 text-xs font-medium text-white/80 bg-black/20 p-2 rounded-lg backdrop-blur-sm inline-flex">
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 text-primary" />
              <span>Target: {macros.calories} kcal</span>
            </div>
             <div className="flex items-center gap-1">
              <Info className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Rec: {recommendedMacros.calories}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20 space-y-6">
        {/* Macros */}
        <div className="grid grid-cols-2 gap-3">
            <Card className="bg-secondary/30 border-white/5 text-center">
              <CardContent className="p-3">
                <span className="text-xs uppercase text-muted-foreground font-bold block mb-1">Protein Consumed</span>
                <div className="flex justify-center items-end gap-2">
                   <span className="text-2xl font-heading font-bold text-white">{current.protein}g</span>
                   <span className="text-[10px] text-muted-foreground mb-1">/ {macros.protein}g goal</span>
                </div>
                <Progress value={(current.protein / macros.protein) * 100} className="h-1 mt-2 bg-blue-500/20" />
              </CardContent>
            </Card>
            <Card className="bg-secondary/30 border-white/5 text-center">
              <CardContent className="p-3">
                <span className="text-xs uppercase text-muted-foreground font-bold block mb-1">Calories Consumed</span>
                <div className="flex justify-center items-end gap-2">
                   <span className="text-2xl font-heading font-bold text-white">{current.calories}</span>
                   <span className="text-[10px] text-muted-foreground mb-1">/ {macros.calories} goal</span>
                </div>
                <Progress value={(current.calories / macros.calories) * 100} className="h-1 mt-2 bg-primary/20" />
              </CardContent>
            </Card>
        </div>

        {/* Meals Selection Accordion */}
        <div className="space-y-4">
          <h2 className="text-xl font-heading font-bold text-white">Today's Menu</h2>
          <Accordion type="single" collapsible className="w-full space-y-2">
            {meals.map((section) => {
              const selectedOption = section.options.find(opt => opt.id === selectedMeals[section.id]);
              const isChecked = consumedMeals[section.id];
              
              return (
                <AccordionItem key={section.id} value={section.id} className={cn(
                  "border-none rounded-xl overflow-hidden border border-white/5 transition-colors",
                  isChecked ? "bg-primary/5 border-primary/20" : "bg-card"
                )}>
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/5 group">
                    <div className="flex items-center w-full gap-3">
                       <div 
                         className={cn(
                           "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors z-20",
                           isChecked ? "bg-primary border-primary" : "border-muted-foreground group-hover:border-white"
                         )}
                         onClick={(e) => toggleConsumed(section.id, e)}
                       >
                         {isChecked && <Check className="w-3.5 h-3.5 text-black font-bold" />}
                       </div>
                       
                       <div className="flex flex-col items-start text-left w-full">
                        <div className="flex justify-between w-full pr-4">
                          <span className={cn(
                            "text-xs font-bold uppercase tracking-wider transition-colors",
                            isChecked ? "text-primary" : "text-muted-foreground"
                          )}>{section.title}</span>
                          <span className="text-xs text-muted-foreground">{selectedOption?.calories} kcal</span>
                        </div>
                        <span className={cn(
                          "text-lg font-bold mt-1 transition-all",
                          isChecked ? "text-white/50 line-through" : "text-white"
                        )}>{selectedOption?.name}</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-0 pl-14">
                    {/* Selected Meal Recipe - Only show if not checked (or maybe always show?) - Showing always is better for utility */}
                    {selectedOption?.recipe && (
                      <div className="bg-secondary/30 rounded-lg p-3 mb-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                           <ChefHat className="w-4 h-4 text-primary" />
                           <span className="text-xs font-bold text-white uppercase">Preparation</span>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                          {selectedOption.recipe}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2 mt-2">
                      <p className="text-xs text-muted-foreground uppercase mb-2 font-bold">Swap Meal:</p>
                      {section.options.map((option) => (
                        <div 
                          key={option.id}
                          onClick={() => !isChecked && setSelectedMeals(prev => ({ ...prev, [section.id]: option.id }))}
                          className={cn(
                            "p-3 rounded-lg border transition-all flex justify-between items-center",
                            selectedMeals[section.id] === option.id 
                              ? "bg-primary/10 border-primary" 
                              : "bg-secondary/50 border-transparent",
                            !isChecked && "cursor-pointer hover:bg-secondary",
                            isChecked && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <div>
                            <p className={cn("font-bold text-sm", selectedMeals[section.id] === option.id ? "text-primary" : "text-white")}>
                              {option.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              <span className="text-primary font-bold">{option.protein}g Protein</span> • {option.carbs}g Carbs • {option.fats}g Fat
                            </p>
                          </div>
                          {selectedMeals[section.id] === option.id && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      ))}
                      
                      {/* Add Custom Meal Button */}
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-primary hover:text-primary hover:bg-primary/10 mt-2"
                        onClick={() => {
                          setCurrentSectionId(section.id);
                          setIsCustomDialogOpen(true);
                        }}
                        disabled={isChecked}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Custom Meal...
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>

      {/* Custom Meal Dialog */}
      <Dialog open={isCustomDialogOpen} onOpenChange={(open) => {
        setIsCustomDialogOpen(open);
        if (!open) {
          setImagePreview(null);
          setNewMeal({ name: "", calories: "", protein: "", carbs: "", fats: "" });
        }
      }}>
        <DialogContent className="bg-card border-white/10 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Custom Meal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Photo Upload Section */}
            <div className="grid gap-2">
              <Label>Snap a Photo (AI will detect nutrition)</Label>
              <div className="flex flex-col items-center gap-3">
                {imagePreview ? (
                  <div className="relative w-full">
                    <img 
                      src={imagePreview} 
                      alt="Food preview" 
                      className="w-full h-32 object-cover rounded-lg border border-white/10"
                    />
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                        <div className="flex items-center gap-2 text-primary">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="text-sm">Analyzing...</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <label 
                    htmlFor="food-photo" 
                    className="w-full h-24 border-2 border-dashed border-primary/50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors"
                  >
                    <Camera className="w-8 h-8 text-primary mb-1" />
                    <span className="text-xs text-muted-foreground">Tap to take photo</span>
                  </label>
                )}
                <input
                  id="food-photo"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleImageUpload}
                  data-testid="input-food-photo"
                />
                {imagePreview && !isAnalyzing && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-muted-foreground"
                    onClick={() => {
                      setImagePreview(null);
                      setNewMeal({ name: "", calories: "", protein: "", carbs: "", fats: "" });
                    }}
                  >
                    Clear & try again
                  </Button>
                )}
              </div>
            </div>

            <div className="relative flex items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="mx-4 text-xs text-muted-foreground">or enter manually</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Meal Name</Label>
              <Input 
                id="name" 
                placeholder="e.g., Turkey Sandwich" 
                className="bg-secondary/50 border-white/10"
                value={newMeal.name}
                onChange={(e) => setNewMeal({...newMeal, name: e.target.value})}
                data-testid="input-meal-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="calories">Calories</Label>
                <Input 
                  id="calories" 
                  type="number" 
                  placeholder="0" 
                  className="bg-secondary/50 border-white/10"
                  value={newMeal.calories}
                  onChange={(e) => setNewMeal({...newMeal, calories: e.target.value})}
                  data-testid="input-meal-calories"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="protein">Protein (g)</Label>
                <Input 
                  id="protein" 
                  type="number" 
                  placeholder="0" 
                  className="bg-secondary/50 border-white/10"
                  value={newMeal.protein}
                  onChange={(e) => setNewMeal({...newMeal, protein: e.target.value})}
                  data-testid="input-meal-protein"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input 
                  id="carbs" 
                  type="number" 
                  placeholder="0" 
                  className="bg-secondary/50 border-white/10"
                  value={newMeal.carbs}
                  onChange={(e) => setNewMeal({...newMeal, carbs: e.target.value})}
                  data-testid="input-meal-carbs"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fats">Fats (g)</Label>
                <Input 
                  id="fats" 
                  type="number" 
                  placeholder="0" 
                  className="bg-secondary/50 border-white/10"
                  value={newMeal.fats}
                  onChange={(e) => setNewMeal({...newMeal, fats: e.target.value})}
                  data-testid="input-meal-fats"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomDialogOpen(false)} data-testid="button-cancel-meal">Cancel</Button>
            <Button onClick={handleAddCustomMeal} disabled={!newMeal.name || isAnalyzing} data-testid="button-add-meal">Add Meal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
