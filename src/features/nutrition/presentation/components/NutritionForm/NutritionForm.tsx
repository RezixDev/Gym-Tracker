// src/features/nutrition/presentation/components/NutritionForm/NutritionForm.tsx
import React, { useState, useMemo } from 'react';
import { useForm } from '@tanstack/react-form';
import { Plus, Calendar, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

// Shadcn UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Direct domain imports - better for tree-shaking
import { FOOD_UNITS } from '../../../domain/constants';
import { MealTypeService } from '../../../domain/services/MealTypeService';
import { DateUtils } from '../../../domain/utils/dateUtils';

// Direct application imports
import { useNutritionData } from '../../../application/hooks/useNutritionData';

// Sub-components
import { DailySummaryCard } from './DailySummaryCard';
import { TodaysMealsCard } from './TodaysMealsCard';
import { QuickInsights } from './QuickInsights';
import { NutritionTable } from '../NutritionTable/NutritionTable';
import { NutritionStats } from '../NutritionStats/NutritionStats';

export function NutritionForm() {
  const {
    meals,
    addMeal,
    deleteMeal,
    totalMeals,
    nutritionCompleteness
  } = useNutritionData();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('today');

  // Convert date to string for filtering
  const selectedDateString = DateUtils.toISODate(selectedDate);

  // Get current meal type
  const currentMealType = MealTypeService.getMealTypeFromTime();

  // Form setup
  const form = useForm({
    defaultValues: {
      name: '',
      quantity: '1',
      unit: 'serving',
      notes: ''
    },
    onSubmit: async ({ value }) => {
      try {
        await addMeal({
          date: selectedDateString,
          foods: [{
            name: value.name.trim(),
            quantity: Number(value.quantity) || 1,
            unit: value.unit
          }],
          notes: value.notes
        });

        form.reset();
        toast.success(`Added ${value.name} to ${currentMealType}`);
      } catch (error) {
        toast.error('Failed to add meal');
      }
    }
  });

  // Filter meals by selected date
  const todaysMeals = useMemo(() => {
    return meals
      .filter(meal => meal.date === selectedDateString)
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
      });
  }, [meals, selectedDateString]);

  // Handle calendar date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      await deleteMeal(mealId);
      toast.success('Meal deleted!');
    } catch (error) {
      toast.error('Failed to delete meal');
    }
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
          <CalendarDays className="h-4 w-4 text-gray-500" />
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
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
                        {FOOD_UNITS.map(unit => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
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
                      Add to {currentMealType.charAt(0).toUpperCase() + currentMealType.slice(1)}
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
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        {/* Today Tab */}
        <TabsContent value="today" className="space-y-6">
          <DailySummaryCard 
            meals={todaysMeals} 
            date={selectedDate} 
          />
          
          <TodaysMealsCard 
            meals={todaysMeals} 
            onDeleteMeal={handleDeleteMeal}
          />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6">
              <NutritionTable />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <NutritionStats />
        </TabsContent>
      </Tabs>

      {/* Quick Insights */}
      {activeTab === 'today' && (
        <QuickInsights
          todaysMealCount={todaysMeals.length}
          totalMeals={totalMeals}
          nutritionCompleteness={nutritionCompleteness}
          hasTodaysNutritionData={todaysMeals.some(m => m.nutritionDataComplete)}
        />
      )}
    </div>
  );
}