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
import { setupAuth } from "./auth";

// Initialize OpenAI client only if API key is provided (optional for basic functionality)
const getOpenAIClient = () => {
  if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    return null;
  }
  return new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });
};

const openai = getOpenAIClient();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  // Health check endpoints (for Railway and monitoring)
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
  
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
  
  // Root endpoint for Railway health checks
  app.get("/", (req, res) => {
    res.json({ status: "ok", service: "edge-hockey-api", timestamp: new Date().toISOString() });
  });

  // Get profile for the current session
  app.get("/api/profile", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user?.id;
      
      const profile = await storage.getProfileByUserId(userId);
      
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
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
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user?.id;
      const updates = updateProfileSchema.parse(req.body);
      
      const updated = await storage.updateProfile(userId, updates);
      
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
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user?.id;
      const logs = await storage.getWorkoutLogs(userId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      res.status(500).json({ error: "Failed to fetch workouts" });
    }
  });

  // Log a workout
  app.post("/api/workouts", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user?.id;
      const data = insertWorkoutLogSchema.parse({
        ...req.body,
        userId: userId,
      });

      // Check if workout already logged for this date
      const existing = await storage.getWorkoutLogByDate(userId, data.date);
      if (existing) {
        return res.status(400).json({ error: "Workout already logged for this date" });
      }

      const log = await storage.logWorkout(data);

      // Add XP to user progress
      await storage.addXpEvent({
        userId: userId,
        xpAmount: 15,
        eventType: "workout_completed",
        sourceId: log.id,
        description: "Completed workout",
      });
      await storage.updateUserXp(userId, 15);

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
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user?.id;
      const { date } = req.params;
      
      await storage.deleteWorkoutByDate(userId, date);
      
      // Remove XP from user progress
      await storage.addXpEvent({
        userId: userId,
        xpAmount: -15,
        eventType: "workout_undone",
        sourceId: null,
        description: "Workout undone",
      });
      await storage.updateUserXp(userId, -15);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting workout:", error);
      res.status(500).json({ error: "Failed to delete workout" });
    }
  });

  // Get meal logs for a date
  app.get("/api/meals/:date", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user?.id;
      const { date } = req.params;
      const logs = await storage.getMealLogsForDate(userId, date);
      
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
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user?.id;
      const { mealType, mealId, mealName, calories, protein, carbs, fats, customMealId, ...rest } = req.body;
      
      // Resolve mealType code to mealTypeId
      const mealTypes = await storage.getMealTypes();
      const mealTypeRecord = mealTypes.find(mt => mt.code === mealType);
      
      if (!mealTypeRecord) {
        return res.status(400).json({ error: `Invalid meal type: ${mealType}` });
      }

      const data = insertMealLogSchema.parse({
        ...rest,
        userId: userId,
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
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user?.id;
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

      const updated = await storage.toggleMealConsumed(userId, date, mealTypeRecord.id);
      
      if (!updated) {
        return res.status(404).json({ error: "Meal log not found" });
      }

      // Add XP if meal was marked as consumed, remove if unchecked
      if (updated.consumed) {
        await storage.addXpEvent({
          userId: userId,
          xpAmount: 5,
          eventType: "meal_consumed",
          sourceId: updated.id,
          description: "Meal consumed",
        });
        await storage.updateUserXp(userId, 5);
      } else {
        await storage.addXpEvent({
          userId: userId,
          xpAmount: -5,
          eventType: "meal_unchecked",
          sourceId: updated.id,
          description: "Meal unchecked",
        });
        await storage.updateUserXp(userId, -5);
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
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user?.id;
      const meals = await storage.getCustomMeals(userId);
      
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
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user?.id;
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
        userId: userId,
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
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user?.id;
      
      // Get user progress
      let progress = await storage.getUserProgress(userId);
      if (!progress) {
        progress = await storage.initUserProgress(userId);
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
      await storage.promoteUserTier(userId, nextTier.id);

      const updatedProgress = await storage.getUserProgress(userId);
      res.json(updatedProgress);
    } catch (error) {
      console.error("Error promoting tier:", error);
      res.status(500).json({ error: "Failed to promote tier" });
    }
  });

  // Analyze food image with AI vision
  app.post("/api/analyze-food", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { imageBase64 } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Image data required" });
      }

      if (!openai) {
        return res.status(503).json({ error: "AI features are not available. Please configure OPENAI_API_KEY." });
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
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user?.id;
      let progress = await storage.getUserProgress(userId);
      
      if (!progress) {
        progress = await storage.initUserProgress(userId);
      }
      
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  app.get("/api/progress/xp-history", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 50;
      const events = await storage.getXpEvents(userId, limit);
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
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user?.id;
      const schedule = await storage.getUserSchedule(userId);
      res.json(schedule);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      res.status(500).json({ error: "Failed to fetch schedule" });
    }
  });

  app.put("/api/schedule", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user?.id;
      const { schedule } = req.body;
      
      if (!Array.isArray(schedule)) {
        return res.status(400).json({ error: "Schedule must be an array" });
      }
      
      const result = await storage.setUserSchedule(userId, schedule);
      res.json(result);
    } catch (error) {
      console.error("Error updating schedule:", error);
      res.status(500).json({ error: "Failed to update schedule" });
    }
  });

  // ============================================
  // CUSTOM WORKOUT TYPES ROUTES
  // ============================================

  app.get("/api/custom-workouts", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user?.id;
      const customWorkouts = await storage.getCustomWorkoutTypes(userId);
      res.json(customWorkouts);
    } catch (error) {
      console.error("Error fetching custom workouts:", error);
      res.status(500).json({ error: "Failed to fetch custom workouts" });
    }
  });

  app.post("/api/custom-workouts", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user?.id;
      const { name, categories, day, profile } = req.body;
      
      if (!name || !categories || !Array.isArray(categories) || categories.length === 0) {
        return res.status(400).json({ error: "Name and categories are required" });
      }
      
      const code = 'custom_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_' + Math.random().toString(36).substring(2, 8);
      
      // Generate personalized exercises using AI
      let generatedExercises = null;
      try {
        
        const goalMapping: Record<string, string> = {
          muscle: "building muscle mass with higher volume",
          fatloss: "fat loss with shorter rest periods and circuit-style training",
          maintain: "maintaining current fitness with balanced volume"
        };
        
        const prompt = `Create a personalized workout for a hockey player with these specifications:
- Workout name: ${name}
- Exercise categories to include: ${categories.join(", ")}
- Player position: ${profile?.position || "unknown"}
- Competition level: ${profile?.level || "unknown"}
- Age: ${profile?.age || "unknown"} years old
- Weight: ${profile?.weight || "unknown"} lbs
- Training goal: ${goalMapping[profile?.goal] || "general fitness"}

Generate 5-7 exercises that combine these categories appropriately for a hockey player.
For each exercise, provide: name, sets, reps, rest time, and which category it belongs to.

Return ONLY a JSON array (no markdown, no explanation) in this exact format:
[{"name": "Exercise Name", "sets": "3", "reps": "10", "rest": "60s", "category": "category_name"}]`;

        if (!openai) {
          console.warn("AI features not available - skipping custom workout generation");
          // Continue without AI - will use default exercises
        } else {
          try {
            const completion = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [{ role: "user", content: prompt }],
              max_tokens: 600,
              temperature: 0.7
            });
            
            const responseText = completion.choices[0]?.message?.content?.trim() || "[]";
            try {
              generatedExercises = JSON.parse(responseText);
            } catch {
              console.error("Failed to parse AI response:", responseText);
            }
          } catch (aiError) {
            console.error("AI generation failed:", aiError);
          }
        }
      } catch (error) {
        console.error("Error generating custom workout:", error);
        // Continue without AI-generated exercises
      }
      
      // Create the custom workout with generated exercises
      const newWorkout = await storage.createCustomWorkoutType({
        userId,
        name,
        code,
        categories,
        generatedExercises,
        xpReward: 15
      });
      
      // If a day is specified, update the schedule to use this custom workout
      if (day) {
        const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const dayIndex = dayNames.indexOf(day.toLowerCase());
        
        if (dayIndex !== -1) {
          // Get existing schedule
          const existingSchedule = await storage.getUserSchedule(userId);
          
          // Build new schedule array
          const newSchedule = dayNames.map((_, index) => {
            const existing = existingSchedule.find(s => s.dayOfWeek === index);
            if (index === dayIndex) {
              return {
                dayOfWeek: index,
                workoutTypeId: null,
                customWorkoutTypeId: newWorkout.id,
                isRestDay: false
              };
            }
            return {
              dayOfWeek: index,
              workoutTypeId: existing?.workoutTypeId || null,
              customWorkoutTypeId: existing?.customWorkoutTypeId || null,
              isRestDay: existing?.isRestDay ?? (index === 0 || index === 6)
            };
          });
          
          await storage.setUserSchedule(userId, newSchedule);
        }
      }
      
      res.json(newWorkout);
    } catch (error) {
      console.error("Error creating custom workout:", error);
      res.status(500).json({ error: "Failed to create custom workout" });
    }
  });

  app.delete("/api/custom-workouts/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user?.id;
      const { id } = req.params;
      
      await storage.deleteCustomWorkoutType(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting custom workout:", error);
      res.status(500).json({ error: "Failed to delete custom workout" });
    }
  });

  // AI Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { messages, profile } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array required" });
      }

      // Build player profile section with only defined fields
      let playerProfileSection = "";
      if (profile) {
        const profileParts: string[] = [];
        if (profile.position) profileParts.push(`- Position: ${profile.position}`);
        if (profile.level) profileParts.push(`- Level: ${profile.level}`);
        if (profile.age) profileParts.push(`- Age: ${profile.age} years old`);
        if (profile.weight) profileParts.push(`- Weight: ${profile.weight} lbs`);
        
        if (profileParts.length > 0) {
          playerProfileSection = `PLAYER PROFILE:\n${profileParts.join('\n')}\n\nTailor all advice specifically to this player's position, age, and competition level.`;
        }
      }

      const systemPrompt = `You are Coach AI, an elite hockey training specialist with deep knowledge of player development across all levels from house league to junior. You have expertise from top hockey programs like USA Hockey ADM, Hockey Canada, and elite development academies.

${playerProfileSection}

YOUR EXPERTISE INCLUDES:

1. HOCKEY-SPECIFIC TRAINING:
- Off-ice conditioning for hockey (explosive power, lateral agility, core stability)
- Position-specific training (defensemen need hip mobility and backward skating power; forwards need acceleration and puck protection strength; goalies need flexibility, reflexes, and butterfly recovery)
- Age-appropriate training progressions (younger players: coordination and fun; older: strength and power)
- Periodization around hockey season (pre-season buildup, in-season maintenance, off-season development)

2. SKATING DEVELOPMENT:
- Edge work and balance drills
- Crossovers, transitions, and pivots
- Backward skating technique
- Speed and acceleration mechanics
- Stopping and starting explosiveness

3. SKILL DEVELOPMENT:
- Stickhandling in tight spaces
- Shooting mechanics (wrist shot, snap shot, slap shot, one-timers)
- Passing accuracy and receiving
- Puck protection and body positioning
- Deking and moves

4. NUTRITION FOR YOUNG ATHLETES:
- Pre-game and post-game nutrition
- Hydration strategies
- Protein intake for muscle recovery (0.6-0.8g per lb bodyweight for growing athletes)
- Carbohydrate timing for energy
- Healthy snacks and meal timing around practice

5. MENTAL GAME:
- Pre-game routines and focus
- Building confidence after mistakes
- Handling pressure situations
- Setting hockey goals
- Dealing with setbacks and slumps

6. POSITION-SPECIFIC ADVICE:
- DEFENSE: Gap control, angling, first pass breakouts, shot blocking technique, pinching decisions, defensive positioning, communication
- WING: Forechecking lanes, board battles, net-front presence, cycling, off-puck positioning, backchecking
- CENTER: Faceoff technique, defensive responsibility, playmaking, supporting D in own zone, transition play
- GOALIE: Butterfly technique, rebound control, tracking pucks, positioning, mental focus, flexibility training

RESPONSE GUIDELINES:
- Be encouraging and positive while being specific and actionable
- Use proper hockey terminology but explain if needed for younger players
- Give 2-4 specific, practical tips they can use immediately
- Reference age-appropriate expectations (don't suggest heavy weights for 13-year-olds)
- When discussing exercises, include sets/reps when helpful
- For younger players (under 14), emphasize fun, fundamentals, and coordination over intensity
- Be like a supportive, knowledgeable coach who genuinely cares about their development`;

      if (!openai) {
        return res.status(503).json({ error: "AI chat is not available. Please configure OPENAI_API_KEY." });
      }

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
        max_tokens: 500,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || "I'm having trouble responding right now. Please try again.";

      res.json({ response });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  // Personalized AI workout generation
  app.get("/api/personalized-workout/:workoutType", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user?.id;
      const { workoutType } = req.params;
      const forceRegenerate = req.query.regenerate === "true";
      
      const profile = await storage.getProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      
      // Check for cached workout (unless force regenerate)
      if (!forceRegenerate) {
        const cached = await storage.getPersonalizedWorkout(userId, workoutType);
        if (cached) {
          // Check if profile has changed
          const snapshot = cached.profileSnapshot as any;
          if (snapshot && 
              snapshot.age === profile.age && 
              snapshot.weight === profile.weight &&
              snapshot.position === profile.position &&
              snapshot.level === profile.level &&
              snapshot.goal === profile.goal) {
            return res.json({ exercises: cached.exercises, cached: true });
          }
        }
      }
      
      // Get goals, positions for labels
      const goalsData = await storage.getGoals();
      const positionsData = await storage.getPositions();
      const levelsData = await storage.getCompetitionLevels();
      
      const goal = goalsData.find(g => g.id === profile.goal);
      const position = positionsData.find(p => p.id === profile.position);
      const level = levelsData.find(l => l.id === profile.level);
      
      // Determine weight category for hockey
      const isUnder16 = (profile.age || 16) < 16;
      const positionCode = position?.code || "center";
      
      let optimalWeight = { min: 150, max: 190 };
      if (positionCode === "defense") {
        optimalWeight = isUnder16 ? { min: 140, max: 185 } : { min: 155, max: 200 };
      } else if (positionCode === "goalie") {
        optimalWeight = isUnder16 ? { min: 145, max: 195 } : { min: 160, max: 210 };
      } else {
        optimalWeight = isUnder16 ? { min: 130, max: 170 } : { min: 145, max: 185 };
      }
      
      const weight = profile.weight || 150;
      let weightCategory = "optimal";
      if (weight < optimalWeight.min) weightCategory = "underweight";
      else if (weight > optimalWeight.max) weightCategory = "heavy";
      
      // Generate personalized workout using AI
      const prompt = `Generate a personalized ${workoutType.replace(/_/g, " ")} workout for a hockey player with these characteristics:

PLAYER PROFILE:
- Age: ${profile.age} years old
- Weight: ${weight} lbs (${weightCategory} for position)
- Position: ${position?.name || "Forward"}
- Competition Level: ${level?.name || "Recreational"}
- Training Goal: ${goal?.name || "General fitness"}

WORKOUT TYPE: ${workoutType.replace(/_/g, " ")}

Generate 5-8 exercises that are:
1. Age-appropriate (${(profile.age || 16) < 14 ? "focus on form, lighter weights, no heavy compounds" : (profile.age || 16) < 16 ? "moderate intensity, building foundations" : "can include heavier compound lifts"})
2. Position-specific (${positionCode === "defense" ? "emphasize hip strength, core stability, lateral power" : positionCode === "goalie" ? "emphasize flexibility, lateral movement, reaction training" : "emphasize explosive speed, quick changes of direction"})
3. Goal-aligned (${goal?.code === "muscle" ? "higher volume, progressive overload" : goal?.code === "fat_loss" ? "higher intensity, shorter rest" : "balanced approach"})
4. Hockey-relevant (translate to on-ice performance)

Return ONLY a JSON array with this exact format (no other text):
[
  {"id": "unique_id", "name": "Exercise Name", "sets": "3", "reps": "10", "rest": "90s", "category": "category_name", "notes": "Brief coaching tip"}
]

Categories: legs_compound, legs_explosive, legs_hinge, legs_unilateral, upper_push, upper_pull, core, mobility, shoulders, calves, isolation_bicep, isolation_tricep`;

      if (!openai) {
        return res.status(503).json({ error: "AI workout generation is not available. Please configure OPENAI_API_KEY." });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      });

      let exercises = [];
      try {
        const content = completion.choices[0]?.message?.content || "[]";
        // Extract JSON from response (in case there's extra text)
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          exercises = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error("Failed to parse AI workout response:", parseError);
        return res.status(500).json({ error: "Failed to generate workout" });
      }

      // Save to cache
      const profileSnapshot = {
        age: profile.age,
        weight: profile.weight,
        position: profile.position,
        level: profile.level,
        goal: profile.goal
      };
      
      await storage.savePersonalizedWorkout(userId, workoutType, exercises, profileSnapshot);

      res.json({ exercises, cached: false });
    } catch (error) {
      console.error("Error generating personalized workout:", error);
      res.status(500).json({ error: "Failed to generate personalized workout" });
    }
  });

  // Puck shots routes
  app.get("/api/puck-shots/:date", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user?.id;
      const { date } = req.params;
      
      const shots = await storage.getPuckShots(userId, date);
      // Calculate high score from completed days only (excludes today)
      const highScoreData = await storage.calculateHighScoreFromHistory(userId, date);
      res.json({ 
        count: shots?.count || 0,
        highScore: highScoreData.highScore,
        highScoreDate: highScoreData.highScoreDate
      });
    } catch (error) {
      console.error("Error fetching puck shots:", error);
      res.status(500).json({ error: "Failed to fetch puck shots" });
    }
  });

  app.put("/api/puck-shots", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user?.id;
      const { date, count } = req.body;
      
      // Only update today's count - don't touch high score until day is complete
      const shots = await storage.upsertPuckShots(userId, date, count);
      // Return high score from completed days only (excludes today)
      const highScoreData = await storage.calculateHighScoreFromHistory(userId, date);
      res.json({ 
        count: shots.count,
        highScore: highScoreData.highScore,
        highScoreDate: highScoreData.highScoreDate
      });
    } catch (error) {
      console.error("Error updating puck shots:", error);
      res.status(500).json({ error: "Failed to update puck shots" });
    }
  });

  // Recommended schedule routes
  app.get("/api/schedule/recommended", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user?.id;
      
      const profile = await storage.getProfileByUserId(userId);
      const workoutTypesData = await storage.getWorkoutTypes();
      
      // Generate recommended schedule based on profile
      const recommended = generateRecommendedSchedule(profile, workoutTypesData);
      
      res.json(recommended);
    } catch (error) {
      console.error("Error fetching recommended schedule:", error);
      res.status(500).json({ error: "Failed to fetch recommended schedule" });
    }
  });

  app.post("/api/schedule/apply-recommended", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user?.id;
      
      const profile = await storage.getProfileByUserId(userId);
      const workoutTypesData = await storage.getWorkoutTypes();
      
      // Generate recommended schedule based on profile
      const recommended = generateRecommendedSchedule(profile, workoutTypesData);
      
      // Apply the schedule
      const updated = await storage.setUserSchedule(userId, recommended);
      
      res.json(updated);
    } catch (error) {
      console.error("Error applying recommended schedule:", error);
      res.status(500).json({ error: "Failed to apply recommended schedule" });
    }
  });

  return httpServer;
}

// Helper to generate recommended schedule based on user profile
// Optimized for hockey players based on sports science research:
// - 2-4 leg sessions per week with both strength AND explosive work
// - Upper body integrated (push/pull together) for hockey-specific power
// - Hockey-specific cardio and skills work
// - Proper recovery for performance
// - Weight considerations for injury prevention and optimal gains
function generateRecommendedSchedule(profile: any, workoutTypes: any[]) {
  const getWorkoutTypeId = (code: string) => {
    const wt = workoutTypes.find(w => w.code === code);
    return wt?.id || null;
  };
  
  const isGoalie = profile?.positionId === 4;
  const age = profile?.age || 16;
  const goalId = profile?.goalId || 3; // Default to maintain
  const weight = profile?.weight || 150;
  const positionId = profile?.positionId || 1;
  
  // Weight categories by position (adjusted for youth if under 16)
  // These determine if player needs more strength work (underweight) or more conditioning (heavy)
  const ageAdjust = age < 16 ? -15 : 0;
  let optimalWeightRange: { min: number; max: number };
  
  if (isGoalie) {
    optimalWeightRange = { min: 160 + ageAdjust, max: 210 + ageAdjust };
  } else if (positionId === 1) { // Defense - typically heavier
    optimalWeightRange = { min: 155 + ageAdjust, max: 200 + ageAdjust };
  } else { // Forwards (wing, center)
    optimalWeightRange = { min: 145 + ageAdjust, max: 185 + ageAdjust };
  }
  
  const isUnderweight = weight < optimalWeightRange.min;
  const isHeavy = weight > optimalWeightRange.max;
  
  // Optimal hockey training split (based on research):
  // - Legs need BOTH strength AND explosive training for skating power
  // - Upper body combined for hockey-specific movements
  // - Skills/cardio for conditioning
  // - Active recovery for mobility and injury prevention
  // - Underweight players: extra strength focus
  // - Heavy players: more conditioning, less plyometric stress
  
  let schedule;
  
  if (goalId === 1) {
    // MUSCLE BUILDING: More volume, still hockey-focused
    // 2 leg days, 3 upper days, 1 conditioning, 1 recovery
    schedule = [
      { dayOfWeek: 0, workoutTypeId: getWorkoutTypeId("rest"), customWorkoutTypeId: null, isRestDay: true },
      { dayOfWeek: 1, workoutTypeId: getWorkoutTypeId("legs_strength"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 2, workoutTypeId: getWorkoutTypeId("chest_triceps"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 3, workoutTypeId: getWorkoutTypeId("legs_explosive"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 4, workoutTypeId: getWorkoutTypeId("back_biceps"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 5, workoutTypeId: getWorkoutTypeId("upper_body"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 6, workoutTypeId: getWorkoutTypeId("active_recovery"), customWorkoutTypeId: null, isRestDay: false },
    ];
  } else if (goalId === 2) {
    // FAT LOSS: High frequency, metabolic focus
    // Full body sessions + cardio for calorie burn
    schedule = [
      { dayOfWeek: 0, workoutTypeId: getWorkoutTypeId("active_recovery"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 1, workoutTypeId: getWorkoutTypeId("full_body"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 2, workoutTypeId: getWorkoutTypeId("skills_cardio"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 3, workoutTypeId: getWorkoutTypeId("legs_explosive"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 4, workoutTypeId: getWorkoutTypeId("cardio"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 5, workoutTypeId: getWorkoutTypeId("full_body"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 6, workoutTypeId: getWorkoutTypeId("rest"), customWorkoutTypeId: null, isRestDay: true },
    ];
  } else {
    // MAINTAIN / DEFAULT: Optimal hockey performance split
    // Balanced approach with explosive legs, integrated upper body, skills
    schedule = [
      { dayOfWeek: 0, workoutTypeId: getWorkoutTypeId("rest"), customWorkoutTypeId: null, isRestDay: true },
      { dayOfWeek: 1, workoutTypeId: getWorkoutTypeId("legs_strength"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 2, workoutTypeId: getWorkoutTypeId("upper_body"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 3, workoutTypeId: getWorkoutTypeId("skills_cardio"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 4, workoutTypeId: getWorkoutTypeId("legs_explosive"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 5, workoutTypeId: getWorkoutTypeId("upper_body"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 6, workoutTypeId: getWorkoutTypeId("active_recovery"), customWorkoutTypeId: null, isRestDay: false },
    ];
  }
  
  // Goalie-specific adjustments: More core, mobility, reaction work
  if (isGoalie) {
    // Goalies need more recovery, flexibility, and reaction training
    schedule[3] = { dayOfWeek: 3, workoutTypeId: getWorkoutTypeId("active_recovery"), customWorkoutTypeId: null, isRestDay: false };
    schedule[5] = { dayOfWeek: 5, workoutTypeId: getWorkoutTypeId("full_body"), customWorkoutTypeId: null, isRestDay: false };
  }
  
  // Age-based adjustments for proper development
  if (age < 14) {
    // Young players (under 14): More recovery, less intensity
    // Focus on coordination and fundamentals, not heavy lifting
    // But keep strength work if they're underweight and trying to build muscle
    if (!isUnderweight) {
      schedule[3] = { dayOfWeek: 3, workoutTypeId: getWorkoutTypeId("active_recovery"), customWorkoutTypeId: null, isRestDay: false };
    }
    schedule[4] = { dayOfWeek: 4, workoutTypeId: getWorkoutTypeId("skills_cardio"), customWorkoutTypeId: null, isRestDay: false };
  } else if (age >= 14 && age < 16) {
    // Teen players (14-15): Building foundation with some explosive work
    // Keep one extra recovery day
    schedule[6] = { dayOfWeek: 6, workoutTypeId: getWorkoutTypeId("recovery"), customWorkoutTypeId: null, isRestDay: false };
  }
  // 16+ gets the full recommended split
  
  // Weight-based adjustments (applied after age/goal adjustments)
  if (isUnderweight) {
    // Underweight players need more strength focus to build mass
    // Replace one cardio/skills day with strength if present
    const skillsIndex = schedule.findIndex(s => 
      s.workoutTypeId === getWorkoutTypeId("skills_cardio") || 
      s.workoutTypeId === getWorkoutTypeId("cardio")
    );
    if (skillsIndex !== -1 && skillsIndex !== 0) {
      // Replace with legs strength for underweight - they need mass
      schedule[skillsIndex] = { 
        dayOfWeek: skillsIndex, 
        workoutTypeId: getWorkoutTypeId("legs_strength"), 
        customWorkoutTypeId: null, 
        isRestDay: false 
      };
    }
  } else if (isHeavy) {
    // Heavy players need more conditioning, less plyometric stress on joints
    // Replace explosive legs with regular cardio or full body
    const explosiveIndex = schedule.findIndex(s => 
      s.workoutTypeId === getWorkoutTypeId("legs_explosive")
    );
    if (explosiveIndex !== -1) {
      schedule[explosiveIndex] = { 
        dayOfWeek: explosiveIndex, 
        workoutTypeId: getWorkoutTypeId("cardio"), 
        customWorkoutTypeId: null, 
        isRestDay: false 
      };
    }
    // Add extra recovery
    const upperIndex = schedule.findIndex(s => 
      s.workoutTypeId === getWorkoutTypeId("upper_body") && s.dayOfWeek >= 4
    );
    if (upperIndex !== -1) {
      schedule[upperIndex] = { 
        dayOfWeek: upperIndex, 
        workoutTypeId: getWorkoutTypeId("active_recovery"), 
        customWorkoutTypeId: null, 
        isRestDay: false 
      };
    }
  }
  
  return schedule;
}
