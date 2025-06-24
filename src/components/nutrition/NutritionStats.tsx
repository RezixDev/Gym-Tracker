// components/nutrition/NutritionStats.tsx

import { useMemo } from "react";
import { Meal } from "../../hooks/useNutritionData";

export function NutritionStats({ meals }: { meals: Meal[] }) {
  // Calculate nutrition statistics
  const stats = useMemo(() => {
    if (meals.length === 0) {
      return {
        totalMeals: 0,
        totalFoodItems: 0,
        averageMealsPerDay: 0,
        averageFoodItemsPerMeal: 0,
        mealCounts: { breakfast: 0, lunch: 0, dinner: 0, snack: 0 },
        recentDays: [],
        nutritionDataAvailable: 0,
        nutritionDataMissing: 0,
      };
    }

    // Get today's date and date a week ago
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);

    // Filter for meals in the last 7 days
    const recentMeals = meals.filter((meal) => {
      const mealDate = new Date(meal.date);
      return mealDate >= oneWeekAgo && mealDate <= today;
    });

    // Group meals by date
    const mealsByDate = recentMeals.reduce(
      (acc, meal) => {
        if (!acc[meal.date]) {
          acc[meal.date] = [];
        }
        acc[meal.date].push(meal);
        return acc;
      },
      {} as Record<string, Meal[]>,
    );

    // Calculate daily totals for recent days
    const recentDays = Object.entries(mealsByDate)
      .map(([date, dayMeals]) => {
        const totalFoodItems = dayMeals.reduce(
          (sum, meal) => sum + (meal.foods?.length || 0),
          0,
        );
        const mealsWithNutrition = dayMeals.filter(
          (meal) =>
            meal.totalCalories > 0 ||
            (meal.foods && meal.foods.some((food) => food.calories > 0)),
        ).length;

        return {
          date,
          mealCount: dayMeals.length,
          foodItemCount: totalFoodItems,
          mealsWithNutrition,
          nutritionCompleteness:
            dayMeals.length > 0 ? (mealsWithNutrition / dayMeals.length) * 100 : 0,
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate overall stats
    const totalMeals = meals.length;
    const totalFoodItems = meals.reduce(
      (sum, meal) => sum + (meal.foods?.length || 0),
      0,
    );

    // Get unique dates to calculate daily averages
    const uniqueDates = new Set(meals.map((meal) => meal.date));
    const dayCount = uniqueDates.size;

    // Count meal types
    const mealCounts = {
      breakfast: meals.filter((meal) => meal.mealType === "breakfast").length,
      lunch: meals.filter((meal) => meal.mealType === "lunch").length,
      dinner: meals.filter((meal) => meal.mealType === "dinner").length,
      snack: meals.filter((meal) => meal.mealType === "snack").length,
    };

    // Count nutrition data availability
    const mealsWithNutrition = meals.filter(
      (meal) =>
        meal.totalCalories > 0 ||
        (meal.foods && meal.foods.some((food) => food.calories > 0)),
    ).length;
    const nutritionDataAvailable = mealsWithNutrition;
    const nutritionDataMissing = totalMeals - mealsWithNutrition;

    return {
      totalMeals,
      totalFoodItems,
      averageMealsPerDay: dayCount > 0 ? totalMeals / dayCount : 0,
      averageFoodItemsPerMeal: totalMeals > 0 ? totalFoodItems / totalMeals : 0,
      mealCounts,
      recentDays,
      nutritionDataAvailable,
      nutritionDataMissing,
    };
  }, [meals]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const nutritionCompleteness =
    stats.totalMeals > 0 ? (stats.nutritionDataAvailable / stats.totalMeals) * 100 : 0;

  return (
    <div className="space-y-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h2 className="text-xl font-semibold">Nutrition Analysis</h2>

      {meals.length === 0 ? (
        <p className="text-gray-500 italic">
          No nutrition data available yet. Start tracking to see your statistics.
        </p>
      ) : (
        <>
          {/* Main Stats - Focus on Meal Tracking */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Meals Logged
              </p>
              <p className="text-2xl font-bold">{stats.totalMeals}</p>
            </div>

            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Food Items Tracked
              </p>
              <p className="text-2xl font-bold">{stats.totalFoodItems}</p>
            </div>

            <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Meals/Day</p>
              <p className="text-2xl font-bold">{stats.averageMealsPerDay.toFixed(1)}</p>
            </div>

            <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Items/Meal</p>
              <p className="text-2xl font-bold">
                {stats.averageFoodItemsPerMeal.toFixed(1)}
              </p>
            </div>
          </div>

          {/* Nutrition Data Completeness */}
          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:from-blue-900/20 dark:to-indigo-900/20">
            <h3 className="mb-2 font-medium">Nutrition Data Status</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Meals with Nutrition Data
                </p>
                <p className="text-xl font-bold text-green-600">
                  {stats.nutritionDataAvailable}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Missing Nutrition Data
                </p>
                <p className="text-xl font-bold text-amber-600">
                  {stats.nutritionDataMissing}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completeness</p>
                <p className="text-xl font-bold">{nutritionCompleteness.toFixed(0)}%</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600"
                  style={{ width: `${nutritionCompleteness}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Meal Type Distribution */}
          <div>
            <h3 className="mb-2 font-medium">Meal Distribution</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                <p className="font-medium">Breakfast</p>
                <p className="text-lg">{stats.mealCounts.breakfast}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                <p className="font-medium">Lunch</p>
                <p className="text-lg">{stats.mealCounts.lunch}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                <p className="font-medium">Dinner</p>
                <p className="text-lg">{stats.mealCounts.dinner}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                <p className="font-medium">Snacks</p>
                <p className="text-lg">{stats.mealCounts.snack}</p>
              </div>
            </div>
          </div>

          {/* Recent Days Summary */}
          {stats.recentDays.length > 0 && (
            <div>
              <h3 className="mb-2 font-medium">Recent Days (Last 7 Days)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                        Meals
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                        Food Items
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                        Nutrition Data
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                        Complete
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                    {stats.recentDays.map((day) => (
                      <tr key={day.date}>
                        <td className="px-4 py-2 text-sm whitespace-nowrap">
                          {formatDate(day.date)}
                        </td>
                        <td className="px-4 py-2 text-sm whitespace-nowrap">
                          {day.mealCount}
                        </td>
                        <td className="px-4 py-2 text-sm whitespace-nowrap">
                          {day.foodItemCount}
                        </td>
                        <td className="px-4 py-2 text-sm whitespace-nowrap">
                          <span
                            className={
                              day.mealsWithNutrition > 0
                                ? "text-green-600"
                                : "text-amber-600"
                            }
                          >
                            {day.mealsWithNutrition}/{day.mealCount}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm whitespace-nowrap">
                          <span
                            className={`rounded px-2 py-1 text-xs ${
                              day.nutritionCompleteness === 100
                                ? "bg-green-100 text-green-800"
                                : day.nutritionCompleteness > 50
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {day.nutritionCompleteness.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Insights */}
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <h3 className="mb-2 font-medium">Quick Insights</h3>
            <div className="space-y-2 text-sm">
              {stats.nutritionDataMissing > 0 && (
                <p className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  You have {stats.nutritionDataMissing} meal
                  {stats.nutritionDataMissing !== 1 ? "s" : ""} without nutrition data.
                  Consider adding nutrition info via AI tools or manual editing.
                </p>
              )}

              {stats.averageMealsPerDay < 2 && (
                <p className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  You're logging {stats.averageMealsPerDay.toFixed(1)} meals per day on
                  average. Consider tracking more meals for better insights.
                </p>
              )}

              {stats.averageFoodItemsPerMeal < 2 && (
                <p className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                  Your meals average {stats.averageFoodItemsPerMeal.toFixed(1)} food
                  items. Try adding more variety to your meals.
                </p>
              )}

              {nutritionCompleteness === 100 && (
                <p className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  Great job! All your meals have nutrition data. Your tracking is
                  complete! 🎉
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
