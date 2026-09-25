import type { DashboardResponse, MealType } from "../api/client";

const ORDER: MealType[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];
const LABEL: Record<MealType, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snack",
};

export default function MealList({
  mealsByType,
  onDelete,
}: {
  mealsByType: DashboardResponse["mealsByType"];
  onDelete: (id: string) => void;
}) {
  const hasAny = ORDER.some((t) => (mealsByType[t]?.length ?? 0) > 0);

  if (!hasAny) {
    return <p className="empty-state">Nothing logged yet today — add your first meal above.</p>;
  }

  return (
    <>
      {ORDER.map((type) => {
        const meals = mealsByType[type];
        if (!meals || meals.length === 0) return null;
        return (
          <div className="meal-group" key={type}>
            <div className="meal-group-title">{LABEL[type]}</div>
            {meals.map((meal) => (
              <div className="meal-item" key={meal.id}>
                <div>
                  <div className="meal-item-name">{meal.name}</div>
                  <div className="meal-item-macros">
                    {meal.calories} kcal · P {Math.round(meal.protein)}g · C {Math.round(meal.carbs)}g · F{" "}
                    {Math.round(meal.fats)}g
                  </div>
                </div>
                <button className="meal-delete" onClick={() => onDelete(meal.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
}
