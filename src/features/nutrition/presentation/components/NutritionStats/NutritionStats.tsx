// src/features/nutrition/presentation/components/NutritionStats/NutritionStats.tsx
import { useMemo } from 'react';
import { useNutritionData } from '@/features/nutrition/application/hooks/useNutritionData';

// Sub-components
import { StatsOverview } from './StatsOverview';
import { NutritionCompleteness } from './NutritionCompleteness';
import { MealDistribution } from './MealDistribution';
import { RecentDaysTable } from './RecentDaysTable';
import { ActionableInsights } from './ActionableInsights';

export function NutritionStats() {
  const { 
    meals,
    getStatistics,
    getRecentDaysStatistics
  } = useNutritionData();

  // Calculate statistics for all time
  const stats = useMemo(() => getStatistics(), [getStatistics]);
  
  // Get recent days statistics
  const recentDays = useMemo(() => getRecentDaysStatistics(7), [getRecentDaysStatistics]);

  if (meals.length === 0) {
    return (
      <div className="space-y-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="text-xl font-semibold">Nutrition Analysis</h2>
        <p className="text-gray-500 italic">
          No nutrition data available yet. Start tracking to see your statistics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h2 className="text-xl font-semibold">Nutrition Analysis</h2>

      <StatsOverview stats={stats} />
      
      <NutritionCompleteness
        mealsWithNutrition={stats.mealsWithNutrition}
        mealsWithoutNutrition={stats.mealsWithoutNutrition}
        completeness={stats.nutritionCompleteness}
      />

      <MealDistribution mealCounts={stats.mealCounts} />

      {recentDays.length > 0 && (
        <RecentDaysTable recentDays={recentDays} />
      )}

      <ActionableInsights
        stats={stats}
        completeness={stats.nutritionCompleteness}
      />
    </div>
  );
}

