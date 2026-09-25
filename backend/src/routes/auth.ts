import bcrypt from "bcrypt";
import { Router } from "express";
import { z } from "zod";
import { User } from "../models";
import { computeTargets } from "../lib/macros";
import { requireAuth, signToken, AuthedRequest } from "../middleware/auth";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  goal: z.enum(["CUTTING", "BULKING", "RECOMPOSITION"]).default("RECOMPOSITION"),
  weightKg: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { name, email, password, goal, weightKg, heightCm } = parsed.data;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const targets = computeTargets(goal, weightKg);

  const user = await User.create({
    name,
    email,
    passwordHash,
    goal,
    weightKg: weightKg ?? null,
    heightCm: heightCm ?? null,
    ...targets,
  });

  const token = signToken(user.id);
  return res.status(201).json({ token, user: user.toSafeJSON() });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken(user.id);
  return res.json({ token, user: user.toSafeJSON() });
});

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await User.findByPk(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ user: user.toSafeJSON() });
});

export default router;
