import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

// GET /api/dashboard?date=YYYY-MM-DD — daily totals grouped by meal type,
// plus progress against the user's goal-based targets.
router.get("/", async (req: AuthedRequest, res) => {
  const dateParam = typeof req.query.date === "string" ? req.query.date : undefined;
  const base = dateParam ? new Date(dateParam) : new Date();
  const start = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const [user, meals] = await Promise.all([
    prisma.user.findUnique({ where: { id: req.userId } }),
    prisma.meal.findMany({
      where: { userId: req.userId, date: { gte: start, lt: end } },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  if (!user) return res.status(404).json({ error: "User not found" });

  const totals = meals.reduce(
    (acc: MacroTotals, m: MacroTotals) => {
      acc.calories += m.calories;
      acc.protein += m.protein;
      acc.carbs += m.carbs;
      acc.fats += m.fats;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

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

  const mealsByType = meals.reduce((acc: Record<string, unknown[]>, m: { mealType: string }) => {
    (acc[m.mealType] ||= []).push(m);
    return acc;
  }, {});

  return res.json({
    date: start.toISOString().slice(0, 10),
    goal: user.goal,
    targets,
    totals,
    remaining,
    mealsByType,
  });
});

export default router;
