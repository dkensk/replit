import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle2, Clock, TrendingUp, PlayCircle } from "lucide-react";
import gymImage from "@assets/generated_images/athletic_gym_training_equipment.png";

export default function Workouts() {
  return (
    <Layout>
      <div className="relative h-48 w-full overflow-hidden rounded-b-3xl shadow-xl mb-6">
         <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
        <img src={gymImage} alt="Gym" className="w-full h-full object-cover opacity-70" />
        <div className="absolute bottom-4 left-6 z-20">
          <h1 className="text-3xl font-heading font-bold text-white uppercase">Training Phase 1</h1>
          <p className="text-primary font-medium">Week 3 - Hypertrophy & Power</p>
        </div>
      </div>

      <div className="px-4 pb-20">
        <Tabs defaultValue="gym" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50 mb-6">
            <TabsTrigger value="gym">Gym Workout</TabsTrigger>
            <TabsTrigger value="ice">Hockey Skills</TabsTrigger>
          </TabsList>

          <TabsContent value="gym" className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-white">Day 1: Lower Body Power</h2>
              <span className="text-sm text-muted-foreground flex items-center"><Clock className="w-4 h-4 mr-1"/> 60 min</span>
            </div>

            {/* Warmup */}
            <Card className="bg-secondary/30 border-white/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-primary">Warmup</h3>
                  <span className="text-xs text-muted-foreground">10 mins</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500/50"/> Dynamic Stretching</li>
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500/50"/> 5 min Bike (Light)</li>
                </ul>
              </CardContent>
            </Card>

            {/* Exercises */}
            {[
              { name: "Box Jumps", sets: "4", reps: "5", rest: "90s" },
              { name: "Trap Bar Deadlift", sets: "5", reps: "5", rest: "120s" },
              { name: "Bulgarian Split Squats", sets: "3", reps: "8/leg", rest: "60s" },
              { name: "Plank w/ Weight", sets: "3", reps: "45s", rest: "60s" },
            ].map((ex, i) => (
              <Card key={i} className="bg-card border-white/5 hover:border-primary/30 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{ex.name}</h4>
                      <p className="text-sm text-muted-foreground">{ex.sets} Sets × {ex.reps} • Rest: {ex.rest}</p>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="text-primary">
                    <PlayCircle className="w-6 h-6" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="ice" className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
             <div className="text-center py-10 text-muted-foreground">
               <p>Switch to "Hockey Skills" tab content here.</p>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
