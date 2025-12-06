import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, User, Target, Dumbbell } from "lucide-react";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);

  const nextStep = () => setStep(step + 1);
  const finish = () => setLocation("/");

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col justify-center max-w-md mx-auto relative overflow-hidden">
      {/* Background visuals */}
      <div className="absolute top-[-20%] right-[-20%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px]" />
      
      <div className="relative z-10 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-heading font-bold text-white uppercase italic">
            Puck<span className="text-primary">Pro</span>
          </h1>
          <p className="text-muted-foreground text-lg">Build your elite player profile.</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-primary neon-glow' : 'bg-secondary'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-10 fade-in duration-300">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input type="number" placeholder="16" className="bg-secondary border-transparent" />
                </div>
                <div className="space-y-2">
                  <Label>Weight (lbs)</Label>
                  <Input type="number" placeholder="175" className="bg-secondary border-transparent" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Height</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input type="number" placeholder="Ft" className="bg-secondary border-transparent" />
                  <Input type="number" placeholder="In" className="bg-secondary border-transparent" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Select>
                  <SelectTrigger className="bg-secondary border-transparent">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="wing">Winger</SelectItem>
                    <SelectItem value="defense">Defense</SelectItem>
                    <SelectItem value="goalie">Goalie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Level</Label>
                <Select>
                  <SelectTrigger className="bg-secondary border-transparent">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hl">House League</SelectItem>
                    <SelectItem value="a">A</SelectItem>
                    <SelectItem value="aa">AA</SelectItem>
                    <SelectItem value="aaa">AAA</SelectItem>
                    <SelectItem value="junior">Junior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90" onClick={nextStep}>
              Next <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-10 fade-in duration-300">
            <h2 className="text-2xl font-heading">Your Goals</h2>
            <div className="space-y-4">
              <RadioGroup defaultValue="muscle">
                <div className="grid gap-4">
                  <Label htmlFor="muscle" className="cursor-pointer">
                    <Card className="bg-secondary border-transparent hover:border-primary/50 transition-all data-[state=checked]:border-primary">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="bg-primary/20 p-3 rounded-full text-primary">
                          <Dumbbell className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">Build Muscle</h3>
                          <p className="text-xs text-muted-foreground">Gain lean mass & strength</p>
                        </div>
                        <RadioGroupItem value="muscle" id="muscle" className="ml-auto" />
                      </CardContent>
                    </Card>
                  </Label>
                  <Label htmlFor="fatloss" className="cursor-pointer">
                    <Card className="bg-secondary border-transparent hover:border-primary/50 transition-all">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="bg-primary/20 p-3 rounded-full text-primary">
                          <Target className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">Lose Fat</h3>
                          <p className="text-xs text-muted-foreground">Get lean & explosive</p>
                        </div>
                        <RadioGroupItem value="fatloss" id="fatloss" className="ml-auto" />
                      </CardContent>
                    </Card>
                  </Label>
                </div>
              </RadioGroup>
              
              <div className="space-y-2 pt-4">
                <Label>Primary Hockey Goal</Label>
                <Select>
                  <SelectTrigger className="bg-secondary border-transparent">
                    <SelectValue placeholder="Select goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="explosiveness">Explosiveness & Speed</SelectItem>
                    <SelectItem value="strength">Puck Protection & Strength</SelectItem>
                    <SelectItem value="endurance">Stamina & Shift Length</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 border-white/10" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1 bg-primary text-primary-foreground font-bold" onClick={nextStep}>Next <ChevronRight className="ml-2 w-4 h-4" /></Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-10 fade-in duration-300">
            <h2 className="text-2xl font-heading">Setup & Diet</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Gym Access</Label>
                <Select>
                  <SelectTrigger className="bg-secondary border-transparent">
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Commercial Gym</SelectItem>
                    <SelectItem value="home_gym">Home Gym (Barbell/Dumbbells)</SelectItem>
                    <SelectItem value="minimal">Minimal (Bands/Bodyweight)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                <Label>Hockey Training Setup</Label>
                <Select>
                  <SelectTrigger className="bg-secondary border-transparent">
                    <SelectValue placeholder="Select setup" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rink">Ice Rink Access</SelectItem>
                    <SelectItem value="shooting_pad">Shooting Pad / Net</SelectItem>
                    <SelectItem value="none">Stickhandling only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                <Label>Dietary Restrictions</Label>
                <Input placeholder="e.g. Peanuts, Dairy, Gluten..." className="bg-secondary border-transparent" />
              </div>
            </div>
            <Button className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 h-12 text-lg shadow-[0_0_20px_rgba(0,240,255,0.3)]" onClick={finish}>
              Create My Plan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
