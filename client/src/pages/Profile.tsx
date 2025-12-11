import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Save, Trophy, Zap } from "lucide-react";
import { useUser } from "@/lib/UserContext";
import { cn } from "@/lib/utils";

export default function Profile() {
  const { profile, updateProfile, xp } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
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

  const tierColors: Record<string, string> = {
    Bronze: "text-orange-400",
    Silver: "text-gray-300",
    Gold: "text-yellow-400",
    Diamond: "text-cyan-400",
    Elite: "text-purple-400"
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-full">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-white">Profile</h1>
              <p className="text-sm text-muted-foreground">Manage your info</p>
            </div>
          </div>
          
          {!isEditing ? (
            <Button 
              data-testid="button-edit-profile"
              variant="outline" 
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          ) : (
            <Button 
              data-testid="button-save-profile"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
        
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className={cn("w-8 h-8", tierColors[profile.tier])} />
                <div>
                  <p className="text-sm text-muted-foreground">Current Tier</p>
                  <p className={cn("text-xl font-bold", tierColors[profile.tier])}>{profile.tier}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-lg font-bold text-white">{xp} XP</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Personal Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              {isEditing ? (
                <Input
                  data-testid="input-edit-first-name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="bg-secondary border-transparent"
                />
              ) : (
                <p data-testid="text-first-name" className="text-lg text-white">{profile.firstName || "Not set"}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                {isEditing ? (
                  <Input
                    data-testid="input-edit-age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                    className="bg-secondary border-transparent"
                  />
                ) : (
                  <p data-testid="text-age" className="text-lg text-white">{profile.age} years</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Weight</Label>
                {isEditing ? (
                  <Input
                    data-testid="input-edit-weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })}
                    className="bg-secondary border-transparent"
                  />
                ) : (
                  <p data-testid="text-weight" className="text-lg text-white">{profile.weight} lbs</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Height</Label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    data-testid="input-edit-height-ft"
                    type="number"
                    value={formData.heightFt}
                    onChange={(e) => setFormData({ ...formData, heightFt: parseInt(e.target.value) || 0 })}
                    placeholder="Feet"
                    className="bg-secondary border-transparent"
                  />
                  <Input
                    data-testid="input-edit-height-in"
                    type="number"
                    value={formData.heightIn}
                    onChange={(e) => setFormData({ ...formData, heightIn: parseInt(e.target.value) || 0 })}
                    placeholder="Inches"
                    className="bg-secondary border-transparent"
                  />
                </div>
              ) : (
                <p data-testid="text-height" className="text-lg text-white">{profile.heightFt}'{profile.heightIn}"</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Hockey Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Position</Label>
              {isEditing ? (
                <Select value={formData.position} onValueChange={(v: any) => setFormData({ ...formData, position: v })}>
                  <SelectTrigger data-testid="select-edit-position" className="bg-secondary border-transparent">
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
                <p data-testid="text-position" className="text-lg text-white capitalize">{profile.position}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Level</Label>
              {isEditing ? (
                <Select value={formData.level} onValueChange={(v: any) => setFormData({ ...formData, level: v })}>
                  <SelectTrigger data-testid="select-edit-level" className="bg-secondary border-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House League</SelectItem>
                    <SelectItem value="a">A</SelectItem>
                    <SelectItem value="aa">AA</SelectItem>
                    <SelectItem value="aaa">AAA</SelectItem>
                    <SelectItem value="junior">Junior</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p data-testid="text-level" className="text-lg text-white uppercase">{profile.level}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Goal</Label>
              {isEditing ? (
                <Select value={formData.goal} onValueChange={(v: any) => setFormData({ ...formData, goal: v })}>
                  <SelectTrigger data-testid="select-edit-goal" className="bg-secondary border-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="muscle">Build Muscle</SelectItem>
                    <SelectItem value="fatloss">Fat Loss</SelectItem>
                    <SelectItem value="maintain">Maintain</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p data-testid="text-goal" className="text-lg text-white capitalize">
                  {profile.goal === "fatloss" ? "Fat Loss" : profile.goal === "muscle" ? "Build Muscle" : "Maintain"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
