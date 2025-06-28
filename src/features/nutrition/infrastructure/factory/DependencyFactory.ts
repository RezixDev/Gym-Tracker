// src/features/nutrition/infrastructure/factory/DependencyFactory.ts
import { 
  MealRepository, 
  LocalStorageMealRepository,
  NutritionAPIService,
  MockNutritionAPIService,
  CacheService,
  LocalStorageCacheService,
  ExportService,
  MealExportService
} from '../';

export interface Dependencies {
  mealRepository: MealRepository;
  nutritionAPI: NutritionAPIService;
  cacheService: CacheService<any>;
  exportService: ExportService;
}

export class DependencyFactory {
  private static instance: DependencyFactory;
  private dependencies: Dependencies;

  private constructor() {
    // Initialize with default implementations
    this.dependencies = {
      mealRepository: new LocalStorageMealRepository(),
      nutritionAPI: new MockNutritionAPIService(),
      cacheService: new LocalStorageCacheService('nutrition_cache'),
      exportService: new MealExportService()
    };
  }

  static getInstance(): DependencyFactory {
    if (!DependencyFactory.instance) {
      DependencyFactory.instance = new DependencyFactory();
    }
    return DependencyFactory.instance;
  }

  getDependencies(): Dependencies {
    return this.dependencies;
  }

  // Methods to override dependencies for testing or different environments
  setMealRepository(repository: MealRepository): void {
    this.dependencies.mealRepository = repository;
  }

  setNutritionAPI(api: NutritionAPIService): void {
    this.dependencies.nutritionAPI = api;
  }

  setCacheService(cache: CacheService<any>): void {
    this.dependencies.cacheService = cache;
  }

  setExportService(exportService: ExportService): void {
    this.dependencies.exportService = exportService;
  }

  // Convenience methods
  getMealRepository(): MealRepository {
    return this.dependencies.mealRepository;
  }

  getNutritionAPI(): NutritionAPIService {
    return this.dependencies.nutritionAPI;
  }

  getCacheService(): CacheService<any> {
    return this.dependencies.cacheService;
  }

  getExportService(): ExportService {
    return this.dependencies.exportService;
  }
}

// Export singleton instance
export const dependencyFactory = DependencyFactory.getInstance();

