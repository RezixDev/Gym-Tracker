// src/features/nutrition/domain/constants.ts
import { FoodUnit, MealType } from './models';

export const FOOD_UNITS: FoodUnit[] = [
  'serving',
  'g',
  'kg',
  'cup',
  'piece',
  'slice',
  'tbsp',
  'tsp',
  'oz',
  'ml'
];

export const MEAL_TYPES: MealType[] = [
  'breakfast',
  'lunch',
  'dinner',
  'snack'
];

export const DEFAULT_FOOD_UNIT: FoodUnit = 'serving';

export const NUTRITION_GOALS = {
  DAILY_CALORIES: 2000,
  DAILY_PROTEIN: 50,
  DAILY_CARBS: 300,
  DAILY_FAT: 65
};

export const MEAL_TIME_RANGES = {
  breakfast: { start: 6, end: 11 },
  lunch: { start: 11, end: 16 },
  dinner: { start: 16, end: 21 },
  snack: { start: 21, end: 6 }
};


