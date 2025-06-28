// src/features/nutrition/presentation/components/NutritionStats/NutritionCompleteness.tsx
import React from 'react';

interface NutritionCompletenessProps {
  mealsWithNutrition: number;
  mealsWithoutNutrition: number;
  completeness: number;
}

export function NutritionCompleteness({ 
  mealsWithNutrition, 
  mealsWithoutNutrition, 
  completeness 
}: NutritionCompletenessProps) {
  return (
    <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:from-blue-900/20 dark:to-indigo-900/20">
      <h3 className="mb-2 font-medium">Nutrition Data Status</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Meals with Nutrition Data
          </p>
          <p className="text-xl font-bold text-green-600">{mealsWithNutrition}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Missing Nutrition Data
          </p>
          <p className="text-xl font-bold text-amber-600">{mealsWithoutNutrition}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Completeness</p>
          <p className="text-xl font-bold">{completeness.toFixed(0)}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600"
            style={{ width: `${completeness}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

