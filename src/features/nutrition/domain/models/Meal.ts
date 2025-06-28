// src/features/nutrition/domain/models/Meal.ts
import { FoodItem } from './FoodItem';
import { NutritionData } from './Nutrition';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Meal extends NutritionData {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  mealType: MealType;
  foods: FoodItem[];
  notes: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  nutritionDataComplete: boolean;
}