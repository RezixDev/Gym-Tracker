// src/features/nutrition/domain/services/NutritionCalculator.ts
import { FoodItem, Meal, NutritionData, NutritionTotals } from '../models';

export class NutritionCalculator {
  /**
   * Calculates total nutrition from an array of food items
   */
  static calculateTotals(foods: FoodItem[]): NutritionTotals {
    const totals = foods.reduce(
      (acc, food) => ({
        calories: acc.calories + (food.calories || 0),
        protein: acc.protein + (food.protein || 0),
        carbs: acc.carbs + (food.carbs || 0),
        fat: acc.fat + (food.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return {
      ...totals,
      items: foods.length
    };
  }

  /**
   * Checks if a meal has complete nutrition data
   */
  static hasNutritionData(meal: Meal): boolean {
    return (
      meal.totalCalories > 0 ||
      meal.foods.some(food => food.calories > 0)
    );
  }

  /**
   * Checks if a food item has nutrition data
   */
  static foodHasNutritionData(food: FoodItem): boolean {
    return food.calories > 0;
  }

  /**
   * Calculates the nutrition completeness percentage for a set of meals
   */
  static calculateCompleteness(meals: Meal[]): number {
    if (meals.length === 0) return 0;
    
    const mealsWithNutrition = meals.filter(meal => this.hasNutritionData(meal));
    return (mealsWithNutrition.length / meals.length) * 100;
  }

  /**
   * Calculates daily nutrition totals from meals
   */
  static calculateDailyTotals(meals: Meal[]): NutritionData {
    return meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.totalCalories,
        protein: acc.protein + meal.totalProtein,
        carbs: acc.carbs + meal.totalCarbs,
        fat: acc.fat + meal.totalFat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }
}

