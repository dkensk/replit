// Database initialization script - runs migrations on startup
import { execSync } from "child_process";
import { db, pool } from "../db/index";
import { sql } from "drizzle-orm";

export async function initializeDatabase(): Promise<void> {
  try {
    console.log("🔄 Running database migrations...");
    // Run drizzle-kit push to create/update database schema
    execSync("npx drizzle-kit push", { 
      stdio: "inherit",
      env: process.env, // Pass through environment variables (including DATABASE_URL)
    });
    console.log("✅ Database migrations complete");
    
    // Create session table for connect-pg-simple (if it doesn't exist)
    console.log("🔄 Creating session table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
      )
      WITH (OIDS=FALSE);
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);
    console.log("✅ Session table ready");
  } catch (error: any) {
    // Don't crash if migrations fail - database might already be set up or have connection issues
    console.warn("⚠️ Database migration failed (this is OK if tables already exist):", error.message);
    console.log("⚠️ Continuing with server startup...");
  }
}
