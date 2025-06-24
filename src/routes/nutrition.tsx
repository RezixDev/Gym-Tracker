// app/routes/nutrition.tsx
import { createFileRoute } from "@tanstack/react-router";
import { NutritionForm } from "../components/nutrition/NutritionForm";
import { NutritionStats } from "../components/nutrition/NutritionStats";
import { NutritionTable } from "../components/nutrition/NutritionTable";
import { useNutritionData } from "../hooks/useNutritionData";

export const Route = createFileRoute("/nutrition")({
  component: NutritionPage,
});

function NutritionPage() {
  const { meals, addMeal, deleteMeal, createFoodItem } = useNutritionData();

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-6 text-3xl font-bold">Nutrition Tracking</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Form Column */}
        <div className="lg:col-span-4">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold">Log Meal</h2>
            <NutritionForm addMeal={addMeal} createFoodItem={createFoodItem} />
          </div>
        </div>

        {/* Stats & History Column */}
        <div className="space-y-8 lg:col-span-4">
          <NutritionStats meals={meals} />

          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <NutritionTable meals={meals} deleteMeal={deleteMeal} />
          </div>
        </div>
      </div>
    </div>
  );
}
