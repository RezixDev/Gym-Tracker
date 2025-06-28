// src/features/nutrition/presentation/components/NutritionTable/FoodItemsPopover.tsx
import React from 'react';
import { toast } from 'sonner';
import { Meal } from '../../../domain';

interface FoodItemsPopoverProps {
  meal: Meal;
}

export function FoodItemsPopover({ meal }: FoodItemsPopoverProps) {
  const foods = meal.foods;
  const foodNames = foods.map((food) => food.name);

  const handleClick = () => {
    toast.info(
      <div className="max-w-sm">
        <p className="mb-2 font-bold">Food Items ({foods.length})</p>
        <ul className="list-disc space-y-1 pl-4">
          {foods.map((food, index) => (
            <li key={index} className="text-sm">
              <strong>{food.name}</strong>
              <br />
              <span className="text-gray-600">
                {food.quantity} {food.unit}
                {food.calories > 0 && <span> • {food.calories} cal</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>,
      { duration: 5000 }
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-left transition-colors hover:text-blue-600 dark:hover:text-blue-400"
    >
      <div className="max-w-[200px]">
        <div className="flex items-center gap-2">
          <span className="font-medium text-blue-600">
            {foods.length} item{foods.length !== 1 ? 's' : ''}
          </span>
          <span className="text-xs text-gray-500">click to view</span>
        </div>
        <div className="mt-1 truncate text-sm text-gray-600">
          {foodNames.slice(0, 2).join(', ')}
          {foodNames.length > 2 && ` +${foodNames.length - 2} more`}
        </div>
      </div>
    </button>
  );
}

