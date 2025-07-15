// src/features/nutrition/domain/utils/validators.ts
import { Meal, FoodItem } from '@/features/nutrition/models';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class Validators {
  /**
   * Validates a food item
   */
  static validateFoodItem(food: Partial<FoodItem>): ValidationResult {
    const errors: string[] = [];

    if (!food.name?.trim()) {
      errors.push('Food name is required');
    }

    if (food.quantity !== undefined && food.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (!food.unit?.trim()) {
      errors.push('Unit is required');
    }

    // Nutrition values should be non-negative
    if (food.calories !== undefined && food.calories < 0) {
      errors.push('Calories cannot be negative');
    }

    if (food.protein !== undefined && food.protein < 0) {
      errors.push('Protein cannot be negative');
    }

    if (food.carbs !== undefined && food.carbs < 0) {
      errors.push('Carbs cannot be negative');
    }

    if (food.fat !== undefined && food.fat < 0) {
      errors.push('Fat cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates a meal
   */
  static validateMeal(meal: Partial<Meal>): ValidationResult {
    const errors: string[] = [];

    if (!meal.date) {
      errors.push('Date is required');
    }

    if (!meal.mealType) {
      errors.push('Meal type is required');
    }

    if (!meal.foods || meal.foods.length === 0) {
      errors.push('At least one food item is required');
    }

    // Validate each food item
    meal.foods?.forEach((food, index) => {
      const foodValidation = this.validateFoodItem(food);
      if (!foodValidation.isValid) {
        foodValidation.errors.forEach(error => {
          errors.push(`Food item ${index + 1}: ${error}`);
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates nutrition update data
   */
  static validateNutritionUpdate(data: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  }): ValidationResult {
    const errors: string[] = [];

    if (data.calories !== undefined && data.calories < 0) {
      errors.push('Calories cannot be negative');
    }

    if (data.protein !== undefined && data.protein < 0) {
      errors.push('Protein cannot be negative');
    }

    if (data.carbs !== undefined && data.carbs < 0) {
      errors.push('Carbs cannot be negative');
    }

    if (data.fat !== undefined && data.fat < 0) {
      errors.push('Fat cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

