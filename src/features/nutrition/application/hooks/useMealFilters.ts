// src/features/nutrition/application/hooks/useMealFilters.ts
import { useState, useMemo } from 'react';
import { Meal } from '@/features/nutrition/domain/models/Meal';
import { MealType } from '@/features/nutrition/domain/models/Meal';

export interface MealFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  mealTypes?: MealType[];
  hasNutritionData?: boolean;
  searchQuery?: string;
}

export interface UseMealFiltersReturn {
  filters: MealFilters;
  setFilters: (filters: MealFilters) => void;
  clearFilters: () => void;
  applyFilters: (meals: Meal[]) => Meal[];
}

export function useMealFilters(initialFilters: MealFilters = {}): UseMealFiltersReturn {
  const [filters, setFilters] = useState<MealFilters>(initialFilters);

  const applyFilters = useMemo(() => {
    return (meals: Meal[]): Meal[] => {
      let filtered = [...meals];

      // Date range filter
      if (filters.dateRange) {
        filtered = filtered.filter(meal => 
          meal.date >= filters.dateRange!.start && 
          meal.date <= filters.dateRange!.end
        );
      }

      // Meal type filter
      if (filters.mealTypes && filters.mealTypes.length > 0) {
        filtered = filtered.filter(meal => 
          filters.mealTypes!.includes(meal.mealType)
        );
      }

      // Nutrition data filter
      if (filters.hasNutritionData !== undefined) {
        filtered = filtered.filter(meal => {
          const hasData = meal.nutritionDataComplete;
          return filters.hasNutritionData ? hasData : !hasData;
        });
      }

      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(meal => {
          // Search in food names
          const foodMatch = meal.foods.some(food => 
            food.name.toLowerCase().includes(query)
          );
          
          // Search in notes
          const notesMatch = meal.notes?.toLowerCase().includes(query);
          
          return foodMatch || notesMatch;
        });
      }

      return filtered;
    };
  }, [filters]);

  const clearFilters = () => {
    setFilters({});
  };

  return {
    filters,
    setFilters,
    clearFilters,
    applyFilters
  };
}
