import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Save, Trophy, Zap, Target, TrendingUp, Award, LogOut, Key, Pencil, X } from "lucide-react";
import { useUser } from "@/lib/UserContext";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Profile() {
  const { profile, updateProfile, xp } = useUser();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  
  const updateUsernameMutation = useMutation({
    mutationFn: async (username: string) => {
      const res = await apiRequest("PATCH", "/api/user/username", { username });
      return await res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      setIsEditingUsername(false);
      setNewUsername("");
      toast({ title: "Username updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update username", description: error.message, variant: "destructive" });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest("PATCH", "/api/user/password", data);
      return await res.json();
    },
    onSuccess: () => {
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({ title: "Password updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update password", description: error.message, variant: "destructive" });
    },
  });

  const handleUsernameSubmit = () => {
    if (newUsername.trim().length >= 3) {
      updateUsernameMutation.mutate(newUsername.trim());
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    updatePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };
  
  const [formData, setFormData] = useState({
    firstName: profile.firstName || "",
    age: profile.age,
    weight: profile.weight,
    heightFt: profile.heightFt,
    heightIn: profile.heightIn,
    position: profile.position,
    level: profile.level,
    goal: profile.goal
  });
  
  useEffect(() => {
    setFormData({
      firstName: profile.firstName || "",
      age: profile.age,
      weight: profile.weight,
      heightFt: profile.heightFt,
      heightIn: profile.heightIn,
      position: profile.position,
      level: profile.level,
      goal: profile.goal
    });
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        firstName: formData.firstName,
        age: formData.age,
        weight: formData.weight,
        heightFt: formData.heightFt,
        heightIn: formData.heightIn,
        position: formData.position,
        level: formData.level,
        goal: formData.goal
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const tierConfig: Record<string, { color: string; bgColor: string; borderColor: string; gradientFrom: string }> = {
    Bronze: { color: "text-orange-400", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/30", gradientFrom: "from-orange-500/20" },
    Silver: { color: "text-gray-300", bgColor: "bg-gray-500/10", borderColor: "border-gray-500/30", gradientFrom: "from-gray-500/20" },
    Gold: { color: "text-yellow-400", bgColor: "bg-yellow-500/10", borderColor: "border-yellow-500/30", gradientFrom: "from-yellow-500/20" },
    Diamond: { color: "text-cyan-400", bgColor: "bg-cyan-500/10", borderColor: "border-cyan-500/30", gradientFrom: "from-cyan-500/20" },
    Elite: { color: "text-purple-400", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/30", gradientFrom: "from-purple-500/20" }
  };

  const currentTier = tierConfig[profile.tier] || tierConfig.Bronze;

  const positionLabels: Record<string, string> = {
    defense: "Defense",
    wing: "Wing",
    center: "Center",
    goalie: "Goalie"
  };

  const levelLabels: Record<string, string> = {
    house: "House League",
    a: "A Level",
    aa: "AA Level",
    aaa: "AAA Level",
    junior: "Junior"
  };

  const goalLabels: Record<string, string> = {
    muscle: "Build Muscle",
    fatloss: "Fat Loss",
    maintain: "Maintain"
  };

  const inputClassName = "bg-secondary/80 border-white/10 h-11 rounded-lg focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60";
  const selectTriggerClassName = "bg-secondary/80 border-white/10 h-11 rounded-lg focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all";

  return (
    <Layout>
      <div className="p-4 sm:p-6 space-y-5 max-w-2xl mx-auto pb-24">
        <div className={cn(
          "relative rounded-2xl p-5 sm:p-6 border overflow-hidden shadow-lg",
          currentTier.bgColor,
          currentTier.borderColor
        )}>
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br to-transparent opacity-60",
            currentTier.gradientFrom
          )} />
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className={cn(
              "w-18 h-18 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold border-2 shadow-md",
              currentTier.bgColor,
              currentTier.borderColor,
              currentTier.color
            )} style={{ width: '72px', height: '72px' }}>
              {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : "P"}
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-white truncate" data-testid="text-player-name">
                {profile.firstName || "Player"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Trophy className={cn("w-4 h-4 flex-shrink-0", currentTier.color)} />
                <span className={cn("font-semibold text-sm", currentTier.color)} data-testid="text-tier">
                  {profile.tier} Tier
                </span>
              </div>
              
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 bg-black/20 rounded-lg px-2.5 py-1.5">
                  <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span className="text-white font-bold text-sm" data-testid="text-xp">{xp}</span>
                  <span className="text-white/60 text-xs">XP</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/20 rounded-lg px-2.5 py-1.5">
                  <Award className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-white font-bold text-sm">{profile.workoutHistory?.length || 0}</span>
                  <span className="text-white/60 text-xs">Workouts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-card/80 border-white/5 text-center hover:border-white/10 transition-colors">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-white" data-testid="text-age-chip">{profile.age}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Years Old</p>
            </CardContent>
          </Card>
          <Card className="bg-card/80 border-white/5 text-center hover:border-white/10 transition-colors">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-white" data-testid="text-weight-chip">{profile.weight}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Pounds</p>
            </CardContent>
          </Card>
          <Card className="bg-card/80 border-white/5 text-center hover:border-white/10 transition-colors">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-white" data-testid="text-height-chip">{profile.heightFt}'{profile.heightIn}"</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Height</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/80 border-white/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-5">
            <CardTitle className="text-base font-semibold flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              Personal Info
            </CardTitle>
            {!isEditing ? (
              <Button 
                data-testid="button-edit-profile"
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-9 px-4"
              >
                <Pencil className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  data-testid="button-cancel-edit"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="h-9 px-3"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button 
                  data-testid="button-save-profile"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="h-9 px-4"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-5 px-5 pb-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">First Name</Label>
                {isEditing ? (
                  <Input
                    data-testid="input-edit-first-name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={inputClassName}
                  />
                ) : (
                  <p data-testid="text-first-name" className="text-white font-medium h-11 flex items-center">{profile.firstName || "Not set"}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Age</Label>
                {isEditing ? (
                  <Input
                    data-testid="input-edit-age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                    className={inputClassName}
                  />
                ) : (
                  <p data-testid="text-age" className="text-white font-medium h-11 flex items-center">{profile.age} years</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Weight (lbs)</Label>
                {isEditing ? (
                  <Input
                    data-testid="input-edit-weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })}
                    className={inputClassName}
                  />
                ) : (
                  <p data-testid="text-weight" className="text-white font-medium h-11 flex items-center">{profile.weight} lbs</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Height</Label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Input
                      data-testid="input-edit-height-ft"
                      type="number"
                      value={formData.heightFt}
                      onChange={(e) => setFormData({ ...formData, heightFt: parseInt(e.target.value) || 0 })}
                      placeholder="Ft"
                      className={inputClassName}
                    />
                    <Input
                      data-testid="input-edit-height-in"
                      type="number"
                      value={formData.heightIn}
                      onChange={(e) => setFormData({ ...formData, heightIn: parseInt(e.target.value) || 0 })}
                      placeholder="In"
                      className={inputClassName}
                    />
                  </div>
                ) : (
                  <p data-testid="text-height" className="text-white font-medium h-11 flex items-center">{profile.heightFt}'{profile.heightIn}"</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/80 border-white/5 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-5">
            <CardTitle className="text-base font-semibold flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              Hockey Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 px-5 pb-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Position</Label>
                {isEditing ? (
                  <Select value={formData.position} onValueChange={(v: any) => setFormData({ ...formData, position: v })}>
                    <SelectTrigger data-testid="select-edit-position" className={selectTriggerClassName}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="defense">Defense</SelectItem>
                      <SelectItem value="wing">Wing</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="goalie">Goalie</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p data-testid="text-position" className="text-white font-medium h-11 flex items-center">{positionLabels[profile.position]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Level</Label>
                {isEditing ? (
                  <Select value={formData.level} onValueChange={(v: any) => setFormData({ ...formData, level: v })}>
                    <SelectTrigger data-testid="select-edit-level" className={selectTriggerClassName}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House League</SelectItem>
                      <SelectItem value="a">A Level</SelectItem>
                      <SelectItem value="aa">AA Level</SelectItem>
                      <SelectItem value="aaa">AAA Level</SelectItem>
                      <SelectItem value="junior">Junior</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p data-testid="text-level" className="text-white font-medium h-11 flex items-center">{levelLabels[profile.level]}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Training Goal</Label>
              {isEditing ? (
                <Select value={formData.goal} onValueChange={(v: any) => setFormData({ ...formData, goal: v })}>
                  <SelectTrigger data-testid="select-edit-goal" className={selectTriggerClassName}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="muscle">Build Muscle</SelectItem>
                    <SelectItem value="fatloss">Fat Loss</SelectItem>
                    <SelectItem value="maintain">Maintain</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2 h-11">
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p data-testid="text-goal" className="text-white font-medium">{goalLabels[profile.goal]}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-white/5 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-5">
            <CardTitle className="text-base font-semibold flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Key className="w-4 h-4 text-primary" />
              </div>
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 px-5 pb-5">
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Username</Label>
              {isEditingUsername ? (
                <div className="space-y-3">
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter new username"
                    data-testid="input-new-username"
                    className={inputClassName}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleUsernameSubmit}
                      disabled={updateUsernameMutation.isPending || newUsername.trim().length < 3}
                      data-testid="button-save-username"
                      className="h-9 px-4"
                    >
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setIsEditingUsername(false); setNewUsername(""); }}
                      data-testid="button-cancel-username"
                      className="h-9 px-4"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-secondary/40 rounded-lg px-4 py-3">
                  <p className="text-white font-medium" data-testid="text-username">{user?.username}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setIsEditingUsername(true); setNewUsername(user?.username || ""); }}
                    data-testid="button-edit-username"
                    className="h-8 px-3 text-muted-foreground hover:text-white"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                    Change
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Password</Label>
              {isChangingPassword ? (
                <div className="space-y-3">
                  <Input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Current password"
                    data-testid="input-current-password"
                    className={inputClassName}
                  />
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="New password (min 6 characters)"
                    data-testid="input-new-password"
                    className={inputClassName}
                  />
                  <Input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    data-testid="input-confirm-password"
                    className={inputClassName}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handlePasswordSubmit}
                      disabled={updatePasswordMutation.isPending}
                      data-testid="button-save-password"
                      className="h-9 px-4"
                    >
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      Update Password
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setIsChangingPassword(false); setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }}
                      data-testid="button-cancel-password"
                      className="h-9 px-4"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-secondary/40 rounded-lg px-4 py-3">
                  <p className="text-white font-medium tracking-wider">••••••••</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsChangingPassword(true)}
                    data-testid="button-change-password"
                    className="h-8 px-3 text-muted-foreground hover:text-white"
                  >
                    <Key className="w-3.5 h-3.5 mr-1.5" />
                    Change
                  </Button>
                </div>
              )}
            </div>

            <div className="pt-4 mt-2 border-t border-white/5">
              <Button
                variant="outline"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
                className="w-full h-11 text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30 transition-all"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
