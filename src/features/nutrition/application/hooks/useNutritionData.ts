// src/features/nutrition/application/hooks/useNutritionData.ts
import { useState, useEffect, useCallback, useMemo } from 'react';

import { Meal } from '@/features/nutrition/domain/models/Meal';
import { FoodItem } from '@/features/nutrition/domain/models/FoodItem';
import { MealService } from '@/features/nutrition/domain/services/MealService';
import { NutritionCalculator } from '@/features/nutrition/domain/services/NutritionCalculator';
import { MealTypeService } from '@/features/nutrition/domain/services/MealTypeService';
import { dependencyFactory } from '@/features/nutrition/infrastructure/factory/DependencyFactory';

export interface UseNutritionDataReturn {
  // State
  meals: Meal[];
  loading: boolean;
  error: string | null;
  
  // Basic operations
  addMeal: (mealData: CreateMealInput) => Promise<void>;
  updateMeal: (id: string, updates: Partial<Meal>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  
  // Nutrition operations
  updateMealNutrition: (mealId: string, nutritionData: UpdateNutritionInput) => Promise<void>;
  bulkUpdateNutrition: (updates: BulkNutritionUpdate[]) => Promise<void>;
  
  // Helpers
  createFoodItem: (foodData: CreateFoodInput) => FoodItem;
  refreshMeals: () => Promise<void>;
  
  // Computed values
  totalMeals: number;
  mealsWithNutrition: number;
  mealsWithoutNutrition: number;
  nutritionCompleteness: number;
  
  // Queries
  getMealsByDate: (date: string) => Meal[];
  getMealsWithoutNutrition: () => Meal[];
  getMealsWithNutrition: () => Meal[];
  getStatistics: (startDate?: string, endDate?: string) => ReturnType<typeof MealService.calculateStatistics>;
  getRecentDaysStatistics: (days?: number) => ReturnType<typeof MealService.getRecentDaysStatistics>;
}

export interface CreateMealInput {
  date: string;
  mealType?: Meal['mealType'];
  foods: CreateFoodInput[];
  notes?: string;
}

export interface CreateFoodInput {
  name: string;
  quantity: number;
  unit: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface UpdateNutritionInput {
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

export interface BulkNutritionUpdate {
  mealId: string;
  nutritionData: UpdateNutritionInput;
}

export function useNutritionData(): UseNutritionDataReturn {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const repository = useMemo(() => 
    dependencyFactory.getMealRepository(), 
    []
  );

  // Load meals on mount
  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedMeals = await repository.getAll();
      setMeals(loadedMeals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meals');
      console.error('Failed to load meals:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshMeals = useCallback(async () => {
    await loadMeals();
  }, []);

  const addMeal = useCallback(async (mealData: CreateMealInput) => {
    try {
      setError(null);
      
      // Determine meal type if not provided
      const mealType = mealData.mealType || MealTypeService.getMealTypeFromTime();
      
      // Create food items
      const foods = mealData.foods.map(food => MealService.createFoodItem(food));
      
      // Calculate nutrition totals
      const nutritionTotals = NutritionCalculator.calculateTotals(foods);
      
      // Create meal
      const meal = MealService.createMeal({
        date: mealData.date,
        mealType,
        foods,
        notes: mealData.notes || '',
        totalCalories: nutritionTotals.calories,
        totalProtein: nutritionTotals.protein,
        totalCarbs: nutritionTotals.carbs,
        totalFat: nutritionTotals.fat,
        calories: nutritionTotals.calories,
        protein: nutritionTotals.protein,
        carbs: nutritionTotals.carbs,
        fat: nutritionTotals.fat
      });
      
      // Save to repository
      await repository.save(meal);
      
      // Update local state
      setMeals(prev => [...prev, meal]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add meal';
      setError(message);
      throw new Error(message);
    }
  }, [repository]);

  const updateMeal = useCallback(async (id: string, updates: Partial<Meal>) => {
    try {
      setError(null);
      
      const existingMeal = meals.find(m => m.id === id);
      if (!existingMeal) {
        throw new Error(`Meal with id ${id} not found`);
      }
      
      const updatedMeal: Meal = {
        ...existingMeal,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await repository.update(updatedMeal);
      setMeals(prev => prev.map(m => m.id === id ? updatedMeal : m));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update meal';
      setError(message);
      throw new Error(message);
    }
  }, [meals, repository]);

  const deleteMeal = useCallback(async (id: string) => {
    try {
      setError(null);
      await repository.delete(id);
      setMeals(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete meal';
      setError(message);
      throw new Error(message);
    }
  }, [repository]);

  const updateMealNutrition = useCallback(async (
    mealId: string,
    nutritionData: UpdateNutritionInput
  ) => {
    try {
      setError(null);
      
      const meal = meals.find(m => m.id === mealId);
      if (!meal) {
        throw new Error(`Meal with id ${mealId} not found`);
      }
      
      const updatedMeal = MealService.updateMealNutrition(meal, nutritionData);
      
      await repository.update(updatedMeal);
      setMeals(prev => prev.map(m => m.id === mealId ? updatedMeal : m));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update nutrition';
      setError(message);
      throw new Error(message);
    }
  }, [meals, repository]);

  const bulkUpdateNutrition = useCallback(async (
    updates: BulkNutritionUpdate[]
  ) => {
    try {
      setError(null);
      
      const updatedMeals = meals.map(meal => {
        const update = updates.find(u => u.mealId === meal.id);
        if (!update) return meal;
        
        return MealService.updateMealNutrition(meal, update.nutritionData);
      });
      
      // Update all changed meals in repository
      for (const update of updates) {
        const updatedMeal = updatedMeals.find(m => m.id === update.mealId);
        if (updatedMeal) {
          await repository.update(updatedMeal);
        }
      }
      
      setMeals(updatedMeals);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to bulk update nutrition';
      setError(message);
      throw new Error(message);
    }
  }, [meals, repository]);

  const createFoodItem = useCallback((foodData: CreateFoodInput): FoodItem => {
    return MealService.createFoodItem(foodData);
  }, []);

  // Query functions
  const getMealsByDate = useCallback((date: string): Meal[] => {
    return meals.filter(meal => meal.date === date);
  }, [meals]);

  const getMealsWithoutNutrition = useCallback((): Meal[] => {
    return meals.filter(meal => !NutritionCalculator.hasNutritionData(meal));
  }, [meals]);

  const getMealsWithNutrition = useCallback((): Meal[] => {
    return meals.filter(meal => NutritionCalculator.hasNutritionData(meal));
  }, [meals]);

  const getStatistics = useCallback((startDate?: string, endDate?: string) => {
    return MealService.calculateStatistics(meals, startDate, endDate);
  }, [meals]);

  const getRecentDaysStatistics = useCallback((days: number = 7) => {
    return MealService.getRecentDaysStatistics(meals, days);
  }, [meals]);

  // Computed values
  const totalMeals = meals.length;
  const mealsWithNutrition = meals.filter(m => NutritionCalculator.hasNutritionData(m)).length;
  const mealsWithoutNutrition = totalMeals - mealsWithNutrition;
  const nutritionCompleteness = totalMeals > 0 
    ? (mealsWithNutrition / totalMeals) * 100 
    : 0;

  return {
    // State
    meals,
    loading,
    error,
    
    // Operations
    addMeal,
    updateMeal,
    deleteMeal,
    updateMealNutrition,
    bulkUpdateNutrition,
    
    // Helpers
    createFoodItem,
    refreshMeals,
    
    // Computed values
    totalMeals,
    mealsWithNutrition,
    mealsWithoutNutrition,
    nutritionCompleteness,
    
    // Queries
    getMealsByDate,
    getMealsWithoutNutrition,
    getMealsWithNutrition,
    getStatistics,
    getRecentDaysStatistics
  };
}

