import type { DashboardResponse, Goal } from "../api/client";

const GOAL_LABEL: Record<Goal, string> = {
  CUTTING: "Cutting",
  BULKING: "Bulking",
  RECOMPOSITION: "Recomp",
};

const MACRO_META = [
  { key: "protein" as const, label: "Protein", color: "var(--protein)" },
  { key: "carbs" as const, label: "Carbs", color: "var(--carbs)" },
  { key: "fats" as const, label: "Fats", color: "var(--fats)" },
];

export default function MacroLabel({ data }: { data: DashboardResponse }) {
  const { targets, totals, remaining, goal } = data;
  const caloriesPct = Math.min(100, Math.round((totals.calories / Math.max(targets.calories, 1)) * 100));

  return (
    <div className="label-panel">
      <h2 className="label-title">Nutrition Facts</h2>
      <div className="label-sub">
        <span>Today's log</span>
        <span className="goal-badge">Goal: {GOAL_LABEL[goal]}</span>
      </div>

      <div className="calories-row">
        <span className="calories-label">Calories</span>
        <span>
          <span className="calories-value">{totals.calories}</span>{" "}
          <span className="calories-target">/ {targets.calories} kcal</span>
        </span>
      </div>

      <div style={{ margin: "10px 0 4px" }}>
        <div className="macro-bar-track">
          <div
            className="macro-bar-fill"
            style={{
              width: `${caloriesPct}%`,
              background: totals.calories > targets.calories ? "var(--over)" : "var(--calories)",
            }}
          />
        </div>
      </div>

      {MACRO_META.map(({ key, label, color }) => {
        const value = totals[key];
        const target = targets[key];
        const pct = Math.min(100, Math.round((value / Math.max(target, 1)) * 100));
        return (
          <div className="macro-row" key={key}>
            <div className="macro-row-top">
              <span className="macro-name">
                <span className="macro-swatch" style={{ background: color }} />
                {label}
              </span>
              <span className="macro-figures">
                {Math.round(value * 10) / 10}g / {target}g
              </span>
            </div>
            <div className="macro-bar-track">
              <div className="macro-bar-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        );
      })}

      <div className="remaining-note">
        <strong>{Math.max(remaining.calories, 0)} kcal</strong> remaining today ·{" "}
        <strong>{Math.max(remaining.protein, 0)}g</strong> protein ·{" "}
        <strong>{Math.max(remaining.carbs, 0)}g</strong> carbs ·{" "}
        <strong>{Math.max(remaining.fats, 0)}g</strong> fats
      </div>
    </div>
  );
}
