// src/features/nutrition/domain/utils/dateUtils.ts
export class DateUtils {
  /**
   * Converts a Date to ISO date string (YYYY-MM-DD)
   */
  static toISODate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Formats a date string for display
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formats a date string for short display
   */
  static formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Formats a time from an ISO datetime string
   */
  static formatTime(isoString: string): string {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  /**
   * Checks if a date is today
   */
  static isToday(dateString: string): boolean {
    const today = this.toISODate(new Date());
    return dateString === today;
  }

  /**
   * Gets the date N days ago
   */
  static getDaysAgo(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }
}

