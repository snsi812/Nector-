import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Goal } from "../api/client";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const GOALS: { value: Goal; label: string }[] = [
  { value: "CUTTING", label: "Cutting" },
  { value: "BULKING", label: "Bulking" },
  { value: "RECOMPOSITION", label: "Recomp" },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [goal, setGoal] = useState<Goal>("RECOMPOSITION");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(name, email, password, goal, weightKg ? Number(weightKg) : undefined);
      navigate("/");
    } catch (err: unknown) {
      setError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="auth-eyebrow">Nector · Create Account</p>
        <h1 className="auth-title">Start tracking</h1>
        <p className="auth-subtitle">
          Pick a goal and Nector sets your daily calorie and macro targets automatically. You can fine-tune them later.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Sanskar" />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          <div className="field">
            <label htmlFor="weight">Body weight (kg) — optional, sharpens your targets</label>
            <input
              id="weight"
              type="number"
              min={30}
              max={250}
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="75"
            />
          </div>

          <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-soft)", marginBottom: 5 }}>
            Goal
          </label>
          <div className="goal-picker">
            {GOALS.map((g) => (
              <button
                type="button"
                key={g.value}
                className={`goal-option${goal === g.value ? " active" : ""}`}
                onClick={() => setGoal(g.value)}
              >
                {g.label}
              </button>
            ))}
          </div>

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already tracking? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function extractError(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const response = (err as { response?: { data?: { error?: string } } }).response;
    if (response?.data?.error) {
      const e = response.data.error;
      return typeof e === "string" ? e : "Please check the form and try again.";
    }
  }
  return "Something went wrong. Please try again.";
}
