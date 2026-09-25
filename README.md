
# Nector

A full-stack nutrition and macro-tracking platform. Users pick a goal —
**Cutting**, **Bulking**, or **Body Recomposition** — and Nector derives
daily calorie and macro (protein / carbs / fats) targets automatically.
Meals are logged with their own macro breakdown, and a dashboard shows
daily totals against targets, styled like a nutrition-facts label.

**Stack:** TypeScript · Node.js (Express) · Sequelize ORM → PostgreSQL ·
React · JWT + Bcrypt authentication.

> This is a variant of the project built on **Sequelize + PostgreSQL**
> instead of Prisma + SQL Server. Every feature, route, and UI element is
> identical — only the data-access layer changed.

## Project structure

```
nector/
├── backend/     Express API — auth, goals, meals, dashboard
└── frontend/    React + Vite client
```

## Backend

```bash
cd backend
npm install
cp .env .env        # already present; edit DATABASE_URL for your Postgres instance
npm run dev          # http://localhost:4000
```

`DATABASE_URL` in `backend/.env` is set up for PostgreSQL, e.g.:

```
DATABASE_URL="postgres://postgres:yourpassword@localhost:5432/nector"
DB_DIALECT="postgres"
```

The schema self-creates on boot via `sequelize.sync()` (fine for local/dev
use; swap in `sequelize-cli` migrations for a production deployment).

No Postgres available locally? Set:

```
DB_DIALECT="sqlite"
DATABASE_URL="./dev.sqlite"
```

— no other code changes are needed. All queries go through Sequelize's
model API (`User.findOne`, `Meal.findAll`, etc.) rather than raw or
dialect-specific SQL, so the same code runs against either database. This
was verified by running the full API — register → log a meal → fetch the
dashboard — end-to-end against SQLite during development.

### API summary

| Method | Route                 | Description                              |
| ------ | --------------------- | ----------------------------------------- |
| POST   | `/api/auth/register`  | Create account, returns JWT               |
| POST   | `/api/auth/login`     | Authenticate, returns JWT                 |
| GET    | `/api/auth/me`        | Current user (requires `Authorization: Bearer <token>`) |
| PUT    | `/api/goals`           | Update goal / body weight, recomputes targets |
| POST   | `/api/meals`           | Log a meal with its macro breakdown       |
| GET    | `/api/meals?date=`     | List meals for a day (defaults to today)  |
| PUT    | `/api/meals/:id`       | Edit a logged meal                        |
| DELETE | `/api/meals/:id`       | Remove a logged meal                      |
| GET    | `/api/dashboard?date=` | Daily totals, remaining, grouped by meal type |

## Frontend

```bash
cd frontend
npm install
cp .env.example .env   # points at the local API by default
npm run dev             # http://localhost:5173
```

## Notes

- Passwords are hashed with **bcrypt** (12 rounds); sessions use **JWT**
  (7-day expiry) sent as `Authorization: Bearer <token>`.
- Goal-based targets are computed in `backend/src/lib/macros.ts` from goal
  type and body weight, then stored per-user and editable from the
  dashboard.
- `User` and `Meal` are plain Sequelize models (`src/models`) connected by
  a one-to-many association with cascading delete, matching the original
  Prisma schema's shape 1:1.
- The dashboard groups meals by type (breakfast / lunch / dinner / snack)
  and shows calories and each macro against the day's target, with a
  remaining count for the rest of the day.
