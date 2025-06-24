// hooks/useNutritionData.ts

import { useCallback, useEffect, useState } from "react";

export type Meal = {
  id: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  foods: FoodItem[];
  notes: string;
  // Nutrition totals - can be 0 initially and filled later
  totalCalories: number;
  totalProtein: number; // grams
  totalCarbs: number; // grams
  totalFat: number; // grams
  // Metadata for tracking
  createdAt: string;
  updatedAt: string;
  nutritionDataComplete: boolean; // Flag to track if nutrition data has been added
};

export type FoodItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  // Nutrition data - can be 0 initially and filled later via AI/manual editing
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  // Metadata
  nutritionDataAdded: boolean; // Flag to track if nutrition data has been manually added
  lastNutritionUpdate?: string; // Timestamp of last nutrition update
};

export function useNutritionData() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    console.log("📥 Loading meals from localStorage...");
    const storedMeals = localStorage.getItem("meals");
    if (storedMeals) {
      try {
        const parsed: Meal[] = JSON.parse(storedMeals);
        // Migrate old data structure if needed
        const migratedMeals = parsed.map((meal) => ({
          ...meal,
          // Add new fields if they don't exist (for backward compatibility)
          createdAt: meal.createdAt || new Date().toISOString(),
          updatedAt: meal.updatedAt || new Date().toISOString(),
          nutritionDataComplete:
            meal.nutritionDataComplete ??
            (meal.totalCalories > 0 ||
              (meal.foods && meal.foods.some((food) => food.calories > 0))),
          // Migrate food items
          foods:
            meal.foods?.map((food) => ({
              ...food,
              nutritionDataAdded: food.nutritionDataAdded ?? food.calories > 0,
              lastNutritionUpdate: food.lastNutritionUpdate,
            })) || [],
        }));
        setMeals(migratedMeals);
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
      localStorage.setItem("meals", JSON.stringify(meals));
    }
  }, [meals, loaded]);

  const addMeal = useCallback(
    (meal: Omit<Meal, "id" | "createdAt" | "updatedAt" | "nutritionDataComplete">) => {
      const now = new Date().toISOString();

      // Validate and clean food items
      const validatedFoods = meal.foods.map((food) => ({
        ...food,
        // Ensure food has an ID
        id: food.id || crypto.randomUUID(),
        // Ensure all numeric values are valid numbers (default to 0 for nutrition)
        calories: Number(food.calories) || 0,
        protein: Number(food.protein) || 0,
        carbs: Number(food.carbs) || 0,
        fat: Number(food.fat) || 0,
        quantity: Number(food.quantity) || 1,
        // Add metadata
        nutritionDataAdded: (Number(food.calories) || 0) > 0,
        lastNutritionUpdate: (Number(food.calories) || 0) > 0 ? now : undefined,
      }));

      // Calculate if nutrition data is complete
      const hasNutritionData =
        validatedFoods.some((food) => food.calories > 0) || meal.totalCalories > 0;

      const validatedMeal: Meal = {
        ...meal,
        id: crypto.randomUUID(),
        foods: validatedFoods,
        createdAt: now,
        updatedAt: now,
        nutritionDataComplete: hasNutritionData,
        // Ensure all numeric values are valid
        totalCalories: Number(meal.totalCalories) || 0,
        totalProtein: Number(meal.totalProtein) || 0,
        totalCarbs: Number(meal.totalCarbs) || 0,
        totalFat: Number(meal.totalFat) || 0,
      };

      console.log("💾 Adding meal with foods:", validatedMeal);

      setMeals((prev) => [...prev, validatedMeal]);
    },
    [],
  );

  const updateMealNutrition = useCallback(
    (
      mealId: string,
      nutritionData: {
        totalCalories?: number;
        totalProtein?: number;
        totalCarbs?: number;
        totalFat?: number;
        foodUpdates?: Array<{
          foodId: string;
          calories?: number;
          protein?: number;
          carbs?: number;
          fat?: number;
        }>;
      },
    ) => {
      const now = new Date().toISOString();

      setMeals((prev) =>
        prev.map((meal) => {
          if (meal.id !== mealId) return meal;

          let updatedFoods = [...meal.foods];

          // Update individual food items if provided
          if (nutritionData.foodUpdates) {
            updatedFoods = meal.foods.map((food) => {
              const update = nutritionData.foodUpdates?.find((u) => u.foodId === food.id);
              if (!update) return food;

              return {
                ...food,
                calories:
                  update.calories !== undefined ? Number(update.calories) : food.calories,
                protein:
                  update.protein !== undefined ? Number(update.protein) : food.protein,
                carbs: update.carbs !== undefined ? Number(update.carbs) : food.carbs,
                fat: update.fat !== undefined ? Number(update.fat) : food.fat,
                nutritionDataAdded: true,
                lastNutritionUpdate: now,
              };
            });
          }

          // Calculate totals if not provided
          const calculatedTotals = {
            totalCalories:
              nutritionData.totalCalories !== undefined
                ? Number(nutritionData.totalCalories)
                : updatedFoods.reduce((sum, food) => sum + (food.calories || 0), 0),
            totalProtein:
              nutritionData.totalProtein !== undefined
                ? Number(nutritionData.totalProtein)
                : updatedFoods.reduce((sum, food) => sum + (food.protein || 0), 0),
            totalCarbs:
              nutritionData.totalCarbs !== undefined
                ? Number(nutritionData.totalCarbs)
                : updatedFoods.reduce((sum, food) => sum + (food.carbs || 0), 0),
            totalFat:
              nutritionData.totalFat !== undefined
                ? Number(nutritionData.totalFat)
                : updatedFoods.reduce((sum, food) => sum + (food.fat || 0), 0),
          };

          const hasNutritionData =
            calculatedTotals.totalCalories > 0 ||
            updatedFoods.some((food) => food.calories > 0);

          return {
            ...meal,
            foods: updatedFoods,
            ...calculatedTotals,
            nutritionDataComplete: hasNutritionData,
            updatedAt: now,
          };
        }),
      );
    },
    [],
  );

  const deleteMeal = useCallback((id: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // Helper function to create a new food item with simplified structure
  const createFoodItem = useCallback(
    (
      food: Omit<FoodItem, "id" | "nutritionDataAdded" | "lastNutritionUpdate">,
    ): FoodItem => {
      const hasNutritionData = (food.calories || 0) > 0;

      return {
        ...food,
        id: crypto.randomUUID(),
        // Default nutrition values to 0 (to be filled later)
        calories: Number(food.calories) || 0,
        protein: Number(food.protein) || 0,
        carbs: Number(food.carbs) || 0,
        fat: Number(food.fat) || 0,
        quantity: Number(food.quantity) || 1,
        nutritionDataAdded: hasNutritionData,
        lastNutritionUpdate: hasNutritionData ? new Date().toISOString() : undefined,
      };
    },
    [],
  );

  // Get meals with missing nutrition data
  const getMealsWithoutNutrition = useCallback(() => {
    return meals.filter((meal) => !meal.nutritionDataComplete);
  }, [meals]);

  // Get meals with complete nutrition data
  const getMealsWithNutrition = useCallback(() => {
    return meals.filter((meal) => meal.nutritionDataComplete);
  }, [meals]);

  // Calculate nutrition statistics for a given date range
  const getNutritionStats = useCallback(
    (startDate?: string, endDate?: string) => {
      let filteredMeals = [...meals];

      if (startDate) {
        filteredMeals = filteredMeals.filter((meal) => meal.date >= startDate);
      }

      if (endDate) {
        filteredMeals = filteredMeals.filter((meal) => meal.date <= endDate);
      }

      const totalMeals = filteredMeals.length;
      const mealsWithNutrition = filteredMeals.filter(
        (meal) => meal.nutritionDataComplete,
      );
      const mealsWithoutNutrition = filteredMeals.filter(
        (meal) => !meal.nutritionDataComplete,
      );

      if (totalMeals === 0) {
        return {
          totalMeals: 0,
          totalFoodItems: 0,
          mealsWithNutrition: 0,
          mealsWithoutNutrition: 0,
          nutritionCompleteness: 0,
          totalCalories: 0,
          averageCaloriesPerDay: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          mealCounts: { breakfast: 0, lunch: 0, dinner: 0, snack: 0 },
        };
      }

      // Calculate nutrition totals (only from meals with complete data)
      const nutritionTotals = mealsWithNutrition.reduce(
        (acc, meal) => ({
          totalCalories: acc.totalCalories + meal.totalCalories,
          totalProtein: acc.totalProtein + meal.totalProtein,
          totalCarbs: acc.totalCarbs + meal.totalCarbs,
          totalFat: acc.totalFat + meal.totalFat,
        }),
        { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
      );

      const totalFoodItems = filteredMeals.reduce(
        (sum, meal) => sum + (meal.foods?.length || 0),
        0,
      );

      // Get unique dates to calculate daily averages
      const uniqueDates = new Set(filteredMeals.map((meal) => meal.date));
      const dayCount = uniqueDates.size;

      // Count meal types
      const mealCounts = {
        breakfast: filteredMeals.filter((meal) => meal.mealType === "breakfast").length,
        lunch: filteredMeals.filter((meal) => meal.mealType === "lunch").length,
        dinner: filteredMeals.filter((meal) => meal.mealType === "dinner").length,
        snack: filteredMeals.filter((meal) => meal.mealType === "snack").length,
      };

      return {
        totalMeals,
        totalFoodItems,
        mealsWithNutrition: mealsWithNutrition.length,
        mealsWithoutNutrition: mealsWithoutNutrition.length,
        nutritionCompleteness: (mealsWithNutrition.length / totalMeals) * 100,
        ...nutritionTotals,
        averageCaloriesPerDay:
          dayCount > 0 ? nutritionTotals.totalCalories / dayCount : 0,
        mealCounts,
      };
    },
    [meals],
  );

  // Bulk update nutrition data (useful for AI-powered nutrition addition)
  const bulkUpdateNutrition = useCallback(
    async (
      updates: Array<{
        mealId: string;
        nutritionData: Parameters<typeof updateMealNutrition>[1];
      }>,
    ) => {
      console.log("🔄 Bulk updating nutrition data...", updates);

      updates.forEach(({ mealId, nutritionData }) => {
        updateMealNutrition(mealId, nutritionData);
      });

      return Promise.resolve();
    },
    [updateMealNutrition],
  );

  return {
    meals,
    addMeal,
    updateMealNutrition,
    deleteMeal,
    createFoodItem,
    getNutritionStats,
    getMealsWithoutNutrition,
    getMealsWithNutrition,
    bulkUpdateNutrition,
    // Helper computed values
    totalMeals: meals.length,
    mealsWithNutrition: meals.filter((m) => m.nutritionDataComplete).length,
    mealsWithoutNutrition: meals.filter((m) => !m.nutritionDataComplete).length,
    nutritionCompleteness:
      meals.length > 0
        ? (meals.filter((m) => m.nutritionDataComplete).length / meals.length) * 100
        : 0,
  };
}
