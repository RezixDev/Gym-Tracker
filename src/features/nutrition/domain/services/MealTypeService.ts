// src/features/nutrition/domain/services/MealTypeService.ts
import { MealType } from '../models';

export class MealTypeService {
  /**
   * Determines the meal type based on the current time
   */
  static getMealTypeFromTime(date: Date = new Date()): MealType {
    const hour = date.getHours();
    
    if (hour < 11) return 'breakfast';
    if (hour < 16) return 'lunch';
    if (hour < 21) return 'dinner';
    return 'snack';
  }

  /**
   * Gets the display order for meal types
   */
  static getMealTypeOrder(mealType: MealType): number {
    const order: Record<MealType, number> = {
      breakfast: 1,
      lunch: 2,
      dinner: 3,
      snack: 4
    };
    return order[mealType];
  }

  /**
   * Sorts meals by their type order
   */
  static sortByMealType<T extends { mealType: MealType }>(meals: T[]): T[] {
    return [...meals].sort(
      (a, b) => this.getMealTypeOrder(a.mealType) - this.getMealTypeOrder(b.mealType)
    );
  }
}

