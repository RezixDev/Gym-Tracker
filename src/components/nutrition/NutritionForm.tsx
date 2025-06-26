// components/nutrition/NutriTracker.tsx

import React, { useState, useMemo } from 'react';
import { useForm } from '@tanstack/react-form';
import { Plus, Calendar, Apple, Coffee, UtensilsCrossed, Cookie } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Shadcn UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import the other components
import { NutritionTable } from './NutritionTable';
import { NutritionStats } from './NutritionStats';

// Types matching the Meal type from useNutritionData
export interface Food {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  date: string;
  timestamp: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: Food[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes?: string;
}

// Initial data
const initialMeals: Meal[] = [
  {
    id: '1',
    date: '2025-06-26',
    timestamp: '2025-06-26T08:30:00',
    mealType: 'breakfast',
    foods: [{
      name: 'Apple',
      quantity: 1,
      unit: 'piece',
      calories: 95,
      protein: 0.5,
      carbs: 25,
      fat: 0.3
    }],
    totalCalories: 95,
    totalProtein: 0.5,
    totalCarbs: 25,
    totalFat: 0.3
  }
];

export function NutritionForm() {
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAdding, setIsAdding] = useState(false);

  // Auto-determine meal type based on current time
  const getMealTypeFromTime = (date = new Date()): 'breakfast' | 'lunch' | 'dinner' | 'snack' => {
    const hour = date.getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 16) return 'lunch';
    if (hour < 21) return 'dinner';
    return 'snack';
  };

  // Get meal type icon
  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return <Coffee className="h-4 w-4" />;
      case 'lunch': return <UtensilsCrossed className="h-4 w-4" />;
      case 'dinner': return <UtensilsCrossed className="h-4 w-4" />;
      case 'snack': return <Cookie className="h-4 w-4" />;
      default: return <Apple className="h-4 w-4" />;
    }
  };

  // Form setup with TanStack Form
  const form = useForm({
    defaultValues: {
      name: '',
      quantity: '1',
      unit: 'serving',
      notes: ''
    },
    onSubmit: async ({ value }) => {
      const now = new Date();
      const timestamp = `${selectedDate}T${now.toTimeString().slice(0, 8)}`;
      const mealType = getMealTypeFromTime(now);

      const newFood: Food = {
        name: value.name.trim(),
        quantity: Number(value.quantity) || 1,
        unit: value.unit,
        calories: 0, // Will be filled later
        protein: 0,
        carbs: 0,
        fat: 0
      };

      const newMeal: Meal = {
        id: Date.now().toString(),
        date: selectedDate,
        timestamp,
        mealType,
        foods: [newFood],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        notes: value.notes
      };

      setMeals(prev => [...prev, newMeal]);
      setIsAdding(false);
      form.reset();
      toast.success(`Added ${value.name} to ${mealType}`);
    }
  });

  // Delete meal
  const deleteMeal = (id: string) => {
    setMeals(prev => prev.filter(meal => meal.id !== id));
  };

  // Filter meals by selected date
  const todaysMeals = useMemo(() => {
    return meals.filter(meal => meal.date === selectedDate)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [meals, selectedDate]);

  // Calculate daily totals
  const dailyTotals = useMemo(() => {
    return todaysMeals.reduce((acc, meal) => ({
      items: acc.items + meal.foods.length,
      calories: acc.calories + meal.totalCalories,
      protein: acc.protein + meal.totalProtein,
      carbs: acc.carbs + meal.totalCarbs,
      fat: acc.fat + meal.totalFat
    }), { items: 0, calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [todaysMeals]);

  // Group meals by meal type for display
  const mealsByType = useMemo(() => {
    return todaysMeals.reduce((acc, meal) => {
      if (!acc[meal.mealType]) acc[meal.mealType] = [];
      acc[meal.mealType].push(meal);
      return acc;
    }, {} as Record<string, Meal[]>);
  }, [todaysMeals]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Quick Add Section */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quick Add Food</CardTitle>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isAdding ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-4 bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <form.Field
                    name="name"
                    validators={{
                      onChange: ({ value }) => 
                        !value.trim() ? 'Food name is required' : undefined
                    }}
                  >
                    {(field) => (
                      <>
                        <Input
                          type="text"
                          placeholder="What did you eat? (e.g., Apple, Chicken breast, etc.)"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className="w-full text-lg"
                          autoFocus
                        />
                        {field.state.meta.errors && (
                          <p className="text-sm text-red-500 mt-1">
                            {field.state.meta.errors}
                          </p>
                        )}
                      </>
                    )}
                  </form.Field>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <form.Field name="quantity">
                    {(field) => (
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="Qty"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    )}
                  </form.Field>
                  <form.Field name="unit">
                    {(field) => (
                      <Select
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="serving">serving</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="cup">cup</SelectItem>
                          <SelectItem value="piece">piece</SelectItem>
                          <SelectItem value="slice">slice</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </form.Field>
                </div>
              </div>
              
              <form.Field name="notes">
                {(field) => (
                  <Input
                    type="text"
                    placeholder="Notes (optional)"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full"
                  />
                )}
              </form.Field>

              <div className="flex gap-3">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Add to {formatTime(new Date())} ({getMealTypeFromTime().charAt(0).toUpperCase() + getMealTypeFromTime().slice(1)})
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsAdding(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Meal type is automatically determined by time. Nutrition data can be added later.
              </p>
            </form>
          ) : (
            <Button
              onClick={() => setIsAdding(true)}
              className="w-full"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Food Item
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Daily Summary */}
      <Card>
        <CardHeader>
          <CardTitle>
            Daily Summary - {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Items</p>
              <p className="text-2xl font-bold text-blue-600">{dailyTotals.items}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
              <p className="text-2xl font-bold text-green-600">{dailyTotals.calories}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Protein</p>
              <p className="text-2xl font-bold text-purple-600">{dailyTotals.protein}g</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Carbs</p>
              <p className="text-2xl font-bold text-yellow-600">{dailyTotals.carbs}g</p>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Fat</p>
              <p className="text-2xl font-bold text-red-600">{dailyTotals.fat}g</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Food Items */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Food Items</CardTitle>
        </CardHeader>
        <CardContent>
          {todaysMeals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Apple className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg">No food items logged for this day</p>
              <p className="text-sm">Add your first item above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(mealsByType).map(([mealType, mealItems]) => (
                <Card key={mealType} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      {getMealIcon(mealType)}
                      <CardTitle className="text-base capitalize">{mealType}</CardTitle>
                      <Badge variant="secondary">{mealItems.length} items</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {mealItems.map((meal) => (
                        <div key={meal.id}>
                          {meal.foods.map((food, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-3 rounded">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <span className="font-medium">{food.name}</span>
                                  <span className="text-sm text-gray-500">
                                    {food.quantity} {food.unit}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {formatTime(meal.timestamp)}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {food.calories > 0 ? (
                                    <span>{food.calories} cal • {food.protein}g protein • {food.carbs}g carbs • {food.fat}g fat</span>
                                  ) : (
                                    <span className="text-amber-600">Nutrition data missing - add via AI or manual entry</span>
                                  )}
                                </div>
                                {meal.notes && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    Note: {meal.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Alert */}
      <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200">
        <AlertDescription>
          <h3 className="font-semibold mb-2">Quick Insights</h3>
          <div className="space-y-2 text-sm">
            {dailyTotals.items === 0 ? (
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                Start tracking your food to see daily insights and nutrition analysis.
              </p>
            ) : (
              <>
                <p className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  You've logged {dailyTotals.items} food item{dailyTotals.items !== 1 ? 's' : ''} today.
                </p>
                {dailyTotals.calories === 0 && (
                  <p className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    Add nutrition data to your items for detailed calorie and macro tracking.
                  </p>
                )}
                {dailyTotals.calories > 0 && (
                  <p className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    Total calories: {dailyTotals.calories} | Protein: {dailyTotals.protein}g | Carbs: {dailyTotals.carbs}g | Fat: {dailyTotals.fat}g
                  </p>
                )}
              </>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}