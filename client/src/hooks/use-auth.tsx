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
      console.log("[AUTH] === REGISTRATION ATTEMPT START ===");
      console.log("[AUTH] Credentials:", { username: credentials.username, passwordLength: credentials.password?.length });
      console.log("[AUTH] Calling apiRequest with POST /api/register");
      
      try {
        const res = await apiRequest("POST", "/api/register", credentials);
        console.log("[AUTH] Registration request succeeded, parsing JSON");
        const result = await res.json();
        console.log("[AUTH] Registration successful:", result);
        return result;
      } catch (error: any) {
        console.error("[AUTH] Registration request failed in mutationFn");
        console.error("[AUTH] Error type:", error?.constructor?.name);
        console.error("[AUTH] Error name:", error?.name);
        console.error("[AUTH] Error message:", error?.message);
        console.error("[AUTH] Error stack:", error?.stack);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      console.log("[AUTH] Registration onSuccess callback");
      queryClient.setQueryData(["/api/user"], user);
    },
    onError: (error: Error) => {
      console.error("[AUTH] === REGISTRATION MUTATION ERROR ===");
      console.error("[AUTH] Error object:", error);
      console.error("[AUTH] Error message:", error.message);
      console.error("[AUTH] Error stack:", error.stack);
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
