import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { Capacitor } from "@capacitor/core";

// Get API base URL - use production URL on native, relative path on web
const getApiBase = () => {
  if (Capacitor.isNativePlatform()) {
    // For iOS/Android, always use the production Railway URL
    // Environment variables aren't available in built apps, so we hardcode it
    const apiUrl = "https://replit-production-3505.up.railway.app/api";
    console.log("[API] Native platform detected, using API URL:", apiUrl);
    return apiUrl;
  }
  // On web, use relative path (works with dev server or same-origin backend)
  console.log("[API] Web platform, using relative API path: /api");
  return "/api";
};

const API_BASE = getApiBase();
console.log("[API] API_BASE initialized to:", API_BASE);

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorText = res.statusText;
    try {
      const json = await res.json();
      errorText = json.error || json.message || JSON.stringify(json);
    } catch {
      const text = await res.text();
      errorText = text || res.statusText;
    }
    throw new Error(errorText);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // If URL is relative, prepend API_BASE
  const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
  
  console.log(`[API] ${method} request to:`, fullUrl);
  console.log(`[API] API_BASE is:`, API_BASE);
  console.log(`[API] Is native platform:`, Capacitor.isNativePlatform());
  if (data) {
    console.log("[API] Request body:", typeof data === 'object' ? JSON.stringify(data) : data);
  }
  
  try {
    const fetchOptions: RequestInit = {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    };
    
    console.log("[API] Fetch options:", {
      method: fetchOptions.method,
      hasHeaders: !!fetchOptions.headers,
      hasBody: !!fetchOptions.body,
      credentials: fetchOptions.credentials,
    });
    
    const res = await fetch(fullUrl, fetchOptions);

    console.log(`[API] Response status:`, res.status, res.statusText);
    console.log(`[API] Response headers:`, Object.fromEntries(res.headers.entries()));
    
    await throwIfResNotOk(res);
    return res;
  } catch (error: any) {
    console.error("[API] Request failed with error:", error);
    console.error("[API] Error type:", error?.constructor?.name);
    console.error("[API] Error name:", error?.name);
    console.error("[API] Error message:", error?.message);
    console.error("[API] Error status:", error?.status);
    console.error("[API] Error stack:", error?.stack);
    
    // Re-throw with more descriptive error
    if (error instanceof TypeError) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error(`Network error: Cannot connect to server at ${fullUrl}. Please check your internet connection.`);
      }
      throw new Error(`Network error: ${error.message}. URL: ${fullUrl}`);
    }
    
    // If it's an Error with a message, use it directly
    if (error instanceof Error) {
      throw error;
    }
    
    // Fallback
    throw new Error(`Request failed: ${String(error)}`);
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    // If URL is relative, prepend API_BASE
    const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
    
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
