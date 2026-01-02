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

// Register health check routes IMMEDIATELY (before anything else)
// This ensures Railway's health checks work even during server startup
app.get("/", (req, res) => {
  console.log("[HEALTH] GET / request received from:", req.ip);
  res.status(200).type('text/plain').send('OK');
  console.log("[HEALTH] GET / response sent: OK");
});

app.get("/health", (req, res) => {
  console.log("[HEALTH] GET /health request received from:", req.ip);
  res.status(200).type('text/plain').send('OK');
  console.log("[HEALTH] GET /health response sent: OK");
});

app.get("/api/health", (req, res) => {
  console.log("[HEALTH] GET /api/health request received from:", req.ip);
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start HTTP server IMMEDIATELY with just health routes
// This ensures Railway can reach the server from the very start
const port = parseInt(process.env.PORT || "5000", 10);
console.log(`Starting HTTP server immediately on port ${port}...`);

httpServer.on("error", (error: any) => {
  console.error("❌ HTTP server error:", error);
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${port} is already in use`);
  }
  process.exit(1);
});

httpServer.on("listening", () => {
  console.log("✅ HTTP server is listening and ready to accept connections");
  console.log(`✅ Server listening on 0.0.0.0:${port}`);
});

httpServer.on("request", (req, res) => {
  console.log(`[SERVER] Incoming request: ${req.method} ${req.url}`);
});

httpServer.on("connection", (socket) => {
  console.log(`[SERVER] New connection from ${socket.remoteAddress}:${socket.remotePort}`);
});

httpServer.listen(port, "0.0.0.0", () => {
  const addr = httpServer.address();
  const address = typeof addr === "string" ? addr : `${addr?.address}:${addr?.port}`;
  log(`✅ Server is serving on port ${port}`);
  console.log(`✅ Server started successfully on port ${port}`);
  console.log(`✅ Server address: ${address}`);
  console.log(`✅ Health check available at: http://0.0.0.0:${port}/health`);
  console.log(`✅ Root endpoint available at: http://0.0.0.0:${port}/`);
});

(async () => {
  try {
    console.log("Starting server initialization...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Not set");
    console.log("SESSION_SECRET:", process.env.SESSION_SECRET ? "✅ Set" : "❌ Not set");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("PORT:", process.env.PORT || "5000 (default)");
    
    // Database schema is pushed during Railway build phase (npm run db:push)
    // Tables should already exist when server starts
    // HTTP server is already listening (started above)
    
    // Test route to verify routing is working
    app.get("/test", (req, res) => {
      console.log("[TEST] GET /test request received");
      res.json({ status: "test", message: "Server is responding", timestamp: new Date().toISOString() });
    });
    
    console.log("Registering routes...");
    try {
      await registerRoutes(httpServer, app);
      console.log("✅ Routes registered");
    } catch (error) {
      console.error("❌ Error registering routes:", error);
      throw error;
    }

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
      try {
        serveStatic(app);
        console.log("✅ Static files configured");
      } catch (error) {
        console.error("❌ Error setting up static files:", error);
        // Don't exit - continue without static files for now
        console.log("⚠️ Continuing without static file serving");
      }
    } else {
      console.log("Setting up Vite dev server...");
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
      console.log("✅ Vite configured");
    }
    
    console.log("✅ Server initialization complete");
    
  } catch (error) {
    console.error("❌ Failed to initialize server:");
    console.error(error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    // Don't exit - server is already listening, let it continue
    console.log("⚠️ Continuing with server running despite initialization error");
  }
})();

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("⚠️  Received SIGTERM, shutting down gracefully...");
  httpServer.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

// Keep process alive - prevent Node.js from exiting
// The HTTP server should keep it alive, but this ensures it
setInterval(() => {
  // Keep event loop alive
}, 10000);
