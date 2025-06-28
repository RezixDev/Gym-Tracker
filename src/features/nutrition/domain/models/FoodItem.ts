// src/features/nutrition/domain/models/FoodItem.ts
import { NutritionData } from './Nutrition';

export interface FoodItem extends NutritionData {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  nutritionDataAdded: boolean;
  lastNutritionUpdate?: string;
}

export type FoodUnit = 
  | 'serving' 
  | 'g' 
  | 'kg' 
  | 'cup' 
  | 'piece' 
  | 'slice' 
  | 'tbsp' 
  | 'tsp' 
  | 'oz' 
  | 'ml';


