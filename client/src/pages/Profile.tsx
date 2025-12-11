import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Save, Trophy, Zap, Target, TrendingUp, Award, LogOut, Key, Pencil } from "lucide-react";
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

  const tierConfig: Record<string, { color: string; bgColor: string; borderColor: string }> = {
    Bronze: { color: "text-orange-400", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/30" },
    Silver: { color: "text-gray-300", bgColor: "bg-gray-500/10", borderColor: "border-gray-500/30" },
    Gold: { color: "text-yellow-400", bgColor: "bg-yellow-500/10", borderColor: "border-yellow-500/30" },
    Diamond: { color: "text-cyan-400", bgColor: "bg-cyan-500/10", borderColor: "border-cyan-500/30" },
    Elite: { color: "text-purple-400", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/30" }
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

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className={cn(
          "relative rounded-2xl p-6 border overflow-hidden",
          currentTier.bgColor,
          currentTier.borderColor
        )}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full" />
          
          <div className="flex items-start gap-4 relative z-10">
            <div className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold border-2",
              currentTier.bgColor,
              currentTier.borderColor,
              currentTier.color
            )}>
              {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : "P"}
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-heading font-bold text-white" data-testid="text-player-name">
                {profile.firstName || "Player"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Trophy className={cn("w-4 h-4", currentTier.color)} />
                <span className={cn("font-bold text-sm", currentTier.color)} data-testid="text-tier">
                  {profile.tier}
                </span>
              </div>
              
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-bold" data-testid="text-xp">{xp}</span>
                  <span className="text-muted-foreground text-sm">XP</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="text-white font-bold">{profile.workoutHistory?.length || 0}</span>
                  <span className="text-muted-foreground text-sm">Workouts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-card border-white/5 text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-white" data-testid="text-age-chip">{profile.age}</p>
              <p className="text-xs text-muted-foreground uppercase">Years Old</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-white/5 text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-white" data-testid="text-weight-chip">{profile.weight}</p>
              <p className="text-xs text-muted-foreground uppercase">Pounds</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-white/5 text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-white" data-testid="text-height-chip">{profile.heightFt}'{profile.heightIn}"</p>
              <p className="text-xs text-muted-foreground uppercase">Height</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Info
            </CardTitle>
            {!isEditing ? (
              <Button 
                data-testid="button-edit-profile"
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            ) : (
              <Button 
                data-testid="button-save-profile"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">First Name</Label>
                {isEditing ? (
                  <Input
                    data-testid="input-edit-first-name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="bg-secondary border-transparent h-10"
                  />
                ) : (
                  <p data-testid="text-first-name" className="text-white font-medium">{profile.firstName || "Not set"}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Age</Label>
                {isEditing ? (
                  <Input
                    data-testid="input-edit-age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                    className="bg-secondary border-transparent h-10"
                  />
                ) : (
                  <p data-testid="text-age" className="text-white font-medium">{profile.age} years</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Weight (lbs)</Label>
                {isEditing ? (
                  <Input
                    data-testid="input-edit-weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })}
                    className="bg-secondary border-transparent h-10"
                  />
                ) : (
                  <p data-testid="text-weight" className="text-white font-medium">{profile.weight} lbs</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Height</Label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Input
                      data-testid="input-edit-height-ft"
                      type="number"
                      value={formData.heightFt}
                      onChange={(e) => setFormData({ ...formData, heightFt: parseInt(e.target.value) || 0 })}
                      placeholder="Ft"
                      className="bg-secondary border-transparent h-10"
                    />
                    <Input
                      data-testid="input-edit-height-in"
                      type="number"
                      value={formData.heightIn}
                      onChange={(e) => setFormData({ ...formData, heightIn: parseInt(e.target.value) || 0 })}
                      placeholder="In"
                      className="bg-secondary border-transparent h-10"
                    />
                  </div>
                ) : (
                  <p data-testid="text-height" className="text-white font-medium">{profile.heightFt}'{profile.heightIn}"</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Hockey Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Position</Label>
                {isEditing ? (
                  <Select value={formData.position} onValueChange={(v: any) => setFormData({ ...formData, position: v })}>
                    <SelectTrigger data-testid="select-edit-position" className="bg-secondary border-transparent h-10">
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
                  <p data-testid="text-position" className="text-white font-medium">{positionLabels[profile.position]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Level</Label>
                {isEditing ? (
                  <Select value={formData.level} onValueChange={(v: any) => setFormData({ ...formData, level: v })}>
                    <SelectTrigger data-testid="select-edit-level" className="bg-secondary border-transparent h-10">
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
                  <p data-testid="text-level" className="text-white font-medium">{levelLabels[profile.level]}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Training Goal</Label>
              {isEditing ? (
                <Select value={formData.goal} onValueChange={(v: any) => setFormData({ ...formData, goal: v })}>
                  <SelectTrigger data-testid="select-edit-goal" className="bg-secondary border-transparent h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="muscle">Build Muscle</SelectItem>
                    <SelectItem value="fatloss">Fat Loss</SelectItem>
                    <SelectItem value="maintain">Maintain</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <p data-testid="text-goal" className="text-white font-medium">{goalLabels[profile.goal]}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Username</Label>
              {isEditingUsername ? (
                <div className="flex gap-2">
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter new username"
                    data-testid="input-new-username"
                    className="bg-secondary border-transparent"
                  />
                  <Button
                    size="sm"
                    onClick={handleUsernameSubmit}
                    disabled={updateUsernameMutation.isPending || newUsername.trim().length < 3}
                    data-testid="button-save-username"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setIsEditingUsername(false); setNewUsername(""); }}
                    data-testid="button-cancel-username"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-white font-medium" data-testid="text-username">{user?.username}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setIsEditingUsername(true); setNewUsername(user?.username || ""); }}
                    data-testid="button-edit-username"
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Change
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Password</Label>
              {isChangingPassword ? (
                <div className="space-y-2">
                  <Input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Current password"
                    data-testid="input-current-password"
                    className="bg-secondary border-transparent"
                  />
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="New password (min 6 characters)"
                    data-testid="input-new-password"
                    className="bg-secondary border-transparent"
                  />
                  <Input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    data-testid="input-confirm-password"
                    className="bg-secondary border-transparent"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handlePasswordSubmit}
                      disabled={updatePasswordMutation.isPending}
                      data-testid="button-save-password"
                    >
                      Update Password
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setIsChangingPassword(false); setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }}
                      data-testid="button-cancel-password"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-white font-medium">••••••••</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsChangingPassword(true)}
                    data-testid="button-change-password"
                  >
                    <Key className="w-4 h-4 mr-1" />
                    Change
                  </Button>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
                className="w-full text-red-400 border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
