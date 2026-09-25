import { Router } from "express";
import { Op } from "sequelize";
import { Meal, User } from "../models";
import type { MealType } from "../models";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

interface DailyMealTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

// GET /api/dashboard?date=YYYY-MM-DD — daily macro totals, grouped by meal
// type, plus progress against the user's goal-based targets.
router.get("/", async (req: AuthedRequest, res) => {
  const dateParam = typeof req.query.date === "string" ? req.query.date : undefined;
  const base = dateParam ? new Date(dateParam) : new Date();
  const start = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const [user, meals] = await Promise.all([
    User.findByPk(req.userId),
    Meal.findAll({
      where: { userId: req.userId, date: { [Op.gte]: start, [Op.lt]: end } },
      order: [["createdAt", "ASC"]],
    }),
  ]);

  if (!user) return res.status(404).json({ error: "User not found" });

  const totals = meals.reduce(
    (acc: DailyMealTotals, m) => {
      acc.calories += m.calories;
      acc.protein += m.protein;
      acc.carbs += m.carbs;
      acc.fats += m.fats;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const byType = groupByType(meals);

  const targets = {
    calories: user.targetCalories,
    protein: user.targetProtein,
    carbs: user.targetCarbs,
    fats: user.targetFats,
  };

  const remaining = {
    calories: targets.calories - totals.calories,
    protein: Math.round((targets.protein - totals.protein) * 10) / 10,
    carbs: Math.round((targets.carbs - totals.carbs) * 10) / 10,
    fats: Math.round((targets.fats - totals.fats) * 10) / 10,
  };

  return res.json({
    date: start.toISOString().slice(0, 10),
    goal: user.goal,
    targets,
    totals,
    remaining,
    mealsByType: byType,
  });
});

function groupByType(meals: Meal[]) {
  return meals.reduce((acc: Record<string, Meal[]>, m) => {
    const key = m.mealType as MealType;
    (acc[key] ||= []).push(m);
    return acc;
  }, {});
}

export default router;
