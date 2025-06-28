// src/features/nutrition/infrastructure/services/ExportService.ts
import { Meal } from '../../domain/models';

export interface ExportService {
  exportToJSON(meals: Meal[]): string;
  exportToCSV(meals: Meal[]): string;
  importFromJSON(jsonString: string): Meal[];
}

export class MealExportService implements ExportService {
  exportToJSON(meals: Meal[]): string {
    return JSON.stringify(meals, null, 2);
  }

  exportToCSV(meals: Meal[]): string {
    const headers = [
      'Date',
      'Meal Type',
      'Food Name',
      'Quantity',
      'Unit',
      'Calories',
      'Protein (g)',
      'Carbs (g)',
      'Fat (g)',
      'Notes'
    ].join(',');

    const rows = meals.flatMap(meal =>
      meal.foods.map(food =>
        [
          meal.date,
          meal.mealType,
          `"${food.name}"`,
          food.quantity,
          food.unit,
          food.calories,
          food.protein,
          food.carbs,
          food.fat,
          `"${meal.notes || ''}"`
        ].join(',')
      )
    );

    return [headers, ...rows].join('\n');
  }

  importFromJSON(jsonString: string): Meal[] {
    try {
      const data = JSON.parse(jsonString);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid JSON format: expected an array of meals');
      }

      // Validate and transform the imported data
      return data.map((meal: any) => {
        if (!meal.id || !meal.date || !meal.mealType || !meal.foods) {
          throw new Error('Invalid meal format');
        }

        return meal as Meal;
      });
    } catch (error) {
      throw new Error(`Failed to import meals: ${error.message}`);
    }
  }
}

