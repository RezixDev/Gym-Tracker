// src/features/nutrition/infrastructure/repositories/LocalStorageMealRepository.ts
import { Meal } from '@/features/nutrition/domain/models';
import { MealRepository } from './MealRepository';

export class LocalStorageMealRepository implements MealRepository {
  private readonly STORAGE_KEY = 'meals';

  async getAll(): Promise<Meal[]> {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (!storedData) return [];

      const meals: Meal[] = JSON.parse(storedData);
      
      // Migrate old data structure if needed
      return meals.map(meal => this.migrateMealData(meal));
    } catch (error) {
      console.error('Failed to load meals from localStorage:', error);
      return [];
    }
  }

  async getById(id: string): Promise<Meal | null> {
    const meals = await this.getAll();
    return meals.find(meal => meal.id === id) || null;
  }

  async getByDate(date: string): Promise<Meal[]> {
    const meals = await this.getAll();
    return meals.filter(meal => meal.date === date);
  }

  async getByDateRange(startDate: string, endDate: string): Promise<Meal[]> {
    const meals = await this.getAll();
    return meals.filter(meal => meal.date >= startDate && meal.date <= endDate);
  }

  async save(meal: Meal): Promise<void> {
    const meals = await this.getAll();
    meals.push(meal);
    await this.persistMeals(meals);
  }

  async saveMany(newMeals: Meal[]): Promise<void> {
    const meals = await this.getAll();
    meals.push(...newMeals);
    await this.persistMeals(meals);
  }

  async update(updatedMeal: Meal): Promise<void> {
    const meals = await this.getAll();
    const index = meals.findIndex(meal => meal.id === updatedMeal.id);
    
    if (index === -1) {
      throw new Error(`Meal with id ${updatedMeal.id} not found`);
    }

    meals[index] = updatedMeal;
    await this.persistMeals(meals);
  }

  async delete(id: string): Promise<void> {
    const meals = await this.getAll();
    const filteredMeals = meals.filter(meal => meal.id !== id);
    
    if (filteredMeals.length === meals.length) {
      throw new Error(`Meal with id ${id} not found`);
    }

    await this.persistMeals(filteredMeals);
  }

  async deleteAll(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private async persistMeals(meals: Meal[]): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(meals));
    } catch (error) {
      console.error('Failed to save meals to localStorage:', error);
      throw new Error('Failed to save meals');
    }
  }

  private migrateMealData(meal: any): Meal {
    // Handle migration from old data structure
    return {
      ...meal,
      createdAt: meal.createdAt || new Date().toISOString(),
      updatedAt: meal.updatedAt || new Date().toISOString(),
      nutritionDataComplete:
        meal.nutritionDataComplete ??
        (meal.totalCalories > 0 ||
          (meal.foods && meal.foods.some((food: any) => food.calories > 0))),
      foods: (meal.foods || []).map((food: any) => ({
        ...food,
        nutritionDataAdded: food.nutritionDataAdded ?? food.calories > 0,
        lastNutritionUpdate: food.lastNutritionUpdate,
      })),
    };
  }
}

