// hooks/useNutritionData.ts

import { useCallback, useEffect, useState } from 'react';

export type Meal = {
    id: string;
    date: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    foods: FoodItem[];
    notes: string;
    totalCalories: number;
    totalProtein: number; // grams
    totalCarbs: number; // grams
    totalFat: number; // grams
};

export type FoodItem = {
    id: string;
    name: string;
    calories: number;
    protein: number; // grams
    carbs: number; // grams
    fat: number; // grams
    quantity: number;
    unit: string;
};

export function useNutritionData() {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        console.log("📥 Loading meals from localStorage...");
        const storedMeals = localStorage.getItem('meals');
        if (storedMeals) {
            try {
                const parsed: Meal[] = JSON.parse(storedMeals);
                setMeals(parsed);
            } catch (err) {
                console.error("❌ Failed to parse meals", err);
                setMeals([]);
            }
        }
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (loaded) {
            console.log("💾 Saving meals to localStorage...", meals);
            localStorage.setItem('meals', JSON.stringify(meals));
        }
    }, [meals, loaded]);

    const addMeal = useCallback((meal: Omit<Meal, 'id'>) => {
        // Ensure meal structure is correct before adding
        const validatedMeal = {
            ...meal,
            id: crypto.randomUUID(),
            // Ensure all food items have IDs and valid numeric values
            foods: meal.foods.map(food => ({
                ...food,
                // Ensure food has an ID (should already have one, but just in case)
                id: food.id || crypto.randomUUID(),
                // Ensure all numeric values are valid numbers
                calories: Number(food.calories) || 0,
                protein: Number(food.protein) || 0,
                carbs: Number(food.carbs) || 0,
                fat: Number(food.fat) || 0,
                quantity: Number(food.quantity) || 1
            }))
        };

        console.log("💾 Adding meal with foods:", validatedMeal);

        setMeals((prev) => [
            ...prev,
            validatedMeal,
        ]);
    }, []);

    const deleteMeal = useCallback((id: string) => {
        setMeals((prev) => prev.filter((m) => m.id !== id));
    }, []);

    // Helper function to create a new food item
    const createFoodItem = useCallback((food: Omit<FoodItem, 'id'>): FoodItem => {
        return {
            ...food,
            id: crypto.randomUUID()
        };
    }, []);

    // Calculate nutrition statistics for a given date range
    const getNutritionStats = useCallback((startDate?: string, endDate?: string) => {
        let filteredMeals = [...meals];

        if (startDate) {
            filteredMeals = filteredMeals.filter(meal => meal.date >= startDate);
        }

        if (endDate) {
            filteredMeals = filteredMeals.filter(meal => meal.date <= endDate);
        }

        if (filteredMeals.length === 0) {
            return {
                totalCalories: 0,
                averageCaloriesPerDay: 0,
                totalProtein: 0,
                totalCarbs: 0,
                totalFat: 0,
                mealCounts: { breakfast: 0, lunch: 0, dinner: 0, snack: 0 }
            };
        }

        const totalCalories = filteredMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
        const totalProtein = filteredMeals.reduce((sum, meal) => sum + meal.totalProtein, 0);
        const totalCarbs = filteredMeals.reduce((sum, meal) => sum + meal.totalCarbs, 0);
        const totalFat = filteredMeals.reduce((sum, meal) => sum + meal.totalFat, 0);

        // Get unique dates to calculate daily averages
        const uniqueDates = new Set(filteredMeals.map(meal => meal.date));
        const dayCount = uniqueDates.size;

        // Count meal types
        const mealCounts = {
            breakfast: filteredMeals.filter(meal => meal.mealType === 'breakfast').length,
            lunch: filteredMeals.filter(meal => meal.mealType === 'lunch').length,
            dinner: filteredMeals.filter(meal => meal.mealType === 'dinner').length,
            snack: filteredMeals.filter(meal => meal.mealType === 'snack').length,
        };

        return {
            totalCalories,
            averageCaloriesPerDay: dayCount > 0 ? totalCalories / dayCount : 0,
            totalProtein,
            totalCarbs,
            totalFat,
            mealCounts
        };
    }, [meals]);

    return {
        meals,
        addMeal,
        deleteMeal,
        createFoodItem,
        getNutritionStats
    };
}