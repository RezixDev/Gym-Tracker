// src/features/nutrition/presentation/components/NutritionStats/MealDistribution.tsx
import React from 'react';
import { NutritionStatistics } from '../../../domain';

interface MealDistributionProps {
  mealCounts: NutritionStatistics['mealCounts'];
}

export function MealDistribution({ mealCounts }: MealDistributionProps) {
  return (
    <div>
      <h3 className="mb-2 font-medium">Meal Distribution</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
          <p className="font-medium">Breakfast</p>
          <p className="text-lg">{mealCounts.breakfast}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
          <p className="font-medium">Lunch</p>
          <p className="text-lg">{mealCounts.lunch}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
          <p className="font-medium">Dinner</p>
          <p className="text-lg">{mealCounts.dinner}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
          <p className="font-medium">Snacks</p>
          <p className="text-lg">{mealCounts.snack}</p>
        </div>
      </div>
    </div>
  );
}

