// Local union mirroring the Prisma `Goal` enum.
export type Goal = "CUTTING" | "BULKING" | "RECOMPOSITION";

/**
 * Derives daily calorie and macro targets from a goal and (optional) body
 * weight — the goal-based logic for Cutting, Bulking, and Body Recomposition.
 */
export function computeTargets(goal: Goal, weightKg?: number | null) {
  const w = weightKg && weightKg > 0 ? weightKg : 75;

  const build = (proteinPerKg: number, fatsPerKg: number, kcalPerKg: number) => {
    const protein = Math.round(w * proteinPerKg);
    const fats = Math.round(w * fatsPerKg);
    const calories = Math.round(w * kcalPerKg);
    const carbs = Math.max(0, Math.round((calories - protein * 4 - fats * 9) / 4));
    return { targetCalories: calories, targetProtein: protein, targetCarbs: carbs, targetFats: fats };
  };

  switch (goal) {
    case "CUTTING":
      return build(2.2, 0.8, 26);
    case "BULKING":
      return build(2.0, 1.0, 38);
    case "RECOMPOSITION":
    default:
      return build(2.2, 0.9, 31);
  }
}
