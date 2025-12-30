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
  type CustomWorkoutType,
  type InsertCustomWorkoutType,
  type Goal,
  type Position,
  type CompetitionLevel,
  type Tier,
  type WorkoutType,
  type MealType,
  type MealCatalogItem,
  type UserWorkoutSchedule,
  type InsertUserWorkoutSchedule,
  type UserProgress,
  type InsertUserProgress,
  type XpEvent,
  type InsertXpEvent,
  users,
  profiles,
  workoutLogs,
  mealLogs,
  customMeals,
  customWorkoutTypes,
  goals,
  positions,
  competitionLevels,
  tiers,
  workoutTypes,
  mealTypes,
  mealCatalog,
  userWorkoutSchedule,
  userProgress,
  xpEvents
} from "@shared/schema";
import { db, pool } from "../db/index";
import { eq, and, desc, asc, gte, lte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

export interface IStorage {
  // Session store
  sessionStore: session.Store;

  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: { username?: string; password?: string }): Promise<User | undefined>;
  
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
  toggleMealConsumed(userId: string, date: string, mealTypeId: number): Promise<MealLog | undefined>;
  
  // Custom meal methods
  getCustomMeals(userId: string): Promise<CustomMeal[]>;
  createCustomMeal(meal: InsertCustomMeal): Promise<CustomMeal>;

  // Custom workout type methods
  getCustomWorkoutTypes(userId: string): Promise<CustomWorkoutType[]>;
  createCustomWorkoutType(workout: InsertCustomWorkoutType): Promise<CustomWorkoutType>;
  deleteCustomWorkoutType(id: string, userId: string): Promise<boolean>;

  // Lookup table methods
  getGoals(): Promise<Goal[]>;
  getPositions(): Promise<Position[]>;
  getCompetitionLevels(): Promise<CompetitionLevel[]>;
  getTiers(): Promise<Tier[]>;
  getWorkoutTypes(): Promise<WorkoutType[]>;
  getMealTypes(): Promise<MealType[]>;
  getMealCatalog(mealTypeCode?: string): Promise<MealCatalogItem[]>;

  // User workout schedule methods
  getUserSchedule(userId: string): Promise<UserWorkoutSchedule[]>;
  setUserSchedule(userId: string, schedule: Omit<InsertUserWorkoutSchedule, 'userId'>[]): Promise<UserWorkoutSchedule[]>;

  // XP and progress methods
  getUserProgress(userId: string): Promise<UserProgress | undefined>;
  initUserProgress(userId: string): Promise<UserProgress>;
  addXpEvent(event: InsertXpEvent): Promise<XpEvent>;
  getXpEvents(userId: string, limit?: number): Promise<XpEvent[]>;
  updateUserXp(userId: string, xpChange: number): Promise<UserProgress | undefined>;
  promoteUserTier(userId: string, newTierId: number): Promise<UserProgress | undefined>;
}

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

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

  async updateUser(id: string, updates: { username?: string; password?: string }): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
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
    if (!log.mealTypeId) {
      throw new Error("mealTypeId is required");
    }
    
    const existing = await db
      .select()
      .from(mealLogs)
      .where(
        and(
          eq(mealLogs.userId, log.userId),
          eq(mealLogs.date, log.date),
          eq(mealLogs.mealTypeId, log.mealTypeId)
        )
      )
      .orderBy(asc(mealLogs.createdAt));

    if (existing.length > 0) {
      // Delete any duplicates (keep only the first one)
      if (existing.length > 1) {
        const idsToDelete = existing.slice(1).map(e => e.id);
        for (const id of idsToDelete) {
          await db.delete(mealLogs).where(eq(mealLogs.id, id));
        }
      }
      
      const [updated] = await db
        .update(mealLogs)
        .set({ 
          mealCatalogId: log.mealCatalogId,
          customMealId: log.customMealId,
          consumed: log.consumed,
        })
        .where(eq(mealLogs.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [newLog] = await db.insert(mealLogs).values(log).returning();
      return newLog;
    }
  }

  async toggleMealConsumed(userId: string, date: string, mealTypeId: number): Promise<MealLog | undefined> {
    const [existing] = await db
      .select()
      .from(mealLogs)
      .where(
        and(
          eq(mealLogs.userId, userId),
          eq(mealLogs.date, date),
          eq(mealLogs.mealTypeId, mealTypeId)
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

  // Custom workout type methods
  async getCustomWorkoutTypes(userId: string): Promise<CustomWorkoutType[]> {
    return await db.select().from(customWorkoutTypes).where(eq(customWorkoutTypes.userId, userId));
  }

  async createCustomWorkoutType(workout: InsertCustomWorkoutType): Promise<CustomWorkoutType> {
    const [newWorkout] = await db.insert(customWorkoutTypes).values(workout).returning();
    return newWorkout;
  }

  async deleteCustomWorkoutType(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(customWorkoutTypes)
      .where(and(eq(customWorkoutTypes.id, id), eq(customWorkoutTypes.userId, userId)));
    return true;
  }

  // Lookup table methods
  async getGoals(): Promise<Goal[]> {
    return await db.select().from(goals);
  }

  async getPositions(): Promise<Position[]> {
    return await db.select().from(positions);
  }

  async getCompetitionLevels(): Promise<CompetitionLevel[]> {
    return await db.select().from(competitionLevels);
  }

  async getTiers(): Promise<Tier[]> {
    return await db.select().from(tiers).orderBy(asc(tiers.displayOrder));
  }

  async getWorkoutTypes(): Promise<WorkoutType[]> {
    return await db.select().from(workoutTypes);
  }

  async getMealTypes(): Promise<MealType[]> {
    return await db.select().from(mealTypes).orderBy(asc(mealTypes.displayOrder));
  }

  async getMealCatalog(mealTypeCode?: string): Promise<MealCatalogItem[]> {
    if (mealTypeCode) {
      const mealType = await db.select().from(mealTypes).where(eq(mealTypes.code, mealTypeCode));
      if (mealType.length > 0) {
        return await db.select().from(mealCatalog)
          .where(and(eq(mealCatalog.mealTypeId, mealType[0].id), eq(mealCatalog.isActive, true)));
      }
      return [];
    }
    return await db.select().from(mealCatalog).where(eq(mealCatalog.isActive, true));
  }

  // User workout schedule methods
  async getUserSchedule(userId: string): Promise<UserWorkoutSchedule[]> {
    return await db.select().from(userWorkoutSchedule)
      .where(eq(userWorkoutSchedule.userId, userId))
      .orderBy(asc(userWorkoutSchedule.dayOfWeek));
  }

  async setUserSchedule(userId: string, schedule: Omit<InsertUserWorkoutSchedule, 'userId'>[]): Promise<UserWorkoutSchedule[]> {
    await db.delete(userWorkoutSchedule).where(eq(userWorkoutSchedule.userId, userId));
    if (schedule.length === 0) return [];
    const values = schedule.map(s => ({ ...s, userId }));
    return await db.insert(userWorkoutSchedule).values(values).returning();
  }

  // XP and progress methods
  async getUserProgress(userId: string): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
    return progress;
  }

  async initUserProgress(userId: string): Promise<UserProgress> {
    const existing = await this.getUserProgress(userId);
    if (existing) return existing;
    
    const [bronzeTier] = await db.select().from(tiers).where(eq(tiers.name, "Bronze"));
    const [progress] = await db.insert(userProgress).values({
      userId,
      totalXp: 0,
      tierId: bronzeTier?.id,
      currentStreak: 0,
      longestStreak: 0,
    }).returning();
    return progress;
  }

  async addXpEvent(event: InsertXpEvent): Promise<XpEvent> {
    const [xpEvent] = await db.insert(xpEvents).values(event).returning();
    return xpEvent;
  }

  async getXpEvents(userId: string, limit: number = 50): Promise<XpEvent[]> {
    return await db.select().from(xpEvents)
      .where(eq(xpEvents.userId, userId))
      .orderBy(desc(xpEvents.createdAt))
      .limit(limit);
  }

  async updateUserXp(userId: string, xpChange: number): Promise<UserProgress | undefined> {
    let progress = await this.getUserProgress(userId);
    if (!progress) {
      progress = await this.initUserProgress(userId);
    }
    
    const newXp = Math.max(0, progress.totalXp + xpChange);
    
    const allTiers = await this.getTiers();
    const newTier = allTiers.find(t => newXp >= t.minXp && newXp <= t.maxXp);
    
    const [updated] = await db.update(userProgress)
      .set({ 
        totalXp: newXp, 
        tierId: newTier?.id,
        updatedAt: new Date() 
      })
      .where(eq(userProgress.userId, userId))
      .returning();
    
    return updated;
  }

  async promoteUserTier(userId: string, newTierId: number): Promise<UserProgress | undefined> {
    const [updated] = await db.update(userProgress)
      .set({ 
        totalXp: 0,
        tierId: newTierId,
        updatedAt: new Date() 
      })
      .where(eq(userProgress.userId, userId))
      .returning();
    
    return updated;
  }
}

export const storage = new DatabaseStorage();
