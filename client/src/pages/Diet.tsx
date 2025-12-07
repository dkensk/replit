import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Check, Target, Info } from "lucide-react";
import foodImage from "@assets/generated_images/healthy_meal_prep_food.png";
import { useUser } from "@/lib/UserContext";
import { useState } from "react";
import { cn } from "@/lib/utils";

type MealOption = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

type MealSection = {
  id: string;
  title: string;
  options: MealOption[];
};

export default function Diet() {
  const { profile, updateProfile, macros, recommendedMacros } = useUser();
  const [selectedMeals, setSelectedMeals] = useState<Record<string, string>>({
    breakfast: "power_oats",
    lunch: "chicken_quinoa",
    snack: "recovery_shake",
    dinner: "lean_beef"
  });
  
  // Track checked (consumed) meals
  const [consumedMeals, setConsumedMeals] = useState<Record<string, boolean>>({
    breakfast: false,
    lunch: false,
    snack: false,
    dinner: false
  });

  // Athletic Performance Meals
  const meals: MealSection[] = [
    {
      id: "breakfast",
      title: "Breakfast (Fuel Up)",
      options: [
        { id: "power_oats", name: "Pro-Athlete Oatmeal", calories: 550, protein: 35, carbs: 75, fats: 12 }, // Oats, whey, berries, chia seeds
        { id: "egg_scramble", name: "Muscle Scramble", calories: 520, protein: 40, carbs: 30, fats: 25 }, // 4 eggs, spinach, turkey bacon, whole wheat toast
        { id: "greek_yogurt_bowl", name: "High-Protein Yogurt Bowl", calories: 450, protein: 35, carbs: 50, fats: 10 } // Greek yogurt, granola, honey, berries
      ]
    },
    {
      id: "lunch",
      title: "Lunch (Sustain)",
      options: [
        { id: "chicken_quinoa", name: "Chicken & Quinoa Power Bowl", calories: 650, protein: 50, carbs: 70, fats: 18 }, // Grilled chicken breast, quinoa, roasted veg
        { id: "turkey_wrap", name: "Loaded Turkey Club Wrap", calories: 580, protein: 45, carbs: 55, fats: 20 }, // Turkey breast, avocado, whole wheat tortilla
        { id: "bison_burger", name: "Lean Bison Burger (No Bun)", calories: 600, protein: 55, carbs: 10, fats: 35 } // Lean bison, sweet potato fries side
      ]
    },
    {
      id: "snack",
      title: "Pre/Post Workout",
      options: [
        { id: "recovery_shake", name: "Elite Recovery Shake", calories: 350, protein: 40, carbs: 40, fats: 5 }, // Whey isolate, banana, almond milk
        { id: "rice_cakes", name: "PB & Rice Cakes", calories: 300, protein: 10, carbs: 35, fats: 14 }, // Rice cakes, peanut butter, honey (Pre-game energy)
        { id: "protein_bar", name: "High-Quality Protein Bar", calories: 240, protein: 20, carbs: 25, fats: 9 }
      ]
    },
    {
      id: "dinner",
      title: "Dinner (Recover)",
      options: [
        { id: "salmon_rice", name: "Atlantic Salmon & Wild Rice", calories: 700, protein: 45, carbs: 60, fats: 30 }, // Omega-3 rich for recovery
        { id: "lean_beef", name: "Steak & Sweet Potato", calories: 750, protein: 60, carbs: 50, fats: 35 }, // Red meat for iron/creatine
        { id: "pasta_meat_sauce", name: "Whole Wheat Pasta Bolognese", calories: 800, protein: 50, carbs: 90, fats: 25 } // Carb load for next day
      ]
    }
  ];

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

  const toggleConsumed = (mealId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent accordion toggle
    setConsumedMeals(prev => ({ ...prev, [mealId]: !prev[mealId] }));
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
                              {option.protein}g Protein • {option.carbs}g Carbs
                            </p>
                          </div>
                          {selectedMeals[section.id] === option.id && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </Layout>
  );
}
