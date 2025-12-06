import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, Flame, Calendar, ChevronRight } from "lucide-react";
import heroImage from "@assets/generated_images/cinematic_hockey_arena_ice_surface.png";

export default function Home() {
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
        {/* Daily Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-secondary/50 border-white/5 backdrop-blur-sm">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="p-2 rounded-full bg-orange-500/20 text-orange-500 mb-2">
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold font-heading text-white">2,450</span>
              <span className="text-xs text-muted-foreground uppercase">Calories</span>
            </CardContent>
          </Card>
          <Card className="bg-secondary/50 border-white/5 backdrop-blur-sm">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="p-2 rounded-full bg-primary/20 text-primary mb-2">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold font-heading text-white">85%</span>
              <span className="text-xs text-muted-foreground uppercase">Readiness</span>
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
              <Button className="w-full mt-4 bg-primary/10 hover:bg-primary/20 text-primary font-bold border border-primary/50">
                Start Workout
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Nutrition Summary */}
        <section>
           <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-heading font-semibold text-white">Nutrition Goal</h2>
          </div>
          <Card className="bg-secondary/30 border-white/5">
            <CardContent className="p-5">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-muted-foreground">Protein</span>
                <span className="text-sm font-bold text-white">140g / 180g</span>
              </div>
              <Progress value={78} className="h-2 bg-secondary" />
              
              <div className="flex justify-between items-end mt-4 mb-2">
                <span className="text-sm font-medium text-muted-foreground">Carbs</span>
                <span className="text-sm font-bold text-white">210g / 300g</span>
              </div>
              <Progress value={65} className="h-2 bg-secondary" />
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
}
