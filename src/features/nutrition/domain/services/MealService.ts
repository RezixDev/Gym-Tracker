// src/features/nutrition/domain/services/MealService.ts
import { Meal, FoodItem, NutritionStatistics, DailyStatistics } from '@/features/nutrition/models';
import { NutritionCalculator } from './NutritionCalculator';
import { DateUtils } from '@/features/nutrition/domain/utils/dateUtils';

export class MealService {
  /**
   * Creates a new meal with validated data
   */
  static createMeal(
    mealData: Omit<Meal, 'id' | 'createdAt' | 'updatedAt' | 'nutritionDataComplete'>
  ): Meal {
    const now = new Date().toISOString();
    const hasNutritionData = NutritionCalculator.hasNutritionData(mealData as Meal);

    return {
      ...mealData,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      nutritionDataComplete: hasNutritionData,
    };
  }

  /**
   * Creates a new food item with validated data
   */
  static createFoodItem(
    foodData: Omit<FoodItem, 'id' | 'nutritionDataAdded' | 'lastNutritionUpdate'>
  ): FoodItem {
    const hasNutritionData = (foodData.calories || 0) > 0;

    return {
      ...foodData,
      id: crypto.randomUUID(),
      calories: Number(foodData.calories) || 0,
      protein: Number(foodData.protein) || 0,
      carbs: Number(foodData.carbs) || 0,
      fat: Number(foodData.fat) || 0,
      quantity: Number(foodData.quantity) || 1,
      nutritionDataAdded: hasNutritionData,
      lastNutritionUpdate: hasNutritionData ? new Date().toISOString() : undefined,
    };
  }

  /**
   * Updates meal nutrition data
   */
  static updateMealNutrition(
    meal: Meal,
    nutritionUpdate: {
      totalCalories?: number;
      totalProtein?: number;
      totalCarbs?: number;
      totalFat?: number;
      foodUpdates?: Array<{
        foodId: string;
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
      }>;
    }
  ): Meal {
    const now = new Date().toISOString();
    let updatedFoods = [...meal.foods];

    // Update individual food items if provided
    if (nutritionUpdate.foodUpdates) {
      updatedFoods = meal.foods.map(food => {
        const update = nutritionUpdate.foodUpdates?.find(u => u.foodId === food.id);
        if (!update) return food;

        return {
          ...food,
          calories: update.calories !== undefined ? Number(update.calories) : food.calories,
          protein: update.protein !== undefined ? Number(update.protein) : food.protein,
          carbs: update.carbs !== undefined ? Number(update.carbs) : food.carbs,
          fat: update.fat !== undefined ? Number(update.fat) : food.fat,
          nutritionDataAdded: true,
          lastNutritionUpdate: now,
        };
      });
    }

    // Calculate totals
    const calculatedTotals = NutritionCalculator.calculateTotals(updatedFoods);
    
    const updatedMeal: Meal = {
      ...meal,
      foods: updatedFoods,
      totalCalories: nutritionUpdate.totalCalories ?? calculatedTotals.calories,
      totalProtein: nutritionUpdate.totalProtein ?? calculatedTotals.protein,
      totalCarbs: nutritionUpdate.totalCarbs ?? calculatedTotals.carbs,
      totalFat: nutritionUpdate.totalFat ?? calculatedTotals.fat,
      nutritionDataComplete: NutritionCalculator.hasNutritionData({ 
        ...meal, 
        totalCalories: nutritionUpdate.totalCalories ?? calculatedTotals.calories 
      } as Meal),
      updatedAt: now,
    };

    return updatedMeal;
  }

  /**
   * Filters meals by date range
   */
  static filterByDateRange(
    meals: Meal[],
    startDate?: string,
    endDate?: string
  ): Meal[] {
    let filtered = [...meals];

    if (startDate) {
      filtered = filtered.filter(meal => meal.date >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(meal => meal.date <= endDate);
    }

    return filtered;
  }

  /**
   * Groups meals by date
   */
  static groupByDate(meals: Meal[]): Record<string, Meal[]> {
    return meals.reduce((acc, meal) => {
      if (!acc[meal.date]) {
        acc[meal.date] = [];
      }
      acc[meal.date].push(meal);
      return acc;
    }, {} as Record<string, Meal[]>);
  }

  /**
   * Groups meals by meal type
   */
  static groupByMealType(meals: Meal[]): Record<string, Meal[]> {
    return meals.reduce((acc, meal) => {
      if (!acc[meal.mealType]) {
        acc[meal.mealType] = [];
      }
      acc[meal.mealType].push(meal);
      return acc;
    }, {} as Record<string, Meal[]>);
  }

  /**
   * Calculates comprehensive nutrition statistics
   */
  static calculateStatistics(
    meals: Meal[],
    startDate?: string,
    endDate?: string
  ): NutritionStatistics {
    const filteredMeals = this.filterByDateRange(meals, startDate, endDate);

    if (filteredMeals.length === 0) {
      return {
        totalMeals: 0,
        totalFoodItems: 0,
        mealsWithNutrition: 0,
        mealsWithoutNutrition: 0,
        nutritionCompleteness: 0,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        averageCaloriesPerDay: 0,
        mealCounts: { breakfast: 0, lunch: 0, dinner: 0, snack: 0 },
      };
    }

    const mealsWithNutrition = filteredMeals.filter(meal => 
      NutritionCalculator.hasNutritionData(meal)
    );
    
    const nutritionTotals = mealsWithNutrition.reduce(
      (acc, meal) => ({
        totalCalories: acc.totalCalories + meal.totalCalories,
        totalProtein: acc.totalProtein + meal.totalProtein,
        totalCarbs: acc.totalCarbs + meal.totalCarbs,
        totalFat: acc.totalFat + meal.totalFat,
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
    );

    const totalFoodItems = filteredMeals.reduce(
      (sum, meal) => sum + (meal.foods?.length || 0),
      0
    );

    const uniqueDates = new Set(filteredMeals.map(meal => meal.date));
    const dayCount = uniqueDates.size;

    const mealCounts = {
      breakfast: filteredMeals.filter(meal => meal.mealType === 'breakfast').length,
      lunch: filteredMeals.filter(meal => meal.mealType === 'lunch').length,
      dinner: filteredMeals.filter(meal => meal.mealType === 'dinner').length,
      snack: filteredMeals.filter(meal => meal.mealType === 'snack').length,
    };

    return {
      totalMeals: filteredMeals.length,
      totalFoodItems,
      mealsWithNutrition: mealsWithNutrition.length,
      mealsWithoutNutrition: filteredMeals.length - mealsWithNutrition.length,
      nutritionCompleteness: NutritionCalculator.calculateCompleteness(filteredMeals),
      ...nutritionTotals,
      averageCaloriesPerDay: dayCount > 0 ? nutritionTotals.totalCalories / dayCount : 0,
      mealCounts,
    };
  }

  /**
   * Gets daily statistics for the last N days
   */
  static getRecentDaysStatistics(meals: Meal[], days: number = 7): DailyStatistics[] {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const recentMeals = this.filterByDateRange(
      meals,
      DateUtils.toISODate(startDate),
      DateUtils.toISODate(endDate)
    );

    const mealsByDate = this.groupByDate(recentMeals);

    return Object.entries(mealsByDate)
      .map(([date, dayMeals]) => {
        const totalFoodItems = dayMeals.reduce(
          (sum, meal) => sum + (meal.foods?.length || 0),
          0
        );
        const mealsWithNutrition = dayMeals.filter(meal =>
          NutritionCalculator.hasNutritionData(meal)
        ).length;

        return {
          date,
          mealCount: dayMeals.length,
          foodItemCount: totalFoodItems,
          mealsWithNutrition,
          nutritionCompleteness: dayMeals.length > 0 
            ? (mealsWithNutrition / dayMeals.length) * 100 
            : 0,
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}

