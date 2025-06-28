// src/features/nutrition/infrastructure/repositories/MealRepository.ts
import { Meal } from '../../domain/models';

export interface MealRepository {
  getAll(): Promise<Meal[]>;
  getById(id: string): Promise<Meal | null>;
  getByDate(date: string): Promise<Meal[]>;
  getByDateRange(startDate: string, endDate: string): Promise<Meal[]>;
  save(meal: Meal): Promise<void>;
  saveMany(meals: Meal[]): Promise<void>;
  update(meal: Meal): Promise<void>;
  delete(id: string): Promise<void>;
  deleteAll(): Promise<void>;
}

