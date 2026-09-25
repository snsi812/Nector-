import "dotenv/config";
import { Sequelize } from "sequelize";

// Production datasource: PostgreSQL, via DATABASE_URL.
// Local development without a Postgres server available: set DB_DIALECT=sqlite
// and DATABASE_URL=./dev.sqlite — no other code changes are needed, since all
// models and queries go through Sequelize rather than dialect-specific SQL.
const dialect = (process.env.DB_DIALECT as "postgres" | "sqlite") || "postgres";

export const sequelize =
  dialect === "sqlite"
    ? new Sequelize({
        dialect: "sqlite",
        storage: process.env.DATABASE_URL || "./dev.sqlite",
        logging: false,
      })
    : new Sequelize(process.env.DATABASE_URL as string, {
        dialect: "postgres",
        logging: false,
      });
