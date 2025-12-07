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
import { AlertCircle, Check, Target, Info, Plus, ChefHat } from "lucide-react";
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

  // Base meals with simple names AND recipes
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
      <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
        <DialogContent className="bg-card border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Add Custom Meal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Meal Name</Label>
              <Input 
                id="name" 
                placeholder="e.g., Turkey Sandwich" 
                className="bg-secondary/50 border-white/10"
                value={newMeal.name}
                onChange={(e) => setNewMeal({...newMeal, name: e.target.value})}
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
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCustomMeal} disabled={!newMeal.name}>Add Meal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
