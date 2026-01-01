import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser } from "@shared/schema";
import { queryClient, apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/user");
        return res.json();
      } catch (error: any) {
        // Return null for 401 (not authenticated)
        if (error.message?.includes("401")) return null;
        throw error;
      }
    },
    retry: false,
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      console.log("[AUTH] Attempting registration with:", { username: credentials.username, passwordLength: credentials.password?.length });
      
      // First, test if we can reach the server
      try {
        console.log("[AUTH] Testing server connection...");
        const healthCheck = await fetch("https://replit-production-3505.up.railway.app/api/health", {
          method: "GET",
          credentials: "include",
        });
        console.log("[AUTH] Health check response:", healthCheck.status, healthCheck.statusText);
      } catch (healthError: any) {
        console.error("[AUTH] Health check failed:", healthError);
        throw new Error(`Cannot connect to server. Network error: ${healthError?.message || 'Unknown error'}. Please check your internet connection.`);
      }
      
      try {
        const res = await apiRequest("POST", "/api/register", credentials);
        console.log("[AUTH] Registration successful");
        return await res.json();
      } catch (error: any) {
        console.error("[AUTH] Registration error:", error);
        console.error("[AUTH] Error details:", {
          message: error?.message,
          stack: error?.stack,
          name: error?.name,
          status: error?.status,
        });
        
        // Ensure we throw a clear error message
        if (error?.message) {
          throw new Error(error.message);
        }
        throw new Error(`Registration failed: ${String(error)}`);
      }
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
    },
    onError: (error: Error) => {
      console.error("[AUTH] Registration mutation error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== "/api/user" });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
