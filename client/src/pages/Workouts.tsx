import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Clock, Calendar, PlayCircle, RefreshCw, Dumbbell, Activity, Move, Timer, Flame, Plus, Trash2 } from "lucide-react";
import gymImage from "@assets/generated_images/athletic_gym_training_equipment.png";
import { useUser } from "@/lib/UserContext";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface CustomWorkoutType {
  id: string;
  userId: string;
  name: string;
  code: string;
  categories: string[];
  xpReward: number;
}

const EXERCISE_CATEGORIES = [
  { id: "legs_compound", label: "Legs (Compound)" },
  { id: "legs_hinge", label: "Legs (Hinge)" },
  { id: "legs_unilateral", label: "Legs (Unilateral)" },
  { id: "legs_explosive", label: "Legs (Explosive)" },
  { id: "calves", label: "Calves" },
  { id: "upper_push", label: "Upper Push" },
  { id: "upper_pull", label: "Upper Pull" },
  { id: "shoulders", label: "Shoulders" },
  { id: "isolation_bicep", label: "Biceps" },
  { id: "isolation_tricep", label: "Triceps" },
  { id: "core", label: "Core" },
];

const WORKOUT_TYPES = [
  { id: "legs_strength", label: "Legs (Strength)" },
  { id: "legs_speed", label: "Legs (Speed)" },
  { id: "legs_explosive", label: "Legs (Explosive)" },
  { id: "upper_push", label: "Upper Body (Push)" },
  { id: "upper_pull", label: "Upper Body (Pull)" },
  { id: "upper_body", label: "Upper Body Power" },
  { id: "chest_triceps", label: "Chest & Triceps" },
  { id: "back_biceps", label: "Back & Biceps" },
  { id: "shoulders_traps", label: "Shoulders & Traps" },
  { id: "full_body", label: "Full Body Athletic" },
  { id: "cardio", label: "Cardio" },
  { id: "skills_cardio", label: "Skills & Cardio" },
  { id: "recovery", label: "Recovery" },
  { id: "active_recovery", label: "Active Recovery" },
  { id: "rest", label: "Rest Day" },
];

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

// Exercise Database - Expanded with "Reliable Source" Quality Data for All Ages
const EXERCISES: Record<string, Array<{ id: string, name: string, category: string }>> = {
  "legs_compound": [
    { id: "back_squat", name: "Back Squat", category: "legs_compound" },
    { id: "front_squat", name: "Front Squat", category: "legs_compound" },
    { id: "leg_press", name: "Leg Press", category: "legs_compound" },
    { id: "hack_squat", name: "Hack Squat", category: "legs_compound" },
    { id: "safety_bar_squat", name: "Safety Bar Squat", category: "legs_compound" },
    { id: "zercher_squat", name: "Zercher Squat", category: "legs_compound" },
    { id: "goblet_squat", name: "Goblet Squat", category: "legs_compound" },
    { id: "bodyweight_squat", name: "Bodyweight Squat", category: "legs_compound" },
    { id: "box_squat", name: "Box Squat", category: "legs_compound" },
    { id: "pause_squat", name: "Pause Squat", category: "legs_compound" },
    { id: "anderson_squat", name: "Anderson Squat", category: "legs_compound" },
    { id: "sissy_squat", name: "Sissy Squat", category: "legs_compound" }
  ],
  "legs_hinge": [
    { id: "rdl", name: "Romanian Deadlift", category: "legs_hinge" },
    { id: "trap_bar", name: "Trap Bar Deadlift", category: "legs_hinge" },
    { id: "good_morning", name: "Good Mornings", category: "legs_hinge" },
    { id: "kettlebell_swing", name: "Kettlebell Swing", category: "legs_hinge" },
    { id: "single_leg_rdl", name: "Single Leg RDL", category: "legs_hinge" },
    { id: "conventional_deadlift", name: "Conventional Deadlift", category: "legs_hinge" },
    { id: "sumo_deadlift", name: "Sumo Deadlift", category: "legs_hinge" },
    { id: "hip_thrust", name: "Barbell Hip Thrust", category: "legs_hinge" },
    { id: "glute_bridge", name: "Glute Bridge", category: "legs_hinge" },
    { id: "cable_pull_through", name: "Cable Pull Through", category: "legs_hinge" },
    { id: "hyperextension", name: "Back Extension", category: "legs_hinge" },
    { id: "nordic_curl", name: "Nordic Hamstring Curl", category: "legs_hinge" }
  ],
  "legs_unilateral": [
    { id: "split_squat", name: "Bulgarian Split Squat", category: "legs_unilateral" },
    { id: "walking_lunges", name: "Walking Lunges", category: "legs_unilateral" },
    { id: "reverse_lunges", name: "Reverse Lunges", category: "legs_unilateral" },
    { id: "step_ups", name: "Box Step Ups", category: "legs_unilateral" },
    { id: "cossack_squat", name: "Cossack Squat", category: "legs_unilateral" },
    { id: "lateral_lunges", name: "Lateral Lunges", category: "legs_unilateral" },
    { id: "curtsy_lunges", name: "Curtsy Lunges", category: "legs_unilateral" },
    { id: "pistol_squat", name: "Pistol Squat", category: "legs_unilateral" },
    { id: "single_leg_press", name: "Single Leg Press", category: "legs_unilateral" },
    { id: "single_leg_squat", name: "Single Leg Squat to Box", category: "legs_unilateral" },
    { id: "rear_foot_elevated_split", name: "Rear Foot Elevated Split Squat", category: "legs_unilateral" }
  ],
  "legs_explosive": [
    { id: "box_jumps", name: "Box Jumps", category: "legs_explosive" },
    { id: "broad_jumps", name: "Broad Jumps", category: "legs_explosive" },
    { id: "power_clean", name: "Power Clean", category: "legs_explosive" },
    { id: "depth_jumps", name: "Depth Jumps", category: "legs_explosive" },
    { id: "skater_jumps", name: "Skater Jumps", category: "legs_explosive" },
    { id: "hurdle_hops", name: "Hurdle Hops", category: "legs_explosive" },
    { id: "vertical_jump", name: "Vertical Jump", category: "legs_explosive" },
    { id: "tuck_jumps", name: "Tuck Jumps", category: "legs_explosive" },
    { id: "split_jump", name: "Split Jumps", category: "legs_explosive" },
    { id: "single_leg_hop", name: "Single Leg Hops", category: "legs_explosive" },
    { id: "lateral_bounds", name: "Lateral Bounds", category: "legs_explosive" },
    { id: "hang_clean", name: "Hang Clean", category: "legs_explosive" },
    { id: "jump_squat", name: "Jump Squat", category: "legs_explosive" },
    { id: "medicine_ball_slam", name: "Medicine Ball Slam", category: "legs_explosive" },
    { id: "sprint_starts", name: "Sprint Starts", category: "legs_explosive" },
    { id: "burpee_variant", name: "Burpees", category: "legs_explosive" }
  ],
  "calves": [
    { id: "standing_calf_raise", name: "Standing Calf Raise", category: "calves" },
    { id: "seated_calf_raise", name: "Seated Calf Raise", category: "calves" },
    { id: "single_leg_calf_raise", name: "Single Leg Calf Raise", category: "calves" },
    { id: "donkey_calf_raise", name: "Donkey Calf Raise", category: "calves" },
    { id: "calf_press", name: "Calf Press (Leg Press)", category: "calves" },
    { id: "jump_rope", name: "Jump Rope", category: "calves" },
    { id: "tibialis_raise", name: "Tibialis Raise", category: "calves" }
  ],
  "upper_push": [
    { id: "bench_press", name: "Bench Press", category: "upper_push" },
    { id: "overhead_press", name: "Overhead Press", category: "upper_push" },
    { id: "incline_dumbbell_press", name: "Incline DB Press", category: "upper_push" },
    { id: "db_press", name: "DB Press", category: "upper_push" },
    { id: "db_shoulder_press", name: "DB Shoulder Press", category: "upper_push" },
    { id: "dips", name: "Weighted Dips", category: "upper_push" },
    { id: "landmine_press", name: "Landmine Press", category: "upper_push" },
    { id: "pushups", name: "Weighted Pushups", category: "upper_push" },
    { id: "decline_bench", name: "Decline Bench Press", category: "upper_push" },
    { id: "dumbbell_bench", name: "Dumbbell Bench Press", category: "upper_push" },
    { id: "floor_press", name: "Floor Press", category: "upper_push" },
    { id: "pike_pushup", name: "Pike Pushups", category: "upper_push" },
    { id: "arnold_press", name: "Arnold Press", category: "upper_push" },
    { id: "push_press", name: "Push Press", category: "upper_push" },
    { id: "cable_fly", name: "Cable Fly", category: "upper_push" },
    { id: "dumbbell_fly", name: "Dumbbell Fly", category: "upper_push" },
    { id: "machine_chest_press", name: "Machine Chest Press", category: "upper_push" },
    { id: "incline_bench", name: "Incline Bench Press", category: "upper_push" },
    { id: "close_grip_pushup", name: "Close Grip Pushups", category: "upper_push" }
  ],
  "upper_pull": [
    { id: "pullups", name: "Pull Ups", category: "upper_pull" },
    { id: "barbell_row", name: "Barbell Row", category: "upper_pull" },
    { id: "face_pulls", name: "Face Pulls", category: "upper_pull" },
    { id: "single_arm_row", name: "Single Arm DB Row", category: "upper_pull" },
    { id: "lat_pulldown", name: "Lat Pulldown", category: "upper_pull" },
    { id: "tbar_row", name: "T-Bar Row", category: "upper_pull" },
    { id: "chin_ups", name: "Chin Ups", category: "upper_pull" },
    { id: "pendlay_row", name: "Pendlay Row", category: "upper_pull" },
    { id: "cable_row", name: "Seated Cable Row", category: "upper_pull" },
    { id: "inverted_row", name: "Inverted Row", category: "upper_pull" },
    { id: "meadows_row", name: "Meadows Row", category: "upper_pull" },
    { id: "chest_supported_row", name: "Chest Supported Row", category: "upper_pull" },
    { id: "straight_arm_pulldown", name: "Straight Arm Pulldown", category: "upper_pull" },
    { id: "rear_delt_fly", name: "Rear Delt Fly", category: "upper_pull" },
    { id: "band_pull_apart", name: "Band Pull Apart", category: "upper_pull" }
  ],
  "isolation_bicep": [
    { id: "barbell_curl", name: "Barbell Curl", category: "isolation_bicep" },
    { id: "hammer_curl", name: "Hammer Curl", category: "isolation_bicep" },
    { id: "preacher_curl", name: "Preacher Curl", category: "isolation_bicep" },
    { id: "incline_curl", name: "Incline DB Curl", category: "isolation_bicep" },
    { id: "concentration_curl", name: "Concentration Curl", category: "isolation_bicep" },
    { id: "cable_curl", name: "Cable Curl", category: "isolation_bicep" },
    { id: "spider_curl", name: "Spider Curl", category: "isolation_bicep" },
    { id: "ez_bar_curl", name: "EZ Bar Curl", category: "isolation_bicep" },
    { id: "reverse_curl", name: "Reverse Curl", category: "isolation_bicep" },
    { id: "drag_curl", name: "Drag Curl", category: "isolation_bicep" }
  ],
  "isolation_tricep": [
    { id: "skull_crusher", name: "Skull Crushers", category: "isolation_tricep" },
    { id: "tricep_pushdown", name: "Cable Pushdown", category: "isolation_tricep" },
    { id: "overhead_extension", name: "Overhead Extension", category: "isolation_tricep" },
    { id: "close_grip_bench", name: "Close Grip Bench", category: "isolation_tricep" },
    { id: "tricep_kickback", name: "Tricep Kickback", category: "isolation_tricep" },
    { id: "rope_pushdown", name: "Rope Pushdown", category: "isolation_tricep" },
    { id: "diamond_pushup", name: "Diamond Pushups", category: "isolation_tricep" },
    { id: "jm_press", name: "JM Press", category: "isolation_tricep" },
    { id: "tricep_dips", name: "Bench Dips", category: "isolation_tricep" }
  ],
  "core": [
    { id: "plank", name: "Weighted Plank", category: "core" },
    { id: "pallof_press", name: "Pallof Press", category: "core" },
    { id: "ab_wheel", name: "Ab Wheel Rollout", category: "core" },
    { id: "hanging_leg_raise", name: "Hanging Leg Raise", category: "core" },
    { id: "russian_twist", name: "Russian Twist", category: "core" },
    { id: "dead_bug", name: "Dead Bug", category: "core" },
    { id: "bird_dog", name: "Bird Dog", category: "core" },
    { id: "bicycle_crunch", name: "Bicycle Crunch", category: "core" },
    { id: "mountain_climber", name: "Mountain Climbers", category: "core" },
    { id: "side_plank", name: "Side Plank", category: "core" },
    { id: "v_ups", name: "V-Ups", category: "core" },
    { id: "toe_touches", name: "Toe Touches", category: "core" },
    { id: "cable_crunch", name: "Cable Crunch", category: "core" },
    { id: "hollow_hold", name: "Hollow Hold", category: "core" },
    { id: "woodchop", name: "Cable Woodchop", category: "core" },
    { id: "suitcase_carry", name: "Suitcase Carry", category: "core" },
    { id: "farmers_walk", name: "Farmers Walk", category: "core" }
  ],
  "shoulders": [
    { id: "lateral_raise", name: "Lateral Raise", category: "shoulders" },
    { id: "front_raise", name: "Front Raise", category: "shoulders" },
    { id: "upright_row", name: "Upright Row", category: "shoulders" },
    { id: "shrugs", name: "Barbell Shrugs", category: "shoulders" },
    { id: "cuban_rotation", name: "Cuban Rotation", category: "shoulders" },
    { id: "y_raise", name: "Y Raise", category: "shoulders" },
    { id: "prone_y_raise", name: "Prone Y Raise", category: "shoulders" },
    { id: "reverse_fly_machine", name: "Reverse Fly Machine", category: "shoulders" }
  ],
  "mobility": [
    { id: "hip_90_90", name: "90/90 Hip Stretch", category: "mobility" },
    { id: "world_greatest", name: "World's Greatest Stretch", category: "mobility" },
    { id: "cat_cow", name: "Cat-Cow Stretch", category: "mobility" },
    { id: "thoracic_rotation", name: "Thoracic Rotation", category: "mobility" },
    { id: "hip_circles", name: "Hip Circles", category: "mobility" },
    { id: "ankle_mobility", name: "Ankle Mobility Drill", category: "mobility" },
    { id: "foam_roll_quads", name: "Foam Roll Quads", category: "mobility" },
    { id: "foam_roll_it_band", name: "Foam Roll IT Band", category: "mobility" },
    { id: "lacrosse_ball_glute", name: "Lacrosse Ball Glute Release", category: "mobility" }
  ]
};

// Goal-specific workouts - Optimized for muscle building, maintenance, or fat loss
type WorkoutExercise = { id: string, sets: string, reps: string, rest: string, category: string };
type GoalWorkouts = Record<string, Record<string, Array<WorkoutExercise>>>;

const GOAL_WORKOUTS: GoalWorkouts = {
  // MUSCLE BUILDING: Higher volume, longer rest, heavier compound lifts, progressive overload focus
  "muscle": {
    "legs_strength": [
      { id: "back_squat", sets: "5", reps: "5", rest: "3-5 min", category: "legs_compound" },
      { id: "leg_press", sets: "4", reps: "8-10", rest: "2-3 min", category: "legs_compound" },
      { id: "rdl", sets: "4", reps: "8-10", rest: "2-3 min", category: "legs_hinge" },
      { id: "split_squat", sets: "4", reps: "8/leg", rest: "2 min", category: "legs_unilateral" },
      { id: "standing_calf_raise", sets: "5", reps: "12-15", rest: "90s", category: "calves" },
      { id: "plank", sets: "3", reps: "60s", rest: "60s", category: "core" }
    ],
    "legs_explosive": [
      { id: "power_clean", sets: "5", reps: "3", rest: "3 min", category: "legs_explosive" },
      { id: "box_jumps", sets: "4", reps: "5", rest: "2-3 min", category: "legs_explosive" },
      { id: "trap_bar", sets: "5", reps: "5", rest: "3 min", category: "legs_hinge" },
      { id: "front_squat", sets: "4", reps: "6", rest: "2-3 min", category: "legs_compound" },
      { id: "skater_jumps", sets: "3", reps: "8/side", rest: "90s", category: "legs_explosive" }
    ],
    "upper_body": [
      { id: "bench_press", sets: "5", reps: "5", rest: "3-4 min", category: "upper_push" },
      { id: "pullups", sets: "4", reps: "6-8", rest: "2-3 min", category: "upper_pull" },
      { id: "overhead_press", sets: "4", reps: "6-8", rest: "2-3 min", category: "upper_push" },
      { id: "barbell_row", sets: "4", reps: "8-10", rest: "2 min", category: "upper_pull" },
      { id: "db_press", sets: "3", reps: "8-10", rest: "2 min", category: "upper_push" },
      { id: "dips", sets: "3", reps: "8-10", rest: "2 min", category: "upper_push" },
      { id: "face_pulls", sets: "3", reps: "15", rest: "60s", category: "upper_pull" },
      { id: "lateral_raise", sets: "3", reps: "12-15", rest: "60s", category: "shoulders" }
    ],
    "back_biceps": [
      { id: "pullups", sets: "4", reps: "6-8", rest: "2-3 min", category: "upper_pull" },
      { id: "barbell_row", sets: "5", reps: "5", rest: "2-3 min", category: "upper_pull" },
      { id: "tbar_row", sets: "4", reps: "8-10", rest: "2 min", category: "upper_pull" },
      { id: "lat_pulldown", sets: "4", reps: "10-12", rest: "90s", category: "upper_pull" },
      { id: "chest_supported_row", sets: "3", reps: "10-12", rest: "90s", category: "upper_pull" },
      { id: "barbell_curl", sets: "4", reps: "8-10", rest: "90s", category: "isolation_bicep" },
      { id: "hammer_curl", sets: "3", reps: "10-12", rest: "60s", category: "isolation_bicep" },
      { id: "preacher_curl", sets: "3", reps: "10-12", rest: "60s", category: "isolation_bicep" }
    ],
    "chest_triceps": [
      { id: "bench_press", sets: "5", reps: "5", rest: "3-4 min", category: "upper_push" },
      { id: "incline_dumbbell_press", sets: "4", reps: "8-10", rest: "2-3 min", category: "upper_push" },
      { id: "db_press", sets: "4", reps: "8-10", rest: "2 min", category: "upper_push" },
      { id: "dips", sets: "4", reps: "8-10", rest: "2 min", category: "upper_push" },
      { id: "cable_fly", sets: "3", reps: "12-15", rest: "90s", category: "upper_push" },
      { id: "skull_crusher", sets: "4", reps: "10-12", rest: "90s", category: "isolation_tricep" },
      { id: "tricep_pushdown", sets: "3", reps: "12-15", rest: "60s", category: "isolation_tricep" },
      { id: "overhead_extension", sets: "3", reps: "12-15", rest: "60s", category: "isolation_tricep" }
    ],
    "shoulders_traps": [
      { id: "overhead_press", sets: "5", reps: "5", rest: "3-4 min", category: "upper_push" },
      { id: "db_shoulder_press", sets: "4", reps: "8-10", rest: "2-3 min", category: "upper_push" },
      { id: "lateral_raise", sets: "4", reps: "12-15", rest: "60s", category: "shoulders" },
      { id: "face_pulls", sets: "4", reps: "15", rest: "60s", category: "upper_pull" },
      { id: "shrugs", sets: "4", reps: "10-12", rest: "90s", category: "shoulders" },
      { id: "upright_row", sets: "3", reps: "10-12", rest: "90s", category: "shoulders" },
      { id: "front_raise", sets: "3", reps: "12-15", rest: "60s", category: "shoulders" },
      { id: "rear_delt_fly", sets: "3", reps: "15", rest: "60s", category: "upper_pull" }
    ],
    "full_body": [
      { id: "conventional_deadlift", sets: "4", reps: "5", rest: "3-4 min", category: "legs_hinge" },
      { id: "bench_press", sets: "4", reps: "6-8", rest: "2-3 min", category: "upper_push" },
      { id: "barbell_row", sets: "4", reps: "8-10", rest: "2 min", category: "upper_pull" },
      { id: "split_squat", sets: "3", reps: "10/leg", rest: "90s", category: "legs_unilateral" },
      { id: "db_shoulder_press", sets: "3", reps: "8-10", rest: "2 min", category: "upper_push" },
      { id: "chin_ups", sets: "3", reps: "8-10", rest: "90s", category: "upper_pull" },
      { id: "pallof_press", sets: "3", reps: "10/side", rest: "60s", category: "core" }
    ],
    "skills_cardio": [
      { id: "box_jumps", sets: "4", reps: "5", rest: "90s", category: "legs_explosive" },
      { id: "skater_jumps", sets: "4", reps: "10/side", rest: "60s", category: "legs_explosive" },
      { id: "lateral_bounds", sets: "3", reps: "8/side", rest: "60s", category: "legs_explosive" },
      { id: "medicine_ball_slam", sets: "3", reps: "10", rest: "60s", category: "legs_explosive" },
      { id: "farmers_walk", sets: "3", reps: "40m", rest: "90s", category: "core" },
      { id: "suitcase_carry", sets: "3", reps: "30m/side", rest: "60s", category: "core" }
    ],
    "active_recovery": []
  },

  // MAINTAIN: Moderate volume, balanced rest, mix of strength and conditioning
  "maintain": {
    "legs_strength": [
      { id: "back_squat", sets: "4", reps: "6-8", rest: "2-3 min", category: "legs_compound" },
      { id: "rdl", sets: "3", reps: "10-12", rest: "90s", category: "legs_hinge" },
      { id: "split_squat", sets: "3", reps: "10/leg", rest: "90s", category: "legs_unilateral" },
      { id: "standing_calf_raise", sets: "3", reps: "15-20", rest: "60s", category: "calves" },
      { id: "plank", sets: "3", reps: "45s", rest: "45s", category: "core" }
    ],
    "legs_explosive": [
      { id: "box_jumps", sets: "3", reps: "5", rest: "2 min", category: "legs_explosive" },
      { id: "power_clean", sets: "4", reps: "3", rest: "2-3 min", category: "legs_explosive" },
      { id: "trap_bar", sets: "3", reps: "6", rest: "2 min", category: "legs_hinge" },
      { id: "skater_jumps", sets: "3", reps: "8/side", rest: "90s", category: "legs_explosive" },
      { id: "pallof_press", sets: "3", reps: "10/side", rest: "60s", category: "core" }
    ],
    "upper_body": [
      { id: "bench_press", sets: "4", reps: "8-10", rest: "2 min", category: "upper_push" },
      { id: "pullups", sets: "3", reps: "AMRAP", rest: "2 min", category: "upper_pull" },
      { id: "db_shoulder_press", sets: "3", reps: "10-12", rest: "90s", category: "upper_push" },
      { id: "barbell_row", sets: "3", reps: "10-12", rest: "90s", category: "upper_pull" },
      { id: "db_press", sets: "3", reps: "10-12", rest: "90s", category: "upper_push" },
      { id: "face_pulls", sets: "3", reps: "15", rest: "60s", category: "upper_pull" },
      { id: "lateral_raise", sets: "3", reps: "12-15", rest: "45s", category: "shoulders" }
    ],
    "back_biceps": [
      { id: "pullups", sets: "3", reps: "8-10", rest: "2 min", category: "upper_pull" },
      { id: "barbell_row", sets: "3", reps: "10-12", rest: "90s", category: "upper_pull" },
      { id: "lat_pulldown", sets: "3", reps: "12-15", rest: "60s", category: "upper_pull" },
      { id: "cable_row", sets: "3", reps: "12-15", rest: "60s", category: "upper_pull" },
      { id: "barbell_curl", sets: "3", reps: "12", rest: "60s", category: "isolation_bicep" },
      { id: "hammer_curl", sets: "3", reps: "12", rest: "60s", category: "isolation_bicep" },
      { id: "incline_curl", sets: "2", reps: "12-15", rest: "45s", category: "isolation_bicep" }
    ],
    "chest_triceps": [
      { id: "bench_press", sets: "4", reps: "8-10", rest: "2 min", category: "upper_push" },
      { id: "incline_dumbbell_press", sets: "3", reps: "10-12", rest: "90s", category: "upper_push" },
      { id: "db_press", sets: "3", reps: "10-12", rest: "90s", category: "upper_push" },
      { id: "dips", sets: "3", reps: "10-12", rest: "90s", category: "upper_push" },
      { id: "cable_fly", sets: "3", reps: "12-15", rest: "60s", category: "upper_push" },
      { id: "skull_crusher", sets: "3", reps: "12", rest: "60s", category: "isolation_tricep" },
      { id: "tricep_pushdown", sets: "3", reps: "15", rest: "60s", category: "isolation_tricep" }
    ],
    "shoulders_traps": [
      { id: "overhead_press", sets: "4", reps: "8-10", rest: "2 min", category: "upper_push" },
      { id: "db_shoulder_press", sets: "3", reps: "10-12", rest: "90s", category: "upper_push" },
      { id: "lateral_raise", sets: "3", reps: "12-15", rest: "60s", category: "shoulders" },
      { id: "face_pulls", sets: "3", reps: "15", rest: "60s", category: "upper_pull" },
      { id: "shrugs", sets: "3", reps: "12-15", rest: "60s", category: "shoulders" },
      { id: "upright_row", sets: "3", reps: "12", rest: "60s", category: "shoulders" },
      { id: "rear_delt_fly", sets: "3", reps: "15", rest: "45s", category: "upper_pull" }
    ],
    "full_body": [
      { id: "trap_bar", sets: "3", reps: "8", rest: "2 min", category: "legs_hinge" },
      { id: "db_press", sets: "3", reps: "10", rest: "90s", category: "upper_push" },
      { id: "walking_lunges", sets: "3", reps: "10/leg", rest: "90s", category: "legs_unilateral" },
      { id: "single_arm_row", sets: "3", reps: "10/arm", rest: "90s", category: "upper_pull" },
      { id: "db_shoulder_press", sets: "3", reps: "10", rest: "90s", category: "upper_push" },
      { id: "ab_wheel", sets: "3", reps: "10", rest: "60s", category: "core" }
    ],
    "skills_cardio": [
      { id: "box_jumps", sets: "3", reps: "5", rest: "90s", category: "legs_explosive" },
      { id: "skater_jumps", sets: "3", reps: "8/side", rest: "60s", category: "legs_explosive" },
      { id: "kettlebell_swing", sets: "3", reps: "15", rest: "60s", category: "legs_hinge" },
      { id: "medicine_ball_slam", sets: "3", reps: "10", rest: "60s", category: "legs_explosive" },
      { id: "mountain_climber", sets: "3", reps: "30s", rest: "45s", category: "core" }
    ],
    "active_recovery": []
  },

  // FAT LOSS: Circuit-style, shorter rest, supersets, higher reps, metabolic conditioning
  "fat": {
    "legs_strength": [
      { id: "goblet_squat", sets: "4", reps: "15", rest: "45s", category: "legs_compound" },
      { id: "kettlebell_swing", sets: "4", reps: "20", rest: "30s", category: "legs_hinge" },
      { id: "walking_lunges", sets: "3", reps: "12/leg", rest: "45s", category: "legs_unilateral" },
      { id: "step_ups", sets: "3", reps: "15/leg", rest: "30s", category: "legs_unilateral" },
      { id: "jump_rope", sets: "3", reps: "60s", rest: "30s", category: "calves" },
      { id: "mountain_climber", sets: "3", reps: "30s", rest: "30s", category: "core" }
    ],
    "legs_explosive": [
      { id: "jump_squat", sets: "4", reps: "12", rest: "45s", category: "legs_explosive" },
      { id: "box_jumps", sets: "4", reps: "8", rest: "45s", category: "legs_explosive" },
      { id: "kettlebell_swing", sets: "4", reps: "20", rest: "30s", category: "legs_hinge" },
      { id: "lateral_bounds", sets: "3", reps: "10/side", rest: "30s", category: "legs_explosive" },
      { id: "tuck_jumps", sets: "3", reps: "10", rest: "45s", category: "legs_explosive" },
      { id: "burpee_variant", sets: "3", reps: "10", rest: "30s", category: "legs_explosive" }
    ],
    "upper_body": [
      { id: "pushups", sets: "4", reps: "15-20", rest: "30s", category: "upper_push" },
      { id: "inverted_row", sets: "4", reps: "15", rest: "30s", category: "upper_pull" },
      { id: "db_press", sets: "3", reps: "15", rest: "30s", category: "upper_push" },
      { id: "pike_pushup", sets: "3", reps: "12", rest: "30s", category: "upper_push" },
      { id: "band_pull_apart", sets: "3", reps: "20", rest: "20s", category: "upper_pull" },
      { id: "db_shoulder_press", sets: "3", reps: "12", rest: "30s", category: "upper_push" },
      { id: "diamond_pushup", sets: "3", reps: "12", rest: "30s", category: "isolation_tricep" },
      { id: "bicycle_crunch", sets: "3", reps: "20/side", rest: "30s", category: "core" }
    ],
    "back_biceps": [
      { id: "chin_ups", sets: "4", reps: "AMRAP", rest: "45s", category: "upper_pull" },
      { id: "cable_row", sets: "3", reps: "15", rest: "30s", category: "upper_pull" },
      { id: "lat_pulldown", sets: "3", reps: "15", rest: "30s", category: "upper_pull" },
      { id: "straight_arm_pulldown", sets: "3", reps: "15", rest: "30s", category: "upper_pull" },
      { id: "face_pulls", sets: "3", reps: "20", rest: "20s", category: "upper_pull" },
      { id: "cable_curl", sets: "3", reps: "15", rest: "30s", category: "isolation_bicep" },
      { id: "hammer_curl", sets: "3", reps: "15", rest: "30s", category: "isolation_bicep" }
    ],
    "chest_triceps": [
      { id: "pushups", sets: "4", reps: "20", rest: "30s", category: "upper_push" },
      { id: "db_press", sets: "3", reps: "15", rest: "30s", category: "upper_push" },
      { id: "incline_dumbbell_press", sets: "3", reps: "15", rest: "45s", category: "upper_push" },
      { id: "cable_fly", sets: "3", reps: "15", rest: "30s", category: "upper_push" },
      { id: "tricep_dips", sets: "3", reps: "15", rest: "30s", category: "isolation_tricep" },
      { id: "rope_pushdown", sets: "3", reps: "20", rest: "30s", category: "isolation_tricep" },
      { id: "mountain_climber", sets: "3", reps: "30s", rest: "30s", category: "core" }
    ],
    "shoulders_traps": [
      { id: "db_shoulder_press", sets: "4", reps: "15", rest: "30s", category: "upper_push" },
      { id: "lateral_raise", sets: "4", reps: "15", rest: "30s", category: "shoulders" },
      { id: "face_pulls", sets: "4", reps: "20", rest: "20s", category: "upper_pull" },
      { id: "shrugs", sets: "3", reps: "15", rest: "30s", category: "shoulders" },
      { id: "upright_row", sets: "3", reps: "15", rest: "30s", category: "shoulders" },
      { id: "rear_delt_fly", sets: "3", reps: "20", rest: "20s", category: "upper_pull" },
      { id: "pike_pushup", sets: "3", reps: "12", rest: "30s", category: "upper_push" }
    ],
    "full_body": [
      { id: "kettlebell_swing", sets: "4", reps: "20", rest: "30s", category: "legs_hinge" },
      { id: "db_press", sets: "3", reps: "15", rest: "30s", category: "upper_push" },
      { id: "goblet_squat", sets: "3", reps: "15", rest: "30s", category: "legs_compound" },
      { id: "inverted_row", sets: "3", reps: "12", rest: "30s", category: "upper_pull" },
      { id: "reverse_lunges", sets: "3", reps: "10/leg", rest: "30s", category: "legs_unilateral" },
      { id: "db_shoulder_press", sets: "3", reps: "12", rest: "30s", category: "upper_push" },
      { id: "v_ups", sets: "3", reps: "15", rest: "30s", category: "core" }
    ],
    "skills_cardio": [
      { id: "jump_squat", sets: "4", reps: "15", rest: "30s", category: "legs_explosive" },
      { id: "burpee_variant", sets: "4", reps: "10", rest: "30s", category: "legs_explosive" },
      { id: "skater_jumps", sets: "4", reps: "12/side", rest: "30s", category: "legs_explosive" },
      { id: "mountain_climber", sets: "4", reps: "30s", rest: "20s", category: "core" },
      { id: "jump_rope", sets: "4", reps: "60s", rest: "30s", category: "calves" },
      { id: "tuck_jumps", sets: "3", reps: "10", rest: "30s", category: "legs_explosive" }
    ],
    "active_recovery": []
  }
};

// Helper function to get workouts based on goal
const getWorkoutForGoal = (goal: string, workoutType: string): WorkoutExercise[] => {
  const goalKey = goal === "muscle" ? "muscle" : goal === "fat" ? "fat" : "maintain";
  return GOAL_WORKOUTS[goalKey]?.[workoutType] || GOAL_WORKOUTS["maintain"][workoutType] || [];
};

// Generate recommended schedule based on user stats
const getRecommendedSchedule = (
  position: string,
  level: string,
  goal: string
): Record<string, string> => {
  // Base schedules by goal with full workout variety
  const goalSchedules: Record<string, Record<string, string>> = {
    muscle: {
      monday: "legs_strength",
      tuesday: "chest_triceps",
      wednesday: "active_recovery",
      thursday: "back_biceps",
      friday: "legs_explosive",
      saturday: "upper_body",
      sunday: "rest"
    },
    fatloss: {
      monday: "full_body",
      tuesday: "skills_cardio",
      wednesday: "legs_explosive",
      thursday: "active_recovery",
      friday: "full_body",
      saturday: "skills_cardio",
      sunday: "rest"
    },
    maintain: {
      monday: "legs_strength",
      tuesday: "upper_body",
      wednesday: "skills_cardio",
      thursday: "legs_explosive",
      friday: "full_body",
      saturday: "active_recovery",
      sunday: "rest"
    }
  };

  // Get base schedule
  let schedule = { ...goalSchedules[goal] || goalSchedules.maintain };

  // Adjust for position
  if (position === "goalie") {
    // Goalies need more explosiveness and lateral movement
    schedule.monday = "legs_explosive";
    schedule.thursday = "full_body";
    schedule.friday = "skills_cardio";
  } else if (position === "defense") {
    // Defensemen need strong legs and upper body for physical play
    schedule.tuesday = "upper_body";
    schedule.friday = "legs_strength";
  } else if (position === "center") {
    // Centers need endurance and all-around fitness
    schedule.wednesday = "skills_cardio";
    schedule.saturday = "full_body";
  }

  // Adjust for competition level - higher levels need more intensity, less rest
  if (level === "aaa" || level === "junior") {
    // Elite players: 6 training days
    schedule.saturday = goal === "muscle" ? "full_body" : "skills_cardio";
    schedule.wednesday = "legs_explosive";
  } else if (level === "house") {
    // Recreational: more recovery days
    schedule.wednesday = "active_recovery";
    schedule.saturday = "rest";
  }

  return schedule;
};

const STRETCHES = {
  pre_game: [
    { name: "Leg Swings", duration: "10 reps/side", type: "Dynamic", instructions: "Swing leg forward and back, then side to side to open hips." },
    { name: "Arm Circles", duration: "30 secs", type: "Dynamic", instructions: "Large circles forward then backward to warm up shoulders." },
    { name: "Walking Lunges with Twist", duration: "10 reps", type: "Dynamic", instructions: "Lunge forward and twist torso towards the front leg." },
    { name: "High Knees", duration: "30 secs", type: "Dynamic", instructions: "Run in place driving knees up to chest height rapidly." },
    { name: "Butt Kicks", duration: "30 secs", type: "Dynamic", instructions: "Jog in place kicking heels up to glutes to warm hamstrings." },
    { name: "Torso Twists", duration: "20 reps", type: "Dynamic", instructions: "Stand feet wide, twist upper body left and right." }
  ],
  post_game: [
    { name: "Hamstring Stretch", duration: "45 secs/leg", type: "Static", instructions: "Sit with one leg out, reach for toes keeping back straight." },
    { name: "Quad Stretch", duration: "45 secs/leg", type: "Static", instructions: "Stand on one leg, pull other heel to glute. Keep knees together." },
    { name: "Pigeon Pose", duration: "60 secs/side", type: "Static", instructions: "Leg bent in front, other leg straight back. Lean forward for deep glute stretch." },
    { name: "Hip Flexor Lunge", duration: "45 secs/side", type: "Static", instructions: "Kneel on one knee, push hips forward until stretch felt in rear hip." },
    { name: "Calf Stretch", duration: "45 secs/leg", type: "Static", instructions: "Push against wall with one leg back, heel on ground." },
    { name: "Chest Opener", duration: "30 secs", type: "Static", instructions: "Clasp hands behind back and lift arms up to open chest." }
  ]
};

export default function Workouts() {
  const { profile, updateProfile } = useUser();
  const [activeTab, setActiveTab] = useState("schedule");
  const queryClient = useQueryClient();
  
  // Local state for current workout session customization
  // Maps index -> exerciseId
  const [customWorkout, setCustomWorkout] = useState<Record<number, string>>({});
  
  // Custom workout builder state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Fetch custom workout types
  const { data: customWorkoutTypes = [] } = useQuery<CustomWorkoutType[]>({
    queryKey: ["/api/custom-workouts"],
    queryFn: async () => {
      const res = await fetch("/api/custom-workouts", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    }
  });
  
  // Create custom workout mutation
  const createCustomWorkout = useMutation({
    mutationFn: async (data: { name: string; categories: string[] }) => {
      const res = await fetch("/api/custom-workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create custom workout");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-workouts"] });
      setShowCreateDialog(false);
      setNewWorkoutName("");
      setSelectedCategories([]);
    }
  });
  
  // Delete custom workout mutation
  const deleteCustomWorkout = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/custom-workouts/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to delete custom workout");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-workouts"] });
    }
  });
  
  // Combine built-in and custom workout types
  const allWorkoutTypes = [
    ...WORKOUT_TYPES,
    ...customWorkoutTypes.map(cw => ({ id: cw.code, label: cw.name, isCustom: true, customId: cw.id }))
  ];

  const handleScheduleChange = (day: string, type: string) => {
    // Create a complete schedule with defaults for any missing days
    const defaultSchedule: Record<string, string> = {
      monday: "rest",
      tuesday: "rest",
      wednesday: "rest",
      thursday: "rest",
      friday: "rest",
      saturday: "rest",
      sunday: "rest"
    };
    
    const fullSchedule = {
      ...defaultSchedule,
      ...profile.schedule,
      [day]: type
    };
    
    updateProfile({ schedule: fullSchedule });
  };

  const currentDay = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]; // Simple mapping, 0=Sun -> 6
  const currentWorkoutType = profile.schedule[currentDay] || "rest";
  const baseWorkout = getWorkoutForGoal(profile.goal || "maintain", currentWorkoutType);

  const getExerciseName = (id: string, category: string) => {
    return EXERCISES[category]?.find(e => e.id === id)?.name || id;
  };

  return (
    <Layout>
      <div className="relative h-52 w-full overflow-hidden rounded-b-3xl mb-6">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
        <img src={gymImage} alt="Gym" className="w-full h-full object-cover" />
        <div className="absolute bottom-6 left-6 right-6 z-20">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-heading font-bold text-white uppercase tracking-wide">Training Plan</h1>
              <p className="text-primary font-medium text-sm mt-1">Phase 1: Foundation</p>
            </div>
            <div className="glass-panel rounded-xl px-3 py-2">
              <Select 
                value={profile.workoutDuration.toString()} 
                onValueChange={(val) => updateProfile({ workoutDuration: parseInt(val) })}
              >
                <SelectTrigger className="h-8 border-none bg-transparent text-white w-[100px] focus:ring-0 text-xs font-medium" data-testid="select-duration">
                  <Clock className="w-3.5 h-3.5 mr-1.5 text-primary" />
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 Mins</SelectItem>
                  <SelectItem value="45">45 Mins</SelectItem>
                  <SelectItem value="60">60 Mins</SelectItem>
                  <SelectItem value="90">90 Mins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/80 backdrop-blur-sm border border-white/5 p-1 rounded-xl mb-6 h-12">
            <TabsTrigger 
              value="schedule" 
              className="rounded-lg font-medium text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              data-testid="tab-schedule"
            >
              Weekly Split
            </TabsTrigger>
            <TabsTrigger 
              value="today" 
              className="rounded-lg font-medium text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              data-testid="tab-today"
            >
              Today
            </TabsTrigger>
            <TabsTrigger 
              value="stretching" 
              className="rounded-lg font-medium text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              data-testid="tab-stretching"
            >
              Stretching
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Your 7-Day Split</h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-primary hover:text-primary hover:bg-primary/10 font-medium"
                  data-testid="button-create-custom-workout"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="w-3 h-3 mr-1.5" />
                  Custom Workout
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 font-medium"
                  data-testid="button-reset-schedule"
                  onClick={() => {
                    const recommended = getRecommendedSchedule(
                      profile.position || "defense",
                      profile.level || "aa",
                      profile.goal || "maintain"
                    );
                    updateProfile({ schedule: recommended });
                  }}
                >
                  <RefreshCw className="w-3 h-3 mr-1.5" />
                  Reset
                </Button>
              </div>
            </div>
             
            <div className="space-y-2">
              {DAYS.map((day, index) => {
                const isToday = day === currentDay;
                return (
                  <Card 
                    key={day} 
                    className={cn(
                      "border transition-all duration-200",
                      isToday 
                        ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20" 
                        : "bg-card/60 border-white/5 hover:border-white/10"
                    )}
                  >
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isToday && (
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                        <span className={cn(
                          "text-sm font-bold uppercase w-20",
                          isToday ? "text-primary" : "text-muted-foreground"
                        )}>
                          {day}
                        </span>
                      </div>
                      <Select 
                        value={profile.schedule[day] || "rest"} 
                        onValueChange={(val) => handleScheduleChange(day, val)}
                      >
                        <SelectTrigger 
                          className="w-[180px] h-9 text-xs bg-secondary/50 border-white/5 text-white font-medium hover:bg-secondary/70 transition-colors"
                          data-testid={`select-day-${day}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {allWorkoutTypes.map((type: any) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.label}
                              {type.isCustom && " *"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="today" className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{WORKOUT_TYPES.find(w => w.id === currentWorkoutType)?.label || "Rest Day"}</h2>
                <p className="text-sm text-muted-foreground capitalize">{currentDay}'s Workout</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-lg">
                <Timer className="w-4 h-4 text-primary" />
                <span className="font-medium">{profile.workoutDuration} min</span>
              </div>
            </div>

            {currentWorkoutType !== "rest" && currentWorkoutType !== "active_recovery" && (
              <Card className="glass-panel rounded-xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Flame className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="font-bold text-white">Warmup</h3>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium bg-secondary/50 px-2 py-1 rounded">10 min</span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary/60 flex-shrink-0" />
                      <span>5 min Light Cardio (Bike/Jog)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary/60 flex-shrink-0" />
                      <span>Dynamic Stretching (Leg Swings, etc.)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary/60 flex-shrink-0" />
                      <span>Activation (Glute Bridges, Band Pullaparts)</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}

            {currentWorkoutType === "rest" || currentWorkoutType === "active_recovery" ? (
              <Card className="glass-panel rounded-xl">
                <CardContent className="p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
                    <Dumbbell className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Rest & Recover</h3>
                  <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
                    Take today off to let your muscles rebuild. Light walking or mobility work is optional but encouraged.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {baseWorkout.slice(0, Math.ceil(profile.workoutDuration / 12)).map((ex, i) => {
                  const currentExerciseId = customWorkout[i] || ex.id;
                  const currentExerciseName = getExerciseName(currentExerciseId, ex.category);
                  
                  return (
                    <Dialog key={i}>
                      <DialogTrigger asChild>
                        <Card 
                          className="bg-card/60 border-white/5 hover:border-primary/30 hover:bg-card/80 transition-all duration-200 cursor-pointer group"
                          data-testid={`card-exercise-${i}`}
                        >
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-11 w-11 rounded-xl bg-secondary/70 flex items-center justify-center text-muted-foreground font-bold text-lg group-hover:bg-primary/20 group-hover:text-primary transition-all">
                                {i + 1}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-white group-hover:text-primary transition-colors">{currentExerciseName}</h4>
                                  <RefreshCw className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                                  <span className="font-medium">{ex.sets} Sets × {ex.reps}</span>
                                  <span className="text-white/20">•</span>
                                  <span>Rest: {ex.rest}</span>
                                </div>
                              </div>
                            </div>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="w-10 h-10 rounded-xl text-primary/50 group-hover:text-primary group-hover:bg-primary/10 transition-all"
                            >
                              <PlayCircle className="w-6 h-6" />
                            </Button>
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-white/10 text-white max-h-[80vh] overflow-y-auto rounded-2xl">
                        <DialogHeader className="pb-4 border-b border-white/5">
                          <DialogTitle className="text-lg">Substitute Exercise</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-2 py-4">
                          {EXERCISES[ex.category]?.map((alt) => (
                            <Button 
                              key={alt.id}
                              variant="ghost" 
                              className={cn(
                                "justify-start h-auto py-3 px-4 rounded-xl transition-all",
                                currentExerciseId === alt.id 
                                  ? "bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20" 
                                  : "hover:bg-white/5 border border-transparent"
                              )}
                              onClick={() => {
                                setCustomWorkout(prev => ({ ...prev, [i]: alt.id }));
                              }}
                              data-testid={`button-exercise-${alt.id}`}
                            >
                              <div className="text-left">
                                <div className="font-bold">{alt.name}</div>
                                {currentExerciseId === alt.id && (
                                  <span className="text-[10px] uppercase font-bold text-primary mt-0.5 block">Selected</span>
                                )}
                              </div>
                            </Button>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stretching" className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Pre-Game (Dynamic)</h2>
                  <p className="text-xs text-muted-foreground">Perform while moving to warm up before skating</p>
                </div>
              </div>
               
              <div className="space-y-3">
                {STRETCHES.pre_game.map((stretch, i) => (
                  <Card key={i} className="bg-card/60 border-white/5 hover:border-white/10 transition-all" data-testid={`card-stretch-pre-${i}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-white mb-1">{stretch.name}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{stretch.instructions}</p>
                        </div>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg whitespace-nowrap flex-shrink-0">
                          {stretch.duration}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Move className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Post-Game (Static)</h2>
                  <p className="text-xs text-muted-foreground">Hold stretches to improve flexibility & recovery</p>
                </div>
              </div>
               
              <div className="space-y-3">
                {STRETCHES.post_game.map((stretch, i) => (
                  <Card key={i} className="bg-card/60 border-white/5 hover:border-white/10 transition-all" data-testid={`card-stretch-post-${i}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-white mb-1">{stretch.name}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{stretch.instructions}</p>
                        </div>
                        <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded-lg whitespace-nowrap flex-shrink-0">
                          {stretch.duration}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Create Custom Workout</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Combine exercise categories to build your own workout type.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workout-name" className="text-sm text-white">Workout Name</Label>
              <Input
                id="workout-name"
                placeholder="e.g. Triceps & Back"
                value={newWorkoutName}
                onChange={(e) => setNewWorkoutName(e.target.value)}
                className="bg-secondary/50 border-white/10 text-white"
                data-testid="input-custom-workout-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-white">Exercise Categories</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {EXERCISE_CATEGORIES.map((cat) => (
                  <div key={cat.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={cat.id}
                      checked={selectedCategories.includes(cat.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCategories([...selectedCategories, cat.id]);
                        } else {
                          setSelectedCategories(selectedCategories.filter(c => c !== cat.id));
                        }
                      }}
                      data-testid={`checkbox-category-${cat.id}`}
                    />
                    <label
                      htmlFor={cat.id}
                      className="text-sm text-muted-foreground cursor-pointer hover:text-white transition-colors"
                    >
                      {cat.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {customWorkoutTypes.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <Label className="text-sm text-white">Your Custom Workouts</Label>
                <div className="space-y-1">
                  {customWorkoutTypes.map((cw) => (
                    <div key={cw.id} className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg">
                      <span className="text-sm text-white">{cw.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-red-400"
                        onClick={() => deleteCustomWorkout.mutate(cw.id)}
                        data-testid={`button-delete-custom-${cw.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setNewWorkoutName("");
                setSelectedCategories([]);
              }}
              className="border-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={() => createCustomWorkout.mutate({ name: newWorkoutName, categories: selectedCategories })}
              disabled={!newWorkoutName.trim() || selectedCategories.length === 0 || createCustomWorkout.isPending}
              data-testid="button-save-custom-workout"
            >
              {createCustomWorkout.isPending ? "Saving..." : "Create Workout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
