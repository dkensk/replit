import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

// Check required environment variables
if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL environment variable is not set!");
  console.error("Please set DATABASE_URL in your Railway environment variables.");
  process.exit(1);
}

if (!process.env.SESSION_SECRET) {
  console.error("❌ ERROR: SESSION_SECRET environment variable is not set!");
  console.error("Please set SESSION_SECRET in your Railway environment variables.");
  process.exit(1);
}

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// CORS middleware - allow requests from mobile apps
app.use((req, res, next) => {
  // Log all incoming requests for debugging
  console.log(`[CORS] ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  
  // Allow requests from any origin (for mobile apps)
  // In production, you might want to restrict this to specific domains
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    console.log(`[CORS] Handling OPTIONS preflight for ${req.path}`);
    return res.sendStatus(200);
  }
  
  next();
});

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

  // Log ALL requests for debugging - moved after CORS
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    
    // Log incoming request immediately (using console.log for visibility)
    console.log(`[REQUEST] ${req.method} ${path} - IP: ${req.ip} - Origin: ${req.headers.origin || 'none'} - User-Agent: ${req.headers['user-agent']?.substring(0, 50) || 'none'}`);
    log(`${req.method} ${path} - IP: ${req.ip} - Origin: ${req.headers.origin || 'none'}`);
    
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
        console.log(`[RESPONSE] ${logLine}`);
        log(logLine);
      }
    });

    next();
  });

(async () => {
  try {
    // Database schema is pushed during Railway build phase (npm run db:push)
    // Tables should already exist when server starts
    await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    log(`Error ${status}: ${message}`, "error");
    res.status(status).json({ message });
    // Don't throw - just log the error
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
})();
