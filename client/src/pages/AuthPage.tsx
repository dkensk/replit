import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Trophy, Target, Zap, AlertCircle } from "lucide-react";
import { Capacitor } from "@capacitor/core";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", password: "", confirmPassword: "" });
  const [testResult, setTestResult] = useState<string>("");

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Test connectivity on mount
  useEffect(() => {
    const testConnectivity = async () => {
      try {
        const apiUrl = Capacitor.isNativePlatform() 
          ? "https://replit-production-2580.up.railway.app/api/health"
          : "/api/health";
        
        console.log("[AUTH PAGE] Testing connectivity to:", apiUrl);
        const response = await fetch(apiUrl, {
          method: "GET",
          credentials: "include",
        });
        
        const data = await response.json();
        setTestResult(`✅ Connected! Status: ${response.status}`);
        console.log("[AUTH PAGE] Connectivity test successful:", data);
      } catch (error: any) {
        setTestResult(`❌ Failed: ${error.message}`);
        console.error("[AUTH PAGE] Connectivity test failed:", error);
      }
    };
    
    testConnectivity();
  }, []);

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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Edge Hockey</h1>
          </div>
          <CardDescription>
            Your personal hockey training companion
          </CardDescription>
          {testResult && (
            <div className={`text-sm p-2 rounded ${testResult.startsWith("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {testResult}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Username</Label>
                  <Input
                    id="login-username"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username">Username</Label>
                  <Input
                    id="register-username"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
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
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                {registerForm.password && registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    Passwords do not match
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
