import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Trophy, Target, Zap } from "lucide-react";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", password: "", confirmPassword: "" });

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (user) {
    return null;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      return;
    }
    registerMutation.mutate({
      username: registerForm.username,
      password: registerForm.password,
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card border-white/10">
          <CardHeader className="text-center pb-2">
            <h1 className="text-3xl font-heading font-bold text-white uppercase italic mb-2">
              Edge<span className="text-primary">Hockey</span>
            </h1>
            <CardDescription className="text-muted-foreground">
              Elite training for elite players
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" data-testid="tab-login">Sign In</TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <Input
                      id="login-username"
                      name="username"
                      autoComplete="username"
                      data-testid="input-login-username"
                      type="text"
                      placeholder="Enter your username"
                      className="bg-secondary border-transparent"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      name="password"
                      autoComplete="current-password"
                      data-testid="input-login-password"
                      type="password"
                      placeholder="Enter your password"
                      className="bg-secondary border-transparent"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    data-testid="button-login"
                    className="w-full bg-primary text-primary-foreground font-bold h-12"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Sign In
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      name="username"
                      autoComplete="username"
                      data-testid="input-register-username"
                      type="text"
                      placeholder="Choose a username"
                      className="bg-secondary border-transparent"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      name="password"
                      autoComplete="new-password"
                      data-testid="input-register-password"
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      className="bg-secondary border-transparent"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm">Confirm Password</Label>
                    <Input
                      id="register-confirm"
                      name="confirm-password"
                      autoComplete="new-password"
                      data-testid="input-register-confirm"
                      type="password"
                      placeholder="Confirm your password"
                      className="bg-secondary border-transparent"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      required
                    />
                    {registerForm.password && registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword && (
                      <p className="text-xs text-red-500">Passwords do not match</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    data-testid="button-register"
                    className="w-full bg-primary text-primary-foreground font-bold h-12"
                    disabled={registerMutation.isPending || registerForm.password !== registerForm.confirmPassword}
                  >
                    {registerMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 to-primary/5 items-center justify-center p-12">
        <div className="max-w-md space-y-8">
          <h2 className="text-4xl font-heading font-bold text-white uppercase italic">
            Train Like a Pro
          </h2>
          <p className="text-lg text-muted-foreground">
            Join Edge Hockey and unlock personalized training plans, nutrition tracking, and skill development tools designed for serious hockey players.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-white">Personalized Workouts</p>
                <p className="text-sm text-muted-foreground">Custom plans for your position and goals</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-white">XP & Progression</p>
                <p className="text-sm text-muted-foreground">Track your journey from Bronze to Elite</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-white">Skill Development</p>
                <p className="text-sm text-muted-foreground">Master drills used by the pros</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
