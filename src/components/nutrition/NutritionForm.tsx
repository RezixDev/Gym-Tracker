// components/nutrition/NutritionForm.tsx

import { useForm as useTanstackForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { CalendarIcon, Plus, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FoodItem, Meal } from "../../hooks/useNutritionData";

type FoodItemInput = Omit<FoodItem, "id">;

export function NutritionForm({
  addMeal,
  createFoodItem,
}: {
  addMeal: (meal: Omit<Meal, "id">) => void;
  createFoodItem: (food: Omit<FoodItem, "id">) => FoodItem;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">(
    "breakfast",
  );
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isAddingFood, setIsAddingFood] = useState(false);

  // Simple state for the add food form
  const [addFoodFormData, setAddFoodFormData] = useState({
    name: "",
    quantity: "1",
    unit: "serving",
  });

  // Function to add food item directly
  const addFoodItemDirect = () => {
    console.log("🔥 Direct add function called with:", addFoodFormData);

    if (!addFoodFormData.name || addFoodFormData.name.trim() === "") {
      toast.error("Please provide a name for the food item.");
      return;
    }

    try {
      const newFoodItem = createFoodItem({
        name: addFoodFormData.name.trim(),
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        quantity: Number(addFoodFormData.quantity) || 1,
        unit: addFoodFormData.unit.trim() || "serving",
      });

      console.log("✅ Created food item:", newFoodItem);
      setFoodItems((prev) => {
        const updated = [...prev, newFoodItem];
        console.log("✅ Updated food items list:", updated);
        return updated;
      });

      // Reset form
      setAddFoodFormData({ name: "", quantity: "1", unit: "serving" });
      setIsAddingFood(false);
      toast.success(`Added ${newFoodItem.name} to meal`);
    } catch (error) {
      console.error("❌ Error creating food item:", error);
      toast.error("Failed to add food item. Please try again.");
    }
  };

  // Form for the entire meal
  const mealForm = useTanstackForm({
    defaultValues: {
      notes: "",
    },
    onSubmit: async ({ value }) => {
      console.log("📝 Submitting new meal:", value, foodItems);

      if (!selectedDate) {
        toast.error("Please select a date.");
        return;
      }

      if (foodItems.length === 0) {
        toast.error("Please add at least one food item to your meal.");
        setIsAddingFood(true); // Open the food form to help the user
        return;
      }

      try {
        // Calculate meal totals (default to 0 for now since we removed nutrition fields)
        const totalCalories = foodItems.reduce(
          (sum, item) => sum + (item.calories || 0),
          0,
        );
        const totalProtein = foodItems.reduce(
          (sum, item) => sum + (item.protein || 0),
          0,
        );
        const totalCarbs = foodItems.reduce((sum, item) => sum + (item.carbs || 0), 0);
        const totalFat = foodItems.reduce((sum, item) => sum + (item.fat || 0), 0);

        // Create deep copies of food items to ensure they're properly saved
        const foodItemsCopy = foodItems.map((item) => ({ ...item }));

        // Add the meal
        addMeal({
          date: format(selectedDate, "yyyy-MM-dd"),
          mealType,
          foods: foodItemsCopy,
          notes: value.notes,
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFat,
        });

        // Reset form state
        toast.success(
          `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} with ${foodItems.length} items saved successfully! 🎉`,
        );
        mealForm.reset();
        setSelectedDate(new Date());
        setMealType("breakfast");
        setFoodItems([]);
      } catch (error) {
        console.error("Error saving meal:", error);
        toast.error("There was an error saving your meal. Please try again.");
      }
    },
  });

  const removeFoodItem = (id: string) => {
    setFoodItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Bigger Log Meal Window */}
      <div className="rounded-lg border-2 border-blue-200 bg-white p-8 shadow-lg dark:border-blue-700 dark:bg-gray-800">
        <h2 className="mb-6 text-center text-2xl font-bold">Log Meal</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mealForm.handleSubmit();
          }}
          className="space-y-6"
        >
          {/* Date and Meal Type in one row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Date Picker */}
            <div className="flex flex-col space-y-2">
              <label className="text-lg font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-12 w-full pl-3 text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                    )}
                  >
                    {selectedDate ? (
                      format(selectedDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Meal Type */}
            <div className="space-y-2">
              <label className="text-lg font-medium">Meal Type</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={mealType === "breakfast" ? "default" : "outline"}
                  onClick={() => setMealType("breakfast")}
                  className="h-12"
                >
                  Breakfast
                </Button>
                <Button
                  type="button"
                  variant={mealType === "lunch" ? "default" : "outline"}
                  onClick={() => setMealType("lunch")}
                  className="h-12"
                >
                  Lunch
                </Button>
                <Button
                  type="button"
                  variant={mealType === "dinner" ? "default" : "outline"}
                  onClick={() => setMealType("dinner")}
                  className="h-12"
                >
                  Dinner
                </Button>
                <Button
                  type="button"
                  variant={mealType === "snack" ? "default" : "outline"}
                  onClick={() => setMealType("snack")}
                  className="h-12"
                >
                  Snack
                </Button>
              </div>
            </div>
          </div>

          {/* Food Items Section - Much Bigger */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-lg font-medium">Food Items</label>
              <Button
                type="button"
                size="lg"
                onClick={() => setIsAddingFood(true)}
                disabled={isAddingFood}
                className="h-12 px-6"
              >
                <Plus className="mr-2 h-5 w-5" /> Add Food
              </Button>
            </div>

            {/* Food Items List Section - Bigger Container */}
            <div className="min-h-[200px] rounded-lg border-2 border-gray-200 p-6 dark:border-gray-700">
              <h3 className="mb-4 text-lg font-medium">
                Added Items ({foodItems.length})
              </h3>

              {foodItems.length === 0 && !isAddingFood ? (
                <div className="flex h-32 items-center justify-center">
                  <p className="text-lg text-gray-500 italic">
                    No food items added yet. Click "Add Food" to add items to your meal.
                  </p>
                </div>
              ) : (
                <div className="max-h-80 space-y-3 overflow-y-auto">
                  {foodItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border bg-gray-50 p-4 dark:bg-gray-800"
                    >
                      <div>
                        <p className="text-lg font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.quantity} {item.unit}
                          <span className="ml-2 rounded bg-yellow-100 px-2 py-1 text-xs dark:bg-yellow-900">
                            Nutrition info can be added later
                          </span>
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFoodItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Food Form - Simplified */}
            {isAddingFood && (
              <div className="mt-3 space-y-4 rounded-lg border-2 border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Add Food Item</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingFood(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Only Essential Fields */}
                  <div>
                    <label className="text-sm font-medium">
                      Food Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={addFoodFormData.name}
                      onChange={(e) =>
                        setAddFoodFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="e.g., Apple"
                      required
                      autoFocus
                      className="h-12 text-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Quantity</label>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={addFoodFormData.quantity}
                        onChange={(e) =>
                          setAddFoodFormData((prev) => ({
                            ...prev,
                            quantity: e.target.value,
                          }))
                        }
                        placeholder="1"
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Unit</label>
                      <select
                        value={addFoodFormData.unit}
                        onChange={(e) =>
                          setAddFoodFormData((prev) => ({
                            ...prev,
                            unit: e.target.value,
                          }))
                        }
                        className="h-12 w-full rounded-md border border-gray-300 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="serving">serving</option>
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="l">l</option>
                        <option value="cup">cup</option>
                        <option value="tbsp">tbsp</option>
                        <option value="tsp">tsp</option>
                        <option value="piece">piece</option>
                        <option value="slice">slice</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="button"
                      className="h-12 w-full text-lg"
                      onClick={addFoodItemDirect}
                    >
                      Add to Meal
                    </Button>
                    <p className="mt-2 text-center text-xs text-gray-500">
                      Nutrition info (calories, protein, etc.) can be added later via AI
                      or manual editing
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-lg font-medium">Notes</label>
            <mealForm.Field name="notes">
              {(field) => (
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Any notes about this meal (optional)"
                  className="h-12"
                />
              )}
            </mealForm.Field>
          </div>

          <Button
            type="submit"
            className="h-14 w-full text-lg font-semibold"
            disabled={foodItems.length === 0}
          >
            {foodItems.length > 0
              ? `Save ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} with ${foodItems.length} item${foodItems.length !== 1 ? "s" : ""}`
              : "Add food items first"}
          </Button>

          {foodItems.length === 0 && (
            <p className="mt-2 text-center text-sm text-amber-600">
              Please add at least one food item to save your meal
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
