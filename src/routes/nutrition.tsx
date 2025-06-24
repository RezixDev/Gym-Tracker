// app/routes/nutrition.tsx
import { createFileRoute } from '@tanstack/react-router';
import { useNutritionData } from '../hooks/useNutritionData';
import { NutritionForm } from '../components/nutrition/NutritionForm';
import { NutritionTable } from '../components/nutrition/NutritionTable';
import { NutritionStats } from '../components/nutrition/NutritionStats';

export const Route = createFileRoute('/nutrition')({
    component: NutritionPage,
});

function NutritionPage() {
    const { meals, addMeal, deleteMeal, createFoodItem } = useNutritionData();

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Nutrition Tracking</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Log Meal</h2>
                        <NutritionForm
                            addMeal={addMeal}
                            createFoodItem={createFoodItem}
                        />
                    </div>
                </div>

                {/* Stats & History Column */}
                <div className="lg:col-span-2 space-y-8">
                    <NutritionStats meals={meals} />

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <NutritionTable
                            meals={meals}
                            deleteMeal={deleteMeal}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}