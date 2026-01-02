// Database initialization script - runs migrations on startup
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function initializeDatabase(): Promise<void> {
  try {
    console.log("🔄 Running database migrations...");
    const { stdout, stderr } = await execAsync("npm run db:push");
    if (stdout) console.log(stdout);
    if (stderr && !stderr.includes("warn")) console.error(stderr);
    console.log("✅ Database migrations complete");
  } catch (error: any) {
    // Don't crash if migrations fail - database might already be set up
    console.warn("⚠️ Database migration failed (this is OK if tables already exist):", error.message);
    console.log("⚠️ Continuing with server startup...");
  }
}

