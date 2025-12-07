import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Play, Lock, CheckCircle2 } from "lucide-react";
import skillsImage from "@assets/generated_images/hockey_stick_and_puck_on_ice.png";
import { useUser } from "@/lib/UserContext";

// Comprehensive drill data - Expanded with "Reliable Source" Quality Data
// Updated: No drills locked, added instructions
const ALL_DRILLS = [
  // --- DEFENSE ---
  // Skating & Agility
  { 
    id: 101, 
    title: "Mohawk Transitions", 
    type: "Skating", 
    positions: ["defense"], 
    levels: ["a", "aa", "aaa", "junior"], 
    locked: false,
    setup: "3 cones in a triangle pattern.",
    instructions: "1. Skate forward to first cone.\n2. Open hips into mohawk (heels together).\n3. Glide around cone maintaining speed.\n4. Accelerate out."
  },
  { 
    id: 102, 
    title: "Backward Crossovers (Overspeed)", 
    type: "Skating", 
    positions: ["defense"], 
    levels: ["aa", "aaa", "junior"], 
    locked: false,
    setup: "Full circle (faceoff circle).",
    instructions: "1. Skate backward around the circle.\n2. Focus on powerful under-push.\n3. Maintain low center of gravity.\n4. Increase speed until uncomfortable."
  },
  { 
    id: 103, 
    title: "Pivot & Gap Control", 
    type: "Skating", 
    positions: ["defense"], 
    levels: ["house", "a", "aa"], 
    locked: false,
    setup: "Partner or cone at blue line.",
    instructions: "1. Skate backward from red line.\n2. As partner attacks, match their speed (gap).\n3. Pivot to forward when they commit wide.\n4. Angle them to the boards."
  },
  
  // Puck Control & Passing
  { 
    id: 201, 
    title: "Blue Line Walking", 
    type: "Shooting", 
    positions: ["defense"], 
    levels: ["aa", "aaa", "junior"], 
    locked: false,
    setup: "Pucks at blue line.",
    instructions: "1. Receive puck at blue line.\n2. Drag puck laterally to change shooting angle.\n3. Head up, find lane through traffic.\n4. Snap shot low for tip."
  },
  { 
    id: 202, 
    title: "D-Zone Retrieval & Outlet", 
    type: "Passing", 
    positions: ["defense"], 
    levels: ["a", "aa", "aaa"], 
    locked: false,
    setup: "Dump puck into corner.",
    instructions: "1. Retrieve puck with shoulder check.\n2. Use net as protection (wheel or reverse).\n3. Head up immediately.\n4. Make crisp first pass to winger."
  },
  { 
    id: 203, 
    title: "First Pass Under Pressure", 
    type: "Passing", 
    positions: ["defense"], 
    levels: ["aa", "aaa", "junior"], 
    locked: false, // Unlocked
    setup: "Partner applying forecheck pressure.",
    instructions: "1. Retrieve puck.\n2. Fake one way to freeze forechecker.\n3. Escape turn opposite way.\n4. Execute pass."
  },
  
  // --- FORWARD (WING/CENTER) ---
  // Shooting
  { 
    id: 401, 
    title: "Quick Release Snap Shot", 
    type: "Shooting", 
    positions: ["wing", "center"], 
    levels: ["a", "aa", "aaa"], 
    locked: false,
    setup: "Pucks in slot.",
    instructions: "1. Receive pass.\n2. No dust (don't stickhandle unnecessarily).\n3. Pull puck into body.\n4. Snap shot immediately."
  },
  { 
    id: 402, 
    title: "Shoot in Stride", 
    type: "Shooting", 
    positions: ["wing", "center"], 
    levels: ["aa", "aaa", "junior"], 
    locked: false,
    setup: "Skate down wing.",
    instructions: "1. Skate full speed down wing.\n2. Release shot while feet are moving.\n3. Shoot off outside foot for surprise factor."
  },
  { 
    id: 504, 
    title: "Pavel Datsyuk Cutbacks", 
    type: "Skills", 
    positions: ["wing", "center"], 
    levels: ["aaa", "junior"], 
    locked: false, // Unlocked
    setup: "2 cones near half-wall.",
    instructions: "1. Attack cone with speed.\n2. Hard stop/cutback to open space.\n3. Accelerate in new direction.\n4. Protect puck with body."
  },
  
  // --- UNIVERSAL ---
  { 
    id: 901, 
    title: "Explosive Starts", 
    type: "Skating", 
    positions: ["defense", "wing", "center"], 
    levels: ["house", "a", "aa", "aaa"], 
    locked: false,
    setup: "Goal line.",
    instructions: "1. Athletic stance.\n2. First 3 steps are quick running steps (toes).\n3. Transition to full stride.\n4. Stay low."
  },
  { 
    id: 903, 
    title: "Stickhandling Through Traffic", 
    type: "Skills", 
    positions: ["defense", "wing", "center"], 
    levels: ["aa", "aaa"], 
    locked: false, // Unlocked
    setup: "Random obstacles/pucks scattered.",
    instructions: "1. Stickhandle through 'minefield' of obstacles.\n2. Don't touch any obstacles.\n3. Keep head up scanning environment.\n4. Use toe drags and wide reaches."
  }
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
                  <SelectItem value="junior">Junior</SelectItem>
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
              <Dialog key={drill.id}>
                <DialogTrigger asChild>
                  <Card className="bg-card border-white/5 overflow-hidden group hover:border-primary/50 cursor-pointer transition-colors">
                    <CardContent className="p-0 flex h-24">
                      <div className="w-24 bg-secondary flex items-center justify-center relative group-hover:bg-primary/20 transition-colors">
                        <Play className="w-8 h-8 text-white fill-white relative z-10 group-hover:scale-110 transition-transform" />
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
                        <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{drill.title}</h3>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="bg-card border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle>{drill.title}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="bg-secondary/30 p-3 rounded-lg border border-white/5">
                      <span className="text-xs font-bold text-primary uppercase mb-1 block">Setup</span>
                      <p className="text-sm text-gray-300">{drill.setup}</p>
                    </div>
                    
                    <div>
                      <span className="text-xs font-bold text-primary uppercase mb-2 block">Instructions</span>
                      <div className="space-y-2">
                        {drill.instructions?.split('\n').map((step, i) => (
                          <div key={i} className="flex gap-3 text-sm text-gray-300">
                             <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                             <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
