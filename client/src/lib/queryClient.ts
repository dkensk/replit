import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { Capacitor } from "@capacitor/core";
// Import Http to ensure it patches fetch/XHR when enabled in config
import "@capacitor-community/http";

// Get API base URL - use production URL on native, relative path on web
const getApiBase = () => {
  if (Capacitor.isNativePlatform()) {
    // For iOS/Android, always use the production Railway URL
    // Environment variables aren't available in built apps, so we hardcode it
    const apiUrl = "https://replit-production-2580.up.railway.app/api";
    console.log("[API] Native platform detected, using API URL:", apiUrl);
    return apiUrl;
  }
  // On web, use relative path (works with dev server or same-origin backend)
  console.log("[API] Web platform, using relative API path: /api");
  return "/api";
};

const API_BASE = getApiBase();
console.log("[API] API_BASE initialized to:", API_BASE);

// Use Capacitor HTTP on native, fetch on web
async function makeRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  // If URL is relative, prepend API_BASE
  const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
  
  console.log(`[API] === REQUEST START ===`);
  console.log(`[API] Method: ${method}`);
  console.log(`[API] URL: ${fullUrl}`);
  console.log(`[API] API_BASE: ${API_BASE}`);
  console.log(`[API] Platform: ${Capacitor.isNativePlatform() ? 'Native' : 'Web'}`);
  if (data) {
    console.log("[API] Request data:", typeof data === 'object' ? JSON.stringify(data) : data);
  }

  // Use fetch - Capacitor HTTP plugin patches fetch/XHR automatically when enabled
  // So fetch() will use native networking on iOS/Android
  try {
    console.log("[API] Using fetch (patched by Capacitor HTTP on native)");
    const fetchOptions: RequestInit = {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    };
    
    console.log("[API] Fetch options:", {
      method: fetchOptions.method,
      url: fullUrl,
      hasHeaders: !!fetchOptions.headers,
      hasBody: !!fetchOptions.body,
    });
    
    const res = await fetch(fullUrl, fetchOptions);
    
    console.log(`[API] === RESPONSE RECEIVED ===`);
    console.log(`[API] Status: ${res.status} ${res.statusText}`);
    console.log(`[API] OK: ${res.ok}`);
    
    if (!res.ok) {
      let errorText = res.statusText;
      const contentType = res.headers.get("content-type");
      
      try {
        if (contentType && contentType.includes("application/json")) {
          const json = await res.json();
          errorText = json.error || json.message || JSON.stringify(json);
        } else {
          const text = await res.text();
          errorText = text || res.statusText;
        }
      } catch (parseError) {
        errorText = res.statusText || `HTTP ${res.status} Error`;
      }
      
      const error = new Error(errorText);
      (error as any).status = res.status;
      (error as any).statusText = res.statusText;
      throw error;
    }
    
    return res;
  } catch (error: any) {
    console.error("[API] === REQUEST FAILED ===");
    console.error("[API] Error type:", error?.constructor?.name);
    console.error("[API] Error name:", error?.name);
    console.error("[API] Error message:", error?.message);
    console.error("[API] Error status:", error?.status);
    console.error("[API] Full error:", error);
    
    if (error.status) {
      // HTTP error (server responded with error status)
      throw error;
    }
    // Network error
    throw new Error(`Network error: Cannot connect to ${fullUrl}. ${error.message || 'Connection failed'}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  return makeRequest(method, url, data);
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    const res = await makeRequest("GET", url);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: res.statusText }));
      const error = new Error(errorData.error || errorData.message || `HTTP ${res.status}`);
      (error as any).status = res.status;
      throw error;
    }

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
