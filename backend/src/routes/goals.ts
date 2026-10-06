import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
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
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { goal, weightKg, heightCm, overrides } = parsed.data;

  const targets = { ...computeTargets(goal, weightKg), ...overrides };
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { goal, weightKg, heightCm, ...targets },
  });

  const { passwordHash, ...safeUser } = user;
  return res.json({ user: safeUser });
});

export default router;
