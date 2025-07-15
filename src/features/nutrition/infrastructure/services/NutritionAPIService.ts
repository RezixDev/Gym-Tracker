// src/features/nutrition/infrastructure/services/NutritionAPIService.ts
import { FoodItem } from '@/features/nutrition/domain/models';

export interface NutritionAPIResponse {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_size?: string;
}

export interface NutritionAPIService {
  searchFood(query: string): Promise<NutritionAPIResponse[]>;
  getFoodDetails(foodId: string): Promise<NutritionAPIResponse>;
  getNutritionByBarcode(barcode: string): Promise<NutritionAPIResponse>;
}

// Mock implementation - replace with actual API integration
export class MockNutritionAPIService implements NutritionAPIService {
  async searchFood(query: string): Promise<NutritionAPIResponse[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock data for demonstration
    const mockDatabase: Record<string, NutritionAPIResponse[]> = {
      apple: [
        {
          name: 'Apple, medium',
          calories: 95,
          protein: 0.5,
          carbs: 25,
          fat: 0.3,
          serving_size: '1 medium (182g)'
        },
        {
          name: 'Apple, large',
          calories: 116,
          protein: 0.6,
          carbs: 31,
          fat: 0.4,
          serving_size: '1 large (223g)'
        }
      ],
      chicken: [
        {
          name: 'Chicken breast, grilled',
          calories: 165,
          protein: 31,
          carbs: 0,
          fat: 3.6,
          serving_size: '100g'
        },
        {
          name: 'Chicken thigh, grilled',
          calories: 209,
          protein: 26,
          carbs: 0,
          fat: 10.9,
          serving_size: '100g'
        }
      ]
    };

    const searchLower = query.toLowerCase();
    for (const [key, foods] of Object.entries(mockDatabase)) {
      if (searchLower.includes(key)) {
        return foods;
      }
    }

    return [];
  }

  async getFoodDetails(foodId: string): Promise<NutritionAPIResponse> {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      name: 'Generic Food',
      calories: 100,
      protein: 10,
      carbs: 10,
      fat: 5,
      serving_size: '100g'
    };
  }

  async getNutritionByBarcode(barcode: string): Promise<NutritionAPIResponse> {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      name: 'Product from Barcode',
      calories: 150,
      protein: 5,
      carbs: 20,
      fat: 7,
      serving_size: '1 serving'
    };
  }
}

