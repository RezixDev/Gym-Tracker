// src/features/nutrition/presentation/components/NutritionTable/NutritionTable.tsx
import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { AlertCircle, CheckCircle, Edit, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// Domain imports
import { DateUtils } from '@/features/nutrition/domain/utils/dateUtils';
import { NutritionCalculator } from '@/features/nutrition/domain/services/NutritionCalculator';

import { Meal } from '@/features/nutrition/domain/models/Meal';
// Application imports
import { useNutritionData } from '@/features/nutrition/application/hooks/useNutritionData';
import { useMealFilters } from '@/features/nutrition/application/hooks/useMealFilters';

// Sub-components
import { NutritionTableHeader } from './NutritionTableHeader';
import { NutritionDataAlert } from './NutritionDataAlert';
import { FoodItemsPopover } from './FoodItemsPopover';

const columnHelper = createColumnHelper<Meal>();

export function NutritionTable() {
  const { 
    meals, 
    deleteMeal,
    getMealsWithoutNutrition 
  } = useNutritionData();

  const { filters, setFilters, applyFilters } = useMealFilters();
  const [selectedMealType, setSelectedMealType] = useState<string>('');

  // Apply filters
  const filteredMeals = useMemo(() => {
    let filtered = applyFilters(meals);
    
    // Apply local meal type filter
    if (selectedMealType) {
      filtered = filtered.filter(meal => meal.mealType === selectedMealType);
    }
    
    // Sort by date (newest first)
    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [meals, applyFilters, selectedMealType]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredMeals.length;
    const withNutrition = filteredMeals.filter(m => 
      NutritionCalculator.hasNutritionData(m)
    ).length;
    const withoutNutrition = total - withNutrition;

    return {
      total,
      withNutrition,
      withoutNutrition,
      completeness: total > 0 ? (withNutrition / total) * 100 : 0,
    };
  }, [filteredMeals]);

  const handleDeleteMeal = async (id: string, mealType: string) => {
    if (confirm(`Are you sure you want to delete this ${mealType} meal?`)) {
      try {
        await deleteMeal(id);
        toast.success('Meal deleted!');
      } catch (error) {
        toast.error('Failed to delete meal');
      }
    }
  };

  const handleAddNutritionData = (mealId: string) => {
    toast.info(
      'Nutrition editing feature coming soon! You\'ll be able to add calories, protein, carbs, and fat data here.'
    );
  };

  const handleEditNutritionData = (mealId: string) => {
    toast.info(
      'Nutrition editing feature coming soon! You\'ll be able to modify nutrition data here.'
    );
  };

  // Define columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('date', {
        header: 'Date',
        cell: (info) => (
          <div className="font-medium">{DateUtils.formatDateShort(info.getValue())}</div>
        ),
      }),
      columnHelper.accessor('mealType', {
        header: 'Meal Type',
        cell: (info) => (
          <Badge variant="outline" className="capitalize">
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor('foods', {
        header: 'Food Items',
        cell: (info) => {
          const foods = info.getValue();
          const meal = info.row.original;
          
          if (!foods || foods.length === 0) {
            return (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-gray-400 italic">No foods</span>
              </div>
            );
          }

          return <FoodItemsPopover meal={meal} />;
        },
      }),
      columnHelper.display({
        id: 'nutritionStatus',
        header: 'Nutrition Data',
        cell: ({ row }) => {
          const meal = row.original;
          const hasData = NutritionCalculator.hasNutritionData(meal);

          return (
            <div className="flex items-center gap-2">
              {hasData ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Complete
                  </Badge>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    Missing
                  </Badge>
                </>
              )}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'quickStats',
        header: 'Quick Stats',
        cell: ({ row }) => {
          const meal = row.original;
          const foodCount = meal.foods?.length || 0;
          const hasData = NutritionCalculator.hasNutritionData(meal);

          if (!hasData) {
            return (
              <div className="text-sm text-gray-500">
                <div>{foodCount} food{foodCount !== 1 ? 's' : ''}</div>
                <div className="text-xs text-amber-600">Add nutrition data</div>
              </div>
            );
          }

          return (
            <div className="text-sm">
              <div>{foodCount} food{foodCount !== 1 ? 's' : ''}</div>
              {meal.totalCalories > 0 && (
                <div className="text-xs text-gray-600">{meal.totalCalories} cal</div>
              )}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'notes',
        header: 'Notes',
        cell: ({ row }) => {
          const notes = row.original.notes;
          if (!notes) {
            return <span className="text-sm text-gray-400 italic">No notes</span>;
          }

          return (
            <div className="max-w-[150px]">
              <span className="truncate text-sm" title={notes}>
                {notes}
              </span>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const meal = row.original;
          const hasData = NutritionCalculator.hasNutritionData(meal);

          return (
            <div className="flex items-center gap-2">
              {!hasData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddNutritionData(meal.id)}
                  className="h-8 px-2"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Data
                </Button>
              )}

              {hasData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditNutritionData(meal.id)}
                  className="h-8 px-2"
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
              )}

              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteMeal(meal.id, meal.mealType)}
                className="h-8 px-2"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          );
        },
      }),
    ],
    []
  );

  // Create table instance
  const table = useReactTable({
    data: filteredMeals,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <NutritionTableHeader
        stats={stats}
        selectedMealType={selectedMealType}
        onMealTypeChange={setSelectedMealType}
      />

      {stats.withoutNutrition > 0 && (
        <NutritionDataAlert count={stats.withoutNutrition} />
      )}

      {/* Table */}
      {meals.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-gray-500 italic">No meals logged yet.</p>
          <p className="mt-2 text-gray-400">Start tracking your nutrition above!</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-sm font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {table.getRowModel().rows.map((row) => {
                const isToday = DateUtils.isToday(row.original.date);
                const hasData = NutritionCalculator.hasNutritionData(row.original);

                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "transition-colors hover:bg-gray-50 dark:hover:bg-gray-800",
                      isToday && "bg-blue-50 dark:bg-blue-900/20",
                      !hasData && "bg-amber-50/50 dark:bg-amber-900/10",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Info */}
      <div className="border-t pt-4 text-sm text-gray-500">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-blue-100"></div>
            <span>Today's meals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-amber-100"></div>
            <span>Missing nutrition data</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Complete nutrition data</span>
          </div>
        </div>
      </div>
    </div>
  );
}