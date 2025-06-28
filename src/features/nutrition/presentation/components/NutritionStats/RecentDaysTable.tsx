// src/features/nutrition/presentation/components/NutritionStats/RecentDaysTable.tsx

import { DailyStatistics } from '../../../domain/models/Statistics';

interface RecentDaysTableProps {
  recentDays: DailyStatistics[];
}

export function RecentDaysTable({ recentDays }: RecentDaysTableProps) {
  return (
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
            {recentDays.map((day) => (
              <tr key={day.date}>
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
  );
}

