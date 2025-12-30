import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, serial, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// LOOKUP/REFERENCE TABLES (3NF)
// ============================================

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // muscle, fatloss, maintain
  label: text("label").notNull(),
  description: text("description"),
});

export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // defense, wing, center, goalie
  label: text("label").notNull(),
  description: text("description"),
});

export const competitionLevels = pgTable("competition_levels", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // house, a, aa, aaa, junior
  label: text("label").notNull(),
  activityMultiplier: real("activity_multiplier").notNull().default(1.65),
  description: text("description"),
});

export const tiers = pgTable("tiers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // Bronze, Silver, Gold, Diamond, Elite
  minXp: integer("min_xp").notNull().default(0),
  maxXp: integer("max_xp").notNull().default(100),
  displayOrder: integer("display_order").notNull().default(0),
  perks: text("perks"), // JSON string of perks
});

export const workoutTypes = pgTable("workout_types", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // legs_strength, upper_body, etc.
  name: text("name").notNull(),
  focusArea: text("focus_area"), // legs, upper, cardio, recovery
  description: text("description"),
  xpReward: integer("xp_reward").notNull().default(15),
});

export const mealTypes = pgTable("meal_types", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // breakfast, lunch, snack, dinner
  name: text("name").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
});

// ============================================
// MEAL CATALOG (3NF - Master meal data)
// ============================================

export const mealCatalog = pgTable("meal_catalog", {
  id: serial("id").primaryKey(),
  mealTypeId: integer("meal_type_id").references(() => mealTypes.id),
  code: text("code").notNull().unique(), // oatmeal, chicken_rice, etc.
  name: text("name").notNull(),
  description: text("description"),
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull(),
  carbs: integer("carbs").notNull(),
  fats: integer("fats").notNull(),
  recipe: text("recipe"),
  isActive: boolean("is_active").notNull().default(true),
});

// ============================================
// USER TABLES
// ============================================

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name"),
  age: integer("age").notNull().default(13),
  weight: integer("weight").notNull().default(100), // lbs
  heightFt: integer("height_ft").notNull().default(5),
  heightIn: integer("height_in").notNull().default(0),
  goalId: integer("goal_id").references(() => goals.id),
  positionId: integer("position_id").references(() => positions.id),
  levelId: integer("level_id").references(() => competitionLevels.id),
  workoutDuration: integer("workout_duration").notNull().default(60),
  livebarnConnected: boolean("livebarn_connected").notNull().default(false),
  livebarnRink: text("livebarn_rink"),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workoutLogs = pgTable("workout_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD format
  workoutTypeId: integer("workout_type_id").references(() => workoutTypes.id),
  xpEarned: integer("xp_earned").notNull().default(15),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mealLogs = pgTable("meal_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD format
  mealTypeId: integer("meal_type_id").references(() => mealTypes.id),
  mealCatalogId: integer("meal_catalog_id").references(() => mealCatalog.id),
  customMealId: varchar("custom_meal_id").references(() => customMeals.id),
  consumed: boolean("consumed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customMeals = pgTable("custom_meals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull(),
  carbs: integer("carbs").notNull(),
  fats: integer("fats").notNull(),
  mealTypeId: integer("meal_type_id").references(() => mealTypes.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Custom user-defined workout types
export const customWorkoutTypes = pgTable("custom_workout_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  code: text("code").notNull(),
  categories: text("categories").array().notNull(), // Array of exercise category keys
  generatedExercises: jsonb("generated_exercises"), // AI-generated exercises based on categories and user stats
  xpReward: integer("xp_reward").notNull().default(15),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// USER WORKOUT SCHEDULE (3NF - Replaces JSONB)
// ============================================

export const userWorkoutSchedule = pgTable("user_workout_schedule", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sunday, 1=Monday, etc.
  workoutTypeId: integer("workout_type_id").references(() => workoutTypes.id),
  customWorkoutTypeId: varchar("custom_workout_type_id").references(() => customWorkoutTypes.id, { onDelete: "set null" }),
  isRestDay: boolean("is_rest_day").notNull().default(false),
});

// ============================================
// XP/PROGRESS TRACKING (3NF)
// ============================================

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  totalXp: integer("total_xp").notNull().default(0),
  tierId: integer("tier_id").references(() => tiers.id),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActivityDate: text("last_activity_date"), // YYYY-MM-DD
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const xpEvents = pgTable("xp_events", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  xpAmount: integer("xp_amount").notNull(),
  eventType: text("event_type").notNull(), // workout_completed, meal_logged, streak_bonus, etc.
  sourceId: varchar("source_id"), // ID of the workout/meal that generated this XP
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Puck shot counter for daily tracking
export const puckShots = pgTable("puck_shots", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD format
  count: integer("count").notNull().default(0),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  updatedAt: true,
});

export const insertWorkoutLogSchema = createInsertSchema(workoutLogs).omit({
  id: true,
  createdAt: true,
});

export const insertMealLogSchema = createInsertSchema(mealLogs).omit({
  id: true,
  createdAt: true,
});

export const insertCustomMealSchema = createInsertSchema(customMeals).omit({
  id: true,
  createdAt: true,
});

export const insertCustomWorkoutTypeSchema = createInsertSchema(customWorkoutTypes).omit({
  id: true,
  createdAt: true,
});

export const updateProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  userId: true,
  updatedAt: true,
}).partial();

// Lookup table insert schemas
export const insertGoalSchema = createInsertSchema(goals).omit({ id: true });
export const insertPositionSchema = createInsertSchema(positions).omit({ id: true });
export const insertCompetitionLevelSchema = createInsertSchema(competitionLevels).omit({ id: true });
export const insertTierSchema = createInsertSchema(tiers).omit({ id: true });
export const insertWorkoutTypeSchema = createInsertSchema(workoutTypes).omit({ id: true });
export const insertMealTypeSchema = createInsertSchema(mealTypes).omit({ id: true });
export const insertMealCatalogSchema = createInsertSchema(mealCatalog).omit({ id: true });

// 3NF tables insert schemas
export const insertUserWorkoutScheduleSchema = createInsertSchema(userWorkoutSchedule).omit({ id: true });
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true, updatedAt: true });
export const insertXpEventSchema = createInsertSchema(xpEvents).omit({ id: true, createdAt: true });
export const insertPuckShotsSchema = createInsertSchema(puckShots).omit({ id: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertWorkoutLog = z.infer<typeof insertWorkoutLogSchema>;
export type WorkoutLog = typeof workoutLogs.$inferSelect;
export type InsertMealLog = z.infer<typeof insertMealLogSchema>;
export type MealLog = typeof mealLogs.$inferSelect;
export type InsertCustomMeal = z.infer<typeof insertCustomMealSchema>;
export type CustomMeal = typeof customMeals.$inferSelect;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type InsertCustomWorkoutType = z.infer<typeof insertCustomWorkoutTypeSchema>;
export type CustomWorkoutType = typeof customWorkoutTypes.$inferSelect;

// Lookup table types
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Position = typeof positions.$inferSelect;
export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type CompetitionLevel = typeof competitionLevels.$inferSelect;
export type InsertCompetitionLevel = z.infer<typeof insertCompetitionLevelSchema>;
export type Tier = typeof tiers.$inferSelect;
export type InsertTier = z.infer<typeof insertTierSchema>;
export type WorkoutType = typeof workoutTypes.$inferSelect;
export type InsertWorkoutType = z.infer<typeof insertWorkoutTypeSchema>;
export type MealType = typeof mealTypes.$inferSelect;
export type InsertMealType = z.infer<typeof insertMealTypeSchema>;
export type MealCatalogItem = typeof mealCatalog.$inferSelect;
export type InsertMealCatalogItem = z.infer<typeof insertMealCatalogSchema>;

// 3NF table types
export type UserWorkoutSchedule = typeof userWorkoutSchedule.$inferSelect;
export type InsertUserWorkoutSchedule = z.infer<typeof insertUserWorkoutScheduleSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type XpEvent = typeof xpEvents.$inferSelect;
export type InsertXpEvent = z.infer<typeof insertXpEventSchema>;
export type PuckShots = typeof puckShots.$inferSelect;
export type InsertPuckShots = z.infer<typeof insertPuckShotsSchema>;
