# Nector

A full-stack nutrition and macro-tracking platform. Users pick a goal —
**Cutting**, **Bulking**, or **Body Recomposition** — and Nector derives daily
calorie and macro (protein / carbs / fats) targets automatically. Meals are
logged with their own macro breakdown, and a dashboard shows daily totals
against targets, styled like a nutrition-facts label.

**Stack:** TypeScript · Node.js (Express) · Prisma ORM → PostgreSQL · React ·
JWT + Bcrypt authentication.

## Structure

```
nector/
├── backend/     Express API — auth, goals, meals, dashboard, Prisma schema
└── frontend/    React + Vite client
```

## Backend setup

1. Install PostgreSQL and create a database:
   ```bash
   createdb nector
   ```
2. Configure and install:
   ```bash
   cd backend
   npm install
   # edit .env → DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/nector?schema=public"
   ```
3. Generate the Prisma Client and create the tables:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Run:
   ```bash
   npm run dev      # http://localhost:4000
   ```

Useful: `npx prisma studio` opens a browser UI for the database. To see the
SQL Prisma generates, use `new PrismaClient({ log: ["query"] })` in
`src/lib/prisma.ts`.

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev             # http://localhost:5173
```

## API

| Method | Route                  | Description                                  |
| ------ | ---------------------- | -------------------------------------------- |
| POST   | `/api/auth/register`   | Create account, returns JWT                  |
| POST   | `/api/auth/login`      | Authenticate, returns JWT                    |
| GET    | `/api/auth/me`         | Current user (Bearer token)                  |
| PUT    | `/api/goals`           | Update goal / weight, recomputes targets     |
| POST   | `/api/meals`           | Log a meal with macros                       |
| GET    | `/api/meals?date=`     | Meals for a day (default today)              |
| PUT    | `/api/meals/:id`       | Edit a meal                                  |
| DELETE | `/api/meals/:id`       | Remove a meal                                |
| GET    | `/api/dashboard?date=` | Daily totals, remaining, grouped by meal type|

## Notes

- Passwords hashed with **bcrypt** (12 rounds); sessions use **JWT** (7-day expiry).
- Goal-based targets live in `backend/src/lib/macros.ts`.
- `prisma/schema.prisma` defines `User` and `Meal` (one-to-many, cascade delete)
  and the `Goal` / `MealType` enums, enforced by PostgreSQL.

  and shows calories and each macro against the day's target, with a
  remaining count for the rest of the day.
