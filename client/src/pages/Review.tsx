import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, Calendar, Clock, MapPin, Play, Download, Scissors, AlertCircle, LogOut } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/lib/UserContext";

export default function Review() {
  const { profile, updateProfile } = useUser();
  const [isLive, setIsLive] = useState(false);
  
  // Use profile data for connection and rink
  const isConnected = profile.livebarnConnected;
  const selectedRink = profile.livebarnRink || "";

  const handleConnect = () => {
    // Save connection to profile (persisted)
    updateProfile({ livebarnConnected: true });
  };

  const handleDisconnect = () => {
    // Disconnect and clear rink selection
    updateProfile({ livebarnConnected: false, livebarnRink: null });
  };

  const handleRinkChange = (rink: string) => {
    // Save rink selection to profile
    updateProfile({ livebarnRink: rink });
  };

  return (
    <Layout>
      <div className="relative h-48 w-full overflow-hidden rounded-b-3xl shadow-xl mb-6 bg-black">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10" />
        
        {/* Mock LiveBarn Header Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
             <div className="text-4xl font-black text-red-600 uppercase tracking-tighter transform -rotate-12 select-none">
               LIVEBARN
             </div>
        </div>

        <div className="absolute bottom-4 left-6 z-20 w-[90%]">
          <h1 className="text-3xl font-heading font-bold text-white uppercase mb-1">Game Review</h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <Video className="w-4 h-4 text-red-500" />
            Powered by LiveBarn
          </p>
        </div>
      </div>

      <div className="px-4 pb-20 space-y-6">
        {/* Connection Status Card */}
        {!isConnected ? (
          <Card className="bg-card border-white/5">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Video className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Connect to LiveBarn</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Link your account to access live streams and on-demand replays of your games.
                </p>
              </div>
              <div className="space-y-3">
                 <Input placeholder="Email / Username" className="bg-secondary/50 border-white/10" />
                 <Input type="password" placeholder="Password" className="bg-secondary/50 border-white/10" />
                 <Button onClick={handleConnect} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold">
                   Connect Account
                 </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                By connecting, you agree to LiveBarn's Terms of Service.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Connected Status */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-green-500">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Connected to LiveBarn
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDisconnect}
                className="text-muted-foreground hover:text-red-500 text-xs"
              >
                <LogOut className="w-3 h-3 mr-1" />
                Disconnect
              </Button>
            </div>

            {/* Game Selector Controls */}
            <Card className="bg-secondary/30 border-white/5">
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-muted-foreground">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                      <Input type="date" className="pl-9 bg-card border-white/10 text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-muted-foreground">Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                      <Input type="time" className="pl-9 bg-card border-white/10 text-sm" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground">Venue</Label>
                  <Select value={selectedRink} onValueChange={handleRinkChange}>
                    <SelectTrigger className="bg-card border-white/10">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <SelectValue placeholder="Select Rink" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rink1">Center Ice Arena - Rink A</SelectItem>
                      <SelectItem value="rink2">Center Ice Arena - Rink B</SelectItem>
                      <SelectItem value="rink3">North Stars Complex - Main</SelectItem>
                      <SelectItem value="rink4">Community Center - East</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 font-bold">
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Load Footage
                </Button>
              </CardContent>
            </Card>

            {/* Video Player Mockup */}
            <div className="space-y-2">
               <div className="flex justify-between items-center px-1">
                 <h3 className="font-bold text-white flex items-center gap-2">
                   {isLive ? (
                     <span className="flex items-center gap-1.5 text-red-500 text-xs uppercase tracking-wider animate-pulse">
                       <span className="w-2 h-2 rounded-full bg-red-500"></span>
                       Live
                     </span>
                   ) : (
                     <span className="text-sm text-muted-foreground">Replay Mode</span>
                   )}
                 </h3>
                 <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className={`h-6 text-[10px] uppercase ${isLive ? 'bg-red-500/10 text-red-500' : 'text-muted-foreground'}`} onClick={() => setIsLive(true)}>Live</Button>
                    <Button variant="ghost" size="sm" className={`h-6 text-[10px] uppercase ${!isLive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`} onClick={() => setIsLive(false)}>VOD</Button>
                 </div>
               </div>
               
               <div className="aspect-video bg-black rounded-xl overflow-hidden relative group border border-white/10 shadow-2xl">
                 {/* Video Placeholder Content */}
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                       {selectedRink ? (
                         <>
                           <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform cursor-pointer">
                             <Play className="w-8 h-8 text-white fill-white ml-1" />
                           </div>
                           <p className="text-white/50 text-xs font-mono">CAM-01 • 1080p • 60FPS</p>
                         </>
                       ) : (
                         <div className="flex flex-col items-center text-muted-foreground">
                            <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                            <p className="text-sm">Select a rink to view feed</p>
                         </div>
                       )}
                    </div>
                 </div>

                 {/* Mock UI Overlay */}
                 <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-1 bg-white/20 rounded-full mb-4 overflow-hidden">
                      <div className="h-full w-1/3 bg-red-600 relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                       <div className="flex gap-4 text-white">
                          <Play className="w-5 h-5 fill-white" />
                          <span className="text-sm font-mono">04:20 / 15:00</span>
                       </div>
                       <div className="flex gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20 rounded-full">
                            <Scissors className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20 rounded-full">
                            <Download className="w-4 h-4" />
                          </Button>
                       </div>
                    </div>
                 </div>
               </div>
            </div>

            {/* Saved Clips Section */}
            <div>
              <h3 className="font-bold text-white mb-3 mt-6">Your Clips</h3>
              <div className="grid grid-cols-2 gap-3">
                 {[1, 2].map((i) => (
                   <Card key={i} className="bg-card border-white/5 overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors">
                     <div className="aspect-video bg-secondary relative">
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                     </div>
                     <CardContent className="p-3">
                       <h4 className="font-bold text-sm text-white truncate">Nice Goal vs Hawks</h4>
                       <p className="text-[10px] text-muted-foreground">Oct 12 • 0:15s</p>
                     </CardContent>
                   </Card>
                 ))}
                 <Card className="bg-secondary/20 border-white/5 border-dashed flex items-center justify-center aspect-[4/3] col-span-2 sm:col-span-1 h-full min-h-[100px]">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Create new clip</p>
                    </div>
                 </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
