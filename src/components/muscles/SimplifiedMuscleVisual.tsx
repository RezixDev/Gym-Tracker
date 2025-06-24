// components/muscles/SimplifiedMuscleVisual.tsx

import React, { useMemo } from 'react';
import { MeasurementType, MEASUREMENT_LABELS } from '../../hooks/useMuscleData';

type MuscleVisualProps = {
    referenceValues: Record<MeasurementType, number>;
    currentValues?: Record<MeasurementType, number | undefined>;
    gender: 'male' | 'female';
    measurementUnit: 'cm' | 'in';
};

// Group measurements by body region for better organization
const MEASUREMENT_GROUPS = {
    upper: ['neck', 'shoulders', 'chest'],
    arms: ['leftBicep', 'rightBicep', 'leftForearm', 'rightForearm'],
    core: ['waist', 'hips'],
    lower: ['leftThigh', 'rightThigh', 'leftCalf', 'rightCalf'],
};

export function SimplifiedMuscleVisual({
                                           referenceValues,
                                           currentValues,
                                           gender,
                                           measurementUnit,
                                       }: MuscleVisualProps) {
    // Helper function to format measurement values
    const formatMeasurement = (value: number | undefined): string => {
        if (value === undefined) return '--';
        return value.toFixed(1);
    };

    // Helper to determine color based on comparison to reference
    const getMeasurementColor = (type: MeasurementType): string => {
        if (!currentValues || currentValues[type] === undefined) {
            return "bg-gray-100 dark:bg-gray-700";
        }

        const current = currentValues[type]!;
        const reference = referenceValues[type];

        // Define thresholds for colors (can be customized)
        const threshold = 0.05; // 5% difference threshold

        if (Math.abs(current - reference) / reference < threshold) {
            return "bg-blue-100 dark:bg-blue-800/30"; // Close to reference
        }

        if (current > reference) {
            return "bg-green-100 dark:bg-green-800/30"; // Above reference
        }

        return "bg-amber-100 dark:bg-amber-800/30"; // Below reference
    };

    // Helper to determine percentage difference
    const getPercentageDiff = (type: MeasurementType): string => {
        if (!currentValues || currentValues[type] === undefined) {
            return "";
        }

        const current = currentValues[type]!;
        const reference = referenceValues[type];
        const percentDiff = ((current - reference) / reference) * 100;

        if (Math.abs(percentDiff) < 1) {
            return ""; // Don't show if very close
        }

        return percentDiff > 0
            ? `+${percentDiff.toFixed(1)}%`
            : `${percentDiff.toFixed(1)}%`;
    };

    // Helper to get color for percentage text
    const getPercentColor = (type: MeasurementType): string => {
        if (!currentValues || currentValues[type] === undefined) {
            return "";
        }

        const current = currentValues[type]!;
        const reference = referenceValues[type];

        // For waist, smaller might be better, for most others larger is better
        const isWaistOrHips = type === 'waist' || type === 'hips';
        const isLarger = current > reference;

        if (Math.abs(current - reference) / reference < 0.01) {
            return "text-blue-600 dark:text-blue-400"; // Very close to reference
        }

        if (isWaistOrHips) {
            // For waist/hips, smaller might be considered "better" depending on goals
            return isLarger
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-green-600 dark:text-green-400";
        } else {
            // For most measurements, larger is usually the goal
            return isLarger
                ? "text-green-600 dark:text-green-400"
                : "text-yellow-600 dark:text-yellow-400";
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
                {/* Upper Body Measurements */}
                <div className="border rounded-lg overflow-hidden dark:border-gray-700">
                    <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 font-medium">
                        Upper Body
                    </div>
                    <div className="divide-y dark:divide-gray-700">
                        {MEASUREMENT_GROUPS.upper.map((type) => (
                            <div
                                key={type}
                                className={`flex items-center px-4 py-3 ${getMeasurementColor(type as MeasurementType)}`}
                            >
                                <div className="flex-1 font-medium">
                                    {MEASUREMENT_LABELS[type as MeasurementType]}
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="text-right">
                    <span className="font-semibold">
                      {currentValues && currentValues[type as MeasurementType] !== undefined
                          ? formatMeasurement(currentValues[type as MeasurementType])
                          : '--'
                      }
                    </span>
                                        <span className="text-gray-500 mx-1">/</span>
                                        <span className="text-gray-500">
                      {formatMeasurement(referenceValues[type as MeasurementType])}
                    </span>
                                        <span className="text-gray-400 text-sm ml-1">{measurementUnit}</span>
                                    </div>
                                    {getPercentageDiff(type as MeasurementType) && (
                                        <div className={`text-sm font-medium ${getPercentColor(type as MeasurementType)}`}>
                                            {getPercentageDiff(type as MeasurementType)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Arm Measurements */}
                <div className="border rounded-lg overflow-hidden dark:border-gray-700">
                    <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 font-medium">
                        Arms
                    </div>
                    <div className="divide-y dark:divide-gray-700">
                        {MEASUREMENT_GROUPS.arms.map((type) => (
                            <div
                                key={type}
                                className={`flex items-center px-4 py-3 ${getMeasurementColor(type as MeasurementType)}`}
                            >
                                <div className="flex-1 font-medium">
                                    {MEASUREMENT_LABELS[type as MeasurementType]}
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="text-right">
                    <span className="font-semibold">
                      {currentValues && currentValues[type as MeasurementType] !== undefined
                          ? formatMeasurement(currentValues[type as MeasurementType])
                          : '--'
                      }
                    </span>
                                        <span className="text-gray-500 mx-1">/</span>
                                        <span className="text-gray-500">
                      {formatMeasurement(referenceValues[type as MeasurementType])}
                    </span>
                                        <span className="text-gray-400 text-sm ml-1">{measurementUnit}</span>
                                    </div>
                                    {getPercentageDiff(type as MeasurementType) && (
                                        <div className={`text-sm font-medium ${getPercentColor(type as MeasurementType)}`}>
                                            {getPercentageDiff(type as MeasurementType)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Core Measurements */}
                <div className="border rounded-lg overflow-hidden dark:border-gray-700">
                    <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-2 font-medium">
                        Core
                    </div>
                    <div className="divide-y dark:divide-gray-700">
                        {MEASUREMENT_GROUPS.core.map((type) => (
                            <div
                                key={type}
                                className={`flex items-center px-4 py-3 ${getMeasurementColor(type as MeasurementType)}`}
                            >
                                <div className="flex-1 font-medium">
                                    {MEASUREMENT_LABELS[type as MeasurementType]}
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="text-right">
                    <span className="font-semibold">
                      {currentValues && currentValues[type as MeasurementType] !== undefined
                          ? formatMeasurement(currentValues[type as MeasurementType])
                          : '--'
                      }
                    </span>
                                        <span className="text-gray-500 mx-1">/</span>
                                        <span className="text-gray-500">
                      {formatMeasurement(referenceValues[type as MeasurementType])}
                    </span>
                                        <span className="text-gray-400 text-sm ml-1">{measurementUnit}</span>
                                    </div>
                                    {getPercentageDiff(type as MeasurementType) && (
                                        <div className={`text-sm font-medium ${getPercentColor(type as MeasurementType)}`}>
                                            {getPercentageDiff(type as MeasurementType)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lower Body Measurements */}
                <div className="border rounded-lg overflow-hidden dark:border-gray-700">
                    <div className="bg-red-50 dark:bg-red-900/20 px-4 py-2 font-medium">
                        Lower Body
                    </div>
                    <div className="divide-y dark:divide-gray-700">
                        {MEASUREMENT_GROUPS.lower.map((type) => (
                            <div
                                key={type}
                                className={`flex items-center px-4 py-3 ${getMeasurementColor(type as MeasurementType)}`}
                            >
                                <div className="flex-1 font-medium">
                                    {MEASUREMENT_LABELS[type as MeasurementType]}
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="text-right">
                    <span className="font-semibold">
                      {currentValues && currentValues[type as MeasurementType] !== undefined
                          ? formatMeasurement(currentValues[type as MeasurementType])
                          : '--'
                      }
                    </span>
                                        <span className="text-gray-500 mx-1">/</span>
                                        <span className="text-gray-500">
                      {formatMeasurement(referenceValues[type as MeasurementType])}
                    </span>
                                        <span className="text-gray-400 text-sm ml-1">{measurementUnit}</span>
                                    </div>
                                    {getPercentageDiff(type as MeasurementType) && (
                                        <div className={`text-sm font-medium ${getPercentColor(type as MeasurementType)}`}>
                                            {getPercentageDiff(type as MeasurementType)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm">
                <div className="font-medium mb-2">Legend:</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-100 dark:bg-blue-800/30 mr-2"></div>
                        <span>Close to reference (±5%)</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-100 dark:bg-green-800/30 mr-2"></div>
                        <span>Above reference</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-amber-100 dark:bg-amber-800/30 mr-2"></div>
                        <span>Below reference</span>
                    </div>
                </div>
            </div>
        </div>
    );
}