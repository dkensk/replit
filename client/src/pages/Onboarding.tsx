import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col justify-center max-w-md mx-auto relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-20%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px]" />
      
      <div className="relative z-10 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-heading font-bold text-white uppercase italic">
            Puck<span className="text-primary">Pro</span>
          </h1>
          <p className="text-muted-foreground text-lg">Let's set up your player profile.</p>
        </div>

        <div className="space-y-6 animate-in slide-in-from-right-10 fade-in duration-300">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input 
                data-testid="input-first-name"
                type="text" 
                placeholder="Your name" 
                className="bg-secondary border-transparent"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input 
                  data-testid="input-age"
                  type="number" 
                  placeholder="13" 
                  className="bg-secondary border-transparent"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Weight (lbs) *</Label>
                <Input 
                  data-testid="input-weight"
                  type="number" 
                  placeholder="130" 
                  className="bg-secondary border-transparent"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Height *</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  data-testid="input-height-ft"
                  type="number" 
                  placeholder="Feet" 
                  className="bg-secondary border-transparent"
                  value={formData.heightFt}
                  onChange={(e) => setFormData({ ...formData, heightFt: e.target.value })}
                />
                <Input 
                  data-testid="input-height-in"
                  type="number" 
                  placeholder="Inches" 
                  className="bg-secondary border-transparent"
                  value={formData.heightIn}
                  onChange={(e) => setFormData({ ...formData, heightIn: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Position</Label>
              <Select value={formData.position} onValueChange={(v) => setFormData({ ...formData, position: v })}>
                <SelectTrigger data-testid="select-position" className="bg-secondary border-transparent">
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
              <Label>Level</Label>
              <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                <SelectTrigger data-testid="select-level" className="bg-secondary border-transparent">
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
            
            <div className="space-y-2">
              <Label>Goal</Label>
              <Select value={formData.goal} onValueChange={(v) => setFormData({ ...formData, goal: v })}>
                <SelectTrigger data-testid="select-goal" className="bg-secondary border-transparent">
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
            className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 h-12 text-lg shadow-[0_0_20px_rgba(0,240,255,0.3)]" 
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
