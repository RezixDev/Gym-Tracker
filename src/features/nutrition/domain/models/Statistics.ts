// src/features/nutrition/domain/models/Statistics.ts
export interface NutritionStatistics {
  totalMeals: number;
  totalFoodItems: number;
  mealsWithNutrition: number;
  mealsWithoutNutrition: number;
  nutritionCompleteness: number; // percentage
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  averageCaloriesPerDay: number;
  mealCounts: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snack: number;
  };
}

export interface DailyStatistics {
  date: string;
  mealCount: number;
  foodItemCount: number;
  mealsWithNutrition: number;
  nutritionCompleteness: number; // percentage
}
