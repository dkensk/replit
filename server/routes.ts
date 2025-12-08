import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertProfileSchema,
  updateProfileSchema,
  insertWorkoutLogSchema,
  insertMealLogSchema,
} from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get or create profile for the current session
  app.get("/api/profile", async (req, res) => {
    try {
      // For now, we'll use a default user ID (can add auth later)
      const defaultUserId = "default-user";
      
      let profile = await storage.getProfileByUserId(defaultUserId);
      
      // If no profile exists, create a default one
      if (!profile) {
        const defaultSchedule = {
          monday: "legs_strength",
          tuesday: "upper_body",
          wednesday: "skills_cardio",
          thursday: "legs_explosive",
          friday: "full_body",
          saturday: "active_recovery",
          sunday: "rest",
        };

        profile = await storage.createProfile({
          userId: defaultUserId,
          age: 16,
          weight: 175,
          heightFt: 5,
          heightIn: 10,
          goal: "muscle",
          position: "defense",
          level: "aa",
          schedule: defaultSchedule,
          workoutDuration: 60,
          xp: 0,
          tier: "Bronze",
        });
      }

      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Update profile
  app.patch("/api/profile", async (req, res) => {
    try {
      const defaultUserId = "default-user";
      const updates = updateProfileSchema.parse(req.body);
      
      const updated = await storage.updateProfile(defaultUserId, updates);
      
      if (!updated) {
        return res.status(404).json({ error: "Profile not found" });
      }

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Get workout history
  app.get("/api/workouts", async (req, res) => {
    try {
      const defaultUserId = "default-user";
      const logs = await storage.getWorkoutLogs(defaultUserId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      res.status(500).json({ error: "Failed to fetch workouts" });
    }
  });

  // Log a workout
  app.post("/api/workouts", async (req, res) => {
    try {
      const defaultUserId = "default-user";
      const data = insertWorkoutLogSchema.parse({
        ...req.body,
        userId: defaultUserId,
      });

      // Check if workout already logged for this date
      const existing = await storage.getWorkoutLogByDate(defaultUserId, data.date);
      if (existing) {
        return res.status(400).json({ error: "Workout already logged for this date" });
      }

      const log = await storage.logWorkout(data);

      // Add XP to profile
      const profile = await storage.getProfileByUserId(defaultUserId);
      if (profile) {
        const newXp = Math.min(100, profile.xp + 15);
        await storage.updateProfile(defaultUserId, { xp: newXp });
      }

      res.json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error logging workout:", error);
      res.status(500).json({ error: "Failed to log workout" });
    }
  });

  // Delete/undo a workout
  app.delete("/api/workouts/:date", async (req, res) => {
    try {
      const defaultUserId = "default-user";
      const { date } = req.params;
      
      await storage.deleteWorkoutByDate(defaultUserId, date);
      
      // Remove XP from profile
      const profile = await storage.getProfileByUserId(defaultUserId);
      if (profile) {
        const newXp = Math.max(0, profile.xp - 15);
        await storage.updateProfile(defaultUserId, { xp: newXp });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting workout:", error);
      res.status(500).json({ error: "Failed to delete workout" });
    }
  });

  // Get meal logs for a date
  app.get("/api/meals/:date", async (req, res) => {
    try {
      const defaultUserId = "default-user";
      const { date } = req.params;
      const logs = await storage.getMealLogsForDate(defaultUserId, date);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching meal logs:", error);
      res.status(500).json({ error: "Failed to fetch meal logs" });
    }
  });

  // Upsert meal selection
  app.post("/api/meals", async (req, res) => {
    try {
      const defaultUserId = "default-user";
      const data = insertMealLogSchema.parse({
        ...req.body,
        userId: defaultUserId,
      });

      const log = await storage.upsertMealLog(data);
      res.json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error upserting meal log:", error);
      res.status(500).json({ error: "Failed to save meal log" });
    }
  });

  // Toggle meal consumed status
  app.patch("/api/meals/toggle", async (req, res) => {
    try {
      const defaultUserId = "default-user";
      const { date, mealType } = req.body;

      if (!date || !mealType) {
        return res.status(400).json({ error: "Missing date or mealType" });
      }

      const updated = await storage.toggleMealConsumed(defaultUserId, date, mealType);
      
      if (!updated) {
        return res.status(404).json({ error: "Meal log not found" });
      }

      // Add XP if meal was marked as consumed
      if (updated.consumed) {
        const profile = await storage.getProfileByUserId(defaultUserId);
        if (profile) {
          const newXp = Math.min(100, profile.xp + 5);
          await storage.updateProfile(defaultUserId, { xp: newXp });
        }
      }

      res.json(updated);
    } catch (error) {
      console.error("Error toggling meal:", error);
      res.status(500).json({ error: "Failed to toggle meal status" });
    }
  });

  // Promote tier
  app.post("/api/profile/promote", async (req, res) => {
    try {
      const defaultUserId = "default-user";
      const profile = await storage.getProfileByUserId(defaultUserId);

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      if (profile.xp < 100) {
        return res.status(400).json({ error: "Not enough XP to promote" });
      }

      const tiers = ["Bronze", "Silver", "Gold", "Diamond", "Elite"];
      const currentIndex = tiers.indexOf(profile.tier);
      const nextTier = currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : profile.tier;

      const updated = await storage.updateProfile(defaultUserId, {
        tier: nextTier,
        xp: 0,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error promoting tier:", error);
      res.status(500).json({ error: "Failed to promote tier" });
    }
  });

  // AI Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, profile } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array required" });
      }

      const systemPrompt = `You are Coach AI, an expert hockey training assistant. ${
        profile
          ? `The user is a ${profile.position} playing at the ${profile.level} level, ${profile.age} years old, weighing ${profile.weight} lbs.`
          : ""
      }

You provide personalized advice on:
- Hockey-specific workouts and training
- Nutrition for athletes
- Skill development drills
- Game strategy and positioning
- Mental preparation

Keep responses concise (2-3 sentences), actionable, and encouraging. Use hockey terminology appropriately.`;

      const chatMessages = [
        { role: "system" as const, content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role === "user" ? ("user" as const) : ("assistant" as const),
          content: m.content,
        })),
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chatMessages,
        max_tokens: 200,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || "I'm having trouble responding right now. Please try again.";

      res.json({ response });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  return httpServer;
}
