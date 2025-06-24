// components/muscles/EnhancedMuscleVisual.tsx

import React, { useMemo, useState } from 'react';
import { MeasurementType, MEASUREMENT_LABELS } from '../../hooks/useMuscleData';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type MuscleVisualProps = {
    referenceValues: Record<MeasurementType, number>;
    currentValues?: Record<MeasurementType, number | undefined>;
    gender: 'male' | 'female';
    measurementUnit: 'cm' | 'in';
};

export function MuscleVisual({
                                         referenceValues,
                                         currentValues,
                                         gender,
                                         measurementUnit,
                                     }: MuscleVisualProps) {
    // State to toggle measurement labels
    const [showMeasurements, setShowMeasurements] = useState(true);

    // Define the positions for each measurement label on the SVG
    const measurementPositions = useMemo(() => ({
        male: {
            neck: { x: 190, y: 60, linePoints: [215, 60, 250, 60] },
            shoulders: { x: 270, y: 85, linePoints: [235, 85, 265, 85] },
            chest: { x: 270, y: 120, linePoints: [225, 120, 265, 120] },
            leftBicep: { x: 105, y: 125, linePoints: [125, 125, 145, 125] },
            rightBicep: { x: 275, y: 125, linePoints: [235, 125, 255, 125] },
            leftForearm: { x: 95, y: 165, linePoints: [110, 165, 130, 165] },
            rightForearm: { x: 285, y: 165, linePoints: [250, 165, 270, 165] },
            waist: { x: 270, y: 200, linePoints: [225, 200, 265, 200] },
            hips: { x: 270, y: 230, linePoints: [225, 230, 265, 230] },
            leftThigh: { x: 140, y: 280, linePoints: [155, 280, 175, 280] },
            rightThigh: { x: 240, y: 280, linePoints: [205, 280, 225, 280] },
            leftCalf: { x: 140, y: 350, linePoints: [155, 350, 175, 350] },
            rightCalf: { x: 240, y: 350, linePoints: [205, 350, 225, 350] },
        },
        female: {
            neck: { x: 190, y: 60, linePoints: [215, 60, 250, 60] },
            shoulders: { x: 270, y: 85, linePoints: [235, 85, 265, 85] },
            chest: { x: 270, y: 120, linePoints: [225, 120, 265, 120] },
            leftBicep: { x: 105, y: 125, linePoints: [125, 125, 145, 125] },
            rightBicep: { x: 275, y: 125, linePoints: [235, 125, 255, 125] },
            leftForearm: { x: 95, y: 165, linePoints: [110, 165, 130, 165] },
            rightForearm: { x: 285, y: 165, linePoints: [250, 165, 270, 165] },
            waist: { x: 270, y: 190, linePoints: [225, 190, 265, 190] },
            hips: { x: 270, y: 230, linePoints: [225, 230, 265, 230] },
            leftThigh: { x: 140, y: 280, linePoints: [155, 280, 175, 280] },
            rightThigh: { x: 240, y: 280, linePoints: [205, 280, 225, 280] },
            leftCalf: { x: 140, y: 350, linePoints: [155, 350, 175, 350] },
            rightCalf: { x: 240, y: 350, linePoints: [205, 350, 225, 350] },
        }
    }), []);

    // Helper function to format measurement values
    const formatMeasurement = (value: number | undefined): string => {
        if (value === undefined) return '--';
        return value.toFixed(1);
    };

    // Helper to determine color based on comparison to reference
    const getMeasurementColor = (type: MeasurementType): string => {
        if (!currentValues || currentValues[type] === undefined) {
            return "text-gray-500";
        }

        const current = currentValues[type]!;
        const reference = referenceValues[type];

        // Define thresholds for colors (can be customized)
        const threshold = 0.05; // 5% difference threshold

        if (Math.abs(current - reference) / reference < threshold) {
            return "text-blue-600 dark:text-blue-400"; // Close to reference
        }

        if (current > reference) {
            return "text-green-600 dark:text-green-400"; // Above reference
        }

        return "text-amber-600 dark:text-amber-400"; // Below reference
    };

    // Get percentage difference for tooltip
    const getPercentageDiff = (type: MeasurementType): string => {
        if (!currentValues || currentValues[type] === undefined) {
            return "";
        }

        const current = currentValues[type]!;
        const reference = referenceValues[type];
        const percentDiff = ((current - reference) / reference) * 100;

        return percentDiff > 0
            ? `+${percentDiff.toFixed(1)}%`
            : `${percentDiff.toFixed(1)}%`;
    };

    return (
        <div className="space-y-4">
            {/* Toggle for measurement labels */}
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="showMeasurements"
                    checked={showMeasurements}
                    onCheckedChange={(checked) => setShowMeasurements(checked as boolean)}
                />
                <Label htmlFor="showMeasurements">Show measurement labels</Label>
            </div>

            <div className="relative mx-auto max-w-xl">
                {/* SVG for muscle figure */}
                <svg
                    viewBox="0 0 400 450"
                    className="w-full h-auto"
                    style={{ maxHeight: '600px' }}
                >
                    {/* Background grid for reference */}
                    <defs>
                        <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(200,200,200,0.2)" strokeWidth="0.5"/>
                        </pattern>
                        <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                            <rect width="100" height="100" fill="url(#smallGrid)"/>
                            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(200,200,200,0.3)" strokeWidth="1"/>
                        </pattern>

                        {/* Muscle definition gradients */}
                        <linearGradient id="muscleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f4f4f5" />
                            <stop offset="50%" stopColor="#e4e4e7" />
                            <stop offset="100%" stopColor="#f4f4f5" />
                        </linearGradient>

                        <linearGradient id="secondaryMuscleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f1f5f9" />
                            <stop offset="50%" stopColor="#e2e8f0" />
                            <stop offset="100%" stopColor="#f1f5f9" />
                        </linearGradient>

                        <radialGradient id="shoulderGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" stopColor="#e4e4e7" />
                            <stop offset="100%" stopColor="#d4d4d8" />
                        </radialGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Improved body outline with muscle definition */}
                    {gender === 'male' ? (
                        // Male body outline with enhanced muscle definition
                        <g>
                            {/* Trapezius */}
                            <path d="M160,85 C170,65 210,65 220,85"
                                  fill="url(#muscleGradient)" stroke="#666" strokeWidth="1.2" opacity="0.9" />

                            {/* Deltoids (shoulders) */}
                            <ellipse cx="140" cy="85" rx="15" ry="10"
                                     fill="url(#shoulderGradient)" stroke="#666" strokeWidth="1.2" />
                            <ellipse cx="240" cy="85" rx="15" ry="10"
                                     fill="url(#shoulderGradient)" stroke="#666" strokeWidth="1.2" />

                            {/* Pectorals (chest) - Improved visibility */}
                            <path d="M160,105 C170,125 190,130 210,125 C220,115 222,105 222,105"
                                  fill="url(#muscleGradient)" stroke="#666" strokeWidth="1.5" />
                            <path d="M160,105 C190,115 210,115 222,105"
                                  stroke="#666" strokeWidth="1" fill="none" opacity="0.7" />

                            {/* Biceps */}
                            <path d="M125,100 C115,110 110,130 120,140 C130,135 135,115 125,100"
                                  fill="url(#secondaryMuscleGradient)" stroke="#666" strokeWidth="1.2" />
                            <path d="M255,100 C265,110 270,130 260,140 C250,135 245,115 255,100"
                                  fill="url(#secondaryMuscleGradient)" stroke="#666" strokeWidth="1.2" />

                            {/* Forearms */}
                            <path d="M120,140 C110,150 100,170 95,180 C105,185 115,165 120,140"
                                  fill="url(#secondaryMuscleGradient)" stroke="#666" strokeWidth="1.2" />
                            <path d="M260,140 C270,150 280,170 285,180 C275,185 265,165 260,140"
                                  fill="url(#secondaryMuscleGradient)" stroke="#666" strokeWidth="1.2" />

                            {/* Abdominals */}
                            <path d="M170,150 C180,155 200,155 210,150 C210,170 210,190 205,200 C190,205 170,205 170,200 C170,190 170,170 170,150Z"
                                  fill="url(#muscleGradient)" stroke="#666" strokeWidth="1.2" />
                            <path d="M180,150 L180,200" stroke="#777" strokeWidth="0.8" />
                            <path d="M200,150 L200,200" stroke="#777" strokeWidth="0.8" />
                            <path d="M170,165 L210,165" stroke="#777" strokeWidth="0.8" />
                            <path d="M170,180 L210,180" stroke="#777" strokeWidth="0.8" />

                            {/* Obliques */}
                            <path d="M170,150 C160,160 150,170 150,200 C160,205 170,205 170,200 C170,190 170,170 170,150Z"
                                  fill="url(#secondaryMuscleGradient)" stroke="#666" strokeWidth="1.2" opacity="0.7" />
                            <path d="M210,150 C220,160 230,170 230,200 C220,205 210,205 210,200 C210,190 210,170 210,150Z"
                                  fill="url(#secondaryMuscleGradient)" stroke="#666" strokeWidth="1.2" opacity="0.7" />

                            {/* Quadriceps */}
                            <path d="M160,220 C155,260 160,300 165,320 C175,310 180,270 175,220 C170,215 165,215 160,220Z"
                                  fill="url(#muscleGradient)" stroke="#666" strokeWidth="1.2" />
                            <path d="M220,220 C225,260 220,300 215,320 C205,310 200,270 205,220 C210,215 215,215 220,220Z"
                                  fill="url(#muscleGradient)" stroke="#666" strokeWidth="1.2" />

                            {/* Calves */}
                            <path d="M165,320 C163,335 160,350 165,370 C170,365 175,340 165,320Z"
                                  fill="url(#secondaryMuscleGradient)" stroke="#666" strokeWidth="1.2" />
                            <path d="M215,320 C217,335 220,350 215,370 C210,365 205,340 215,320Z"
                                  fill="url(#secondaryMuscleGradient)" stroke="#666" strokeWidth="1.2" />

                            {/* Head & Neck */}
                            <circle cx="190" cy="30" r="25" fill="#f5f5f5" stroke="#555" strokeWidth="1.5" />
                            <path d="M175,55 C175,65 190,70 205,65" fill="#f5f5f5" stroke="#555" strokeWidth="1.5" />

                            {/* Main body outline */}
                            <path d="M140,85 C120,100 120,180 140,200 L140,270 C140,320 160,340 190,400 M240,85 C260,100 260,180 240,200 L240,270 C240,320 220,340 190,400"
                                  fill="none" stroke="#333" strokeWidth="2" />

                            {/* Arms outline */}
                            <path d="M140,85 C130,95 120,105 110,125 C100,145 90,165 90,180 M240,85 C250,95 260,105 270,125 C280,145 290,165 290,180"
                                  fill="none" stroke="#444" strokeWidth="2" />

                            {/* Shoulders line */}
                            <path d="M140,85 L240,85" stroke="#333" strokeWidth="2" />
                        </g>
                    ) : (
                        // Female body outline with enhanced anatomical details
                        <g>
                            {/* Trapezius */}
                            <path d="M160,85 C170,65 210,65 220,85"
                                  fill="url(#muscleGradient)" stroke="#666" strokeWidth="1" opacity="0.7" />

                            {/* Deltoids (shoulders) - smaller than male */}
                            <ellipse cx="150" cy="85" rx="12" ry="8"
                                     fill="url(#shoulderGradient)" stroke="#666" strokeWidth="1" opacity="0.8" />
                            <ellipse cx="230" cy="85" rx="12" ry="8"
                                     fill="url(#shoulderGradient)" stroke="#666" strokeWidth="1" opacity="0.8" />

                            {/* Chest - improved visibility */}
                            <path d="M165,110 C175,125 190,125 205,125 C215,115 215,110 215,110"
                                  fill="#f5f5f5" stroke="#666" strokeWidth="1.5" />
                            <path d="M175,115 C185,125 195,125 205,115"
                                  stroke="#666" strokeWidth="1.2" fill="none" opacity="0.8" />
                            <path d="M160,115 C170,130 185,120 190,125"
                                  stroke="#666" strokeWidth="1.2" fill="none" opacity="0.8" />
                            <path d="M190,125 C195,120 210,130 220,115"
                                  stroke="#666" strokeWidth="1.2" fill="none" opacity="0.8" />

                            {/* Biceps - smaller than male */}
                            <path d="M135,100 C125,110 120,125 130,135 C137,132 140,115 135,100"
                                  fill="url(#secondaryMuscleGradient)" stroke="#666" strokeWidth="1" opacity="0.7" />
                            <path d="M245,100 C255,110 260,125 250,135 C243,132 240,115 245,100"
                                  fill="url(#secondaryMuscleGradient)" stroke="#666" strokeWidth="1" opacity="0.7" />

                            {/* Forearms - thinner */}
                            <path d="M130,135 C120,145 110,165 105,175 C115,180 125,165 130,135"
                                  fill="url(#secondaryMuscleGradient)" stroke="#666" strokeWidth="1" opacity="0.7" />
                            <path d="M250,135 C260,145 270,165 275,175 C265,180 255,165 250,135"
                                  fill="url(#secondaryMuscleGradient)" stroke="#666" strokeWidth="1" opacity="0.7" />

                            {/* Abdominals - softer lines */}
                            <path d="M170,150 C180,155 200,155 210,150 C210,170 210,190 205,200 C190,205 170,205 170,200 C170,190 170,170 170,150Z"
                                  fill="url(#muscleGradient)" stroke="#666" strokeWidth="0.8" opacity="0.5" />
                            <path d="M180,150 L180,190" stroke="#777" strokeWidth="0.5" opacity="0.5" />
                            <path d="M200,150 L200,190" stroke="#777" strokeWidth="0.5" opacity="0.5" />
                            <path d="M170,165 L210,165" stroke="#777" strokeWidth="0.5" opacity="0.5" />
                            <path d="M170,175 L210,175" stroke="#777" strokeWidth="0.5" opacity="0.5" />

                            {/* Waist - more curved */}
                            <path d="M150,190 C165,195 175,200 190,200 C205,200 215,195 230,190"
                                  fill="none" stroke="#555" strokeWidth="1.5" />

                            {/* Hips - wider */}
                            <path d="M145,230 C165,245 215,245 235,230"
                                  fill="none" stroke="#555" strokeWidth="1.5" />

                            {/* Thighs */}
                            <path d="M160,230 C155,260 160,300 165,320 C175,310 180,270 175,230 C170,225 165,225 160,230Z"
                                  fill="url(#muscleGradient)" stroke="#666" strokeWidth="1" opacity="0.6" />
                            <path d="M220,230 C225,260 220,300 215,320 C205,310 200,270 205,230 C210,225 215,225 220,230Z"
                                  fill="url(#muscleGradient)" stroke="#666" strokeWidth="1" opacity="0.6" />

                            {/* Calves */}
                            <path d="M165,320 C163,335 160,350 165,370 C170,365 175,340 165,320Z"
                                  fill="url(#secondaryMuscleGradient)" stroke="#666" strokeWidth="1" opacity="0.6" />
                            <path d="M215,320 C217,335 220,350 215,370 C210,365 205,340 215,320Z"
                                  fill="url(#secondaryMuscleGradient)" stroke="#666" strokeWidth="1" opacity="0.6" />

                            {/* Head & Neck */}
                            <circle cx="190" cy="30" r="23" fill="#f5f5f5" stroke="#555" strokeWidth="1.5" />
                            <path d="M178,55 C178,65 190,68 202,65" fill="#f5f5f5" stroke="#555" strokeWidth="1.2" />

                            {/* Main body outline */}
                            <path d="M150,85 C135,100 130,170 140,200 L145,270 C145,320 165,340 190,400 M230,85 C245,100 250,170 240,200 L235,270 C235,320 215,340 190,400"
                                  fill="none" stroke="#333" strokeWidth="1.5" />

                            {/* Arms outline */}
                            <path d="M150,85 C140,95 130,105 120,125 C110,145 100,165 100,180 M230,85 C240,95 250,105 260,125 C270,145 280,165 280,180"
                                  fill="none" stroke="#444" strokeWidth="1.5" />

                            {/* Shoulders line */}
                            <path d="M150,85 L230,85" stroke="#333" strokeWidth="1.5" />
                        </g>
                    )}

                    {/* Only show measurement indicator lines and labels if toggled on */}
                    {showMeasurements && (
                        <>
                            {/* Measurement indicator lines */}
                            <g stroke="#999" strokeWidth="0.8" strokeDasharray="3,2">
                                {Object.keys(MEASUREMENT_LABELS).map((key) => {
                                    const type = key as MeasurementType;
                                    const position = measurementPositions[gender][type];
                                    if (position.linePoints) {
                                        return (
                                            <line
                                                key={`line-${type}`}
                                                x1={position.linePoints[0]}
                                                y1={position.linePoints[1]}
                                                x2={position.linePoints[2]}
                                                y2={position.linePoints[3]}
                                            />
                                        );
                                    }
                                    return null;
                                })}
                            </g>

                            {/* Measurement labels and comparison values */}
                            {Object.keys(MEASUREMENT_LABELS).map((key) => {
                                const type = key as MeasurementType;
                                const position = measurementPositions[gender][type];

                                // Reference value formatting
                                const refValue = formatMeasurement(referenceValues[type]);
                                // Current value formatting (if available)
                                const currValue = currentValues && currentValues[type] !== undefined
                                    ? formatMeasurement(currentValues[type])
                                    : '--';

                                // Color based on comparison
                                const textColor = getMeasurementColor(type);

                                // Percentage difference
                                const percentDiff = getPercentageDiff(type);

                                // Background for better readability
                                return (
                                    <g key={type} transform={`translate(${position.x}, ${position.y})`}>
                                        <rect
                                            x="-60"
                                            y="-15"
                                            width="120"
                                            height={percentDiff ? "45" : "38"}
                                            rx="5"
                                            fill="white"
                                            fillOpacity="0.95"
                                            stroke="#ddd"
                                            strokeWidth="1"
                                        />

                                        {/* Measurement name */}
                                        <text
                                            x="0"
                                            y="-2"
                                            textAnchor="middle"
                                            fontSize="10"
                                            fontWeight="bold"
                                            fill="#444"
                                        >
                                            {MEASUREMENT_LABELS[type]}
                                        </text>

                                        {/* Values - Current/Reference */}
                                        <text
                                            x="0"
                                            y="14"
                                            textAnchor="middle"
                                            fontSize="11"
                                            className={textColor}
                                            fontWeight="600"
                                        >
                                            {currValue}
                                            <tspan className="text-gray-400 font-normal"> / </tspan>
                                            <tspan className="text-gray-500 font-normal">{refValue}</tspan>
                                            <tspan className="text-gray-400 text-xs"> {measurementUnit}</tspan>
                                        </text>

                                        {/* Percentage difference (if available) */}
                                        {percentDiff && (
                                            <text
                                                x="0"
                                                y="30"
                                                textAnchor="middle"
                                                fontSize="10"
                                                className={textColor}
                                                fontWeight="medium"
                                            >
                                                {percentDiff}
                                            </text>
                                        )}
                                    </g>
                                );
                            })}

                            {/* Legend */}
                            <g transform="translate(20, 420)">
                                <rect x="0" y="0" width="180" height="20" fill="white" fillOpacity="0.95" rx="4" stroke="#ddd" strokeWidth="1" />
                                <text x="5" y="14" fontSize="11" fill="#444">
                                    <tspan className="font-medium">Legend: </tspan>
                                    <tspan className="text-blue-600 font-medium">Current</tspan>
                                    <tspan> / </tspan>
                                    <tspan className="text-gray-500">Reference</tspan>
                                    <tspan className="text-xs text-gray-400"> (in {measurementUnit})</tspan>
                                </text>
                            </g>
                        </>
                    )}
                </svg>
            </div>
        </div>
    );
}