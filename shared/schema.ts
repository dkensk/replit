import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  age: integer("age").notNull(),
  weight: integer("weight").notNull(), // lbs
  heightFt: integer("height_ft").notNull(),
  heightIn: integer("height_in").notNull(),
  goal: text("goal").notNull(), // muscle | fatloss | maintain
  position: text("position").notNull(), // defense | wing | center | goalie
  level: text("level").notNull(), // house | a | aa | aaa | junior
  schedule: jsonb("schedule").notNull().$type<Record<string, string>>(), // weekly schedule
  workoutDuration: integer("workout_duration").notNull().default(60),
  xp: integer("xp").notNull().default(0),
  tier: text("tier").notNull().default("Bronze"), // Bronze | Silver | Gold | Diamond | Elite
  livebarnConnected: boolean("livebarn_connected").notNull().default(false),
  livebarnRink: text("livebarn_rink"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workoutLogs = pgTable("workout_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD format
  workoutType: text("workout_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mealLogs = pgTable("meal_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD format
  mealType: text("meal_type").notNull(), // breakfast | lunch | snack | dinner
  mealId: text("meal_id").notNull(), // oatmeal | chicken_rice | etc.
  consumed: boolean("consumed").notNull().default(false),
  mealName: text("meal_name"), // Store meal name for custom meals
  calories: integer("calories"), // Store macros for custom meals
  protein: integer("protein"),
  carbs: integer("carbs"),
  fats: integer("fats"),
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
  mealType: text("meal_type").notNull(), // breakfast | lunch | snack | dinner
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

export const updateProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  userId: true,
  updatedAt: true,
}).partial();

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
