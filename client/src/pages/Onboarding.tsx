import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, User, Activity, Target } from "lucide-react";
import { useUser } from "@/lib/UserContext";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { updateProfile, refetchProfile } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    age: "",
    weight: "",
    heightFt: "",
    heightIn: "",
    position: "defense",
    level: "aa",
    goal: "muscle"
  });

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.weight || !formData.heightFt) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await updateProfile({
        firstName: formData.firstName,
        age: parseInt(formData.age) || 13,
        weight: parseInt(formData.weight),
        heightFt: parseInt(formData.heightFt),
        heightIn: parseInt(formData.heightIn) || 0,
        position: formData.position as any,
        level: formData.level as any,
        goal: formData.goal as any,
        onboardingComplete: true
      });
      
      if (refetchProfile) {
        await refetchProfile();
      }
      
      setLocation("/");
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { icon: User, label: "Profile", active: true },
    { icon: Activity, label: "Stats", active: true },
    { icon: Target, label: "Goals", active: true }
  ];

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col justify-center max-w-md mx-auto relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-20%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[200px] h-[200px] bg-primary/10 rounded-full blur-[60px]" />
      
      <div className="relative z-10 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-heading font-bold text-white uppercase italic">
            Edge<span className="text-primary">Hockey</span>
          </h1>
          <p className="text-muted-foreground text-base">Let's set up your player profile.</p>
        </div>

        <div className="flex items-center justify-center gap-3 py-2">
          {steps.map((step, index) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step.active 
                  ? "bg-primary/20 border border-primary/40" 
                  : "bg-secondary border border-white/10"
              }`}>
                <step.icon className={`w-4 h-4 ${step.active ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${step.active ? "bg-primary/40" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-5 animate-in slide-in-from-right-10 fade-in duration-300">
          <div className="bg-card/60 border border-white/5 backdrop-blur-sm rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-white/80 uppercase tracking-wide">Basic Info</span>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">First Name *</Label>
              <Input 
                data-testid="input-first-name"
                type="text" 
                placeholder="Your name" 
                className="h-11 bg-secondary border-white/5 rounded-xl"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Age</Label>
                <Input 
                  data-testid="input-age"
                  type="number" 
                  placeholder="Your age" 
                  className="h-11 bg-secondary border-white/5 rounded-xl"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Weight (lbs) *</Label>
                <Input 
                  data-testid="input-weight"
                  type="number" 
                  placeholder="Weight" 
                  className="h-11 bg-secondary border-white/5 rounded-xl"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Height *</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  data-testid="input-height-ft"
                  type="number" 
                  placeholder="Feet" 
                  className="h-11 bg-secondary border-white/5 rounded-xl"
                  value={formData.heightFt}
                  onChange={(e) => setFormData({ ...formData, heightFt: e.target.value })}
                />
                <Input 
                  data-testid="input-height-in"
                  type="number" 
                  placeholder="Inches" 
                  className="h-11 bg-secondary border-white/5 rounded-xl"
                  value={formData.heightIn}
                  onChange={(e) => setFormData({ ...formData, heightIn: e.target.value })}
                />
              </div>
            </div>
          </div>
          
          <div className="bg-card/60 border border-white/5 backdrop-blur-sm rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-white/80 uppercase tracking-wide">Hockey Details</span>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Position</Label>
              <Select value={formData.position} onValueChange={(v) => setFormData({ ...formData, position: v })}>
                <SelectTrigger data-testid="select-position" className="h-11 bg-secondary border-white/5 rounded-xl">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="defense">Defense</SelectItem>
                  <SelectItem value="wing">Wing</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="goalie">Goalie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Level</Label>
              <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                <SelectTrigger data-testid="select-level" className="h-11 bg-secondary border-white/5 rounded-xl">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House League</SelectItem>
                  <SelectItem value="a">A</SelectItem>
                  <SelectItem value="aa">AA</SelectItem>
                  <SelectItem value="aaa">AAA</SelectItem>
                  <SelectItem value="junior">Junior</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="bg-card/60 border border-white/5 backdrop-blur-sm rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-white/80 uppercase tracking-wide">Training Goal</span>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Goal</Label>
              <Select value={formData.goal} onValueChange={(v) => setFormData({ ...formData, goal: v })}>
                <SelectTrigger data-testid="select-goal" className="h-11 bg-secondary border-white/5 rounded-xl">
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="muscle">Build Muscle</SelectItem>
                  <SelectItem value="fatloss">Fat Loss</SelectItem>
                  <SelectItem value="maintain">Maintain</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            data-testid="button-start-training"
            className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 h-11 rounded-xl text-base shadow-[0_0_20px_rgba(0,240,255,0.3)]" 
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.firstName || !formData.weight || !formData.heightFt}
          >
            {isSubmitting ? "Setting up..." : "Start Training"} <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
