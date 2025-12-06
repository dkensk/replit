import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Play, Lock } from "lucide-react";
import skillsImage from "@assets/generated_images/hockey_stick_and_puck_on_ice.png";

export default function Skills() {
  return (
    <Layout>
      <div className="relative h-48 w-full overflow-hidden rounded-b-3xl shadow-xl mb-6">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
        <img src={skillsImage} alt="Skills" className="w-full h-full object-cover opacity-70" />
        <div className="absolute bottom-4 left-6 z-20 w-[90%]">
           <h1 className="text-3xl font-heading font-bold text-white uppercase mb-2">Skill Lab</h1>
           
           <div className="flex gap-2 w-full">
             <Select defaultValue="defense">
                <SelectTrigger className="bg-background/20 backdrop-blur-md border-white/10 text-white h-8 text-xs font-medium">
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="defense">Defense</SelectItem>
                  <SelectItem value="forward">Forward</SelectItem>
                </SelectContent>
             </Select>
             <Select defaultValue="aa">
                <SelectTrigger className="bg-background/20 backdrop-blur-md border-white/10 text-white h-8 text-xs font-medium">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aa">AA Level</SelectItem>
                  <SelectItem value="aaa">AAA Level</SelectItem>
                </SelectContent>
             </Select>
           </div>
        </div>
      </div>

      <div className="px-4 pb-20">
        <div className="grid grid-cols-1 gap-4">
          {[
            { title: "Blue Line Walking", type: "Shooting", level: "Advanced", locked: false },
            { title: "Gap Control Drill", type: "Defense", level: "Intermediate", locked: false },
            { title: "Outlet Passes under Pressure", type: "Passing", level: "Elite", locked: true },
            { title: "One-Timer Mechanics", type: "Shooting", level: "Advanced", locked: true },
          ].map((drill, i) => (
            <Card key={i} className={`border-white/5 overflow-hidden group ${drill.locked ? 'bg-secondary/20' : 'bg-card hover:border-primary/50'}`}>
              <CardContent className="p-0 flex h-24">
                <div className="w-24 bg-secondary flex items-center justify-center relative">
                  {/* Placeholder for video thumbnail */}
                  <div className="absolute inset-0 bg-black/40" />
                  {drill.locked ? <Lock className="w-6 h-6 text-muted-foreground relative z-10" /> : <Play className="w-8 h-8 text-white fill-white relative z-10" />}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-1">
                    <Badge variant="outline" className="border-primary/30 text-primary text-[10px] uppercase">{drill.type}</Badge>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">{drill.level}</span>
                  </div>
                  <h3 className={`font-bold text-lg ${drill.locked ? 'text-muted-foreground' : 'text-white'}`}>{drill.title}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
