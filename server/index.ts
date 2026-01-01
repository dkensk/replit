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
  const origin = req.headers.origin;
  
  // Log all incoming requests for debugging
  console.log(`[CORS] ${req.method} ${req.path} - Origin: ${origin || 'none'} - User-Agent: ${req.headers['user-agent']?.substring(0, 80) || 'none'}`);
  
  // Allow requests from any origin (for mobile apps and web)
  // If origin is present, use it; otherwise allow all (mobile apps often don't send origin)
  if (origin) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    res.header("Access-Control-Allow-Origin", "*");
  }
  
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
  
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

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  // Don't exit - let the error handler catch it
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

(async () => {
  try {
    console.log("Starting server...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Not set");
    console.log("SESSION_SECRET:", process.env.SESSION_SECRET ? "✅ Set" : "❌ Not set");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("PORT:", process.env.PORT || "5000 (default)");
    
    // Database schema is pushed during Railway build phase (npm run db:push)
    // Tables should already exist when server starts
    // Register health check routes FIRST (before API routes)
    // This ensures Railway's health checks work even if other routes fail
    app.get("/", (req, res) => {
      res.json({ status: "ok", service: "edge-hockey-api", timestamp: new Date().toISOString() });
    });
    
    app.get("/health", (req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    });
    
    app.get("/api/health", (req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    });
    
    console.log("Registering routes...");
    await registerRoutes(httpServer, app);
    console.log("✅ Routes registered");

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
      console.log("Setting up static file serving...");
      serveStatic(app);
      console.log("✅ Static files configured");
    } else {
      console.log("Setting up Vite dev server...");
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
      console.log("✅ Vite configured");
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || "5000", 10);
    console.log(`Starting HTTP server on port ${port}...`);
    
    httpServer.listen(port, "0.0.0.0", () => {
      log(`✅ Server is serving on port ${port}`);
      console.log(`✅ Server started successfully on port ${port}`);
      console.log(`✅ Health check available at: http://0.0.0.0:${port}/health`);
    });
    
    httpServer.on("error", (error: any) => {
      console.error("❌ HTTP server error:", error);
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${port} is already in use`);
      }
      process.exit(1);
    });
    
    // Keep the process alive
    httpServer.on("listening", () => {
      console.log("✅ HTTP server is listening and ready to accept connections");
    });
    
  } catch (error) {
    console.error("❌ Failed to start server:");
    console.error(error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    process.exit(1);
  }
})();
