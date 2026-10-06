import cors from "cors";
import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth";
import dashboardRoutes from "./routes/dashboard";
import goalRoutes from "./routes/goals";
import mealRoutes from "./routes/meals";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/dashboard", dashboardRoutes);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Nector API listening on http://localhost:${PORT}`);
});
