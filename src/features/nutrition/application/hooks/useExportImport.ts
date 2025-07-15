// src/features/nutrition/application/hooks/useExportImport.ts
import { useState, useCallback } from 'react';
import { Meal } from '@/features/nutrition/domain/models/Meal';
import { dependencyFactory } from '@/features/nutrition/infrastructure/factory/DependencyFactory';

export interface UseExportImportReturn {
  exporting: boolean;
  importing: boolean;
  exportError: string | null;
  importError: string | null;
  exportToJSON: (meals: Meal[]) => void;
  exportToCSV: (meals: Meal[]) => void;
  importFromJSON: (file: File) => Promise<Meal[]>;
}

export function useExportImport(): UseExportImportReturn {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const exportService = dependencyFactory.getExportService();

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = useCallback((meals: Meal[]) => {
    try {
      setExporting(true);
      setExportError(null);
      
      const json = exportService.exportToJSON(meals);
      const filename = `nutrition-data-${new Date().toISOString().split('T')[0]}.json`;
      
      downloadFile(json, filename, 'application/json');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export data';
      setExportError(message);
    } finally {
      setExporting(false);
    }
  }, [exportService]);

  const exportToCSV = useCallback((meals: Meal[]) => {
    try {
      setExporting(true);
      setExportError(null);
      
      const csv = exportService.exportToCSV(meals);
      const filename = `nutrition-data-${new Date().toISOString().split('T')[0]}.csv`;
      
      downloadFile(csv, filename, 'text/csv');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export data';
      setExportError(message);
    } finally {
      setExporting(false);
    }
  }, [exportService]);

  const importFromJSON = useCallback(async (file: File): Promise<Meal[]> => {
    try {
      setImporting(true);
      setImportError(null);
      
      const text = await file.text();
      const meals = exportService.importFromJSON(text);
      
      return meals;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import data';
      setImportError(message);
      throw new Error(message);
    } finally {
      setImporting(false);
    }
  }, [exportService]);

  return {
    exporting,
    importing,
    exportError,
    importError,
    exportToJSON,
    exportToCSV,
    importFromJSON
  };
}

