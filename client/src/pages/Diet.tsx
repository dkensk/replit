import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    breakfast: "oatmeal",
    lunch: "chicken",
    snack: "shake",
    dinner: "salmon"
  });

  const meals: MealSection[] = [
    {
      id: "breakfast",
      title: "Breakfast",
      options: [
        { id: "oatmeal", name: "Oatmeal & Whey Protein", calories: 450, protein: 30, carbs: 50, fats: 10 },
        { id: "eggs", name: "3 Eggs & Whole Wheat Toast", calories: 400, protein: 24, carbs: 25, fats: 20 },
        { id: "yogurt", name: "Greek Yogurt Parfait", calories: 350, protein: 25, carbs: 40, fats: 8 }
      ]
    },
    {
      id: "lunch",
      title: "Lunch",
      options: [
        { id: "chicken", name: "Grilled Chicken & Rice", calories: 600, protein: 45, carbs: 60, fats: 15 },
        { id: "turkey", name: "Turkey Wrap & Salad", calories: 550, protein: 40, carbs: 50, fats: 18 },
        { id: "beef", name: "Lean Beef Stir Fry", calories: 650, protein: 50, carbs: 55, fats: 22 }
      ]
    },
    {
      id: "snack",
      title: "Snack",
      options: [
        { id: "shake", name: "Protein Shake & Banana", calories: 250, protein: 25, carbs: 30, fats: 3 },
        { id: "bar", name: "Protein Bar", calories: 220, protein: 20, carbs: 25, fats: 8 },
        { id: "apple", name: "Apple & Almonds", calories: 200, protein: 6, carbs: 25, fats: 12 }
      ]
    },
    {
      id: "dinner",
      title: "Dinner",
      options: [
        { id: "salmon", name: "Salmon & Asparagus", calories: 550, protein: 40, carbs: 10, fats: 35 },
        { id: "steak", name: "Sirloin Steak & Potato", calories: 700, protein: 55, carbs: 40, fats: 30 },
        { id: "pasta", name: "Chicken Pasta", calories: 650, protein: 45, carbs: 70, fats: 15 }
      ]
    }
  ];

  const calculateTotalConsumed = () => {
    let total = { calories: 0, protein: 0, carbs: 0, fats: 0 };
    
    meals.forEach(section => {
      const selectedId = selectedMeals[section.id];
      const option = section.options.find(opt => opt.id === selectedId);
      if (option) {
        total.calories += option.calories;
        total.protein += option.protein;
        total.carbs += option.carbs;
        total.fats += option.fats;
      }
    });
    
    return total;
  };

  const current = calculateTotalConsumed();

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
                <SelectTrigger className="h-8 border-none bg-transparent text-white w-[120px] focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="muscle">Build Muscle</SelectItem>
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
                <span className="text-xs uppercase text-muted-foreground font-bold block mb-1">Protein Goal</span>
                <div className="flex justify-center items-end gap-2">
                   <span className="text-2xl font-heading font-bold text-white">{macros.protein}g</span>
                   <span className="text-[10px] text-muted-foreground mb-1">/ {recommendedMacros.protein}g rec</span>
                </div>
                <Progress value={(current.protein / macros.protein) * 100} className="h-1 mt-2 bg-blue-500/20" />
              </CardContent>
            </Card>
            <Card className="bg-secondary/30 border-white/5 text-center">
              <CardContent className="p-3">
                <span className="text-xs uppercase text-muted-foreground font-bold block mb-1">Calories Goal</span>
                <div className="flex justify-center items-end gap-2">
                   <span className="text-2xl font-heading font-bold text-white">{macros.calories}</span>
                   <span className="text-[10px] text-muted-foreground mb-1">/ {recommendedMacros.calories} rec</span>
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
              
              return (
                <AccordionItem key={section.id} value={section.id} className="border-none bg-card rounded-xl overflow-hidden border border-white/5">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/5">
                    <div className="flex flex-col items-start text-left w-full">
                      <div className="flex justify-between w-full pr-4">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">{section.title}</span>
                        <span className="text-xs text-muted-foreground">{selectedOption?.calories} kcal</span>
                      </div>
                      <span className="text-lg font-bold text-white mt-1">{selectedOption?.name}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-0">
                    <div className="space-y-2 mt-4">
                      <p className="text-xs text-muted-foreground uppercase mb-2 font-bold">Select Option:</p>
                      {section.options.map((option) => (
                        <div 
                          key={option.id}
                          onClick={() => setSelectedMeals(prev => ({ ...prev, [section.id]: option.id }))}
                          className={cn(
                            "p-3 rounded-lg border transition-all cursor-pointer flex justify-between items-center",
                            selectedMeals[section.id] === option.id 
                              ? "bg-primary/10 border-primary" 
                              : "bg-secondary/50 border-transparent hover:bg-secondary"
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
