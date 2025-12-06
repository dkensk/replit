import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Check } from "lucide-react";
import foodImage from "@assets/generated_images/healthy_meal_prep_food.png";

export default function Diet() {
  return (
    <Layout>
      <div className="relative h-40 w-full overflow-hidden rounded-b-3xl shadow-xl mb-6">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
        <img src={foodImage} alt="Food" className="w-full h-full object-cover opacity-60" />
        <div className="absolute bottom-4 left-6 z-20">
          <h1 className="text-3xl font-heading font-bold text-white uppercase">Nutrition Plan</h1>
          <p className="text-green-400 font-medium flex items-center gap-2">
             <Check className="w-4 h-4" /> On Track
          </p>
        </div>
      </div>

      <div className="px-4 pb-20 space-y-6">
        {/* Macros */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Protein", current: 140, target: 180, color: "bg-blue-500" },
            { label: "Carbs", current: 210, target: 300, color: "bg-green-500" },
            { label: "Fats", current: 45, target: 70, color: "bg-yellow-500" },
          ].map((macro) => (
            <Card key={macro.label} className="bg-secondary/30 border-white/5 text-center">
              <CardContent className="p-3">
                <span className="text-xs uppercase text-muted-foreground font-bold block mb-1">{macro.label}</span>
                <span className="text-xl font-heading font-bold text-white">{macro.current}g</span>
                <Progress value={(macro.current / macro.target) * 100} className={`h-1 mt-2 ${macro.color}`} />
                <span className="text-[10px] text-muted-foreground mt-1 block">of {macro.target}g</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Meals */}
        <div className="space-y-4">
          <h2 className="text-xl font-heading font-bold text-white">Today's Meals</h2>
          
          {[
            { type: "Breakfast", name: "Oatmeal & Whey Protein", cals: 450, protein: 30 },
            { type: "Lunch", name: "Grilled Chicken & Rice", cals: 650, protein: 45 },
            { type: "Pre-Workout", name: "Banana & Peanut Butter", cals: 250, protein: 5 },
            { type: "Dinner", name: "Salmon & Asparagus", cals: 550, protein: 40 },
          ].map((meal, i) => (
            <Card key={i} className="bg-card border-white/5 overflow-hidden group">
              <CardContent className="p-0 flex">
                <div className="w-1.5 bg-primary/50 group-hover:bg-primary transition-colors" />
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">{meal.type}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-white">
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  </div>
                  <h3 className="font-bold text-white text-lg">{meal.name}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{meal.cals} kcal</span>
                    <span>{meal.protein}g pro</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Allergy Alert */}
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-400">Allergy Reminder</h4>
              <p className="text-sm text-red-200/70">This plan excludes all peanuts and tree nuts as per your settings.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
