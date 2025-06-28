// src/features/nutrition/presentation/components/NutritionTable/NutritionDataAlert.tsx
import React from 'react';
import { AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface NutritionDataAlertProps {
  count: number;
}

export function NutritionDataAlert({ count }: NutritionDataAlertProps) {
  const handleBulkAddData = () => {
    toast.info(
      'Bulk nutrition update feature coming soon! You\'ll be able to add nutrition data to multiple meals at once using AI.'
    );
  };

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-200">
              {count} meal{count !== 1 ? 's' : ''} missing nutrition data
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Add nutrition information to get better insights
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleBulkAddData}
          className="border-amber-300 text-amber-700 hover:bg-amber-100"
        >
          <Plus className="mr-1 h-4 w-4" />
          Bulk Add Data
        </Button>
      </div>
    </div>
  );
}

