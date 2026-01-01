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
    const contentType = res.headers.get("content-type");
    
    try {
      // Only try to parse as JSON if content-type says it's JSON
      if (contentType && contentType.includes("application/json")) {
        const json = await res.json();
        errorText = json.error || json.message || JSON.stringify(json);
      } else {
        // Not JSON, get as text
        const text = await res.text();
        errorText = text || res.statusText;
        // If it looks like HTML, provide a better error
        if (text.includes("<!DOCTYPE") || text.includes("<html")) {
          errorText = `Server returned HTML instead of JSON (Status: ${res.status}). This usually means the request reached the wrong endpoint or the server is returning an error page.`;
        }
      }
    } catch (parseError) {
      // If JSON parsing fails, try to get text
      try {
        const text = await res.text();
        errorText = text || res.statusText;
      } catch {
        errorText = res.statusText || `HTTP ${res.status} Error`;
      }
    }
    
    // Create a more descriptive error that includes status code
    const error = new Error(errorText);
    (error as any).status = res.status;
    (error as any).statusText = res.statusText;
    throw error;
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
  
  let fetchError: any = null;
  
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
    fetchError = error;
    console.error("[API] Request failed with error:", error);
    console.error("[API] Error type:", error?.constructor?.name);
    console.error("[API] Error name:", error?.name);
    console.error("[API] Error message:", error?.message);
    console.error("[API] Error status:", error?.status);
    console.error("[API] Error stack:", error?.stack);
    
    // Network errors (fetch fails completely)
    if (error instanceof TypeError) {
      const networkError = `Network error: Cannot connect to ${fullUrl}. This usually means:
1. The server is not running
2. The URL is incorrect
3. There's a network connectivity issue

Please check:
- Server URL: ${fullUrl}
- Is the server running? Visit: ${API_BASE.replace('/api', '/health')}`;
      throw new Error(networkError);
    }
    
    // HTTP errors (server responded with error status)
    if (error instanceof Error && error.message) {
      // If error already has a good message, use it
      if (error.message.includes('Network error') || error.message.includes('Cannot connect')) {
        throw error;
      }
      // Otherwise, enhance it with context
      throw new Error(`Server error: ${error.message} (Status: ${(error as any).status || 'unknown'})`);
    }
    
    // Unknown errors
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
