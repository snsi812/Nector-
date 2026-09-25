import { useState, type FormEvent } from "react";
import type { MealType } from "../api/client";

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: "BREAKFAST", label: "Breakfast" },
  { value: "LUNCH", label: "Lunch" },
  { value: "DINNER", label: "Dinner" },
  { value: "SNACK", label: "Snack" },
];

interface MealFormValues {
  name: string;
  mealType: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export default function MealForm({
  onSubmit,
  submitting,
}: {
  onSubmit: (values: MealFormValues) => Promise<void> | void;
  submitting: boolean;
}) {
  const [name, setName] = useState("");
  const [mealType, setMealType] = useState<MealType>("BREAKFAST");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !calories) return;

    await onSubmit({
      name: name.trim(),
      mealType,
      calories: Number(calories),
      protein: Number(protein || 0),
      carbs: Number(carbs || 0),
      fats: Number(fats || 0),
    });

    setName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFats("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="meal-form-grid">
        <div className="field-sm">
          <label htmlFor="meal-name">Meal / food</label>
          <input
            id="meal-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Grilled chicken bowl"
            required
          />
        </div>
        <div className="field-sm">
          <label htmlFor="meal-type">Type</label>
          <select id="meal-type" value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}>
            {MEAL_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="meal-form-row4">
        <div className="field-sm">
          <label htmlFor="meal-cal">Calories (kcal)</label>
          <input
            id="meal-cal"
            type="number"
            min={0}
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="520"
            required
          />
        </div>
        <div className="field-sm">
          <label htmlFor="meal-protein">Protein (g)</label>
          <input
            id="meal-protein"
            type="number"
            min={0}
            step="0.1"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            placeholder="42"
          />
        </div>
        <div className="field-sm">
          <label htmlFor="meal-carbs">Carbs (g)</label>
          <input
            id="meal-carbs"
            type="number"
            min={0}
            step="0.1"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            placeholder="55"
          />
        </div>
        <div className="field-sm">
          <label htmlFor="meal-fats">Fats (g)</label>
          <input
            id="meal-fats"
            type="number"
            min={0}
            step="0.1"
            value={fats}
            onChange={(e) => setFats(e.target.value)}
            placeholder="14"
          />
        </div>
      </div>

      <button className="add-meal-btn" type="submit" disabled={submitting}>
        {submitting ? "Logging…" : "Log Meal"}
      </button>
    </form>
  );
}
