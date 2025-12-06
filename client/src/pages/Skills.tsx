import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Play, Lock } from "lucide-react";
import skillsImage from "@assets/generated_images/hockey_stick_and_puck_on_ice.png";
import { useUser } from "@/lib/UserContext";

// Comprehensive drill data
const ALL_DRILLS = [
  // Defense Drills
  { id: 1, title: "Blue Line Walking", type: "Shooting", positions: ["defense"], levels: ["aa", "aaa", "junior"], locked: false },
  { id: 2, title: "Gap Control Basics", type: "Defense", positions: ["defense"], levels: ["house", "a"], locked: false },
  { id: 3, title: "D-Zone Retrieval", type: "Skating", positions: ["defense"], levels: ["a", "aa"], locked: false },
  { id: 4, title: "First Pass Under Pressure", type: "Passing", positions: ["defense"], levels: ["aa", "aaa"], locked: true },
  { id: 5, title: "Net Front Battles", type: "Defense", positions: ["defense"], levels: ["house", "a", "aa"], locked: false },
  
  // Forward Drills (Wing/Center)
  { id: 6, title: "Quick Release Shot", type: "Shooting", positions: ["wing", "center"], levels: ["a", "aa", "aaa"], locked: false },
  { id: 7, title: "Wall Pickups", type: "Skills", positions: ["wing"], levels: ["a", "aa"], locked: false },
  { id: 8, title: "Faceoff Wins", type: "Tactics", positions: ["center"], levels: ["aa", "aaa"], locked: false },
  { id: 9, title: "O-Zone Entry", type: "Tactics", positions: ["wing", "center"], levels: ["aa", "aaa"], locked: true },
  { id: 10, title: "Tipping & Screening", type: "Shooting", positions: ["wing", "center"], levels: ["house", "a"], locked: false },
  
  // Universal Drills
  { id: 11, title: "Explosive Starts", type: "Skating", positions: ["defense", "wing", "center"], levels: ["house", "a", "aa", "aaa"], locked: false },
  { id: 12, title: "Tight Turns", type: "Skating", positions: ["defense", "wing", "center"], levels: ["house", "a"], locked: false },
  { id: 13, title: "Stickhandling Through Traffic", type: "Skills", positions: ["defense", "wing", "center"], levels: ["aa", "aaa"], locked: true }
];

export default function Skills() {
  const { profile, updateProfile } = useUser();

  // Filter drills based on user profile
  const recommendedDrills = ALL_DRILLS.filter(drill => 
    drill.positions.includes(profile.position) && 
    (drill.levels.includes(profile.level) || drill.levels.includes("all"))
  );

  return (
    <Layout>
      <div className="relative h-48 w-full overflow-hidden rounded-b-3xl shadow-xl mb-6">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
        <img src={skillsImage} alt="Skills" className="w-full h-full object-cover opacity-70" />
        <div className="absolute bottom-4 left-6 z-20 w-[90%]">
           <h1 className="text-3xl font-heading font-bold text-white uppercase mb-2">Skill Lab</h1>
           
           <div className="flex gap-2 w-full">
             <Select 
               value={profile.position} 
               onValueChange={(val: any) => updateProfile({ position: val })}
             >
                <SelectTrigger className="bg-background/20 backdrop-blur-md border-white/10 text-white h-8 text-xs font-medium">
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="defense">Defense</SelectItem>
                  <SelectItem value="wing">Wing</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                </SelectContent>
             </Select>
             <Select 
               value={profile.level}
               onValueChange={(val: any) => updateProfile({ level: val })}
             >
                <SelectTrigger className="bg-background/20 backdrop-blur-md border-white/10 text-white h-8 text-xs font-medium">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="a">A</SelectItem>
                  <SelectItem value="aa">AA</SelectItem>
                  <SelectItem value="aaa">AAA</SelectItem>
                </SelectContent>
             </Select>
           </div>
        </div>
      </div>

      <div className="px-4 pb-20">
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-lg font-bold text-white">Recommended for You</h2>
           <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
             {recommendedDrills.length} Drills
           </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {recommendedDrills.length > 0 ? (
            recommendedDrills.map((drill) => (
              <Card key={drill.id} className={`border-white/5 overflow-hidden group ${drill.locked ? 'bg-secondary/20' : 'bg-card hover:border-primary/50'}`}>
                <CardContent className="p-0 flex h-24">
                  <div className="w-24 bg-secondary flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-black/40" />
                    {drill.locked ? <Lock className="w-6 h-6 text-muted-foreground relative z-10" /> : <Play className="w-8 h-8 text-white fill-white relative z-10" />}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-1">
                      <Badge variant="outline" className="border-primary/30 text-primary text-[10px] uppercase">{drill.type}</Badge>
                      <div className="flex gap-1">
                         {drill.levels.slice(0, 2).map(l => (
                           <span key={l} className="text-[10px] text-muted-foreground uppercase font-bold">{l}</span>
                         ))}
                      </div>
                    </div>
                    <h3 className={`font-bold text-lg ${drill.locked ? 'text-muted-foreground' : 'text-white'}`}>{drill.title}</h3>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>No specific drills found for this combination.</p>
              <p className="text-xs mt-2">Try adjusting filters.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
