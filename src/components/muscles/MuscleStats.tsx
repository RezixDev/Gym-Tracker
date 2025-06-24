// components/muscles/MuscleStats.tsx

import { useMemo } from 'react';
import {
    MuscleRecord,
    MeasurementType,
    MEASUREMENT_LABELS
} from '../../hooks/useMuscleData';

export function MuscleStats({
                                muscleRecords,
                                measurementUnit,
                            }: {
    muscleRecords: MuscleRecord[];
    measurementUnit: 'cm' | 'in';
}) {
    // Calculate statistics from muscle records
    const stats = useMemo(() => {
        if (muscleRecords.length === 0) {
            return {
                totalRecords: 0,
                newestRecord: null,
                oldestRecord: null,
                progressByMeasurement: {},
                mostImprovedArea: null,
            };
        }

        // Sort records by date (newest first)
        const sortedRecords = [...muscleRecords].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const newestRecord = sortedRecords[0];
        const oldestRecord = sortedRecords[sortedRecords.length - 1];

        // Calculate progress for each measurement type
        const progressByMeasurement: Record<string, any> = {};

        Object.keys(MEASUREMENT_LABELS).forEach((key) => {
            const type = key as MeasurementType;
            const oldestValue = oldestRecord.measurements[type];
            const newestValue = newestRecord.measurements[type];

            if (oldestValue !== undefined && newestValue !== undefined) {
                const change = newestValue - oldestValue;
                const percentChange = (change / oldestValue) * 100;

                progressByMeasurement[type] = {
                    start: oldestValue,
                    current: newestValue,
                    change,
                    percentChange,
                };
            }
        });

        // Find most improved area
        let mostImprovedArea = null;
        let highestPercentImprovement = 0;

        Object.entries(progressByMeasurement).forEach(([type, data]) => {
            // For most body measurements, an increase is an improvement
            // For waist, a decrease might be considered an improvement, but that depends on goals
            const improvement = data.percentChange;

            if (Math.abs(improvement) > Math.abs(highestPercentImprovement)) {
                highestPercentImprovement = improvement;
                mostImprovedArea = {
                    type: type as MeasurementType,
                    label: MEASUREMENT_LABELS[type as MeasurementType],
                    improvement,
                };
            }
        });

        return {
            totalRecords: muscleRecords.length,
            newestRecord,
            oldestRecord,
            progressByMeasurement,
            mostImprovedArea,
        };
    }, [muscleRecords]);

    // Format date for display
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Helper to render a progress item
    const renderProgressItem = (type: MeasurementType, data: any) => {
        const isPositive = data.change > 0;
        const changeDirection = type === 'waist' ? !isPositive : isPositive;

        return (
            <div key={type} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="font-medium">{MEASUREMENT_LABELS[type]}</p>
                <div className="flex justify-between text-sm">
          <span>
            {data.start.toFixed(1)} → {data.current.toFixed(1)} {measurementUnit}
          </span>
                    <span
                        className={cn(
                            "font-medium",
                            changeDirection ? "text-green-600" : "text-red-600"
                        )}
                    >
            {isPositive ? '+' : ''}{data.change.toFixed(1)} {measurementUnit} ({isPositive ? '+' : ''}{data.percentChange.toFixed(1)}%)
          </span>
                </div>
            </div>
        );
    };

    // Helper for conditional classname assignment
    const cn = (...classes: string[]) => {
        return classes.filter(Boolean).join(' ');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold">Measurement Statistics</h2>

            {muscleRecords.length === 0 ? (
                <p className="text-gray-500 italic">No measurement data available yet. Start tracking to see your statistics.</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Records</p>
                            <p className="text-2xl font-bold">{stats.totalRecords}</p>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">First Recorded</p>
                            <p className="text-2xl font-bold">{formatDate(stats.oldestRecord?.date)}</p>
                        </div>

                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Latest Recorded</p>
                            <p className="text-2xl font-bold">{formatDate(stats.newestRecord?.date)}</p>
                        </div>
                    </div>

                    {stats.mostImprovedArea && (
                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                            <h3 className="font-medium mb-2">Most Changed Area</h3>
                            <p>
                                <span className="font-medium">{stats.mostImprovedArea.label}: </span>
                                <span className={stats.mostImprovedArea.improvement > 0 ? "text-green-600" : "text-red-600"}>
                  {stats.mostImprovedArea.improvement > 0 ? '+' : ''}{stats.mostImprovedArea.improvement.toFixed(1)}%
                </span> change since first measurement.
                            </p>
                        </div>
                    )}

                    {/* Progress by Measurement */}
                    <div>
                        <h3 className="font-medium mb-3">Progress Since First Measurement</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {Object.entries(stats.progressByMeasurement)
                                .sort(([, a], [, b]) => Math.abs((b as any).percentChange) - Math.abs((a as any).percentChange))
                                .slice(0, 6) // Show top 6 changes
                                .map(([type, data]) => renderProgressItem(type as MeasurementType, data))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}