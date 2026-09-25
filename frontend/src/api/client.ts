import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nector_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type Goal = "CUTTING" | "BULKING" | "RECOMPOSITION";
export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export interface User {
  id: string;
  name: string;
  email: string;
  goal: Goal;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  weightKg?: number | null;
  heightCm?: number | null;
}

export interface Meal {
  id: string;
  name: string;
  mealType: MealType;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface DashboardResponse {
  date: string;
  goal: Goal;
  targets: { calories: number; protein: number; carbs: number; fats: number };
  totals: { calories: number; protein: number; carbs: number; fats: number };
  remaining: { calories: number; protein: number; carbs: number; fats: number };
  mealsByType: Partial<Record<MealType, Meal[]>>;
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  goal: Goal;
  weightKg?: number;
}) {
  const { data } = await api.post<{ token: string; user: User }>("/auth/register", payload);
  return data;
}

export async function login(payload: { email: string; password: string }) {
  const { data } = await api.post<{ token: string; user: User }>("/auth/login", payload);
  return data;
}

export async function fetchMe() {
  const { data } = await api.get<{ user: User }>("/auth/me");
  return data.user;
}

export async function fetchDashboard(date?: string) {
  const { data } = await api.get<DashboardResponse>("/dashboard", { params: { date } });
  return data;
}

export async function addMeal(payload: {
  name: string;
  mealType: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}) {
  const { data } = await api.post<{ meal: Meal }>("/meals", payload);
  return data.meal;
}

export async function deleteMeal(id: string) {
  await api.delete(`/meals/${id}`);
}

export async function updateGoal(payload: { goal: Goal; weightKg?: number }) {
  const { data } = await api.put<{ user: User }>("/goals", payload);
  return data.user;
}
