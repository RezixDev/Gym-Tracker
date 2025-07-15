// src/features/nutrition/infrastructure/repositories/InMemoryMealRepository.ts
// For testing purposes
import { Meal } from '@/features/nutrition/domain/models';
import { MealRepository } from './MealRepository';

export class InMemoryMealRepository implements MealRepository {
  private meals: Map<string, Meal> = new Map();

  async getAll(): Promise<Meal[]> {
    return Array.from(this.meals.values());
  }

  async getById(id: string): Promise<Meal | null> {
    return this.meals.get(id) || null;
  }

  async getByDate(date: string): Promise<Meal[]> {
    return Array.from(this.meals.values()).filter(meal => meal.date === date);
  }

  async getByDateRange(startDate: string, endDate: string): Promise<Meal[]> {
    return Array.from(this.meals.values()).filter(
      meal => meal.date >= startDate && meal.date <= endDate
    );
  }

  async save(meal: Meal): Promise<void> {
    this.meals.set(meal.id, meal);
  }

  async saveMany(newMeals: Meal[]): Promise<void> {
    newMeals.forEach(meal => this.meals.set(meal.id, meal));
  }

  async update(meal: Meal): Promise<void> {
    if (!this.meals.has(meal.id)) {
      throw new Error(`Meal with id ${meal.id} not found`);
    }
    this.meals.set(meal.id, meal);
  }

  async delete(id: string): Promise<void> {
    if (!this.meals.delete(id)) {
      throw new Error(`Meal with id ${id} not found`);
    }
  }

  async deleteAll(): Promise<void> {
    this.meals.clear();
  }
}

