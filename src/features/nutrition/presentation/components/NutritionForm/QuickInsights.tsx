// src/features/nutrition/presentation/components/NutritionForm/QuickInsights.tsx
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QuickInsightsProps {
  todaysMealCount: number;
  totalMeals: number;
  nutritionCompleteness: number;
  hasTodaysNutritionData: boolean;
}

export function QuickInsights({ 
  todaysMealCount, 
  totalMeals, 
  nutritionCompleteness,
  hasTodaysNutritionData 
}: QuickInsightsProps) {
  return (
    <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200">
      <AlertDescription>
        <h3 className="font-semibold mb-2">Quick Insights</h3>
        <div className="space-y-2 text-sm">
          {todaysMealCount === 0 ? (
            <p className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gray-400"></span>
              Start tracking your meals to see daily insights and nutrition analysis.
            </p>
          ) : (
            <>
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                You've logged {todaysMealCount} food item{todaysMealCount !== 1 ? 's' : ''} today.
              </p>
              {!hasTodaysNutritionData && (
                <p className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  Add nutrition data to track calories and macros.
                </p>
              )}
              {hasTodaysNutritionData && (
                <p className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  Great job tracking! Keep it up for better insights.
                </p>
              )}
            </>
          )}
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Overall: {totalMeals} meals tracked • {nutritionCompleteness.toFixed(0)}% with nutrition data
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
