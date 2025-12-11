import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Onboarding from "@/pages/Onboarding";
import Workouts from "@/pages/Workouts";
import Diet from "@/pages/Diet";
import Skills from "@/pages/Skills";
import Review from "@/pages/Review";
import AI from "@/pages/AI";
import Profile from "@/pages/Profile";
import { UserProvider, useUser } from "./lib/UserContext";

function AuthenticatedRoutes() {
  const { profile, isLoading } = useUser();
  const [location] = useLocation();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-xl">Loading...</div>
      </div>
    );
  }
  
  if (!profile.onboardingComplete && location !== "/onboarding") {
    return <Redirect to="/onboarding" />;
  }
  
  if (profile.onboardingComplete && location === "/onboarding") {
    return <Redirect to="/" />;
  }
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/workouts" component={Workouts} />
      <Route path="/diet" component={Diet} />
      <Route path="/skills" component={Skills} />
      <Route path="/review" component={Review} />
      <Route path="/ai" component={AI} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <Toaster />
          <AuthenticatedRoutes />
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
