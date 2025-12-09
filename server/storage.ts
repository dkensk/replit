import { 
  type User, 
  type InsertUser,
  type Profile,
  type InsertProfile,
  type UpdateProfile,
  type WorkoutLog,
  type InsertWorkoutLog,
  type MealLog,
  type InsertMealLog,
  type CustomMeal,
  type InsertCustomMeal,
  users,
  profiles,
  workoutLogs,
  mealLogs,
  customMeals
} from "@shared/schema";
import { db } from "../db/index";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Profile methods
  getProfileByUserId(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, updates: UpdateProfile): Promise<Profile | undefined>;
  
  // Workout log methods
  getWorkoutLogs(userId: string): Promise<WorkoutLog[]>;
  logWorkout(log: InsertWorkoutLog): Promise<WorkoutLog>;
  getWorkoutLogByDate(userId: string, date: string): Promise<WorkoutLog | undefined>;
  deleteWorkoutByDate(userId: string, date: string): Promise<boolean>;
  
  // Meal log methods
  getMealLogsForDate(userId: string, date: string): Promise<MealLog[]>;
  upsertMealLog(log: InsertMealLog): Promise<MealLog>;
  toggleMealConsumed(userId: string, date: string, mealType: string): Promise<MealLog | undefined>;
  
  // Custom meal methods
  getCustomMeals(userId: string): Promise<CustomMeal[]>;
  createCustomMeal(meal: InsertCustomMeal): Promise<CustomMeal>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Profile methods
  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [newProfile] = await db.insert(profiles).values(profile).returning();
    return newProfile;
  }

  async updateProfile(userId: string, updates: UpdateProfile): Promise<Profile | undefined> {
    const [updated] = await db
      .update(profiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return updated;
  }

  // Workout log methods
  async getWorkoutLogs(userId: string): Promise<WorkoutLog[]> {
    return await db.select().from(workoutLogs).where(eq(workoutLogs.userId, userId));
  }

  async logWorkout(log: InsertWorkoutLog): Promise<WorkoutLog> {
    const [workoutLog] = await db.insert(workoutLogs).values(log).returning();
    return workoutLog;
  }

  async getWorkoutLogByDate(userId: string, date: string): Promise<WorkoutLog | undefined> {
    const [log] = await db
      .select()
      .from(workoutLogs)
      .where(and(eq(workoutLogs.userId, userId), eq(workoutLogs.date, date)));
    return log;
  }

  async deleteWorkoutByDate(userId: string, date: string): Promise<boolean> {
    const result = await db
      .delete(workoutLogs)
      .where(and(eq(workoutLogs.userId, userId), eq(workoutLogs.date, date)));
    return true;
  }

  // Meal log methods
  async getMealLogsForDate(userId: string, date: string): Promise<MealLog[]> {
    return await db
      .select()
      .from(mealLogs)
      .where(and(eq(mealLogs.userId, userId), eq(mealLogs.date, date)));
  }

  async upsertMealLog(log: InsertMealLog): Promise<MealLog> {
    const existing = await db
      .select()
      .from(mealLogs)
      .where(
        and(
          eq(mealLogs.userId, log.userId),
          eq(mealLogs.date, log.date),
          eq(mealLogs.mealType, log.mealType)
        )
      );

    if (existing.length > 0) {
      const [updated] = await db
        .update(mealLogs)
        .set({ 
          mealId: log.mealId, 
          consumed: log.consumed,
          mealName: log.mealName,
          calories: log.calories,
          protein: log.protein,
          carbs: log.carbs,
          fats: log.fats,
        })
        .where(eq(mealLogs.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [newLog] = await db.insert(mealLogs).values(log).returning();
      return newLog;
    }
  }

  async toggleMealConsumed(userId: string, date: string, mealType: string): Promise<MealLog | undefined> {
    const [existing] = await db
      .select()
      .from(mealLogs)
      .where(
        and(
          eq(mealLogs.userId, userId),
          eq(mealLogs.date, date),
          eq(mealLogs.mealType, mealType)
        )
      );

    if (existing) {
      const [updated] = await db
        .update(mealLogs)
        .set({ consumed: !existing.consumed })
        .where(eq(mealLogs.id, existing.id))
        .returning();
      return updated;
    }
    return undefined;
  }

  // Custom meal methods
  async getCustomMeals(userId: string): Promise<CustomMeal[]> {
    return await db
      .select()
      .from(customMeals)
      .where(eq(customMeals.userId, userId))
      .orderBy(desc(customMeals.createdAt));
  }

  async createCustomMeal(meal: InsertCustomMeal): Promise<CustomMeal> {
    const [newMeal] = await db.insert(customMeals).values(meal).returning();
    return newMeal;
  }
}

export const storage = new DatabaseStorage();
