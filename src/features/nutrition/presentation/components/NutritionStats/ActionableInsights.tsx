// src/features/nutrition/presentation/components/NutritionStats/ActionableInsights.tsx
import React from 'react';
import { NutritionStatistics } from '../../../domain';

interface ActionableInsightsProps {
  stats: NutritionStatistics;
  completeness: number;
}

export function ActionableInsights({ stats, completeness }: ActionableInsightsProps) {
  const avgMealsPerDay = stats.totalMeals > 0 && stats.averageCaloriesPerDay > 0
    ? (stats.totalMeals / Math.max(1, stats.totalMeals / stats.averageCaloriesPerDay * 2000))
    : 0;
  
  const avgItemsPerMeal = stats.totalMeals > 0 
    ? stats.totalFoodItems / stats.totalMeals 
    : 0;

  return (
    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
      <h3 className="mb-2 font-medium">Quick Insights</h3>
      <div className="space-y-2 text-sm">
        {stats.mealsWithoutNutrition > 0 && (
          <p className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            You have {stats.mealsWithoutNutrition} meal
            {stats.mealsWithoutNutrition !== 1 ? "s" : ""} without nutrition data.
            Consider adding nutrition info via AI tools or manual editing.
          </p>
        )}

        {avgMealsPerDay < 2 && avgMealsPerDay > 0 && (
          <p className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
            You're logging {avgMealsPerDay.toFixed(1)} meals per day on
            average. Consider tracking more meals for better insights.
          </p>
        )}

        {avgItemsPerMeal < 2 && avgItemsPerMeal > 0 && (
          <p className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-500"></span>
            Your meals average {avgItemsPerMeal.toFixed(1)} food
            items. Try adding more variety to your meals.
          </p>
        )}

        {completeness === 100 && (
          <p className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            Great job! All your meals have nutrition data. Your tracking is
            complete! 🎉
          </p>
        )}
      </div>
    </div>
  );
}

