import { useCallback, useEffect, useState } from "react";
import { addMeal, deleteMeal, fetchDashboard, updateGoal, type DashboardResponse, type Goal } from "../api/client";
import MacroLabel from "../components/MacroLabel";
import MealForm from "../components/MealForm";
import MealList from "../components/MealList";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const GOALS: { value: Goal; label: string }[] = [
  { value: "CUTTING", label: "Cutting" },
  { value: "BULKING", label: "Bulking" },
  { value: "RECOMPOSITION", label: "Recomp" },
];

export default function Dashboard() {
  const { user, logout, setUser } = useAuth();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const dash = await fetchDashboard();
      setData(dash);
    } catch {
      setError("Couldn't load today's log. Is the API running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAddMeal(values: Parameters<typeof addMeal>[0]) {
    setSubmitting(true);
    setError(null);
    try {
      await addMeal(values);
      await load();
    } catch {
      setError("Couldn't log that meal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMeal(id);
      await load();
    } catch {
      setError("Couldn't remove that meal. Please try again.");
    }
  }

  async function handleGoalChange(goal: Goal) {
    try {
      const updated = await updateGoal({ goal, weightKg: user?.weightKg ?? undefined });
      setUser(updated);
      await load();
    } catch {
      setError("Couldn't update your goal. Please try again.");
    }
  }

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="dash">
      <header className="dash-header">
        <div>
          <div className="dash-brand">
            NE<span>C</span>TOR
          </div>
          <div className="dash-meta">{today}</div>
        </div>
        <div className="dash-user">
          <span className="dash-meta">{user?.name}</span>
          <button className="logout-btn" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      {error && <div className="dash-error">{error}</div>}

      {loading || !data ? (
        <p className="empty-state">Loading today's log…</p>
      ) : (
        <div className="dash-grid">
          <div>
            <MacroLabel data={data} />

            <div className="panel" style={{ marginTop: 20 }}>
              <h3 className="panel-title">Goal</h3>
              <div className="goal-picker" style={{ marginBottom: 0 }}>
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    className={`goal-option${data.goal === g.value ? " active" : ""}`}
                    onClick={() => handleGoalChange(g.value)}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="panel">
              <h3 className="panel-title">Log a meal</h3>
              <MealForm onSubmit={handleAddMeal} submitting={submitting} />
            </div>

            <div className="panel">
              <h3 className="panel-title">Today's meals</h3>
              <MealList mealsByType={data.mealsByType} onDelete={handleDelete} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
