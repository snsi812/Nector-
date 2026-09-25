import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { randomUUID } from "crypto";
import { sequelize } from "../config/database";

export type Goal = "CUTTING" | "BULKING" | "RECOMPOSITION";

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare email: string;
  declare passwordHash: string;
  declare name: string;
  declare goal: CreationOptional<Goal>;

  declare targetCalories: CreationOptional<number>;
  declare targetProtein: CreationOptional<number>;
  declare targetCarbs: CreationOptional<number>;
  declare targetFats: CreationOptional<number>;

  declare weightKg: CreationOptional<number | null>;
  declare heightCm: CreationOptional<number | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Never serialize the hash back to a client.
  toSafeJSON() {
    const { passwordHash, ...rest } = this.toJSON();
    return rest;
  }
}

User.init(
  {
    id: { type: DataTypes.UUID, defaultValue: () => randomUUID(), primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    goal: {
      type: DataTypes.ENUM("CUTTING", "BULKING", "RECOMPOSITION"),
      allowNull: false,
      defaultValue: "RECOMPOSITION",
    },
    targetCalories: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 2200 },
    targetProtein: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 150 },
    targetCarbs: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 220 },
    targetFats: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 70 },
    weightKg: { type: DataTypes.FLOAT, allowNull: true },
    heightCm: { type: DataTypes.FLOAT, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: "User", tableName: "users", timestamps: true }
);
