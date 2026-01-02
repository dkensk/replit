// Database initialization script - runs migrations on startup
import { execSync } from "child_process";

export async function initializeDatabase(): Promise<void> {
  try {
    console.log("🔄 Running database migrations...");
    // Run drizzle-kit push to create/update database schema
    execSync("npx drizzle-kit push", { 
      stdio: "inherit",
      env: process.env, // Pass through environment variables (including DATABASE_URL)
    });
    console.log("✅ Database migrations complete");
  } catch (error: any) {
    // Don't crash if migrations fail - database might already be set up or have connection issues
    console.warn("⚠️ Database migration failed (this is OK if tables already exist):", error.message);
    console.log("⚠️ Continuing with server startup...");
  }
}

