// src/features/nutrition/presentation/components/NutritionForm/DailySummaryCard.tsx
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Meal } from '@/features/nutrition/domain/models/Meal';
import { NutritionCalculator } from '@/features/nutrition/domain/services/NutritionCalculator';
import { DateUtils } from '@/features/nutrition/domain/utils/dateUtils';

interface DailySummaryCardProps {
  meals: Meal[];
  date: Date;
}

export function DailySummaryCard({ meals, date }: DailySummaryCardProps) {
  const dailyTotals = useMemo(() => {
    const totals = NutritionCalculator.calculateDailyTotals(meals);
    const totalItems = meals.reduce((sum, meal) => sum + meal.foods.length, 0);
    
    return {
      items: totalItems,
      ...totals
    };
  }, [meals]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Summary - {DateUtils.formatDate(date.toISOString())}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-0 shadow-none bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="p-3 text-center">
              <p className="text-sm text-muted-foreground">Items</p>
              <p className="text-2xl font-bold text-blue-600">{dailyTotals.items}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-none bg-green-50 dark:bg-green-950/20">
            <CardContent className="p-3 text-center">
              <p className="text-sm text-muted-foreground">Calories</p>
              <p className="text-2xl font-bold text-green-600">{dailyTotals.calories}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-none bg-purple-50 dark:bg-purple-950/20">
            <CardContent className="p-3 text-center">
              <p className="text-sm text-muted-foreground">Protein</p>
              <p className="text-2xl font-bold text-purple-600">{dailyTotals.protein}g</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-none bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="p-3 text-center">
              <p className="text-sm text-muted-foreground">Carbs</p>
              <p className="text-2xl font-bold text-yellow-600">{dailyTotals.carbs}g</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-none bg-red-50 dark:bg-red-950/20">
            <CardContent className="p-3 text-center">
              <p className="text-sm text-muted-foreground">Fat</p>
              <p className="text-2xl font-bold text-red-600">{dailyTotals.fat}g</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

