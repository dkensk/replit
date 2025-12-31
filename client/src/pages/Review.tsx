import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, Calendar, Clock, MapPin, Play, Download, Scissors, AlertCircle, LogOut } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/lib/UserContext";
import heroImage from "@assets/generated_images/cinematic_hockey_arena_ice_surface.png";

export default function Review() {
  const { profile, updateProfile } = useUser();
  const [isLive, setIsLive] = useState(false);
  
  const isConnected = profile.livebarnConnected;
  const selectedRink = profile.livebarnRink || "";

  const handleConnect = () => {
    updateProfile({ livebarnConnected: true });
  };

  const handleDisconnect = () => {
    updateProfile({ livebarnConnected: false, livebarnRink: null });
  };

  const handleRinkChange = (rink: string) => {
    updateProfile({ livebarnRink: rink });
  };

  return (
    <Layout>
      <div className="relative h-72 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-transparent to-transparent z-10" />
        <img 
          src={heroImage} 
          alt="Hockey Arena" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-6 left-6 right-6 z-20">
          <div className="flex items-center gap-2 mb-2">
            <Video className="w-4 h-4 text-red-500" />
            <span className="text-xs font-semibold text-red-400 uppercase tracking-widest">Powered by LiveBarn</span>
          </div>
          <h1 className="text-4xl font-heading font-bold text-white leading-tight">
            GAME<br/>REVIEW
          </h1>
        </div>
      </div>

      <div className="px-5 py-6 space-y-6">
        {!isConnected ? (
          <Card className="bg-card/60 border-white/5 backdrop-blur-sm">
            <CardContent className="p-6 text-center space-y-5">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto">
                <Video className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold text-white mb-2">Connect to LiveBarn</h2>
                <p className="text-sm text-muted-foreground">
                  Link your account to access live streams and on-demand replays of your games.
                </p>
              </div>
              <div className="space-y-3">
                <Input 
                  placeholder="Email / Username" 
                  className="bg-background/60 border-white/10 h-11"
                  data-testid="input-livebarn-email"
                />
                <Input 
                  type="password" 
                  placeholder="Password" 
                  className="bg-background/60 border-white/10 h-11"
                  data-testid="input-livebarn-password"
                />
                <Button 
                  onClick={handleConnect} 
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-11 border-red-700"
                  data-testid="button-connect-livebarn"
                >
                  Connect Account
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                By connecting, you agree to LiveBarn's Terms of Service.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-green-500 font-medium">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Connected to LiveBarn
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDisconnect}
                className="text-muted-foreground hover:text-red-500 text-xs h-8"
                data-testid="button-disconnect-livebarn"
              >
                <LogOut className="w-3 h-3 mr-1" />
                Disconnect
              </Button>
            </div>

            <section>
              <h2 className="text-lg font-heading font-semibold text-white tracking-wide mb-3">Find Footage</h2>
              <Card className="bg-card/60 border-white/5 backdrop-blur-sm">
                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase text-muted-foreground tracking-wider">Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          type="date" 
                          className="pl-10 bg-background/60 border-white/10 h-10"
                          data-testid="input-game-date"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase text-muted-foreground tracking-wider">Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          type="time" 
                          className="pl-10 bg-background/60 border-white/10 h-10"
                          data-testid="input-game-time"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase text-muted-foreground tracking-wider">Venue</Label>
                    <Select value={selectedRink} onValueChange={handleRinkChange}>
                      <SelectTrigger className="bg-background/60 border-white/10 h-10" data-testid="select-rink">
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

                  <Button 
                    className="w-full font-bold h-11"
                    data-testid="button-load-footage"
                  >
                    <Play className="w-4 h-4 mr-2 fill-current" />
                    Load Footage
                  </Button>
                </CardContent>
              </Card>
            </section>

            <section>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-heading font-semibold text-white tracking-wide">Video Feed</h2>
                <div className="flex gap-1 bg-secondary/30 rounded-lg p-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-7 px-3 text-[10px] uppercase font-bold rounded-md ${isLive ? 'bg-red-500/20 text-red-500' : 'text-muted-foreground'}`} 
                    onClick={() => setIsLive(true)}
                    data-testid="button-live-mode"
                  >
                    Live
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-7 px-3 text-[10px] uppercase font-bold rounded-md ${!isLive ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`} 
                    onClick={() => setIsLive(false)}
                    data-testid="button-vod-mode"
                  >
                    VOD
                  </Button>
                </div>
              </div>
              
              <Card className="bg-card/60 border-white/5 backdrop-blur-sm overflow-hidden">
                <div className="aspect-video bg-black relative group">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {selectedRink ? (
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform cursor-pointer border border-white/20">
                          <Play className="w-8 h-8 text-white fill-white ml-1" />
                        </div>
                        <div className="space-y-1">
                          {isLive && (
                            <span className="inline-flex items-center gap-1.5 text-red-500 text-xs uppercase tracking-wider font-bold">
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                              Live
                            </span>
                          )}
                          <p className="text-white/50 text-xs font-mono">CAM-01 • 1080p • 60FPS</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground">
                        <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                        <p className="text-sm">Select a rink to view feed</p>
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-1 bg-white/20 rounded-full mb-4 overflow-hidden">
                      <div className="h-full w-1/3 bg-red-600 relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4 text-white items-center">
                        <Play className="w-5 h-5 fill-white cursor-pointer hover:scale-110 transition-transform" />
                        <span className="text-sm font-mono">04:20 / 15:00</span>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                          data-testid="button-clip"
                        >
                          <Scissors className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                          data-testid="button-download"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            <section className="pb-4">
              <h2 className="text-lg font-heading font-semibold text-white tracking-wide mb-3">Your Clips</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 1, title: "Nice Goal vs Hawks", date: "Oct 12", duration: "0:15s" },
                  { id: 2, title: "Breakaway Save", date: "Oct 8", duration: "0:22s" }
                ].map((clip) => (
                  <Card 
                    key={clip.id} 
                    className="bg-card/60 border-white/5 backdrop-blur-sm overflow-hidden group cursor-pointer hover:border-primary/30 transition-all"
                    data-testid={`card-clip-${clip.id}`}
                  >
                    <div className="aspect-video bg-secondary/50 relative">
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <Play className="w-8 h-8 text-white fill-white" />
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h4 className="font-bold text-sm text-white truncate">{clip.title}</h4>
                      <p className="text-[10px] text-muted-foreground">{clip.date} • {clip.duration}</p>
                    </CardContent>
                  </Card>
                ))}
                <Card 
                  className="bg-card/30 border-white/5 border-dashed flex items-center justify-center aspect-[4/3] cursor-pointer hover:border-primary/30 transition-colors"
                  data-testid="button-create-clip"
                >
                  <div className="text-center p-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <Scissors className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Create new clip</p>
                  </div>
                </Card>
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
