import type { MealType } from '../enums/index.js';

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface Meal {
  id: string;
  type: MealType;
  name: string;
  description?: string;
  ingredients: Ingredient[];
  instructions: string;
  cookingTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  macros: Macros;
  imageUrl?: string;
  source: 'ai_generated' | 'recipe_database';
  rating?: number | null;
}

export interface DayPlan {
  meals: Meal[];
}

export interface MealPlan {
  id: string;
  userId: string;
  weekStart: Date;
  weekEnd: Date;
  days: Record<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday', DayPlan>;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface GenerateMealPlanRequest {
  weeks?: number;
}

export type GenerateMealPlanResponse = MealPlan;
