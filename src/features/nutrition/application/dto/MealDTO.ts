// src/features/nutrition/application/dto/MealDTO.ts

import { Meal } from '@/features/nutrition/domain/models/Meal';

export interface MealSummaryDTO {
  id: string;
  date: string;
  mealType: string;
  foodCount: number;
  totalCalories: number;
  hasNutritionData: boolean;
  preview: string;
}

export interface DailyNutritionDTO {
  date: string;
  meals: MealSummaryDTO[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    items: number;
  };
}

export class MealDTOMapper {
  static toSummary(meal: Meal): MealSummaryDTO {
    const foodNames = meal.foods.map(f => f.name).slice(0, 3);
    const preview = foodNames.join(', ') + 
      (meal.foods.length > 3 ? ` +${meal.foods.length - 3} more` : '');

    return {
      id: meal.id,
      date: meal.date,
      mealType: meal.mealType,
      foodCount: meal.foods.length,
      totalCalories: meal.totalCalories,
      hasNutritionData: meal.nutritionDataComplete,
      preview
    };
  }

  static toDailyNutrition(date: string, meals: Meal[]): DailyNutritionDTO {
    const dayMeals = meals.filter(m => m.date === date);
    
    const totals = dayMeals.reduce((acc, meal) => ({
      calories: acc.calories + meal.totalCalories,
      protein: acc.protein + meal.totalProtein,
      carbs: acc.carbs + meal.totalCarbs,
      fat: acc.fat + meal.totalFat,
      items: acc.items + meal.foods.length
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, items: 0 });

    return {
      date,
      meals: dayMeals.map(m => this.toSummary(m)),
      totals
    };
  }
}