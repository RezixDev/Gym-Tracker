// components/nutrition/NutritionTable.tsx

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AlertCircle, CheckCircle, Edit, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Meal } from "../../hooks/useNutritionData";

const columnHelper = createColumnHelper<Meal>();

export function NutritionTable({
  meals,
  deleteMeal,
}: {
  meals: Meal[];
  deleteMeal: (id: string) => void;
}) {
  console.log("📊 NutritionTable rendered. Meals:", meals);
  const [selectedMealType, setSelectedMealType] = useState<string>("");

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Check if meal has nutrition data
  const hasNutritionData = (meal: Meal) => {
    return (
      meal.totalCalories > 0 ||
      (meal.foods && meal.foods.some((food) => food.calories > 0))
    );
  };

  // Define columns - Simplified for quick meal overview
  const columns = useMemo(
    () => [
      columnHelper.accessor("date", {
        header: "Date",
        cell: (info) => <div className="font-medium">{formatDate(info.getValue())}</div>,
      }),
      columnHelper.accessor("mealType", {
        header: "Meal Type",
        cell: (info) => (
          <Badge variant="outline" className="capitalize">
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor("foods", {
        header: "Food Items",
        cell: (info) => {
          const foods = info.getValue();
          // Check if foods array exists and has items
          if (!foods || foods.length === 0) {
            return (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-gray-400 italic">No foods</span>
              </div>
            );
          }

          // Get food names
          const foodNames = foods.map((food) => food.name);

          // Display a clickable element to show all foods
          return (
            <div>
              <button
                onClick={() => {
                  // Show toast with all foods
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
                    { duration: 5000 },
                  );
                }}
                className="text-left transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                <div className="max-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-blue-600">
                      {foods.length} item{foods.length !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs text-gray-500">click to view</span>
                  </div>
                  <div className="mt-1 truncate text-sm text-gray-600">
                    {foodNames.slice(0, 2).join(", ")}
                    {foodNames.length > 2 && ` +${foodNames.length - 2} more`}
                  </div>
                </div>
              </button>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "nutritionStatus",
        header: "Nutrition Data",
        cell: ({ row }) => {
          const meal = row.original;
          const hasData = hasNutritionData(meal);

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
        id: "quickStats",
        header: "Quick Stats",
        cell: ({ row }) => {
          const meal = row.original;
          const foodCount = meal.foods?.length || 0;
          const hasData = hasNutritionData(meal);

          if (!hasData) {
            return (
              <div className="text-sm text-gray-500">
                <div>
                  {foodCount} food{foodCount !== 1 ? "s" : ""}
                </div>
                <div className="text-xs text-amber-600">Add nutrition data</div>
              </div>
            );
          }

          return (
            <div className="text-sm">
              <div>
                {foodCount} food{foodCount !== 1 ? "s" : ""}
              </div>
              {meal.totalCalories > 0 && (
                <div className="text-xs text-gray-600">{meal.totalCalories} cal</div>
              )}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "notes",
        header: "Notes",
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
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const meal = row.original;
          const hasData = hasNutritionData(meal);

          return (
            <div className="flex items-center gap-2">
              {!hasData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.info(
                      "Nutrition editing feature coming soon! You'll be able to add calories, protein, carbs, and fat data here.",
                    );
                  }}
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
                  onClick={() => {
                    toast.info(
                      "Nutrition editing feature coming soon! You'll be able to modify nutrition data here.",
                    );
                  }}
                  className="h-8 px-2"
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
              )}

              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (
                    confirm(`Are you sure you want to delete this ${meal.mealType} meal?`)
                  ) {
                    deleteMeal(meal.id);
                    toast.success("Meal deleted!");
                  }
                }}
                className="h-8 px-2"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          );
        },
      }),
    ],
    [deleteMeal],
  );

  // Get unique meal types
  const mealTypes = useMemo(() => {
    const types = new Set(meals.map((meal) => meal.mealType));
    return Array.from(types);
  }, [meals]);

  // Filter and sort meals
  const filteredMeals = useMemo(() => {
    let filtered = [...meals];

    // Apply meal type filter
    if (selectedMealType) {
      filtered = filtered.filter((meal) => meal.mealType === selectedMealType);
    }

    // Sort by date (newest first)
    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [meals, selectedMealType]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredMeals.length;
    const withNutrition = filteredMeals.filter(hasNutritionData).length;
    const withoutNutrition = total - withNutrition;

    return {
      total,
      withNutrition,
      withoutNutrition,
      completeness: total > 0 ? (withNutrition / total) * 100 : 0,
    };
  }, [filteredMeals]);

  // Create table instance
  const table = useReactTable({
    data: filteredMeals,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Header with Stats and Filter */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">Nutrition History</h2>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
            <span>
              Total: <strong>{stats.total}</strong>
            </span>
            <span className="text-green-600">
              Complete: <strong>{stats.withNutrition}</strong>
            </span>
            <span className="text-amber-600">
              Missing Data: <strong>{stats.withoutNutrition}</strong>
            </span>
            {stats.total > 0 && <span>({stats.completeness.toFixed(0)}% complete)</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMealType}
            onChange={(e) => setSelectedMealType(e.target.value)}
            className="rounded-md border p-2 text-sm"
          >
            <option value="">All Meal Types</option>
            {mealTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Action Bar */}
      {stats.withoutNutrition > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  {stats.withoutNutrition} meal{stats.withoutNutrition !== 1 ? "s" : ""}{" "}
                  missing nutrition data
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Add nutrition information to get better insights
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.info(
                  "Bulk nutrition update feature coming soon! You'll be able to add nutrition data to multiple meals at once using AI.",
                );
              }}
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              <Plus className="mr-1 h-4 w-4" />
              Bulk Add Data
            </Button>
          </div>
        </div>
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
                const isToday =
                  row.original.date === new Date().toISOString().split("T")[0];
                const hasData = hasNutritionData(row.original);

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
