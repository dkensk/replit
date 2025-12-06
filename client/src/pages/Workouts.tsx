import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Clock, Calendar, PlayCircle } from "lucide-react";
import gymImage from "@assets/generated_images/athletic_gym_training_equipment.png";
import { useUser } from "@/lib/UserContext";
import { useState } from "react";
import { cn } from "@/lib/utils";

const WORKOUT_TYPES = [
  { id: "legs_strength", label: "Legs - Strength" },
  { id: "legs_explosive", label: "Legs - Explosiveness" },
  { id: "upper_body", label: "Upper Body Power" },
  { id: "full_body", label: "Full Body Athletic" },
  { id: "skills_cardio", label: "Skills & Cardio" },
  { id: "active_recovery", label: "Active Recovery" },
  { id: "rest", label: "Rest Day" },
];

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function Workouts() {
  const { profile, updateProfile } = useUser();
  const [activeTab, setActiveTab] = useState("schedule");

  const getWorkoutLabel = (id: string) => WORKOUT_TYPES.find(w => w.id === id)?.label || "Rest";

  const handleScheduleChange = (day: string, type: string) => {
    updateProfile({
      schedule: {
        ...profile.schedule,
        [day]: type
      }
    });
  };

  return (
    <Layout>
      <div className="relative h-48 w-full overflow-hidden rounded-b-3xl shadow-xl mb-6">
         <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
        <img src={gymImage} alt="Gym" className="w-full h-full object-cover opacity-70" />
        <div className="absolute bottom-4 left-6 z-20">
          <h1 className="text-3xl font-heading font-bold text-white uppercase">Training Plan</h1>
          <p className="text-primary font-medium">Phase 1: Foundation</p>
        </div>
      </div>

      <div className="px-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50 mb-6">
            <TabsTrigger value="schedule">Weekly Split</TabsTrigger>
            <TabsTrigger value="today">Today's Workout</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-2">
               <h2 className="text-lg font-bold text-white">Your 7-Day Split</h2>
               <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => {
                 // Reset to recommended
                  updateProfile({
                    schedule: {
                      monday: "legs_strength",
                      tuesday: "upper_body",
                      wednesday: "skills_cardio",
                      thursday: "legs_explosive",
                      friday: "full_body",
                      saturday: "active_recovery",
                      sunday: "rest",
                    }
                  });
               }}>Reset to Recommended</Button>
             </div>
             
             <div className="space-y-3">
               {DAYS.map((day) => (
                 <Card key={day} className="bg-card border-white/5">
                   <CardContent className="p-3 flex items-center justify-between">
                     <span className="text-sm font-bold text-muted-foreground uppercase w-24">{day}</span>
                     <Select 
                       value={profile.schedule[day] || "rest"} 
                       onValueChange={(val) => handleScheduleChange(day, val)}
                     >
                       <SelectTrigger className="w-[180px] h-8 text-xs bg-secondary border-transparent text-white">
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         {WORKOUT_TYPES.map((type) => (
                           <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </CardContent>
                 </Card>
               ))}
             </div>
          </TabsContent>

          <TabsContent value="today" className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            {/* Logic to show workout based on actual day could go here, for now static example based on "Legs Strength" */}
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-white">Legs - Strength Focus</h2>
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
              { name: "Back Squat", sets: "5", reps: "5", rest: "120s" },
              { name: "Romanian Deadlift", sets: "4", reps: "8", rest: "90s" },
              { name: "Bulgarian Split Squats", sets: "3", reps: "8/leg", rest: "60s" },
              { name: "Calf Raises", sets: "4", reps: "15", rest: "45s" },
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
        </Tabs>
      </div>
    </Layout>
  );
}
