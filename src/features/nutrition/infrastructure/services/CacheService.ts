// src/features/nutrition/infrastructure/services/CacheService.ts
export interface CacheService<T> {
  get(key: string): T | null;
  set(key: string, value: T, ttlMinutes?: number): void;
  delete(key: string): void;
  clear(): void;
}

export class LocalStorageCacheService<T> implements CacheService<T> {
  private readonly prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  get(key: string): T | null {
    try {
      const fullKey = `${this.prefix}_${key}`;
      const cached = localStorage.getItem(fullKey);
      
      if (!cached) return null;

      const { value, expiry } = JSON.parse(cached);
      
      if (expiry && new Date().getTime() > expiry) {
        localStorage.removeItem(fullKey);
        return null;
      }

      return value;
    } catch {
      return null;
    }
  }

  set(key: string, value: T, ttlMinutes: number = 60): void {
    try {
      const fullKey = `${this.prefix}_${key}`;
      const expiry = new Date().getTime() + ttlMinutes * 60 * 1000;
      
      localStorage.setItem(fullKey, JSON.stringify({ value, expiry }));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  delete(key: string): void {
    const fullKey = `${this.prefix}_${key}`;
    localStorage.removeItem(fullKey);
  }

  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}

