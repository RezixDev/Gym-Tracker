// src/features/nutrition/presentation/components/NutritionForm/TodaysMealsCard.tsx
import React, { useMemo } from 'react';
import { Apple, Coffee, Cookie, UtensilsCrossed } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Meal } from '../../../domain/models/Meal';
import { MealService } from '../../../domain/services/MealService';
import { MealType } from '../../../domain/models/Meal';
import { DateUtils } from '../../../domain/utils/dateUtils';

interface TodaysMealsCardProps {
  meals: Meal[];
  onDeleteMeal: (mealId: string) => void;
}

export function TodaysMealsCard({ meals, onDeleteMeal }: TodaysMealsCardProps) {
  const mealsByType = useMemo(() => {
    return MealService.groupByMealType(meals);
  }, [meals]);

  const getMealIcon = (mealType: MealType) => {
    switch (mealType) {
      case 'breakfast': return <Coffee className="h-4 w-4" />;
      case 'lunch': return <UtensilsCrossed className="h-4 w-4" />;
      case 'dinner': return <UtensilsCrossed className="h-4 w-4" />;
      case 'snack': return <Cookie className="h-4 w-4" />;
    }
  };

  const handleDeleteClick = (mealId: string) => {
    if (confirm('Are you sure you want to delete this meal?')) {
      onDeleteMeal(mealId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Meals</CardTitle>
        <CardDescription>
          Your food items organized by meal type
        </CardDescription>
      </CardHeader>
      <CardContent>
        {meals.length === 0 ? (
          <div className="text-center py-12">
            <Apple className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-lg text-muted-foreground">No meals logged for today</p>
            <p className="text-sm text-muted-foreground mt-1">Start by adding your first meal above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealType) => {
              const typeMeals = mealsByType[mealType] || [];
              if (typeMeals.length === 0) return null;

              return (
                <Card key={mealType}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getMealIcon(mealType)}
                        <CardTitle className="text-base capitalize">{mealType}</CardTitle>
                      </div>
                      <Badge variant="secondary">{typeMeals.length} items</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {typeMeals.map((meal) => (
                      <MealItem 
                        key={meal.id} 
                        meal={meal} 
                        onDelete={() => handleDeleteClick(meal.id)}
                      />
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MealItemProps {
  meal: Meal;
  onDelete: () => void;
}

function MealItem({ meal, onDelete }: MealItemProps) {
  return (
    <div>
      {meal.foods.map((food, idx) => (
        <Card key={food.id || idx} className="border shadow-none bg-muted/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{food.name}</span>
                  <Badge variant="outline">
                    {food.quantity} {food.unit}
                  </Badge>
                  {meal.createdAt && (
                    <span className="text-xs text-muted-foreground">
                      {DateUtils.formatTime(meal.createdAt)}
                    </span>
                  )}
                </div>
                {food.nutritionDataAdded ? (
                  <div className="text-xs text-muted-foreground mt-1">
                    {food.calories} cal • {food.protein}g protein • {food.carbs}g carbs • {food.fat}g fat
                  </div>
                ) : (
                  <div className="text-xs text-amber-600 mt-1">
                    Nutrition data pending
                  </div>
                )}
                {meal.notes && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Note: {meal.notes}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-destructive hover:text-destructive"
              >
                Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

