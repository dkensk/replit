// Database initialization script - runs migrations on startup
import { push } from "drizzle-kit";
import { config } from "dotenv";

// Load environment variables
config();

export async function initializeDatabase(): Promise<void> {
  try {
    console.log("🔄 Running database migrations...");
    if (!process.env.DATABASE_URL) {
      console.warn("⚠️ DATABASE_URL not set, skipping database migrations");
      return;
    }
    // Import drizzle config and push schema
    const { db } = await import("../db/index.js");
    const { drizzleConfig } = await import("../drizzle.config.js");
    
    // Use drizzle-kit push programmatically
    await push({
      ...drizzleConfig,
      driver: "pg",
      schema: drizzleConfig.schema,
    });
    console.log("✅ Database migrations complete");
  } catch (error: any) {
    // Don't crash if migrations fail - database might already be set up
    console.warn("⚠️ Database migration failed (this is OK if tables already exist):", error.message);
    console.log("⚠️ Continuing with server startup...");
  }
}

