// components/nutrition/NutritionTable.tsx

import { useState, useMemo } from 'react';
import {
    useReactTable,
    createColumnHelper,
    getCoreRowModel,
    flexRender,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Meal } from '../../hooks/useNutritionData';
import { cn } from '@/lib/utils';

const columnHelper = createColumnHelper<Meal>();

export function NutritionTable({
                                   meals,
                                   deleteMeal,
                               }: {
    meals: Meal[];
    deleteMeal: (id: string) => void;
}) {
    console.log("📊 NutritionTable rendered. Meals:", meals);
    const [selectedMealType, setSelectedMealType] = useState<string>('');

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Define columns
    const columns = useMemo(() => [
        columnHelper.accessor('date', {
            header: 'Date',
            cell: info => formatDate(info.getValue())
        }),
        columnHelper.accessor('mealType', {
            header: 'Meal Type',
            cell: info => info.getValue().charAt(0).toUpperCase() + info.getValue().slice(1)
        }),
        columnHelper.accessor('totalCalories', {
            header: 'Calories',
            cell: info => `${info.getValue()} kcal`
        }),
        columnHelper.accessor('totalProtein', {
            header: 'Protein',
            cell: info => `${info.getValue()}g`
        }),
        columnHelper.accessor('totalCarbs', {
            header: 'Carbs',
            cell: info => `${info.getValue()}g`
        }),
        columnHelper.accessor('totalFat', {
            header: 'Fat',
            cell: info => `${info.getValue()}g`
        }),
        columnHelper.accessor('foods', {
            header: 'Foods',
            cell: info => {
                const foods = info.getValue();
                // Check if foods array exists and has items
                if (!foods || foods.length === 0) {
                    return <span className="text-gray-400 italic">No foods</span>;
                }

                // Get food names
                const foodNames = foods.map(food => food.name);

                // Display a clickable element to show all foods
                return (
                    <div>
                        <button
                            onClick={() => {
                                // Show toast with all foods
                                toast.info(
                                    <div>
                                        <p className="font-bold mb-1">Food Items ({foods.length})</p>
                                        <ul className="list-disc pl-4">
                                            {foods.map((food, index) => (
                                                <li key={index}>
                                                    {food.name} ({food.quantity} {food.unit}) - {food.calories} cal
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            }}
                            className="text-left hover:text-blue-600 dark:hover:text-blue-400"
                        >
                            <div className="max-w-[200px]">
                                <span className="font-medium">{foods.length} item{foods.length !== 1 ? 's' : ''}: </span>
                                <span className="truncate">{foodNames.join(', ')}</span>
                            </div>
                        </button>
                    </div>
                );
            }
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                        deleteMeal(row.original.id);
                        toast.success('Meal deleted!');
                    }}
                >
                    Delete
                </Button>
            ),
        }),
    ], [deleteMeal]);

    // Get unique meal types
    const mealTypes = useMemo(() => {
        const types = new Set(meals.map(meal => meal.mealType));
        return Array.from(types);
    }, [meals]);

    // Filter and sort meals
    const filteredMeals = useMemo(() => {
        let filtered = [...meals];

        // Apply meal type filter
        if (selectedMealType) {
            filtered = filtered.filter(meal => meal.mealType === selectedMealType);
        }

        // Sort by date (newest first)
        return filtered.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [meals, selectedMealType]);

    // Create table instance
    const table = useReactTable({
        data: filteredMeals,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="overflow-x-auto space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Nutrition History</h2>

                <select
                    value={selectedMealType}
                    onChange={(e) => setSelectedMealType(e.target.value)}
                    className="border rounded-md p-2"
                >
                    <option value="">All Meal Types</option>
                    {mealTypes.map((type) => (
                        <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            {meals.length === 0 ? (
                <p className="text-gray-500 italic">No meals logged yet. Start tracking your nutrition above!</p>
            ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {table.getRowModel().rows.map((row) => (
                        <tr
                            key={row.id}
                            className={cn(
                                "hover:bg-gray-100 dark:hover:bg-gray-800",
                                row.original.date === new Date().toISOString().split('T')[0]
                                    ? "bg-green-50 dark:bg-green-900/20"
                                    : ""
                            )}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}