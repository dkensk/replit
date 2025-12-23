import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Zap, Flame, Settings2, Trophy, Crown, ArrowUpCircle, Calendar as CalendarIcon, CheckCircle2, Undo2 } from "lucide-react";
import heroImage from "@assets/generated_images/cinematic_hockey_arena_ice_surface.png";
import { useUser } from "@/lib/UserContext";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { format, isSameDay, parseISO, startOfToday } from "date-fns";

const WORKOUT_LABELS: Record<string, string> = {
  legs_strength: "Legs - Strength",
  legs_explosive: "Legs - Explosiveness",
  upper_body: "Upper Body Power",
  back_biceps: "Back & Biceps",
  chest_triceps: "Chest & Triceps",
  full_body: "Full Body Athletic",
  skills_cardio: "Skills & Cardio",
  active_recovery: "Active Recovery",
  rest: "Rest Day"
};

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export default function Home() {
  const { profile, updateProfile, macros, consumedMacros, addXp, promoteTier, logWorkout, undoWorkout } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const [formData, setFormData] = useState({
    weight: profile.weight,
    heightFt: profile.heightFt,
    heightIn: profile.heightIn,
    age: profile.age
  });

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const { streak, streakDates } = useMemo(() => {
    const streakDatesSet = new Set<string>();
    let currentStreak = 0;
    const sortedHistory = [...(profile.workoutHistory || [])].sort().reverse();
    
    if (sortedHistory.length === 0) return { streak: 0, streakDates: streakDatesSet };

    const now = new Date();
    const today = formatLocalDate(now);
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = formatLocalDate(yesterdayDate);

    if (sortedHistory[0] !== today && sortedHistory[0] !== yesterday) {
        return { streak: 0, streakDates: streakDatesSet };
    }

    let checkDate = new Date();
    if (sortedHistory.includes(today)) {
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    while (true) {
        const dateStr = formatLocalDate(checkDate);
        if (profile.workoutHistory.includes(dateStr)) {
            currentStreak++;
            streakDatesSet.add(dateStr);
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    return { streak: currentStreak, streakDates: streakDatesSet };
  }, [profile.workoutHistory]);

  const isTodayCompleted = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    return profile.workoutHistory?.includes(today);
  }, [profile.workoutHistory]);

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
    if (!isTodayCompleted) {
      logWorkout();
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
      case "Bronze": return "bg-gradient-to-br from-orange-500/25 to-orange-600/10";
      case "Silver": return "bg-gradient-to-br from-gray-400/25 to-gray-500/10";
      case "Gold": return "bg-gradient-to-br from-yellow-500/25 to-yellow-600/10";
      case "Diamond": return "bg-gradient-to-br from-cyan-500/25 to-cyan-600/10";
      case "Elite": return "bg-gradient-to-br from-red-500/25 to-red-600/10";
      default: return "bg-gradient-to-br from-primary/25 to-primary/10";
    }
  };

  const getScheduledWorkoutForDate = (date: Date) => {
    const dayIndex = date.getDay();
    const dayName = DAYS[dayIndex];
    const workoutType = profile.schedule[dayName] || "rest";
    return WORKOUT_LABELS[workoutType] || "Rest Day";
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative h-72 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent z-10" />
        <img 
          src={heroImage} 
          alt="Hockey Arena" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-6 left-6 right-6 z-20">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
            Welcome back{profile.firstName ? `, ${profile.firstName}` : ""}
          </p>
          <h1 className="text-4xl font-heading font-bold text-white leading-tight">
            READY TO<br/>DOMINATE?
          </h1>
        </div>
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* Stats Section */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-heading font-semibold text-white tracking-wide">Your Stats</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:text-primary/80 hover:bg-primary/10 h-8 px-2"
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              data-testid="button-edit-stats"
            >
              {isEditing ? "Save" : <Settings2 className="w-4 h-4" />}
            </Button>
          </div>
          
          {isEditing ? (
            <Card className="bg-card/90 border-primary/30 backdrop-blur-sm">
              <CardContent className="p-4 grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Weight (lbs)</Label>
                  <Input 
                    type="number" 
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value) || 0})}
                    className="bg-background/60 border-white/10 h-10"
                    data-testid="input-weight"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Age</Label>
                  <Input 
                    type="number" 
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || 0})}
                    className="bg-background/60 border-white/10 h-10"
                    data-testid="input-age"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs text-muted-foreground">Height</Label>
                  <div className="flex gap-3">
                    <div className="flex-1 flex items-center gap-2">
                      <Input 
                        type="number" 
                        value={formData.heightFt}
                        onChange={(e) => setFormData({...formData, heightFt: parseInt(e.target.value) || 0})}
                        className="bg-background/60 border-white/10 h-10"
                        data-testid="input-height-ft"
                      />
                      <span className="text-muted-foreground text-sm">ft</span>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <Input 
                        type="number" 
                        value={formData.heightIn}
                        onChange={(e) => setFormData({...formData, heightIn: parseInt(e.target.value) || 0})}
                        className="bg-background/60 border-white/10 h-10"
                        data-testid="input-height-in"
                      />
                      <span className="text-muted-foreground text-sm">in</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-card/60 border-white/5 backdrop-blur-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center min-h-[88px]">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Weight</span>
                  <span className="text-2xl font-bold font-heading text-white" data-testid="text-weight">{profile.weight}</span>
                  <span className="text-[10px] text-muted-foreground">lbs</span>
                </CardContent>
              </Card>
              <Card className="bg-card/60 border-white/5 backdrop-blur-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center min-h-[88px]">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Height</span>
                  <span className="text-2xl font-bold font-heading text-white" data-testid="text-height">{profile.heightFt}'{profile.heightIn}"</span>
                </CardContent>
              </Card>
              <Card className="bg-card/60 border-white/5 backdrop-blur-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center min-h-[88px]">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Target</span>
                  <span className="text-2xl font-bold font-heading text-primary" data-testid="text-protein">{macros.protein}g</span>
                  <span className="text-[10px] text-muted-foreground">Protein</span>
                </CardContent>
              </Card>
            </div>
          )}
        </section>

        {/* Daily Stats & Gamification */}
        <section>
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-card/60 border-white/5 backdrop-blur-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center min-h-[120px]">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mb-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <span className="text-3xl font-bold font-heading text-white" data-testid="text-streak">{streak}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Day Streak</span>
              </CardContent>
            </Card>
            
            <Card className={cn("border-white/5 backdrop-blur-sm relative overflow-hidden", getTierBg(profile.tier))}>
              {profile.xp >= 100 && (
                <div className="absolute inset-0 bg-black/70 z-10 flex items-center justify-center p-3">
                  <Button 
                    size="sm" 
                    onClick={promoteTier} 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/25"
                    data-testid="button-promote"
                  >
                    <ArrowUpCircle className="w-4 h-4 mr-1.5" />
                    Promote
                  </Button>
                </div>
              )}
              <CardContent className="p-4 flex flex-col items-center justify-center text-center min-h-[120px] relative z-0">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-black/30", getTierColor(profile.tier))}>
                  {profile.tier === "Diamond" || profile.tier === "Elite" ? <Crown className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
                </div>
                <span className={cn("text-3xl font-bold font-heading", getTierColor(profile.tier))} data-testid="text-xp">{profile.xp}%</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{profile.tier} Tier</span>
                <div className="w-full mt-2">
                  <Progress value={profile.xp} className="h-1.5 bg-black/30" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Activity Calendar Section */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-heading font-semibold text-white tracking-wide">Activity Log</h2>
            {selectedDate && (
              <div className="text-right">
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
                  {format(selectedDate, 'MMM do')}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {getScheduledWorkoutForDate(selectedDate)}
                </span>
              </div>
            )}
          </div>
          <Card className="bg-card/40 border-white/5 overflow-hidden">
            <CardContent className="p-3">
              <div className="w-full flex justify-center overflow-hidden">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => date > new Date()}
                  className="pointer-events-auto bg-transparent border-0 p-0 w-full max-w-full"
                  modifiers={{
                    logged: (date) => {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      const dateStr = `${year}-${month}-${day}`;
                      return profile.workoutHistory?.includes(dateStr) || false;
                    },
                    today: (date) => {
                      const now = new Date();
                      return date.getFullYear() === now.getFullYear() &&
                             date.getMonth() === now.getMonth() &&
                             date.getDate() === now.getDate();
                    }
                  }}
                  modifiersClassNames={{
                    logged: "streak-logged-day",
                    today: "calendar-today"
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Today's Workout */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-heading font-semibold text-white tracking-wide">Today's Workout</h2>
            <Button variant="link" size="sm" className="text-xs text-muted-foreground h-auto p-0" data-testid="link-view-schedule">
              View Schedule
            </Button>
          </div>
          <Card className="bg-card border-l-4 border-l-primary overflow-hidden">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary mb-2 uppercase tracking-wider">
                    {profile.schedule[DAYS[new Date().getDay()]] ? "Training" : "Rest"}
                  </span>
                  <h3 className="text-lg font-bold text-white" data-testid="text-workout-name">{getScheduledWorkoutForDate(new Date())}</h3>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-muted-foreground">{profile.workoutDuration} min</span>
                </div>
              </div>
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                See Training tab for details
              </div>
              <div className="space-y-2">
                <Button 
                  className={cn(
                    "w-full font-bold transition-all h-11",
                    isTodayCompleted 
                      ? "bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/20"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                  onClick={handleCompleteWorkout}
                  disabled={isTodayCompleted}
                  data-testid="button-complete-workout"
                >
                  {isTodayCompleted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2"/>
                      Workout Completed (+15 XP)
                    </>
                  ) : (
                    "Complete & Log Workout"
                  )}
                </Button>
                {isTodayCompleted && (
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground hover:text-white h-8"
                    onClick={undoWorkout}
                    data-testid="button-undo-workout"
                  >
                    <Undo2 className="w-3 h-3 mr-1.5"/>
                    Undo
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Nutrition Progress */}
        <section className="pb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-heading font-semibold text-white tracking-wide">Nutrition Progress</h2>
          </div>
          <Card className="bg-card/40 border-white/5">
            <CardContent className="p-5 space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Protein</span>
                  <span className="text-sm font-bold text-white" data-testid="text-protein-progress">
                    {consumedMacros.protein}g <span className="text-muted-foreground font-normal">/ {macros.protein}g</span>
                  </span>
                </div>
                <Progress value={(consumedMacros.protein / macros.protein) * 100} className="h-2.5 bg-secondary/50" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Calories</span>
                  <span className="text-sm font-bold text-white" data-testid="text-calories-progress">
                    {consumedMacros.calories} <span className="text-muted-foreground font-normal">/ {macros.calories}</span>
                  </span>
                </div>
                <Progress value={(consumedMacros.calories / macros.calories) * 100} className="h-2.5 bg-secondary/50" />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
}
