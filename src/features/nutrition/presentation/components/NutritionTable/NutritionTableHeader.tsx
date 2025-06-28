// src/features/nutrition/presentation/components/NutritionTable/NutritionTableHeader.tsx
import React from 'react';
import { MEAL_TYPES } from '../../../domain';

interface NutritionTableHeaderProps {
  stats: {
    total: number;
    withNutrition: number;
    withoutNutrition: number;
    completeness: number;
  };
  selectedMealType: string;
  onMealTypeChange: (mealType: string) => void;
}

export function NutritionTableHeader({ 
  stats, 
  selectedMealType, 
  onMealTypeChange 
}: NutritionTableHeaderProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-xl font-semibold">Nutrition History</h2>
        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
          <span>Total: <strong>{stats.total}</strong></span>
          <span className="text-green-600">
            Complete: <strong>{stats.withNutrition}</strong>
          </span>
          <span className="text-amber-600">
            Missing Data: <strong>{stats.withoutNutrition}</strong>
          </span>
          {stats.total > 0 && (
            <span>({stats.completeness.toFixed(0)}% complete)</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={selectedMealType}
          onChange={(e) => onMealTypeChange(e.target.value)}
          className="rounded-md border p-2 text-sm"
        >
          <option value="">All Meal Types</option>
          {MEAL_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

