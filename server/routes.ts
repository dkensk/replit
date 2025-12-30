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

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

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

  // Puck shots routes
  app.get("/api/puck-shots/:date", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = req.user?.id;
      const { date } = req.params;
      
      const shots = await storage.getPuckShots(userId, date);
      const highScore = await storage.getPuckShotHighScore(userId);
      res.json({ 
        count: shots?.count || 0,
        highScore: highScore?.highScore || 0,
        highScoreDate: highScore?.highScoreDate || null
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
      
      const shots = await storage.upsertPuckShots(userId, date, count);
      // Update high score if this is a new record
      const highScore = await storage.updatePuckShotHighScore(userId, count, date);
      res.json({ 
        count: shots.count,
        highScore: highScore.highScore,
        highScoreDate: highScore.highScoreDate
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
function generateRecommendedSchedule(profile: any, workoutTypes: any[]) {
  const getWorkoutTypeId = (code: string) => {
    const wt = workoutTypes.find(w => w.code === code);
    return wt?.id || null;
  };
  
  // Default balanced schedule for most players
  let schedule = [
    { dayOfWeek: 0, workoutTypeId: getWorkoutTypeId("rest"), customWorkoutTypeId: null, isRestDay: true },
    { dayOfWeek: 1, workoutTypeId: getWorkoutTypeId("legs_strength"), customWorkoutTypeId: null, isRestDay: false },
    { dayOfWeek: 2, workoutTypeId: getWorkoutTypeId("upper_push"), customWorkoutTypeId: null, isRestDay: false },
    { dayOfWeek: 3, workoutTypeId: getWorkoutTypeId("cardio"), customWorkoutTypeId: null, isRestDay: false },
    { dayOfWeek: 4, workoutTypeId: getWorkoutTypeId("upper_pull"), customWorkoutTypeId: null, isRestDay: false },
    { dayOfWeek: 5, workoutTypeId: getWorkoutTypeId("legs_explosive"), customWorkoutTypeId: null, isRestDay: false },
    { dayOfWeek: 6, workoutTypeId: getWorkoutTypeId("active_recovery"), customWorkoutTypeId: null, isRestDay: false },
  ];
  
  // Adjust based on goal
  if (profile?.goalId === 1) { // Muscle building
    schedule = [
      { dayOfWeek: 0, workoutTypeId: getWorkoutTypeId("rest"), customWorkoutTypeId: null, isRestDay: true },
      { dayOfWeek: 1, workoutTypeId: getWorkoutTypeId("legs_strength"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 2, workoutTypeId: getWorkoutTypeId("chest_triceps"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 3, workoutTypeId: getWorkoutTypeId("back_biceps"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 4, workoutTypeId: getWorkoutTypeId("legs_explosive"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 5, workoutTypeId: getWorkoutTypeId("upper_body"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 6, workoutTypeId: getWorkoutTypeId("active_recovery"), customWorkoutTypeId: null, isRestDay: false },
    ];
  } else if (profile?.goalId === 2) { // Fat loss
    schedule = [
      { dayOfWeek: 0, workoutTypeId: getWorkoutTypeId("rest"), customWorkoutTypeId: null, isRestDay: true },
      { dayOfWeek: 1, workoutTypeId: getWorkoutTypeId("full_body"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 2, workoutTypeId: getWorkoutTypeId("cardio"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 3, workoutTypeId: getWorkoutTypeId("full_body"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 4, workoutTypeId: getWorkoutTypeId("skills_cardio"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 5, workoutTypeId: getWorkoutTypeId("full_body"), customWorkoutTypeId: null, isRestDay: false },
      { dayOfWeek: 6, workoutTypeId: getWorkoutTypeId("active_recovery"), customWorkoutTypeId: null, isRestDay: false },
    ];
  }
  
  // Adjust for younger players (more recovery days)
  if (profile?.age && profile.age < 14) {
    // Replace one workout day with recovery for young players
    schedule[3] = { dayOfWeek: 3, workoutTypeId: getWorkoutTypeId("recovery"), customWorkoutTypeId: null, isRestDay: false };
  }
  
  return schedule;
}
