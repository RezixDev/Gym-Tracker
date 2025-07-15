// src/features/nutrition/application/hooks/useNutritionAPI.ts
import { useState, useCallback } from 'react';
import { dependencyFactory } from '@/features/nutrition/infrastructure/factory/DependencyFactory';
import { NutritionAPIResponse } from '@/features/nutrition/infrastructure/services/NutritionAPIService';

export interface UseNutritionAPIReturn {
  searching: boolean;
  searchError: string | null;
  searchFood: (query: string) => Promise<NutritionAPIResponse[]>;
  getFoodDetails: (foodId: string) => Promise<NutritionAPIResponse>;
  getNutritionByBarcode: (barcode: string) => Promise<NutritionAPIResponse>;
}

export function useNutritionAPI(): UseNutritionAPIReturn {
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const api = dependencyFactory.getNutritionAPI();
  const cache = dependencyFactory.getCacheService();

  const searchFood = useCallback(async (query: string): Promise<NutritionAPIResponse[]> => {
    try {
      setSearching(true);
      setSearchError(null);
      
      // Check cache first
      const cacheKey = `search_${query}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        return cached as NutritionAPIResponse[];
      }
      
      // Call API
      const results = await api.searchFood(query);
      
      // Cache results
      cache.set(cacheKey, results, 30); // Cache for 30 minutes
      
      return results;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search food';
      setSearchError(message);
      throw new Error(message);
    } finally {
      setSearching(false);
    }
  }, [api, cache]);

  const getFoodDetails = useCallback(async (foodId: string): Promise<NutritionAPIResponse> => {
    try {
      setSearchError(null);
      
      // Check cache
      const cacheKey = `food_${foodId}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        return cached as NutritionAPIResponse;
      }
      
      const details = await api.getFoodDetails(foodId);
      cache.set(cacheKey, details, 60); // Cache for 1 hour
      
      return details;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get food details';
      setSearchError(message);
      throw new Error(message);
    }
  }, [api, cache]);

  const getNutritionByBarcode = useCallback(async (barcode: string): Promise<NutritionAPIResponse> => {
    try {
      setSearchError(null);
      
      // Check cache
      const cacheKey = `barcode_${barcode}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        return cached as NutritionAPIResponse;
      }
      
      const details = await api.getNutritionByBarcode(barcode);
      cache.set(cacheKey, details, 1440); // Cache for 24 hours
      
      return details;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get nutrition by barcode';
      setSearchError(message);
      throw new Error(message);
    }
  }, [api, cache]);

  return {
    searching,
    searchError,
    searchFood,
    getFoodDetails,
    getNutritionByBarcode
  };
}