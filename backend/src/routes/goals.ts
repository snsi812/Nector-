import { Router } from "express";
import { z } from "zod";
import { User } from "../models";
import { computeTargets } from "../lib/macros";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

const updateGoalSchema = z.object({
  goal: z.enum(["CUTTING", "BULKING", "RECOMPOSITION"]),
  weightKg: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
  overrides: z
    .object({
      targetCalories: z.number().int().positive().optional(),
      targetProtein: z.number().int().positive().optional(),
      targetCarbs: z.number().int().positive().optional(),
      targetFats: z.number().int().positive().optional(),
    })
    .optional(),
});

// PUT /api/goals — set goal type; recomputes macro targets unless overridden.
router.put("/", async (req: AuthedRequest, res) => {
  const parsed = updateGoalSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { goal, weightKg, heightCm, overrides } = parsed.data;

  const user = await User.findByPk(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const computed = computeTargets(goal, weightKg);
  const targets = { ...computed, ...overrides };

  user.set({
    goal,
    weightKg: weightKg ?? user.weightKg,
    heightCm: heightCm ?? user.heightCm,
    ...targets,
  });
  await user.save();

  return res.json({ user: user.toSafeJSON() });
});

export default router;
