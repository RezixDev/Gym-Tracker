// src/features/nutrition/presentation/components/NutritionStats/StatsOverview.tsx
import React from 'react';
import { NutritionStatistics } from '../../../domain';

interface StatsOverviewProps {
  stats: NutritionStatistics;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <p className="text-sm text-gray-500 dark:text-gray-400">Total Meals Logged</p>
        <p className="text-2xl font-bold">{stats.totalMeals}</p>
      </div>

      <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
        <p className="text-sm text-gray-500 dark:text-gray-400">Food Items Tracked</p>
        <p className="text-2xl font-bold">{stats.totalFoodItems}</p>
      </div>

      <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
        <p className="text-sm text-gray-500 dark:text-gray-400">Avg Meals/Day</p>
        <p className="text-2xl font-bold">
          {(stats.totalMeals / Math.max(1, stats.totalMeals / stats.averageCaloriesPerDay * 2000)).toFixed(1)}
        </p>
      </div>

      <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
        <p className="text-sm text-gray-500 dark:text-gray-400">Avg Items/Meal</p>
        <p className="text-2xl font-bold">
          {stats.totalMeals > 0 ? (stats.totalFoodItems / stats.totalMeals).toFixed(1) : '0'}
        </p>
      </div>
    </div>
  );
}

