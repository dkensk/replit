import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertProfileSchema,
  updateProfileSchema,
  insertWorkoutLogSchema,
  insertMealLogSchema,
  insertCustomMealSchema,
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
        // Get default lookup IDs
        const goals = await storage.getGoals();
        const positions = await storage.getPositions();
        const levels = await storage.getCompetitionLevels();
        
        const defaultGoal = goals.find(g => g.code === "muscle");
        const defaultPosition = positions.find(p => p.code === "defense");
        const defaultLevel = levels.find(l => l.code === "aa");

        profile = await storage.createProfile({
          userId: defaultUserId,
          age: 16,
          weight: 175,
          heightFt: 5,
          heightIn: 10,
          goalId: defaultGoal?.id ?? null,
          positionId: defaultPosition?.id ?? null,
          levelId: defaultLevel?.id ?? null,
          workoutDuration: 60,
        });

        // Initialize user progress
        await storage.initUserProgress(defaultUserId);

        // Set default schedule
        const workoutTypes = await storage.getWorkoutTypes();
        const defaultSchedule = [
          { dayOfWeek: 1, workoutTypeCode: "legs_strength" },
          { dayOfWeek: 2, workoutTypeCode: "upper_body" },
          { dayOfWeek: 3, workoutTypeCode: "skills_cardio" },
          { dayOfWeek: 4, workoutTypeCode: "legs_explosive" },
          { dayOfWeek: 5, workoutTypeCode: "full_body" },
          { dayOfWeek: 6, workoutTypeCode: "active_recovery" },
          { dayOfWeek: 0, isRestDay: true },
        ];
        
        const scheduleItems = defaultSchedule.map(item => {
          if (item.isRestDay) {
            return { userId: defaultUserId, dayOfWeek: item.dayOfWeek, workoutTypeId: null, isRestDay: true };
          }
          const wt = workoutTypes.find(w => w.code === item.workoutTypeCode);
          return { userId: defaultUserId, dayOfWeek: item.dayOfWeek, workoutTypeId: wt?.id ?? null, isRestDay: false };
        });
        
        await storage.setUserSchedule(defaultUserId, scheduleItems);
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

      // Add XP to user progress
      await storage.addXpEvent({
        userId: defaultUserId,
        xpAmount: 15,
        eventType: "workout_completed",
        sourceId: log.id,
        description: "Completed workout",
      });
      await storage.updateUserXp(defaultUserId, 15);

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
      
      // Remove XP from user progress
      await storage.addXpEvent({
        userId: defaultUserId,
        xpAmount: -15,
        eventType: "workout_undone",
        sourceId: null,
        description: "Workout undone",
      });
      await storage.updateUserXp(defaultUserId, -15);
      
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
      
      // Enrich logs with mealType code for frontend compatibility
      const mealTypes = await storage.getMealTypes();
      const enrichedLogs = logs.map(log => {
        const mealType = mealTypes.find(mt => mt.id === log.mealTypeId);
        return {
          ...log,
          mealType: mealType?.code || "unknown",
        };
      });
      
      res.json(enrichedLogs);
    } catch (error) {
      console.error("Error fetching meal logs:", error);
      res.status(500).json({ error: "Failed to fetch meal logs" });
    }
  });

  // Upsert meal selection
  app.post("/api/meals", async (req, res) => {
    try {
      const defaultUserId = "default-user";
      const { mealType, mealId, mealName, calories, protein, carbs, fats, customMealId, ...rest } = req.body;
      
      // Resolve mealType code to mealTypeId
      const mealTypes = await storage.getMealTypes();
      const mealTypeRecord = mealTypes.find(mt => mt.code === mealType);
      
      if (!mealTypeRecord) {
        return res.status(400).json({ error: `Invalid meal type: ${mealType}` });
      }

      const data = insertMealLogSchema.parse({
        ...rest,
        userId: defaultUserId,
        mealTypeId: mealTypeRecord.id,
        customMealId: customMealId || null,
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

      // Resolve mealType code to mealTypeId
      const mealTypes = await storage.getMealTypes();
      const mealTypeRecord = mealTypes.find(mt => mt.code === mealType);
      
      if (!mealTypeRecord) {
        return res.status(400).json({ error: "Invalid meal type" });
      }

      const updated = await storage.toggleMealConsumed(defaultUserId, date, mealTypeRecord.id);
      
      if (!updated) {
        return res.status(404).json({ error: "Meal log not found" });
      }

      // Add XP if meal was marked as consumed, remove if unchecked
      if (updated.consumed) {
        await storage.addXpEvent({
          userId: defaultUserId,
          xpAmount: 5,
          eventType: "meal_consumed",
          sourceId: updated.id,
          description: "Meal consumed",
        });
        await storage.updateUserXp(defaultUserId, 5);
      } else {
        await storage.addXpEvent({
          userId: defaultUserId,
          xpAmount: -5,
          eventType: "meal_unchecked",
          sourceId: updated.id,
          description: "Meal unchecked",
        });
        await storage.updateUserXp(defaultUserId, -5);
      }

      res.json(updated);
    } catch (error) {
      console.error("Error toggling meal:", error);
      res.status(500).json({ error: "Failed to toggle meal status" });
    }
  });

  // Get saved custom meals
  app.get("/api/custom-meals", async (req, res) => {
    try {
      const defaultUserId = "default-user";
      const meals = await storage.getCustomMeals(defaultUserId);
      
      // Enrich with mealType code for frontend compatibility
      const mealTypes = await storage.getMealTypes();
      const enrichedMeals = meals.map(meal => {
        const mealType = mealTypes.find(mt => mt.id === meal.mealTypeId);
        return {
          ...meal,
          mealType: mealType?.code || null,
        };
      });
      
      res.json(enrichedMeals);
    } catch (error) {
      console.error("Error fetching custom meals:", error);
      res.status(500).json({ error: "Failed to fetch custom meals" });
    }
  });

  // Save a custom meal
  app.post("/api/custom-meals", async (req, res) => {
    try {
      const defaultUserId = "default-user";
      const { mealType, ...rest } = req.body;
      
      // Resolve mealType code to mealTypeId if provided
      let mealTypeId = null;
      if (mealType) {
        const mealTypes = await storage.getMealTypes();
        const mealTypeRecord = mealTypes.find(mt => mt.code === mealType);
        if (mealTypeRecord) {
          mealTypeId = mealTypeRecord.id;
        }
      }

      const data = insertCustomMealSchema.parse({
        ...rest,
        userId: defaultUserId,
        mealTypeId,
      });

      const meal = await storage.createCustomMeal(data);
      res.json(meal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error saving custom meal:", error);
      res.status(500).json({ error: "Failed to save custom meal" });
    }
  });

  // Promote tier
  app.post("/api/profile/promote", async (req, res) => {
    try {
      const defaultUserId = "default-user";
      
      // Get user progress
      let progress = await storage.getUserProgress(defaultUserId);
      if (!progress) {
        progress = await storage.initUserProgress(defaultUserId);
      }

      // Get tiers from database
      const tiersData = await storage.getTiers();
      const sortedTiers = tiersData.sort((a, b) => a.displayOrder - b.displayOrder);
      
      // Find current tier
      const currentTier = sortedTiers.find(t => t.id === progress!.tierId) || sortedTiers[0];
      
      // Check if XP is enough for promotion (using tier's maxXp)
      if (progress.totalXp < (currentTier?.maxXp || 100)) {
        return res.status(400).json({ error: "Not enough XP to promote" });
      }

      // Find next tier
      const currentIndex = sortedTiers.findIndex(t => t.id === currentTier?.id);
      const nextTier = currentIndex < sortedTiers.length - 1 ? sortedTiers[currentIndex + 1] : currentTier;

      // Update progress: reset XP to 0 and set new tier
      await storage.promoteUserTier(defaultUserId, nextTier.id);

      const updatedProgress = await storage.getUserProgress(defaultUserId);
      res.json(updatedProgress);
    } catch (error) {
      console.error("Error promoting tier:", error);
      res.status(500).json({ error: "Failed to promote tier" });
    }
  });

  // Analyze food image with AI vision
  app.post("/api/analyze-food", async (req, res) => {
    try {
      const { imageBase64 } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Image data required" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this food image and estimate the nutritional content. Provide ONLY a JSON response in this exact format, no other text:
{
  "name": "Name of the food/meal",
  "calories": estimated calories (number),
  "protein": estimated protein in grams (number),
  "carbs": estimated carbs in grams (number),
  "fats": estimated fats in grams (number)
}

Be reasonable with portion sizes. If you cannot identify the food, provide your best guess. Always return valid JSON.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith("data:") 
                    ? imageBase64 
                    : `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
      });

      const content = response.choices[0]?.message?.content || "";
      
      // Parse the JSON response
      try {
        // Extract JSON from response (in case there's extra text)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const nutritionData = JSON.parse(jsonMatch[0]);
          res.json(nutritionData);
        } else {
          res.status(500).json({ error: "Could not parse nutrition data" });
        }
      } catch (parseError) {
        console.error("JSON parse error:", parseError, content);
        res.status(500).json({ error: "Failed to parse nutrition data" });
      }
    } catch (error) {
      console.error("Error analyzing food:", error);
      res.status(500).json({ error: "Failed to analyze food image" });
    }
  });

  // ============================================
  // LOOKUP TABLE ROUTES (3NF)
  // ============================================

  app.get("/api/lookups/goals", async (req, res) => {
    try {
      const data = await storage.getGoals();
      res.json(data);
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.get("/api/lookups/positions", async (req, res) => {
    try {
      const data = await storage.getPositions();
      res.json(data);
    } catch (error) {
      console.error("Error fetching positions:", error);
      res.status(500).json({ error: "Failed to fetch positions" });
    }
  });

  app.get("/api/lookups/levels", async (req, res) => {
    try {
      const data = await storage.getCompetitionLevels();
      res.json(data);
    } catch (error) {
      console.error("Error fetching competition levels:", error);
      res.status(500).json({ error: "Failed to fetch levels" });
    }
  });

  app.get("/api/lookups/tiers", async (req, res) => {
    try {
      const data = await storage.getTiers();
      res.json(data);
    } catch (error) {
      console.error("Error fetching tiers:", error);
      res.status(500).json({ error: "Failed to fetch tiers" });
    }
  });

  app.get("/api/lookups/workout-types", async (req, res) => {
    try {
      const data = await storage.getWorkoutTypes();
      res.json(data);
    } catch (error) {
      console.error("Error fetching workout types:", error);
      res.status(500).json({ error: "Failed to fetch workout types" });
    }
  });

  app.get("/api/lookups/meal-types", async (req, res) => {
    try {
      const data = await storage.getMealTypes();
      res.json(data);
    } catch (error) {
      console.error("Error fetching meal types:", error);
      res.status(500).json({ error: "Failed to fetch meal types" });
    }
  });

  app.get("/api/meal-catalog", async (req, res) => {
    try {
      const mealType = req.query.mealType as string | undefined;
      const data = await storage.getMealCatalog(mealType);
      res.json(data);
    } catch (error) {
      console.error("Error fetching meal catalog:", error);
      res.status(500).json({ error: "Failed to fetch meal catalog" });
    }
  });

  // ============================================
  // XP/PROGRESS ROUTES
  // ============================================

  app.get("/api/progress", async (req, res) => {
    try {
      const defaultUserId = "default-user";
      let progress = await storage.getUserProgress(defaultUserId);
      
      if (!progress) {
        progress = await storage.initUserProgress(defaultUserId);
      }
      
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  app.get("/api/progress/xp-history", async (req, res) => {
    try {
      const defaultUserId = "default-user";
      const limit = parseInt(req.query.limit as string) || 50;
      const events = await storage.getXpEvents(defaultUserId, limit);
      res.json(events);
    } catch (error) {
      console.error("Error fetching XP history:", error);
      res.status(500).json({ error: "Failed to fetch XP history" });
    }
  });

  // ============================================
  // USER SCHEDULE ROUTES
  // ============================================

  app.get("/api/schedule", async (req, res) => {
    try {
      const defaultUserId = "default-user";
      const schedule = await storage.getUserSchedule(defaultUserId);
      res.json(schedule);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      res.status(500).json({ error: "Failed to fetch schedule" });
    }
  });

  app.put("/api/schedule", async (req, res) => {
    try {
      const defaultUserId = "default-user";
      const { schedule } = req.body;
      
      if (!Array.isArray(schedule)) {
        return res.status(400).json({ error: "Schedule must be an array" });
      }
      
      const result = await storage.setUserSchedule(defaultUserId, schedule);
      res.json(result);
    } catch (error) {
      console.error("Error updating schedule:", error);
      res.status(500).json({ error: "Failed to update schedule" });
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
