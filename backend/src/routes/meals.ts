import { Router } from "express";
import { Op } from "sequelize";
import { z } from "zod";
import { Meal } from "../models";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

const mealSchema = z.object({
  name: z.string().min(1),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
  date: z.string().datetime().optional(),
  calories: z.number().int().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fats: z.number().nonnegative(),
});

// POST /api/meals — log a meal with its macro breakdown.
router.post("/", async (req: AuthedRequest, res) => {
  const parsed = mealSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { date, ...rest } = parsed.data;

  const meal = await Meal.create({
    ...rest,
    date: date ? new Date(date) : new Date(),
    userId: req.userId!,
  });

  return res.status(201).json({ meal });
});

// GET /api/meals?date=YYYY-MM-DD — list meals for a given day (defaults to today).
router.get("/", async (req: AuthedRequest, res) => {
  const dateParam = typeof req.query.date === "string" ? req.query.date : undefined;
  const { start, end } = dayBounds(dateParam);

  const meals = await Meal.findAll({
    where: { userId: req.userId, date: { [Op.gte]: start, [Op.lt]: end } },
    order: [["createdAt", "ASC"]],
  });

  return res.json({ meals });
});

// DELETE /api/meals/:id — remove a logged meal.
router.delete("/:id", async (req: AuthedRequest, res) => {
  const meal = await Meal.findByPk(req.params.id);
  if (!meal || meal.userId !== req.userId) {
    return res.status(404).json({ error: "Meal not found" });
  }
  await meal.destroy();
  return res.status(204).send();
});

// PUT /api/meals/:id — edit a logged meal.
router.put("/:id", async (req: AuthedRequest, res) => {
  const meal = await Meal.findByPk(req.params.id);
  if (!meal || meal.userId !== req.userId) {
    return res.status(404).json({ error: "Meal not found" });
  }

  const parsed = mealSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { date, ...rest } = parsed.data;

  meal.set({ ...rest, ...(date ? { date: new Date(date) } : {}) });
  await meal.save();

  return res.json({ meal });
});

function dayBounds(dateStr?: string) {
  const base = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export default router;
