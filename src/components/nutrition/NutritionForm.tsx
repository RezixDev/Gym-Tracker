import React, { useState, useMemo } from 'react';
import { useForm } from '@tanstack/react-form';
import { Plus, Calendar, Apple, Coffee, UtensilsCrossed, Cookie, BarChart3, History } from 'lucide-react';

// Shadcn UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// Import the hook and components
import { useNutritionData } from '../../hooks/useNutritionData';
import { NutritionStats } from './NutritionStats';
import { NutritionTable } from './NutritionTable';

export function NutritionForm() {
  // Use the nutrition data hook
  const {
    meals,
    addMeal,
    deleteMeal,
    createFoodItem,
    totalMeals,
    mealsWithNutrition,
    mealsWithoutNutrition,
    nutritionCompleteness
  } = useNutritionData();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('today');

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

  // Form setup
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

      // Create food item using the hook's helper
      const foodItem = createFoodItem({
        name: value.name.trim(),
        quantity: Number(value.quantity) || 1,
        unit: value.unit,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      });

      // Add meal using the hook
      addMeal({
        date: selectedDate,
        timestamp,
        mealType,
        foods: [foodItem],
        notes: value.notes || '',
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0
      });

      form.reset();
      toast.success(`Added ${value.name} to ${mealType}`);
    }
  });

  // Filter meals by selected date
  const todaysMeals = useMemo(() => {
    return meals.filter(meal => meal.date === selectedDate)
      .sort((a, b) => {
        // Sort by timestamp if available, otherwise by ID
        const timeA = meal.timestamp ? new Date(meal.timestamp).getTime() : 0;
        const timeB = meal.timestamp ? new Date(meal.timestamp).getTime() : 0;
        return timeA - timeB;
      });
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

  // Group meals by meal type
  const mealsByType = useMemo(() => {
    return todaysMeals.reduce((acc, meal) => {
      if (!acc[meal.mealType]) acc[meal.mealType] = [];
      acc[meal.mealType].push(meal);
      return acc;
    }, {} as Record<string, typeof meals>);
  }, [todaysMeals]);

  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Nutrition Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your daily meals and monitor your nutrition
          </p>
        </div>
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

      <Separator />

      {/* Quick Add Form */}
      <Card className="border-2 border-primary/20 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Add Food
          </CardTitle>
          <CardDescription>
            Add food items to track your nutrition. Meal type is auto-detected based on time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">
                <Label htmlFor="food-name">Food Item</Label>
                <form.Field
                  name="name"
                  validators={{
                    onChange: ({ value }) => 
                      !value.trim() ? 'Food name is required' : undefined
                  }}
                >
                  {(field) => (
                    <div>
                      <Input
                        id="food-name"
                        type="text"
                        placeholder="e.g., Apple, Chicken breast, Pasta"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="mt-1"
                        autoFocus
                      />
                      {field.state.meta.errors && (
                        <p className="text-sm text-destructive mt-1">
                          {field.state.meta.errors}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="quantity">Quantity</Label>
                <form.Field name="quantity">
                  {(field) => (
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      step="any"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="mt-1"
                    />
                  )}
                </form.Field>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="unit">Unit</Label>
                <form.Field name="unit">
                  {(field) => (
                    <Select
                      value={field.state.value}
                      onValueChange={field.handleChange}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="serving">serving</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="cup">cup</SelectItem>
                        <SelectItem value="piece">piece</SelectItem>
                        <SelectItem value="slice">slice</SelectItem>
                        <SelectItem value="tbsp">tbsp</SelectItem>
                        <SelectItem value="tsp">tsp</SelectItem>
                        <SelectItem value="oz">oz</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </form.Field>
              </div>
              
              <div className="md:col-span-2 flex items-end">
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button 
                      type="button"
                      onClick={() => form.handleSubmit()}
                      className="w-full"
                      disabled={!canSubmit || isSubmitting}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add to {getMealTypeFromTime().charAt(0).toUpperCase() + getMealTypeFromTime().slice(1)}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <form.Field name="notes">
                {(field) => (
                  <Input
                    id="notes"
                    type="text"
                    placeholder="Any additional notes..."
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="mt-1"
                  />
                )}
              </form.Field>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="today" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Today
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Stats
          </TabsTrigger>
        </TabsList>

        {/* Today Tab */}
        <TabsContent value="today" className="space-y-6">
          {/* Daily Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Summary - {formatDate(selectedDate)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="border-0 shadow-none bg-blue-50 dark:bg-blue-950/20">
                  <CardContent className="p-3 text-center">
                    <p className="text-sm text-muted-foreground">Items</p>
                    <p className="text-2xl font-bold text-blue-600">{dailyTotals.items}</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-none bg-green-50 dark:bg-green-950/20">
                  <CardContent className="p-3 text-center">
                    <p className="text-sm text-muted-foreground">Calories</p>
                    <p className="text-2xl font-bold text-green-600">{dailyTotals.calories}</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-none bg-purple-50 dark:bg-purple-950/20">
                  <CardContent className="p-3 text-center">
                    <p className="text-sm text-muted-foreground">Protein</p>
                    <p className="text-2xl font-bold text-purple-600">{dailyTotals.protein}g</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-none bg-yellow-50 dark:bg-yellow-950/20">
                  <CardContent className="p-3 text-center">
                    <p className="text-sm text-muted-foreground">Carbs</p>
                    <p className="text-2xl font-bold text-yellow-600">{dailyTotals.carbs}g</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-none bg-red-50 dark:bg-red-950/20">
                  <CardContent className="p-3 text-center">
                    <p className="text-sm text-muted-foreground">Fat</p>
                    <p className="text-2xl font-bold text-red-600">{dailyTotals.fat}g</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Today's Meals */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Meals</CardTitle>
              <CardDescription>
                Your food items organized by meal type
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todaysMeals.length === 0 ? (
                <div className="text-center py-12">
                  <Apple className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-lg text-muted-foreground">No meals logged for today</p>
                  <p className="text-sm text-muted-foreground mt-1">Start by adding your first meal above!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealType) => {
                    const meals = mealsByType[mealType] || [];
                    if (meals.length === 0) return null;

                    return (
                      <Card key={mealType}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getMealIcon(mealType)}
                              <CardTitle className="text-base capitalize">{mealType}</CardTitle>
                            </div>
                            <Badge variant="secondary">{meals.length} items</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {meals.map((meal) => (
                            <div key={meal.id}>
                              {meal.foods.map((food, idx) => (
                                <Card key={food.id || idx} className="border shadow-none bg-muted/50">
                                  <CardContent className="p-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                          <span className="font-medium">{food.name}</span>
                                          <Badge variant="outline">
                                            {food.quantity} {food.unit}
                                          </Badge>
                                          {meal.timestamp && (
                                            <span className="text-xs text-muted-foreground">
                                              {formatTime(meal.timestamp)}
                                            </span>
                                          )}
                                        </div>
                                        {food.nutritionDataAdded ? (
                                          <div className="text-xs text-muted-foreground mt-1">
                                            {food.calories} cal • {food.protein}g protein • {food.carbs}g carbs • {food.fat}g fat
                                          </div>
                                        ) : (
                                          <div className="text-xs text-amber-600 mt-1">
                                            Nutrition data pending
                                          </div>
                                        )}
                                        {meal.notes && (
                                          <div className="text-xs text-muted-foreground mt-1">
                                            Note: {meal.notes}
                                          </div>
                                        )}
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteMeal(meal.id)}
                                        className="text-destructive hover:text-destructive"
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6">
              <NutritionTable meals={meals} deleteMeal={deleteMeal} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <NutritionStats meals={meals} />
        </TabsContent>
      </Tabs>

      {/* Quick Insights */}
      {activeTab === 'today' && (
        <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200">
          <AlertDescription>
            <h3 className="font-semibold mb-2">Quick Insights</h3>
            <div className="space-y-2 text-sm">
              {dailyTotals.items === 0 ? (
                <p className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                  Start tracking your meals to see daily insights and nutrition analysis.
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
                      Add nutrition data to track calories and macros.
                    </p>
                  )}
                  {dailyTotals.calories > 0 && (
                    <p className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      Great job tracking! Keep it up for better insights.
                    </p>
                  )}
                </>
              )}
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Overall: {totalMeals} meals tracked • {nutritionCompleteness.toFixed(0)}% with nutrition data
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}