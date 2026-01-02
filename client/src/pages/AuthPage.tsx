import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Trophy, Target, Zap, AlertCircle } from "lucide-react";

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
    console.log("[AUTH PAGE] Register form submitted");
    console.log("[AUTH PAGE] Form data:", {
      username: registerForm.username,
      passwordLength: registerForm.password?.length,
      confirmPasswordLength: registerForm.confirmPassword?.length,
      passwordsMatch: registerForm.password === registerForm.confirmPassword,
    });
    
    if (registerForm.password !== registerForm.confirmPassword) {
      console.log("[AUTH PAGE] Passwords do not match, returning early");
      return;
    }
    
    console.log("[AUTH PAGE] Calling registerMutation.mutate");
    registerMutation.mutate({
      username: registerForm.username,
      password: registerForm.password,
    });
  };

  const passwordMismatch = registerForm.password && registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword;

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-md bg-card border-white/10 shadow-xl shadow-black/20 transition-shadow duration-300">
          <CardHeader className="text-center pb-4 pt-8 px-6 sm:px-8">
            <h1 className="text-3xl font-heading font-bold text-white uppercase italic mb-3">
              Edge<span className="text-primary">Hockey</span>
            </h1>
            <CardDescription className="text-muted-foreground text-sm">
              Elite training for elite players
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 sm:px-8 pb-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger 
                  value="login" 
                  data-testid="tab-login"
                  className="transition-all duration-200"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  data-testid="tab-register"
                  className="transition-all duration-200"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-username" className="text-sm font-medium">Username</Label>
                    <Input
                      id="login-username"
                      name="username"
                      autoComplete="username"
                      data-testid="input-login-username"
                      type="text"
                      placeholder="Enter your username"
                      className="bg-secondary border-transparent h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="login-password"
                      name="password"
                      autoComplete="current-password"
                      data-testid="input-login-password"
                      type="password"
                      placeholder="Enter your password"
                      className="bg-secondary border-transparent h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    data-testid="button-login"
                    className="w-full bg-primary text-primary-foreground font-bold h-12 mt-2 transition-all duration-200 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Sign In
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register" className="mt-0">
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="register-username" className="text-sm font-medium">Username</Label>
                    <Input
                      id="register-username"
                      name="username"
                      autoComplete="username"
                      data-testid="input-register-username"
                      type="text"
                      placeholder="Choose a username"
                      className="bg-secondary border-transparent h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="register-password"
                      name="password"
                      autoComplete="new-password"
                      data-testid="input-register-password"
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      className="bg-secondary border-transparent h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm" className="text-sm font-medium">Confirm Password</Label>
                    <Input
                      id="register-confirm"
                      name="confirm-password"
                      autoComplete="new-password"
                      data-testid="input-register-confirm"
                      type="password"
                      placeholder="Confirm your password"
                      className={`bg-secondary h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-primary ${
                        passwordMismatch 
                          ? "border-destructive/70 focus:ring-destructive/50 focus:border-destructive" 
                          : "border-transparent"
                      }`}
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      required
                    />
                    {passwordMismatch && (
                      <div className="flex items-center gap-2 text-destructive mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <p className="text-sm font-medium" data-testid="text-password-mismatch">Passwords do not match</p>
                      </div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    data-testid="button-register"
                    className="w-full bg-primary text-primary-foreground font-bold h-12 mt-2 transition-all duration-200 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
                    disabled={registerMutation.isPending || !!passwordMismatch}
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
      
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 items-center justify-center p-12">
        <div className="max-w-md space-y-8">
          <h2 className="text-4xl font-heading font-bold text-white uppercase italic">
            Train Like a Pro
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Join Edge Hockey and unlock personalized training plans, nutrition tracking, and skill development tools designed for serious hockey players.
          </p>
          <div className="space-y-5">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/30 group-hover:scale-105">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-white">Personalized Workouts</p>
                <p className="text-sm text-muted-foreground">Custom plans for your position and goals</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/30 group-hover:scale-105">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-white">XP & Progression</p>
                <p className="text-sm text-muted-foreground">Track your journey from Bronze to Elite</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/30 group-hover:scale-105">
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
