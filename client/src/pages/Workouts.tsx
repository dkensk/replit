import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, Clock, Calendar, PlayCircle, RefreshCw, Dumbbell } from "lucide-react";
import gymImage from "@assets/generated_images/athletic_gym_training_equipment.png";
import { useUser } from "@/lib/UserContext";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const WORKOUT_TYPES = [
  { id: "legs_strength", label: "Legs - Strength" },
  { id: "legs_explosive", label: "Legs - Explosiveness" },
  { id: "upper_body", label: "Upper Body Power" },
  { id: "back_biceps", label: "Back & Biceps" },
  { id: "chest_triceps", label: "Chest & Triceps" },
  { id: "full_body", label: "Full Body Athletic" },
  { id: "skills_cardio", label: "Skills & Cardio" },
  { id: "active_recovery", label: "Active Recovery" },
  { id: "rest", label: "Rest Day" },
];

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

// Exercise Database - Expanded with "Reliable Source" Quality Data
const EXERCISES: Record<string, Array<{ id: string, name: string, category: string }>> = {
  "legs_compound": [
    { id: "back_squat", name: "Back Squat", category: "legs_compound" },
    { id: "front_squat", name: "Front Squat", category: "legs_compound" },
    { id: "leg_press", name: "Leg Press", category: "legs_compound" },
    { id: "hack_squat", name: "Hack Squat", category: "legs_compound" },
    { id: "safety_bar_squat", name: "Safety Bar Squat", category: "legs_compound" },
    { id: "zercher_squat", name: "Zercher Squat", category: "legs_compound" }
  ],
  "legs_hinge": [
    { id: "rdl", name: "Romanian Deadlift", category: "legs_hinge" },
    { id: "trap_bar", name: "Trap Bar Deadlift", category: "legs_hinge" },
    { id: "good_morning", name: "Good Mornings", category: "legs_hinge" },
    { id: "kettlebell_swing", name: "Kettlebell Swing", category: "legs_hinge" },
    { id: "single_leg_rdl", name: "Single Leg RDL", category: "legs_hinge" }
  ],
  "legs_unilateral": [
    { id: "split_squat", name: "Bulgarian Split Squat", category: "legs_unilateral" },
    { id: "walking_lunges", name: "Walking Lunges", category: "legs_unilateral" },
    { id: "reverse_lunges", name: "Reverse Lunges", category: "legs_unilateral" },
    { id: "step_ups", name: "Box Step Ups", category: "legs_unilateral" },
    { id: "cossack_squat", name: "Cossack Squat", category: "legs_unilateral" }
  ],
  "legs_explosive": [
    { id: "box_jumps", name: "Box Jumps", category: "legs_explosive" },
    { id: "broad_jumps", name: "Broad Jumps", category: "legs_explosive" },
    { id: "power_clean", name: "Power Clean", category: "legs_explosive" },
    { id: "depth_jumps", name: "Depth Jumps", category: "legs_explosive" },
    { id: "skater_jumps", name: "Skater Jumps", category: "legs_explosive" },
    { id: "hurdle_hops", name: "Hurdle Hops", category: "legs_explosive" }
  ],
  "calves": [
    { id: "standing_calf_raise", name: "Standing Calf Raise", category: "calves" },
    { id: "seated_calf_raise", name: "Seated Calf Raise", category: "calves" },
    { id: "single_leg_calf_raise", name: "Single Leg Calf Raise", category: "calves" }
  ],
  "upper_push": [
    { id: "bench_press", name: "Bench Press", category: "upper_push" },
    { id: "overhead_press", name: "Overhead Press", category: "upper_push" },
    { id: "incline_dumbbell_press", name: "Incline DB Press", category: "upper_push" },
    { id: "dips", name: "Weighted Dips", category: "upper_push" },
    { id: "landmine_press", name: "Landmine Press", category: "upper_push" },
    { id: "pushups", name: "Weighted Pushups", category: "upper_push" }
  ],
  "upper_pull": [
    { id: "pullups", name: "Pull Ups", category: "upper_pull" },
    { id: "barbell_row", name: "Barbell Row", category: "upper_pull" },
    { id: "face_pulls", name: "Face Pulls", category: "upper_pull" },
    { id: "single_arm_row", name: "Single Arm DB Row", category: "upper_pull" },
    { id: "lat_pulldown", name: "Lat Pulldown", category: "upper_pull" },
    { id: "tbar_row", name: "T-Bar Row", category: "upper_pull" }
  ],
  "isolation_bicep": [
    { id: "barbell_curl", name: "Barbell Curl", category: "isolation_bicep" },
    { id: "hammer_curl", name: "Hammer Curl", category: "isolation_bicep" },
    { id: "preacher_curl", name: "Preacher Curl", category: "isolation_bicep" },
    { id: "incline_curl", name: "Incline DB Curl", category: "isolation_bicep" }
  ],
  "isolation_tricep": [
    { id: "skull_crusher", name: "Skull Crushers", category: "isolation_tricep" },
    { id: "tricep_pushdown", name: "Cable Pushdown", category: "isolation_tricep" },
    { id: "overhead_extension", name: "Overhead Extension", category: "isolation_tricep" },
    { id: "close_grip_bench", name: "Close Grip Bench", category: "isolation_tricep" }
  ],
  "core": [
    { id: "plank", name: "Weighted Plank", category: "core" },
    { id: "pallof_press", name: "Pallof Press", category: "core" },
    { id: "ab_wheel", name: "Ab Wheel Rollout", category: "core" },
    { id: "hanging_leg_raise", name: "Hanging Leg Raise", category: "core" },
    { id: "russian_twist", name: "Russian Twist", category: "core" }
  ]
};

// Default workouts mapping - Professional Grade
const DEFAULT_WORKOUTS: Record<string, Array<{ id: string, sets: string, reps: string, rest: string, category: string }>> = {
  "legs_strength": [
    { id: "back_squat", sets: "5", reps: "5", rest: "3-5 min", category: "legs_compound" },
    { id: "rdl", sets: "4", reps: "8-10", rest: "2 min", category: "legs_hinge" },
    { id: "split_squat", sets: "3", reps: "8/leg", rest: "90s", category: "legs_unilateral" },
    { id: "standing_calf_raise", sets: "4", reps: "15-20", rest: "60s", category: "calves" },
    { id: "plank", sets: "3", reps: "45-60s", rest: "60s", category: "core" }
  ],
  "legs_explosive": [
    { id: "box_jumps", sets: "4", reps: "3-5", rest: "2 min", category: "legs_explosive" },
    { id: "power_clean", sets: "5", reps: "3", rest: "3 min", category: "legs_explosive" },
    { id: "trap_bar", sets: "4", reps: "5 (Explosive)", rest: "2-3 min", category: "legs_hinge" },
    { id: "skater_jumps", sets: "3", reps: "8/side", rest: "90s", category: "legs_explosive" },
    { id: "pallof_press", sets: "3", reps: "10/side", rest: "60s", category: "core" }
  ],
  "upper_body": [
    { id: "bench_press", sets: "4", reps: "6-8", rest: "2-3 min", category: "upper_push" },
    { id: "pullups", sets: "4", reps: "AMRAP", rest: "2 min", category: "upper_pull" },
    { id: "overhead_press", sets: "3", reps: "8-10", rest: "2 min", category: "upper_push" },
    { id: "barbell_row", sets: "3", reps: "10-12", rest: "90s", category: "upper_pull" },
    { id: "face_pulls", sets: "3", reps: "15", rest: "60s", category: "upper_pull" }
  ],
  "back_biceps": [
    { id: "pullups", sets: "4", reps: "8-10", rest: "2 min", category: "upper_pull" },
    { id: "barbell_row", sets: "4", reps: "8-12", rest: "90s", category: "upper_pull" },
    { id: "lat_pulldown", sets: "3", reps: "12-15", rest: "60s", category: "upper_pull" },
    { id: "barbell_curl", sets: "3", reps: "10-12", rest: "60s", category: "isolation_bicep" },
    { id: "hammer_curl", sets: "3", reps: "12-15", rest: "60s", category: "isolation_bicep" }
  ],
  "chest_triceps": [
    { id: "bench_press", sets: "4", reps: "6-8", rest: "2-3 min", category: "upper_push" },
    { id: "incline_dumbbell_press", sets: "3", reps: "8-10", rest: "2 min", category: "upper_push" },
    { id: "dips", sets: "3", reps: "10-12", rest: "90s", category: "upper_push" },
    { id: "skull_crusher", sets: "3", reps: "10-12", rest: "60s", category: "isolation_tricep" },
    { id: "tricep_pushdown", sets: "3", reps: "12-15", rest: "60s", category: "isolation_tricep" }
  ],
  "full_body": [
    { id: "trap_bar", sets: "3", reps: "8", rest: "2 min", category: "legs_hinge" },
    { id: "landmine_press", sets: "3", reps: "10/arm", rest: "90s", category: "upper_push" },
    { id: "walking_lunges", sets: "3", reps: "10/leg", rest: "90s", category: "legs_unilateral" },
    { id: "single_arm_row", sets: "3", reps: "10/arm", rest: "90s", category: "upper_pull" },
    { id: "ab_wheel", sets: "3", reps: "10", rest: "60s", category: "core" }
  ],
  "active_recovery": [
     // Placeholder for lighter work, could use same structure or different UI
  ]
};

export default function Workouts() {
  const { profile, updateProfile } = useUser();
  const [activeTab, setActiveTab] = useState("schedule");
  
  // Local state for current workout session customization
  // Maps index -> exerciseId
  const [customWorkout, setCustomWorkout] = useState<Record<number, string>>({});

  const handleScheduleChange = (day: string, type: string) => {
    updateProfile({
      schedule: {
        ...profile.schedule,
        [day]: type
      }
    });
  };

  const currentDay = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]; // Simple mapping, 0=Sun -> 6
  const currentWorkoutType = profile.schedule[currentDay] || "rest";
  const baseWorkout = DEFAULT_WORKOUTS[currentWorkoutType] || DEFAULT_WORKOUTS["legs_strength"]; // Fallback for demo

  const getExerciseName = (id: string, category: string) => {
    return EXERCISES[category]?.find(e => e.id === id)?.name || id;
  };

  return (
    <Layout>
      <div className="relative h-48 w-full overflow-hidden rounded-b-3xl shadow-xl mb-6">
         <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
        <img src={gymImage} alt="Gym" className="w-full h-full object-cover opacity-70" />
        <div className="absolute bottom-4 left-6 z-20 w-[90%] pr-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-heading font-bold text-white uppercase">Training Plan</h1>
              <p className="text-primary font-medium">Phase 1: Foundation</p>
            </div>
             <div className="bg-black/30 backdrop-blur-md rounded-lg p-1 border border-white/10">
              <Select 
                value={profile.workoutDuration.toString()} 
                onValueChange={(val) => updateProfile({ workoutDuration: parseInt(val) })}
              >
                <SelectTrigger className="h-8 border-none bg-transparent text-white w-[100px] focus:ring-0 text-xs">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 Mins</SelectItem>
                  <SelectItem value="45">45 Mins</SelectItem>
                  <SelectItem value="60">60 Mins</SelectItem>
                  <SelectItem value="90">90 Mins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-white">{WORKOUT_TYPES.find(w => w.id === currentWorkoutType)?.label || "Rest Day"}</h2>
              <span className="text-sm text-muted-foreground flex items-center"><Clock className="w-4 h-4 mr-1"/> {profile.workoutDuration} min</span>
            </div>

            {/* Warmup */}
            {currentWorkoutType !== "rest" && (
              <Card className="bg-secondary/30 border-white/5 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-primary">Warmup</h3>
                    <span className="text-xs text-muted-foreground">10 mins</span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500/50"/> 5 min Light Cardio (Bike/Jog)</li>
                    <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500/50"/> Dynamic Stretching (Leg Swings, etc.)</li>
                    <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500/50"/> Activation (Glute Bridges, Band Pullaparts)</li>
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Exercises */}
            {currentWorkoutType === "rest" || currentWorkoutType === "active_recovery" ? (
              <Card className="bg-card border-white/5">
                <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
                  <div className="bg-secondary p-4 rounded-full mb-4">
                    <Dumbbell className="w-8 h-8 opacity-20" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Rest & Recover</h3>
                  <p className="max-w-xs mx-auto">Take today off to let your muscles rebuild. Light walking or mobility work is optional but encouraged.</p>
                </CardContent>
              </Card>
            ) : (
              baseWorkout.slice(0, Math.ceil(profile.workoutDuration / 12)).map((ex, i) => { // Adjusted scaling logic
                const currentExerciseId = customWorkout[i] || ex.id;
                const currentExerciseName = getExerciseName(currentExerciseId, ex.category);
                
                return (
                  <Dialog key={i}>
                    <DialogTrigger asChild>
                      <Card className="bg-card border-white/5 hover:border-primary/30 transition-colors cursor-pointer group mb-3">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground font-bold group-hover:text-primary transition-colors">
                              {i + 1}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white text-lg group-hover:text-primary transition-colors">{currentExerciseName}</h4>
                                <RefreshCw className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <p className="text-sm text-muted-foreground">{ex.sets} Sets × {ex.reps} • Rest: {ex.rest}</p>
                            </div>
                          </div>
                          <Button size="icon" variant="ghost" className="text-primary opacity-50 group-hover:opacity-100">
                            <PlayCircle className="w-6 h-6" />
                          </Button>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-white/10 text-white max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Substitute Exercise</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-2 py-4">
                        {EXERCISES[ex.category]?.map((alt) => (
                          <Button 
                            key={alt.id}
                            variant="ghost" 
                            className={cn(
                              "justify-start h-auto py-3 px-4",
                              currentExerciseId === alt.id ? "bg-primary/20 text-primary border border-primary/50" : "hover:bg-white/5"
                            )}
                            onClick={() => {
                              setCustomWorkout(prev => ({ ...prev, [i]: alt.id }));
                              // Close dialog logic handled by DialogPrimitive typically, or we can control open state
                            }}
                          >
                            <div className="text-left">
                              <div className="font-bold">{alt.name}</div>
                              {currentExerciseId === alt.id && <span className="text-[10px] uppercase font-bold text-primary">Selected</span>}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
