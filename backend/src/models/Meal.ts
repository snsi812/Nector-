import { DataTypes, Model, type CreationOptional, type ForeignKey, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { randomUUID } from "crypto";
import { sequelize } from "../config/database";
import { User } from "./User";

export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export class Meal extends Model<InferAttributes<Meal>, InferCreationAttributes<Meal>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User["id"]>;
  declare name: string;
  declare mealType: MealType;
  declare date: Date;

  declare calories: number;
  declare protein: number;
  declare carbs: number;
  declare fats: number;

  declare createdAt: CreationOptional<Date>;
}

Meal.init(
  {
    id: { type: DataTypes.UUID, defaultValue: () => randomUUID(), primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    mealType: {
      type: DataTypes.ENUM("BREAKFAST", "LUNCH", "DINNER", "SNACK"),
      allowNull: false,
    },
    date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    calories: { type: DataTypes.INTEGER, allowNull: false },
    protein: { type: DataTypes.FLOAT, allowNull: false },
    carbs: { type: DataTypes.FLOAT, allowNull: false },
    fats: { type: DataTypes.FLOAT, allowNull: false },
    createdAt: DataTypes.DATE,
  },
  { sequelize, modelName: "Meal", tableName: "meals", timestamps: true, updatedAt: false }
);

// Associations — mirrors the one-to-many User -> Meal relation from the
// original Prisma schema, with cascading delete.
User.hasMany(Meal, { foreignKey: "userId", onDelete: "CASCADE" });
Meal.belongsTo(User, { foreignKey: "userId" });

// Composite index for the dashboard's day-range lookups.
Meal.addHook("afterSync", async () => {
  const qi = sequelize.getQueryInterface();
  const indexes = await qi.showIndex("meals");
  const hasIndex = (indexes as Array<{ name: string }>).some((i) => i.name === "meals_user_date_idx");
  if (!hasIndex) {
    await qi.addIndex("meals", ["userId", "date"], { name: "meals_user_date_idx" });
  }
});
