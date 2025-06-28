// src/features/nutrition/domain/models/Nutrition.ts
export interface NutritionData {
  calories: number;
  protein: number; // grams
  carbs: number;   // grams
  fat: number;     // grams
}

export interface NutritionTotals extends NutritionData {
  items: number;
}



