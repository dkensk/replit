import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Flame, Settings2, Trophy, Crown, ArrowUpCircle } from "lucide-react";
import heroImage from "@assets/generated_images/cinematic_hockey_arena_ice_surface.png";
import { useUser } from "@/lib/UserContext";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Home() {
  const { profile, updateProfile, macros, consumedMacros, addXp, promoteTier } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);

  // Local state for form handling
  const [formData, setFormData] = useState({
    weight: profile.weight,
    heightFt: profile.heightFt,
    heightIn: profile.heightIn,
    age: profile.age
  });

  // Update local state when profile changes (e.g. on first load)
  useEffect(() => {
    setFormData({
      weight: profile.weight,
      heightFt: profile.heightFt,
      heightIn: profile.heightIn,
      age: profile.age
    });
  }, [profile]);

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  const handleCompleteWorkout = () => {
    if (!workoutCompleted) {
      addXp(15);
      setWorkoutCompleted(true);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Bronze": return "text-orange-400";
      case "Silver": return "text-gray-300";
      case "Gold": return "text-yellow-400";
      case "Diamond": return "text-cyan-400";
      case "Elite": return "text-red-500";
      default: return "text-primary";
    }
  };

  const getTierBg = (tier: string) => {
    switch (tier) {
      case "Bronze": return "bg-orange-500/20";
      case "Silver": return "bg-gray-400/20";
      case "Gold": return "bg-yellow-500/20";
      case "Diamond": return "bg-cyan-500/20";
      case "Elite": return "bg-red-500/20";
      default: return "bg-primary/20";
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative h-64 w-full overflow-hidden rounded-b-3xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
        <img 
          src={heroImage} 
          alt="Hockey Arena" 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute bottom-4 left-6 z-20">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">Welcome Back</p>
          <h1 className="text-3xl font-heading font-bold text-white italic">READY TO <br/>DOMINATE?</h1>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Profile / Stats Editor */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-heading font-semibold text-white">Your Stats</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:text-primary/80 hover:bg-primary/10"
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            >
              {isEditing ? "Save Changes" : <Settings2 className="w-4 h-4" />}
            </Button>
          </div>
          
          {isEditing ? (
             <Card className="bg-secondary/50 border-primary/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
              <CardContent className="p-4 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Weight (lbs)</Label>
                  <Input 
                    type="number" 
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value) || 0})}
                    className="bg-background/50 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input 
                    type="number" 
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || 0})}
                    className="bg-background/50 border-white/10"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Height</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2">
                      <Input 
                        type="number" 
                        value={formData.heightFt}
                        onChange={(e) => setFormData({...formData, heightFt: parseInt(e.target.value) || 0})}
                        className="bg-background/50 border-white/10"
                      />
                      <span className="text-muted-foreground text-sm">ft</span>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                       <Input 
                        type="number" 
                        value={formData.heightIn}
                        onChange={(e) => setFormData({...formData, heightIn: parseInt(e.target.value) || 0})}
                        className="bg-background/50 border-white/10"
                      />
                      <span className="text-muted-foreground text-sm">in</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-secondary/50 border-white/5 backdrop-blur-sm">
                <CardContent className="p-3 flex flex-col items-center text-center">
                  <span className="text-xs text-muted-foreground uppercase mb-1">Weight</span>
                  <span className="text-xl font-bold font-heading text-white">{profile.weight} <span className="text-xs text-muted-foreground font-normal">lbs</span></span>
                </CardContent>
              </Card>
              <Card className="bg-secondary/50 border-white/5 backdrop-blur-sm">
                <CardContent className="p-3 flex flex-col items-center text-center">
                  <span className="text-xs text-muted-foreground uppercase mb-1">Height</span>
                  <span className="text-xl font-bold font-heading text-white">{profile.heightFt}'{profile.heightIn}"</span>
                </CardContent>
              </Card>
              <Card className="bg-secondary/50 border-white/5 backdrop-blur-sm">
                 <CardContent className="p-3 flex flex-col items-center text-center">
                  <span className="text-xs text-muted-foreground uppercase mb-1">Target</span>
                  <span className="text-xl font-bold font-heading text-primary">{macros.protein}g</span>
                  <span className="text-[10px] text-muted-foreground">Protein</span>
                </CardContent>
              </Card>
            </div>
          )}
        </section>

        {/* Daily Stats & Gamification */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-secondary/50 border-white/5 backdrop-blur-sm">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="p-2 rounded-full bg-orange-500/20 text-orange-500 mb-2">
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold font-heading text-white">{consumedMacros.calories}</span>
              <span className="text-xs text-muted-foreground uppercase">Calories Eaten</span>
            </CardContent>
          </Card>
          
          {/* Readiness / Tier Card */}
          <Card className={cn("border-white/5 backdrop-blur-sm relative overflow-hidden", getTierBg(profile.tier))}>
            {profile.xp >= 100 && (
               <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center p-2">
                 <Button size="sm" onClick={promoteTier} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold animate-pulse">
                   <ArrowUpCircle className="w-4 h-4 mr-1" />
                   Promote
                 </Button>
               </div>
            )}
            <CardContent className="p-4 flex flex-col items-center text-center relative z-0">
              <div className={cn("p-2 rounded-full mb-2 bg-black/20", getTierColor(profile.tier))}>
                {profile.tier === "Diamond" || profile.tier === "Elite" ? <Crown className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
              </div>
              <span className={cn("text-2xl font-bold font-heading", getTierColor(profile.tier))}>{profile.xp}%</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wide font-bold">{profile.tier} Tier</span>
              <Progress value={profile.xp} className="h-1 mt-2 w-full bg-black/20" />
            </CardContent>
          </Card>
        </div>

        {/* Next Workout */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-heading font-semibold text-white">Next Workout</h2>
            <Button variant="link" className="text-xs text-muted-foreground">View Schedule</Button>
          </div>
          <Card className="bg-card border-l-4 border-l-primary overflow-hidden group relative">
             <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5 relative z-10">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="inline-block px-2 py-1 rounded text-[10px] font-bold bg-primary/20 text-primary mb-2 uppercase tracking-wider">Explosiveness</span>
                  <h3 className="text-lg font-bold text-white">Lower Body Power</h3>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-muted-foreground">45 min</span>
                </div>
              </div>
              <div className="space-y-2">
                 <div className="flex items-center text-sm text-muted-foreground">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                   Box Jumps (4x5)
                 </div>
                 <div className="flex items-center text-sm text-muted-foreground">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                   Front Squats (5x5)
                 </div>
              </div>
              <Button 
                className={cn(
                  "w-full mt-4 font-bold border transition-all",
                  workoutCompleted 
                    ? "bg-green-500/20 text-green-500 border-green-500/50 hover:bg-green-500/30"
                    : "bg-primary/10 text-primary border-primary/50 hover:bg-primary/20"
                )}
                onClick={handleCompleteWorkout}
                disabled={workoutCompleted}
              >
                {workoutCompleted ? "Workout Completed (+15 XP)" : "Complete & Log Workout"}
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Nutrition Summary - Synced with Diet.tsx */}
        <section>
           <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-heading font-semibold text-white">Nutrition Progress</h2>
          </div>
          <Card className="bg-secondary/30 border-white/5">
            <CardContent className="p-5">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-muted-foreground">Protein</span>
                <span className="text-sm font-bold text-white">{consumedMacros.protein}g / {macros.protein}g</span>
              </div>
              <Progress value={(consumedMacros.protein / macros.protein) * 100} className="h-2 bg-secondary" />
              
              <div className="flex justify-between items-end mt-4 mb-2">
                <span className="text-sm font-medium text-muted-foreground">Calories</span>
                <span className="text-sm font-bold text-white">{consumedMacros.calories} / {macros.calories}</span>
              </div>
              <Progress value={(consumedMacros.calories / macros.calories) * 100} className="h-2 bg-secondary" />
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
}
