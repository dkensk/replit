import { db } from "../db/index";
import { 
  goals, positions, competitionLevels, tiers, 
  workoutTypes, mealTypes, mealCatalog 
} from "@shared/schema";

async function seed() {
  console.log("Seeding lookup tables...");

  // Seed goals
  await db.insert(goals).values([
    { code: "muscle", label: "Build Muscle", description: "Focus on strength and muscle mass gains" },
    { code: "fatloss", label: "Fat Loss", description: "Focus on reducing body fat while maintaining muscle" },
    { code: "maintain", label: "Maintain", description: "Maintain current physique and performance" },
  ]).onConflictDoNothing();

  // Seed positions
  await db.insert(positions).values([
    { code: "defense", label: "Defense", description: "Defensive player position" },
    { code: "wing", label: "Wing", description: "Left or right wing forward position" },
    { code: "center", label: "Center", description: "Center forward position" },
    { code: "goalie", label: "Goalie", description: "Goalkeeper position" },
  ]).onConflictDoNothing();

  // Seed competition levels
  await db.insert(competitionLevels).values([
    { code: "house", label: "House League", activityMultiplier: 1.55, description: "Recreational level play" },
    { code: "a", label: "A Level", activityMultiplier: 1.65, description: "Competitive A level" },
    { code: "aa", label: "AA Level", activityMultiplier: 1.75, description: "Competitive AA level" },
    { code: "aaa", label: "AAA Level", activityMultiplier: 1.85, description: "Elite AAA level" },
    { code: "junior", label: "Junior", activityMultiplier: 1.95, description: "Junior hockey level" },
  ]).onConflictDoNothing();

  // Seed tiers
  await db.insert(tiers).values([
    { name: "Bronze", minXp: 0, maxXp: 99, displayOrder: 1, perks: '["Access to basic workouts"]' },
    { name: "Silver", minXp: 100, maxXp: 299, displayOrder: 2, perks: '["Unlock custom meal plans"]' },
    { name: "Gold", minXp: 300, maxXp: 599, displayOrder: 3, perks: '["Advanced drills unlocked"]' },
    { name: "Diamond", minXp: 600, maxXp: 999, displayOrder: 4, perks: '["AI coach priority"]' },
    { name: "Elite", minXp: 1000, maxXp: 99999, displayOrder: 5, perks: '["All features unlocked"]' },
  ]).onConflictDoNothing();

  // Seed workout types
  await db.insert(workoutTypes).values([
    { code: "legs_strength", name: "Legs (Strength)", focusArea: "legs", xpReward: 15, description: "Lower body strength training" },
    { code: "legs_speed", name: "Legs (Speed)", focusArea: "legs", xpReward: 15, description: "Lower body speed and agility" },
    { code: "upper_push", name: "Upper Body (Push)", focusArea: "upper", xpReward: 15, description: "Chest, shoulders, triceps" },
    { code: "upper_pull", name: "Upper Body (Pull)", focusArea: "upper", xpReward: 15, description: "Back and biceps" },
    { code: "cardio", name: "Cardio", focusArea: "cardio", xpReward: 10, description: "Cardiovascular conditioning" },
    { code: "recovery", name: "Recovery", focusArea: "recovery", xpReward: 5, description: "Rest and recovery day" },
    { code: "rest", name: "Rest Day", focusArea: "recovery", xpReward: 0, description: "Complete rest" },
  ]).onConflictDoNothing();

  // Seed meal types
  await db.insert(mealTypes).values([
    { code: "breakfast", name: "Breakfast", displayOrder: 1 },
    { code: "lunch", name: "Lunch", displayOrder: 2 },
    { code: "snack", name: "Snack", displayOrder: 3 },
    { code: "dinner", name: "Dinner", displayOrder: 4 },
  ]).onConflictDoNothing();

  // Seed meal catalog
  const mealTypeRows = await db.select().from(mealTypes);
  const mealTypeMap: Record<string, number> = Object.fromEntries(mealTypeRows.map((mt) => [mt.code, mt.id]));

  await db.insert(mealCatalog).values([
    // Breakfast options
    { mealTypeId: mealTypeMap["breakfast"], code: "oatmeal", name: "Oatmeal with Berries", calories: 350, protein: 12, carbs: 60, fats: 8, description: "Steel-cut oats with mixed berries and honey" },
    { mealTypeId: mealTypeMap["breakfast"], code: "eggs_toast", name: "Eggs & Toast", calories: 400, protein: 22, carbs: 35, fats: 18, description: "Scrambled eggs with whole wheat toast" },
    { mealTypeId: mealTypeMap["breakfast"], code: "protein_smoothie", name: "Protein Smoothie", calories: 380, protein: 30, carbs: 45, fats: 8, description: "Banana, protein powder, milk, peanut butter" },
    
    // Lunch options
    { mealTypeId: mealTypeMap["lunch"], code: "chicken_rice", name: "Chicken & Rice", calories: 550, protein: 45, carbs: 55, fats: 12, description: "Grilled chicken breast with brown rice and vegetables" },
    { mealTypeId: mealTypeMap["lunch"], code: "turkey_wrap", name: "Turkey Wrap", calories: 480, protein: 35, carbs: 45, fats: 15, description: "Turkey, lettuce, tomato in whole wheat wrap" },
    { mealTypeId: mealTypeMap["lunch"], code: "salmon_salad", name: "Salmon Salad", calories: 520, protein: 40, carbs: 25, fats: 28, description: "Grilled salmon over mixed greens" },
    
    // Snack options
    { mealTypeId: mealTypeMap["snack"], code: "protein_bar", name: "Protein Bar", calories: 200, protein: 20, carbs: 22, fats: 6, description: "High protein energy bar" },
    { mealTypeId: mealTypeMap["snack"], code: "greek_yogurt", name: "Greek Yogurt", calories: 180, protein: 18, carbs: 12, fats: 5, description: "Plain Greek yogurt with nuts" },
    { mealTypeId: mealTypeMap["snack"], code: "trail_mix", name: "Trail Mix", calories: 250, protein: 8, carbs: 28, fats: 14, description: "Mixed nuts and dried fruit" },
    
    // Dinner options
    { mealTypeId: mealTypeMap["dinner"], code: "steak_potato", name: "Steak & Potato", calories: 650, protein: 50, carbs: 45, fats: 28, description: "Grilled steak with baked potato and veggies" },
    { mealTypeId: mealTypeMap["dinner"], code: "pasta_meatballs", name: "Pasta with Meatballs", calories: 700, protein: 35, carbs: 80, fats: 22, description: "Whole wheat pasta with lean meatballs" },
    { mealTypeId: mealTypeMap["dinner"], code: "grilled_fish", name: "Grilled Fish", calories: 450, protein: 42, carbs: 30, fats: 15, description: "White fish with quinoa and vegetables" },
  ]).onConflictDoNothing();

  console.log("Seeding complete!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
