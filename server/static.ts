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
  // BUT skip API routes (those should return JSON)
  // Note: /health and / are handled by route handlers before this
  app.use("*", (req, res) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.resolve(distPath, "index.html"));
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });
}
