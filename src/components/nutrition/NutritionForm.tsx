// components/nutrition/NutritionForm.tsx

import { useForm as useTanstackForm } from '@tanstack/react-form';
import { format } from 'date-fns';
import { useState } from 'react';
import { CalendarIcon, Plus, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Meal, FoodItem } from '../../hooks/useNutritionData';

type FoodItemInput = Omit<FoodItem, 'id'>;

export function NutritionForm({
                                  addMeal,
                                  createFoodItem,
                              }: {
    addMeal: (meal: Omit<Meal, 'id'>) => void;
    createFoodItem: (food: Omit<FoodItem, 'id'>) => FoodItem;
}) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
    const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
    const [isAddingFood, setIsAddingFood] = useState(false);

    // Form for the entire meal
    const mealForm = useTanstackForm({
        defaultValues: {
            notes: '',
        },
        onSubmit: async ({ value }) => {
            console.log("📝 Submitting new meal:", value, foodItems);

            if (!selectedDate) {
                toast.error('Please select a date.');
                return;
            }

            if (foodItems.length === 0) {
                toast.error('Please add at least one food item to your meal.');
                setIsAddingFood(true); // Open the food form to help the user
                return;
            }

            try {
                // Calculate meal totals
                const totalCalories = foodItems.reduce((sum, item) => sum + item.calories, 0);
                const totalProtein = foodItems.reduce((sum, item) => sum + item.protein, 0);
                const totalCarbs = foodItems.reduce((sum, item) => sum + item.carbs, 0);
                const totalFat = foodItems.reduce((sum, item) => sum + item.fat, 0);

                // Create deep copies of food items to ensure they're properly saved
                const foodItemsCopy = foodItems.map(item => ({...item}));

                // Add the meal
                addMeal({
                    date: format(selectedDate, 'yyyy-MM-dd'),
                    mealType,
                    foods: foodItemsCopy,
                    notes: value.notes,
                    totalCalories,
                    totalProtein,
                    totalCarbs,
                    totalFat,
                });

                // Reset form state
                toast.success(`${mealType.charAt(0).toUpperCase() + mealType.slice(1)} with ${foodItems.length} items saved successfully! 🎉`);
                mealForm.reset();
                setSelectedDate(new Date());
                setMealType('breakfast');
                setFoodItems([]);
            } catch (error) {
                console.error("Error saving meal:", error);
                toast.error('There was an error saving your meal. Please try again.');
            }
        },
    });

    // Form for adding individual food items
    const foodForm = useTanstackForm({
        defaultValues: {
            name: '',
            calories: '',
            protein: '',
            carbs: '',
            fat: '',
            quantity: '',
            unit: '',
        },
        onSubmit: async ({ value }) => {
            console.log("📝 Adding food item:", value);

            // Validate required fields
            if (!value.name || !value.calories) {
                toast.error('Please provide at least a name and calories for the food item.');
                return;
            }

            const newFoodItem = createFoodItem({
                name: value.name,
                calories: Number(value.calories || 0),
                protein: Number(value.protein || 0),
                carbs: Number(value.carbs || 0),
                fat: Number(value.fat || 0),
                quantity: Number(value.quantity || 1),
                unit: value.unit || 'serving',
            });

            setFoodItems(prev => [...prev, newFoodItem]);
            foodForm.reset();
            setIsAddingFood(false);
            toast.success(`Added ${newFoodItem.name} to meal`);
        },
    });

    const removeFoodItem = (id: string) => {
        setFoodItems(prev => prev.filter(item => item.id !== id));
    };

    return (
        <div className="space-y-8">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    mealForm.handleSubmit();
                }}
                className="space-y-6"
            >
                {/* Date Picker */}
                <div className="flex flex-col space-y-2">
                    <label className="font-medium">Date</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-[240px] pl-3 text-left font-normal",
                                    !selectedDate && "text-muted-foreground"
                                )}
                            >
                                {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
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
                    <label className="font-medium">Meal Type</label>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant={mealType === 'breakfast' ? 'default' : 'outline'}
                            onClick={() => setMealType('breakfast')}
                        >
                            Breakfast
                        </Button>
                        <Button
                            type="button"
                            variant={mealType === 'lunch' ? 'default' : 'outline'}
                            onClick={() => setMealType('lunch')}
                        >
                            Lunch
                        </Button>
                        <Button
                            type="button"
                            variant={mealType === 'dinner' ? 'default' : 'outline'}
                            onClick={() => setMealType('dinner')}
                        >
                            Dinner
                        </Button>
                        <Button
                            type="button"
                            variant={mealType === 'snack' ? 'default' : 'outline'}
                            onClick={() => setMealType('snack')}
                        >
                            Snack
                        </Button>
                    </div>
                </div>

                {/* Food Items */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="font-medium">Food Items</label>
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => setIsAddingFood(true)}
                            disabled={isAddingFood}
                        >
                            <Plus className="h-4 w-4 mr-1" /> Add Food
                        </Button>
                    </div>

                    {/* Food Items List Section - This will always be visible */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-md font-medium mb-2">Added Items ({foodItems.length})</h3>

                        {foodItems.length === 0 && !isAddingFood ? (
                            <p className="text-gray-500 italic">No food items added yet. Click "Add Food" to add items to your meal.</p>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {foodItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {item.quantity} {item.unit} • {item.calories} cal •
                                                P: {item.protein}g • C: {item.carbs}g • F: {item.fat}g
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

                        {/* Only show totals if there are food items */}
                        {foodItems.length > 0 && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="font-medium">Meal Totals</p>
                                <p className="text-sm">
                                    Calories: {foodItems.reduce((sum, item) => sum + item.calories, 0)} •
                                    Protein: {foodItems.reduce((sum, item) => sum + item.protein, 0)}g •
                                    Carbs: {foodItems.reduce((sum, item) => sum + item.carbs, 0)}g •
                                    Fat: {foodItems.reduce((sum, item) => sum + item.fat, 0)}g
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Add Food Form */}
                    {isAddingFood && (
                        <div className="border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800 p-4 rounded-lg space-y-4 mt-3">
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium">Add Food Item</h3>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsAddingFood(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    foodForm.handleSubmit();
                                }}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Food Name <span className="text-red-500">*</span></label>
                                        <foodForm.Field name="name">
                                            {(field) => (
                                                <Input
                                                    value={field.state.value}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    placeholder="e.g., Apple"
                                                    required
                                                    autoFocus
                                                />
                                            )}
                                        </foodForm.Field>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="text-sm font-medium">Quantity</label>
                                            <foodForm.Field name="quantity">
                                                {(field) => (
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="any"
                                                        value={field.state.value}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        placeholder="Amount (default: 1)"
                                                    />
                                                )}
                                            </foodForm.Field>
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-sm font-medium">Unit</label>
                                            <foodForm.Field name="unit">
                                                {(field) => (
                                                    <Input
                                                        value={field.state.value}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        placeholder="g, ml, serving"
                                                    />
                                                )}
                                            </foodForm.Field>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Calories <span className="text-red-500">*</span></label>
                                        <foodForm.Field name="calories">
                                            {(field) => (
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={field.state.value}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    placeholder="kcal"
                                                    required
                                                />
                                            )}
                                        </foodForm.Field>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Protein (g)</label>
                                        <foodForm.Field name="protein">
                                            {(field) => (
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={field.state.value}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    placeholder="Protein (g)"
                                                />
                                            )}
                                        </foodForm.Field>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Carbs (g)</label>
                                        <foodForm.Field name="carbs">
                                            {(field) => (
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={field.state.value}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    placeholder="Carbs (g)"
                                                />
                                            )}
                                        </foodForm.Field>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Fat (g)</label>
                                        <foodForm.Field name="fat">
                                            {(field) => (
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={field.state.value}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    placeholder="Fat (g)"
                                                />
                                            )}
                                        </foodForm.Field>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button type="submit" className="w-full">
                                        Add to Meal
                                    </Button>
                                    <p className="text-xs text-gray-500 mt-1 text-center">
                                        Fields marked with <span className="text-red-500">*</span> are required
                                    </p>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Notes */}
                <div>
                    <label className="font-medium">Notes</label>
                    <mealForm.Field name="notes">
                        {(field) => (
                            <Input
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                placeholder="Any notes about this meal (optional)"
                            />
                        )}
                    </mealForm.Field>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={foodItems.length === 0}
                >
                    {foodItems.length > 0
                        ? `Save ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} with ${foodItems.length} item${foodItems.length !== 1 ? 's' : ''}`
                        : 'Add food items first'}
                </Button>

                {foodItems.length === 0 && (
                    <p className="text-center text-amber-600 text-sm mt-2">
                        Please add at least one food item to save your meal
                    </p>
                )}
            </form>
        </div>
    );
}