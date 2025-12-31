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
  { 
    id: 104, 
    title: "Basic Backward Skating", 
    type: "Skating", 
    positions: ["defense"], 
    levels: ["house", "a"], 
    locked: false,
    setup: "Open ice space.",
    instructions: "1. Start in athletic stance.\n2. Push with one leg while gliding backward.\n3. Alternate legs in C-cut motion.\n4. Keep head up and chest forward."
  },
  { 
    id: 105, 
    title: "Tight Turn Recovery", 
    type: "Skating", 
    positions: ["defense"], 
    levels: ["house", "a", "aa"], 
    locked: false,
    setup: "4 cones in a square.",
    instructions: "1. Skate backward to first cone.\n2. Execute tight turn around cone.\n3. Sprint forward to next cone.\n4. Repeat around the square."
  },
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
    locked: false,
    setup: "Partner applying forecheck pressure.",
    instructions: "1. Retrieve puck.\n2. Fake one way to freeze forechecker.\n3. Escape turn opposite way.\n4. Execute pass."
  },
  { 
    id: 204, 
    title: "Basic Breakout Pass", 
    type: "Passing", 
    positions: ["defense"], 
    levels: ["house", "a"], 
    locked: false,
    setup: "Puck behind net, partner at boards.",
    instructions: "1. Retrieve puck from behind net.\n2. Look up to find open teammate.\n3. Make tape-to-tape pass to boards.\n4. Follow your pass for support."
  },
  { 
    id: 205, 
    title: "Point Shot Accuracy", 
    type: "Shooting", 
    positions: ["defense"], 
    levels: ["house", "a", "aa"], 
    locked: false,
    setup: "Pucks at the point, targets in net.",
    instructions: "1. Keep shot low and on net.\n2. Focus on quick release.\n3. Aim for corners or rebounds.\n4. Follow through toward target."
  },

  // --- FORWARD (WING) ---
  { 
    id: 301, 
    title: "Board Battle Fundamentals", 
    type: "Skills", 
    positions: ["wing"], 
    levels: ["house", "a", "aa"], 
    locked: false,
    setup: "Boards with partner.",
    instructions: "1. Establish body position first.\n2. Use lower body strength to seal off defender.\n3. Protect puck with stick and body.\n4. Work puck to open ice."
  },
  { 
    id: 302, 
    title: "Net Front Presence", 
    type: "Shooting", 
    positions: ["wing"], 
    levels: ["a", "aa", "aaa"], 
    locked: false,
    setup: "Position in front of net.",
    instructions: "1. Establish position in crease area.\n2. Keep stick on ice for tips/deflections.\n3. Screen goalie without interference.\n4. Be ready for rebounds."
  },
  { 
    id: 303, 
    title: "Wide Attack Entry", 
    type: "Skating", 
    positions: ["wing"], 
    levels: ["house", "a", "aa"], 
    locked: false,
    setup: "Start at red line near boards.",
    instructions: "1. Receive pass while in motion.\n2. Use speed down the wing.\n3. Drive wide around defender.\n4. Cut to net or pass to slot."
  },
  { 
    id: 304, 
    title: "Cycle Game Basics", 
    type: "Skills", 
    positions: ["wing"], 
    levels: ["a", "aa", "aaa"], 
    locked: false,
    setup: "Corner with partner.",
    instructions: "1. Protect puck along boards.\n2. Read teammate's positioning.\n3. Execute give-and-go or reversal.\n4. Support cycle from high position."
  },
  { 
    id: 305, 
    title: "One-Timer from Wing", 
    type: "Shooting", 
    positions: ["wing"], 
    levels: ["aa", "aaa", "junior"], 
    locked: false,
    setup: "Receive pass from slot area.",
    instructions: "1. Open body to passer.\n2. Wind up before puck arrives.\n3. Strike puck cleanly without stopping.\n4. Follow through low and hard."
  },

  // --- FORWARD (CENTER) ---
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
    id: 403, 
    title: "Faceoff Fundamentals", 
    type: "Skills", 
    positions: ["center"], 
    levels: ["house", "a", "aa"], 
    locked: false,
    setup: "Faceoff dot with partner.",
    instructions: "1. Low stance, strong base.\n2. Watch linesman's hand.\n3. Tie up opponent's stick first.\n4. Win back to teammate or kick to yourself."
  },
  { 
    id: 404, 
    title: "Backcheck & Support", 
    type: "Skating", 
    positions: ["center"], 
    levels: ["house", "a", "aa", "aaa"], 
    locked: false,
    setup: "Full ice transition drill.",
    instructions: "1. On turnover, sprint back immediately.\n2. Pick up high threat first.\n3. Communicate with defense.\n4. Support play in D-zone."
  },
  { 
    id: 405, 
    title: "Slot Scoring", 
    type: "Shooting", 
    positions: ["center"], 
    levels: ["a", "aa", "aaa"], 
    locked: false,
    setup: "Pucks in slot area.",
    instructions: "1. Find soft spots in coverage.\n2. Get open for pass.\n3. Quick shot release, aim corners.\n4. Follow shot for rebound."
  },
  { 
    id: 406, 
    title: "Low Support Play", 
    type: "Skills", 
    positions: ["center"], 
    levels: ["aa", "aaa", "junior"], 
    locked: false,
    setup: "O-zone with wingers.",
    instructions: "1. Read where support is needed.\n2. Provide passing option low.\n3. Cycle puck to create space.\n4. Move to scoring position."
  },
  { 
    id: 504, 
    title: "Pavel Datsyuk Cutbacks", 
    type: "Skills", 
    positions: ["wing", "center"], 
    levels: ["aaa", "junior"], 
    locked: false,
    setup: "2 cones near half-wall.",
    instructions: "1. Attack cone with speed.\n2. Hard stop/cutback to open space.\n3. Accelerate in new direction.\n4. Protect puck with body."
  },
  
  // --- UNIVERSAL (ALL POSITIONS) ---
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
    id: 902, 
    title: "Basic Skating Stride", 
    type: "Skating", 
    positions: ["defense", "wing", "center"], 
    levels: ["house", "a"], 
    locked: false,
    setup: "Open ice.",
    instructions: "1. Push fully with each stride.\n2. Recover skate under body.\n3. Keep knees bent throughout.\n4. Arms swing naturally."
  },
  { 
    id: 903, 
    title: "Stickhandling Through Traffic", 
    type: "Skills", 
    positions: ["defense", "wing", "center"], 
    levels: ["aa", "aaa"], 
    locked: false,
    setup: "Random obstacles/pucks scattered.",
    instructions: "1. Stickhandle through 'minefield' of obstacles.\n2. Don't touch any obstacles.\n3. Keep head up scanning environment.\n4. Use toe drags and wide reaches."
  },
  { 
    id: 904, 
    title: "Basic Puck Control", 
    type: "Skills", 
    positions: ["defense", "wing", "center"], 
    levels: ["house", "a"], 
    locked: false,
    setup: "Open ice with puck.",
    instructions: "1. Cup puck softly with blade.\n2. Move puck side to side.\n3. Keep head up as much as possible.\n4. Practice forehand and backhand."
  },
  { 
    id: 905, 
    title: "Edge Work Basics", 
    type: "Skating", 
    positions: ["defense", "wing", "center"], 
    levels: ["house", "a", "aa"], 
    locked: false,
    setup: "Circle or open ice.",
    instructions: "1. Glide on inside edges around circle.\n2. Switch to outside edges.\n3. Practice one-foot glides.\n4. Feel blade edges grip ice."
  },
  { 
    id: 906, 
    title: "Crossover Technique", 
    type: "Skating", 
    positions: ["defense", "wing", "center"], 
    levels: ["house", "a", "aa"], 
    locked: false,
    setup: "Faceoff circle.",
    instructions: "1. Skate around circle forward.\n2. Cross outside leg over inside leg.\n3. Push with inside leg under body.\n4. Build speed with each crossover."
  },
  { 
    id: 907, 
    title: "Two-Touch Passing", 
    type: "Passing", 
    positions: ["defense", "wing", "center"], 
    levels: ["house", "a", "aa"], 
    locked: false,
    setup: "Partner 15-20 feet away.",
    instructions: "1. Receive pass and control.\n2. Set puck quickly.\n3. Make return pass.\n4. Increase speed as comfortable."
  },
  { 
    id: 908, 
    title: "One-Touch Passing", 
    type: "Passing", 
    positions: ["defense", "wing", "center"], 
    levels: ["a", "aa", "aaa"], 
    locked: false,
    setup: "Partner 15-20 feet away.",
    instructions: "1. Receive and pass in one motion.\n2. Cushion puck slightly on reception.\n3. Direct puck to partner's tape.\n4. Build rhythm and speed."
  },
  { 
    id: 909, 
    title: "Wrist Shot Fundamentals", 
    type: "Shooting", 
    positions: ["defense", "wing", "center"], 
    levels: ["house", "a"], 
    locked: false,
    setup: "Stationary with pucks.",
    instructions: "1. Puck starts near back foot.\n2. Pull puck forward, shifting weight.\n3. Snap wrists at release point.\n4. Follow through to target."
  },
  { 
    id: 910, 
    title: "Backhand Shot", 
    type: "Shooting", 
    positions: ["defense", "wing", "center"], 
    levels: ["a", "aa", "aaa"], 
    locked: false,
    setup: "Stationary or in motion.",
    instructions: "1. Cup puck on backhand.\n2. Pull across body.\n3. Snap wrists while rolling blade.\n4. Aim for far side of net."
  },
  { 
    id: 911, 
    title: "Stopping Techniques", 
    type: "Skating", 
    positions: ["defense", "wing", "center"], 
    levels: ["house", "a"], 
    locked: false,
    setup: "Open ice.",
    instructions: "1. Turn both skates perpendicular.\n2. Dig edges into ice.\n3. Bend knees and sit back.\n4. Practice both sides."
  },
  { 
    id: 912, 
    title: "Agility Figure 8s", 
    type: "Skating", 
    positions: ["defense", "wing", "center"], 
    levels: ["house", "a", "aa", "aaa"], 
    locked: false,
    setup: "Two cones 20 feet apart.",
    instructions: "1. Skate figure 8 pattern around cones.\n2. Use tight crossovers on turns.\n3. Alternate directions each rep.\n4. Add puck when comfortable."
  },
  { 
    id: 913, 
    title: "Saucer Pass", 
    type: "Passing", 
    positions: ["defense", "wing", "center"], 
    levels: ["aa", "aaa", "junior"], 
    locked: false,
    setup: "Obstacle between you and partner.",
    instructions: "1. Open blade face slightly.\n2. Lift puck with spin.\n3. Puck should land flat for partner.\n4. Practice varying distances."
  },
  { 
    id: 914, 
    title: "Toe Drag Moves", 
    type: "Skills", 
    positions: ["defense", "wing", "center"], 
    levels: ["a", "aa", "aaa"], 
    locked: false,
    setup: "Stationary or with cones.",
    instructions: "1. Pull puck toward body with toe of blade.\n2. Fake one way, drag other.\n3. Practice inside and outside toe drags.\n4. Use to evade defenders."
  },
  { 
    id: 915, 
    title: "Deking Fundamentals", 
    type: "Skills", 
    positions: ["defense", "wing", "center"], 
    levels: ["a", "aa", "aaa", "junior"], 
    locked: false,
    setup: "Approach cone or partner.",
    instructions: "1. Sell the fake with head and shoulders.\n2. Move puck opposite direction.\n3. Accelerate past defender.\n4. Protect puck with body."
  },

  // --- GOALIE DRILLS ---
  { 
    id: 601, 
    title: "Basic Stance & Ready Position", 
    type: "Skills", 
    positions: ["goalie"], 
    levels: ["house", "a"], 
    locked: false,
    setup: "In crease, facing shooter.",
    instructions: "1. Feet shoulder-width apart.\n2. Knees bent, weight on balls of feet.\n3. Glove and blocker up and ready.\n4. Stick flat on ice in front."
  },
  { 
    id: 602, 
    title: "Butterfly Technique", 
    type: "Skills", 
    positions: ["goalie"], 
    levels: ["house", "a", "aa"], 
    locked: false,
    setup: "In crease.",
    instructions: "1. Drop to knees simultaneously.\n2. Flare pads outward to seal ice.\n3. Keep upper body tall.\n4. Recover quickly to feet."
  },
  { 
    id: 603, 
    title: "T-Push Movement", 
    type: "Skating", 
    positions: ["goalie"], 
    levels: ["house", "a", "aa"], 
    locked: false,
    setup: "Post to post.",
    instructions: "1. Lead with front skate.\n2. Push off back skate powerfully.\n3. Glide across crease.\n4. Set up square to new angle."
  },
  { 
    id: 604, 
    title: "Butterfly Slide", 
    type: "Skating", 
    positions: ["goalie"], 
    levels: ["a", "aa", "aaa"], 
    locked: false,
    setup: "In crease, post to post.",
    instructions: "1. Drop into butterfly.\n2. Push laterally with lead leg.\n3. Keep pads sealed to ice while sliding.\n4. Arrive set and square."
  },
  { 
    id: 605, 
    title: "Post Integration", 
    type: "Skills", 
    positions: ["goalie"], 
    levels: ["a", "aa", "aaa"], 
    locked: false,
    setup: "At goal post.",
    instructions: "1. Seal post with pad.\n2. Blocker protects short side.\n3. Glove ready for pass out.\n4. Eyes track puck carrier."
  },
  { 
    id: 606, 
    title: "Rebound Control", 
    type: "Skills", 
    positions: ["goalie"], 
    levels: ["aa", "aaa", "junior"], 
    locked: false,
    setup: "Partner shooting pucks.",
    instructions: "1. Absorb shots into body.\n2. Direct rebounds to corners.\n3. Cover loose pucks quickly.\n4. Track puck through traffic."
  },
  { 
    id: 607, 
    title: "Glove Saves", 
    type: "Skills", 
    positions: ["goalie"], 
    levels: ["house", "a", "aa"], 
    locked: false,
    setup: "Partner with pucks.",
    instructions: "1. Track puck into glove.\n2. Catch in pocket, not webbing.\n3. Bring glove to body after catch.\n4. Squeeze immediately."
  },
  { 
    id: 608, 
    title: "Blocker Saves & Direction", 
    type: "Skills", 
    positions: ["goalie"], 
    levels: ["a", "aa", "aaa"], 
    locked: false,
    setup: "Partner shooting.",
    instructions: "1. Angle blocker toward corner.\n2. Firm wrist on impact.\n3. Direct puck to safe area.\n4. Recover to ready position."
  },
  { 
    id: 609, 
    title: "Puck Tracking Drills", 
    type: "Skills", 
    positions: ["goalie"], 
    levels: ["house", "a", "aa", "aaa"], 
    locked: false,
    setup: "Multiple shooters.",
    instructions: "1. Eyes follow puck at all times.\n2. Track through screens.\n3. Find puck after pass.\n4. Anticipate shot release."
  },
  { 
    id: 610, 
    title: "Crease Movement Patterns", 
    type: "Skating", 
    positions: ["goalie"], 
    levels: ["aa", "aaa", "junior"], 
    locked: false,
    setup: "Full crease.",
    instructions: "1. Post to post movements.\n2. Out and back to challenge.\n3. Lateral shuffles.\n4. Combine with saves."
  },
  { 
    id: 611, 
    title: "Breakaway Technique", 
    type: "Skills", 
    positions: ["goalie"], 
    levels: ["a", "aa", "aaa", "junior"], 
    locked: false,
    setup: "Shooter from center ice.",
    instructions: "1. Challenge aggressively.\n2. Read shooter's hands.\n3. Stay patient, don't commit early.\n4. Poke check or butterfly at release."
  },
  { 
    id: 612, 
    title: "Playing the Puck", 
    type: "Skills", 
    positions: ["goalie"], 
    levels: ["aa", "aaa", "junior"], 
    locked: false,
    setup: "Dump-ins behind net.",
    instructions: "1. Communicate with defense.\n2. Stop puck cleanly.\n3. Set up for tape-to-tape pass.\n4. Return to crease quickly."
  },

  // --- MORE HOUSE/BEGINNER DRILLS ---
  { 
    id: 916, 
    title: "Forward Skating Basics", 
    type: "Skating", 
    positions: ["defense", "wing", "center"], 
    levels: ["house"], 
    locked: false,
    setup: "Open ice.",
    instructions: "1. Bend knees, lean forward slightly.\n2. Push out and back with each stride.\n3. Glide and recover.\n4. Keep arms relaxed."
  },
  { 
    id: 917, 
    title: "Balance & Edge Control", 
    type: "Skating", 
    positions: ["defense", "wing", "center", "goalie"], 
    levels: ["house", "a"], 
    locked: false,
    setup: "Open ice.",
    instructions: "1. Glide on one foot.\n2. Hold for 5 seconds.\n3. Switch feet.\n4. Practice inside and outside edges."
  },
  { 
    id: 918, 
    title: "Basic Passing", 
    type: "Passing", 
    positions: ["defense", "wing", "center"], 
    levels: ["house"], 
    locked: false,
    setup: "Partner 10 feet away.",
    instructions: "1. Cup puck on blade.\n2. Sweep toward target.\n3. Follow through pointing at partner.\n4. Receive pass with soft hands."
  },
  { 
    id: 919, 
    title: "Receiving Passes", 
    type: "Passing", 
    positions: ["defense", "wing", "center"], 
    levels: ["house", "a"], 
    locked: false,
    setup: "Partner passing pucks.",
    instructions: "1. Present blade as target.\n2. Cushion puck on reception.\n3. Control before next move.\n4. Keep eyes on puck."
  },
  { 
    id: 920, 
    title: "Skating with Puck", 
    type: "Skills", 
    positions: ["defense", "wing", "center"], 
    levels: ["house"], 
    locked: false,
    setup: "Open ice with puck.",
    instructions: "1. Keep puck in front of body.\n2. Look up periodically.\n3. Use long strides.\n4. Cup puck gently."
  },
  { 
    id: 921, 
    title: "Basic Body Positioning", 
    type: "Skills", 
    positions: ["defense", "wing", "center"], 
    levels: ["house", "a"], 
    locked: false,
    setup: "With partner.",
    instructions: "1. Stay between opponent and net.\n2. Use body, not stick.\n3. Keep feet moving.\n4. Maintain balance."
  },
  { 
    id: 922, 
    title: "Slap Shot Introduction", 
    type: "Shooting", 
    positions: ["defense", "wing", "center"], 
    levels: ["a", "aa"], 
    locked: false,
    setup: "Stationary with pucks.",
    instructions: "1. Wind up stick behind body.\n2. Strike ice before puck.\n3. Follow through high.\n4. Transfer weight forward."
  },
  { 
    id: 923, 
    title: "Power Skating Drills", 
    type: "Skating", 
    positions: ["defense", "wing", "center"], 
    levels: ["aa", "aaa", "junior"], 
    locked: false,
    setup: "Full ice.",
    instructions: "1. Deep knee bend throughout.\n2. Full extension on each stride.\n3. Quick recovery under body.\n4. Drive arms for power."
  },
  { 
    id: 924, 
    title: "Stick Protection", 
    type: "Skills", 
    positions: ["defense", "wing", "center"], 
    levels: ["house", "a", "aa"], 
    locked: false,
    setup: "Puck with defender nearby.",
    instructions: "1. Keep body between puck and defender.\n2. Extend stick away from checker.\n3. Use free arm for balance.\n4. Pivot to maintain protection."
  },
  { 
    id: 925, 
    title: "Quick Feet Agility", 
    type: "Skating", 
    positions: ["defense", "wing", "center", "goalie"], 
    levels: ["house", "a", "aa", "aaa"], 
    locked: false,
    setup: "In place or with cones.",
    instructions: "1. Quick choppy steps in place.\n2. Move laterally on command.\n3. Forward and back sprints.\n4. React to visual cues."
  },
  { 
    id: 926, 
    title: "2-on-1 Rush Attack", 
    type: "Skills", 
    positions: ["wing", "center"], 
    levels: ["a", "aa", "aaa", "junior"], 
    locked: false,
    setup: "With partner vs one defender.",
    instructions: "1. Wide entry, spread defense.\n2. Puck carrier drives wide.\n3. Trailer fills middle lane.\n4. Pass or shoot based on read."
  },
  { 
    id: 927, 
    title: "Defensive Zone Coverage", 
    type: "Skills", 
    positions: ["defense"], 
    levels: ["a", "aa", "aaa"], 
    locked: false,
    setup: "5v5 in D-zone.",
    instructions: "1. Cover your man or zone.\n2. Communicate with partner.\n3. Box out in front of net.\n4. Clear rebounds quickly."
  },
  { 
    id: 928, 
    title: "Forecheck Pressure", 
    type: "Skills", 
    positions: ["wing", "center"], 
    levels: ["a", "aa", "aaa"], 
    locked: false,
    setup: "Enter offensive zone.",
    instructions: "1. First man pressures puck.\n2. Second man supports/angles.\n3. Third man covers high.\n4. Force turnovers."
  },
  { 
    id: 929, 
    title: "Neutral Zone Transition", 
    type: "Skating", 
    positions: ["defense", "wing", "center"], 
    levels: ["aa", "aaa", "junior"], 
    locked: false,
    setup: "Full ice.",
    instructions: "1. Quick transition on turnover.\n2. Head up, find open ice.\n3. Support puck carrier.\n4. Attack with speed."
  },
  { 
    id: 930, 
    title: "Penalty Kill Positioning", 
    type: "Skills", 
    positions: ["defense", "wing", "center"], 
    levels: ["aa", "aaa", "junior"], 
    locked: false,
    setup: "4v5 in D-zone.",
    instructions: "1. Maintain box formation.\n2. Pressure puck on perimeter.\n3. Block shooting lanes.\n4. Clear when possible."
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
      {/* Hero Section - Consistent with app styling */}
      <div className="relative h-72 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent z-10" />
        <img src={skillsImage} alt="Skills" className="w-full h-full object-cover" />
        <div className="absolute bottom-6 left-6 right-6 z-20">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
            Training Library
          </p>
          <h1 className="text-4xl font-heading font-bold text-white leading-tight mb-4">
            SKILL LAB
          </h1>
           
          <div className="flex gap-3 max-w-md">
            <Select 
              value={profile.position} 
              onValueChange={(val: any) => updateProfile({ position: val })}
            >
              <SelectTrigger className="bg-card/60 backdrop-blur-sm border-white/10 text-white h-9 text-xs font-medium flex-1" data-testid="select-position">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="defense">Defense</SelectItem>
                <SelectItem value="wing">Wing</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="goalie">Goalie</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={profile.level}
              onValueChange={(val: any) => updateProfile({ level: val })}
            >
              <SelectTrigger className="bg-card/60 backdrop-blur-sm border-white/10 text-white h-9 text-xs font-medium flex-1" data-testid="select-level">
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

      <div className="px-5 py-6 space-y-6 pb-24">
        {/* Section Header */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-heading font-semibold text-white tracking-wide">Recommended for You</h2>
            <span className="text-xs text-muted-foreground bg-card/60 backdrop-blur-sm border border-white/5 px-2.5 py-1 rounded-full">
              {recommendedDrills.length} Drills
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {recommendedDrills.length > 0 ? (
              recommendedDrills.map((drill) => (
                <Dialog key={drill.id}>
                  <DialogTrigger asChild>
                    <Card className="bg-card/60 border-white/5 backdrop-blur-sm overflow-hidden group hover:border-primary/30 cursor-pointer transition-all" data-testid={`card-drill-${drill.id}`}>
                      <CardContent className="p-0 flex h-[88px]">
                        <div className="w-20 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative group-hover:from-primary/30 group-hover:to-primary/10 transition-colors">
                          <Play className="w-7 h-7 text-primary fill-primary/20 relative z-10 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-center">
                          <div className="flex justify-between items-start mb-1.5">
                            <Badge variant="outline" className="border-primary/30 text-primary text-[10px] uppercase tracking-wider font-semibold bg-primary/5">{drill.type}</Badge>
                            <div className="flex gap-1.5">
                              {drill.levels.slice(0, 2).map(l => (
                                <span key={l} className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">{l}</span>
                              ))}
                            </div>
                          </div>
                          <h3 className="font-bold text-base text-white group-hover:text-primary transition-colors">{drill.title}</h3>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-white/10 text-white max-w-md">
                    <DialogHeader>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="border-primary/30 text-primary text-[10px] uppercase tracking-wider font-semibold bg-primary/5">{drill.type}</Badge>
                      </div>
                      <DialogTitle className="text-xl font-heading">{drill.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="bg-card/60 backdrop-blur-sm p-4 rounded-lg border border-white/5">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2 block">Setup</span>
                        <p className="text-sm text-gray-300">{drill.setup}</p>
                      </div>
                      
                      <div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-3 block">Instructions</span>
                        <div className="space-y-2.5">
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
              <Card className="bg-card/40 border-white/5 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No specific drills found for this combination.</p>
                  <p className="text-xs text-muted-foreground mt-2">Try adjusting your position or level filters.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
