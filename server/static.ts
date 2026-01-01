import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // In production, __dirname is dist/ (where index.cjs is), so public is at dist/public
  // Also try relative to process.cwd() as fallback
  const distPath = fs.existsSync(path.resolve(__dirname, "public"))
    ? path.resolve(__dirname, "public")
    : path.resolve(process.cwd(), "dist", "public");
    
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  // BUT skip API routes and health check routes (those should return JSON)
  // Note: /health, /api/health, and / are handled by route handlers registered before this
  app.use("*", (req, res, next) => {
    // Don't serve index.html for API routes or health checks
    // These routes are already registered in registerRoutes()
    if (req.path.startsWith("/api") || req.path === "/health" || req.path === "/") {
      return next(); // Let the route handlers handle it
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
