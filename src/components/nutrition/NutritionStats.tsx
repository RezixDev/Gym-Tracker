// components/nutrition/NutritionStats.tsx

import { useMemo } from 'react';
import { Meal } from '../../hooks/useNutritionData';

export function NutritionStats({
                                   meals
                               }: {
    meals: Meal[];
}) {
    // Calculate nutrition statistics
    const stats = useMemo(() => {
        if (meals.length === 0) {
            return {
                totalCalories: 0,
                averageCaloriesPerDay: 0,
                totalProtein: 0,
                totalCarbs: 0,
                totalFat: 0,
                mealCounts: { breakfast: 0, lunch: 0, dinner: 0, snack: 0 },
                macroRatios: { protein: 0, carbs: 0, fat: 0 },
                recentDays: [],
            };
        }

        // Get today's date and date a week ago
        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);

        // Filter for meals in the last 7 days
        const recentMeals = meals.filter(meal => {
            const mealDate = new Date(meal.date);
            return mealDate >= oneWeekAgo && mealDate <= today;
        });

        // Group meals by date
        const mealsByDate = recentMeals.reduce((acc, meal) => {
            if (!acc[meal.date]) {
                acc[meal.date] = [];
            }
            acc[meal.date].push(meal);
            return acc;
        }, {} as Record<string, Meal[]>);

        // Calculate daily totals for recent days
        const recentDays = Object.entries(mealsByDate).map(([date, dayMeals]) => {
            const calories = dayMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
            const protein = dayMeals.reduce((sum, meal) => sum + meal.totalProtein, 0);
            const carbs = dayMeals.reduce((sum, meal) => sum + meal.totalCarbs, 0);
            const fat = dayMeals.reduce((sum, meal) => sum + meal.totalFat, 0);

            return {
                date,
                calories,
                protein,
                carbs,
                fat,
                mealCount: dayMeals.length,
            };
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Calculate overall stats
        const totalCalories = meals.reduce((sum, meal) => sum + meal.totalCalories, 0);
        const totalProtein = meals.reduce((sum, meal) => sum + meal.totalProtein, 0);
        const totalCarbs = meals.reduce((sum, meal) => sum + meal.totalCarbs, 0);
        const totalFat = meals.reduce((sum, meal) => sum + meal.totalFat, 0);

        // Get unique dates to calculate daily averages
        const uniqueDates = new Set(meals.map(meal => meal.date));
        const dayCount = uniqueDates.size;

        // Count meal types
        const mealCounts = {
            breakfast: meals.filter(meal => meal.mealType === 'breakfast').length,
            lunch: meals.filter(meal => meal.mealType === 'lunch').length,
            dinner: meals.filter(meal => meal.mealType === 'dinner').length,
            snack: meals.filter(meal => meal.mealType === 'snack').length,
        };

        // Calculate macro ratios
        const totalMacroGrams = totalProtein + totalCarbs + totalFat;
        const macroRatios = {
            protein: totalMacroGrams > 0 ? (totalProtein / totalMacroGrams) * 100 : 0,
            carbs: totalMacroGrams > 0 ? (totalCarbs / totalMacroGrams) * 100 : 0,
            fat: totalMacroGrams > 0 ? (totalFat / totalMacroGrams) * 100 : 0,
        };

        return {
            totalCalories,
            averageCaloriesPerDay: dayCount > 0 ? totalCalories / dayCount : 0,
            totalProtein,
            totalCarbs,
            totalFat,
            mealCounts,
            macroRatios,
            recentDays,
        };
    }, [meals]);

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold">Nutrition Analysis</h2>

            {meals.length === 0 ? (
                <p className="text-gray-500 italic">No nutrition data available yet. Start tracking to see your statistics.</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Daily Calories</p>
                            <p className="text-2xl font-bold">{stats.averageCaloriesPerDay.toFixed(0)} kcal</p>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Protein Ratio</p>
                            <p className="text-2xl font-bold">{stats.macroRatios.protein.toFixed(0)}%</p>
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Carbs Ratio</p>
                            <p className="text-2xl font-bold">{stats.macroRatios.carbs.toFixed(0)}%</p>
                        </div>

                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Fat Ratio</p>
                            <p className="text-2xl font-bold">{stats.macroRatios.fat.toFixed(0)}%</p>
                        </div>
                    </div>

                    {/* Meal Type Distribution */}
                    <div>
                        <h3 className="font-medium mb-2">Meal Distribution</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                <p className="font-medium">Breakfast</p>
                                <p className="text-lg">{stats.mealCounts.breakfast}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                <p className="font-medium">Lunch</p>
                                <p className="text-lg">{stats.mealCounts.lunch}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                <p className="font-medium">Dinner</p>
                                <p className="text-lg">{stats.mealCounts.dinner}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                <p className="font-medium">Snacks</p>
                                <p className="text-lg">{stats.mealCounts.snack}</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Days Summary */}
                    {stats.recentDays.length > 0 && (
                        <div>
                            <h3 className="font-medium mb-2">Recent Days</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Calories</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Protein</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Carbs</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fat</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Meals</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {stats.recentDays.map((day) => (
                                        <tr key={day.date}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDate(day.date)}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{day.calories} kcal</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{day.protein}g</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{day.carbs}g</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{day.fat}g</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{day.mealCount}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Nutrition Insight */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h3 className="font-medium mb-2">Nutrition Insight</h3>
                        <p>
                            {stats.macroRatios.protein < 15
                                ? "Your protein intake appears to be below recommended levels. Consider adding more protein-rich foods to your diet."
                                : stats.macroRatios.protein > 35
                                    ? "Your protein intake is on the higher side. This can be good for muscle building but ensure you're getting a balanced diet."
                                    : "Your protein ratio is within the recommended range of 15-35% of total macros."}
                        </p>
                        <p className="mt-2">
                            {stats.averageCaloriesPerDay < 1500
                                ? "Your average daily calorie intake appears to be on the lower side. Make sure you're getting enough nutrition to fuel your body."
                                : stats.averageCaloriesPerDay > 3000
                                    ? "Your calorie intake is on the higher side. This might be appropriate based on your activity level and fitness goals."
                                    : "Your average daily calorie intake is within a moderate range."}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}