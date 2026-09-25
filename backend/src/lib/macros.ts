import type { Goal } from "../models";

/**
 * Derives daily calorie and macro targets from a goal and (optional) body
 * weight. This is the "goal-based logic for Cutting, Bulking, and Body
 * Recomposition" referenced in the project summary.
 *
 * Falls back to sensible flat defaults when weight isn't provided, so a user
 * can start tracking immediately and refine targets later from Settings.
 */
export function computeTargets(goal: Goal, weightKg?: number | null) {
  const w = weightKg && weightKg > 0 ? weightKg : 75; // kg, fallback baseline

  switch (goal) {
    case "CUTTING": {
      const protein = Math.round(w * 2.2);
      const fats = Math.round(w * 0.8);
      const calories = Math.round(w * 26);
      const proteinCals = protein * 4;
      const fatCals = fats * 9;
      const carbs = Math.max(0, Math.round((calories - proteinCals - fatCals) / 4));
      return { targetCalories: calories, targetProtein: protein, targetCarbs: carbs, targetFats: fats };
    }
    case "BULKING": {
      const protein = Math.round(w * 2.0);
      const fats = Math.round(w * 1.0);
      const calories = Math.round(w * 38);
      const proteinCals = protein * 4;
      const fatCals = fats * 9;
      const carbs = Math.max(0, Math.round((calories - proteinCals - fatCals) / 4));
      return { targetCalories: calories, targetProtein: protein, targetCarbs: carbs, targetFats: fats };
    }
    case "RECOMPOSITION":
    default: {
      const protein = Math.round(w * 2.2);
      const fats = Math.round(w * 0.9);
      const calories = Math.round(w * 31);
      const proteinCals = protein * 4;
      const fatCals = fats * 9;
      const carbs = Math.max(0, Math.round((calories - proteinCals - fatCals) / 4));
      return { targetCalories: calories, targetProtein: protein, targetCarbs: carbs, targetFats: fats };
    }
  }
}
