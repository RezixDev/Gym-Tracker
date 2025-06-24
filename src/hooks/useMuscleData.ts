// hooks/useMuscleData.ts

import { useCallback, useEffect, useState } from 'react';

export type MeasurementType =
    | 'neck'
    | 'shoulders'
    | 'chest'
    | 'leftBicep'
    | 'rightBicep'
    | 'leftForearm'
    | 'rightForearm'
    | 'waist'
    | 'hips'
    | 'leftThigh'
    | 'rightThigh'
    | 'leftCalf'
    | 'rightCalf';

export type MuscleRecord = {
    id: string;
    date: string;
    measurements: {
        [key in MeasurementType]?: number;
    };
    notes: string;
};

export const MEASUREMENT_LABELS: Record<MeasurementType, string> = {
    neck: 'Neck',
    shoulders: 'Shoulders',
    chest: 'Chest',
    leftBicep: 'Left Bicep',
    rightBicep: 'Right Bicep',
    leftForearm: 'Left Forearm',
    rightForearm: 'Right Forearm',
    waist: 'Waist',
    hips: 'Hips',
    leftThigh: 'Left Thigh',
    rightThigh: 'Right Thigh',
    leftCalf: 'Left Calf',
    rightCalf: 'Right Calf',
};

// Average measurements in cm for reference (approximate values, can be customized)
export const REFERENCE_MEASUREMENTS = {
    male: {
        neck: 38,
        shoulders: 112,
        chest: 100,
        leftBicep: 35,
        rightBicep: 35,
        leftForearm: 30,
        rightForearm: 30,
        waist: 85,
        hips: 95,
        leftThigh: 55,
        rightThigh: 55,
        leftCalf: 37,
        rightCalf: 37,
    },
    female: {
        neck: 32,
        shoulders: 100,
        chest: 90,
        leftBicep: 28,
        rightBicep: 28,
        leftForearm: 25,
        rightForearm: 25,
        waist: 75,
        hips: 100,
        leftThigh: 55,
        rightThigh: 55,
        leftCalf: 35,
        rightCalf: 35,
    }
};

export function useMuscleData() {
    const [muscleRecords, setMuscleRecords] = useState<MuscleRecord[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [measurementUnit, setMeasurementUnit] = useState<'cm' | 'in'>('cm');

    useEffect(() => {
        console.log("📥 Loading muscle records from localStorage...");
        const storedRecords = localStorage.getItem('muscleRecords');
        if (storedRecords) {
            try {
                const parsed: MuscleRecord[] = JSON.parse(storedRecords);
                setMuscleRecords(parsed);
            } catch (err) {
                console.error("❌ Failed to parse muscle records", err);
                setMuscleRecords([]);
            }
        }

        // Load preferences
        const storedGender = localStorage.getItem('muscleGender');
        if (storedGender === 'male' || storedGender === 'female') {
            setGender(storedGender);
        }

        const storedUnit = localStorage.getItem('muscleUnit');
        if (storedUnit === 'cm' || storedUnit === 'in') {
            setMeasurementUnit(storedUnit);
        }

        setLoaded(true);
    }, []);

    useEffect(() => {
        if (loaded) {
            console.log("💾 Saving muscle records to localStorage...", muscleRecords);
            localStorage.setItem('muscleRecords', JSON.stringify(muscleRecords));
        }
    }, [muscleRecords, loaded]);

    useEffect(() => {
        if (loaded) {
            localStorage.setItem('muscleGender', gender);
        }
    }, [gender, loaded]);

    useEffect(() => {
        if (loaded) {
            localStorage.setItem('muscleUnit', measurementUnit);
        }
    }, [measurementUnit, loaded]);

    const addMuscleRecord = useCallback((record: Omit<MuscleRecord, 'id'>) => {
        setMuscleRecords((prev) => [
            ...prev,
            {
                ...record,
                id: crypto.randomUUID(),
            },
        ]);
    }, []);

    const deleteMuscleRecord = useCallback((id: string) => {
        setMuscleRecords((prev) => prev.filter((r) => r.id !== id));
    }, []);

    const updateMuscleRecord = useCallback((id: string, updates: Partial<Omit<MuscleRecord, 'id'>>) => {
        setMuscleRecords((prev) =>
            prev.map((record) =>
                record.id === id ? { ...record, ...updates } : record
            )
        );
    }, []);

    // Convert between cm and inches
    const convertMeasurement = useCallback((value: number, from: 'cm' | 'in', to: 'cm' | 'in'): number => {
        if (from === to) return value;
        return from === 'cm' ? value / 2.54 : value * 2.54;
    }, []);

    // Get reference measurements in the current unit
    const getReferenceValues = useCallback(() => {
        const referenceValues = REFERENCE_MEASUREMENTS[gender];

        if (measurementUnit === 'cm') {
            return referenceValues;
        }

        // Convert cm to inches
        const inchValues: typeof referenceValues = {} as any;
        for (const key in referenceValues) {
            const typedKey = key as MeasurementType;
            inchValues[typedKey] = convertMeasurement(referenceValues[typedKey], 'cm', 'in');
        }

        return inchValues;
    }, [gender, measurementUnit, convertMeasurement]);

    // Get latest measurements
    const getLatestMeasurements = useCallback(() => {
        if (muscleRecords.length === 0) return null;

        // Sort by date (newest first)
        const sortedRecords = [...muscleRecords].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        return sortedRecords[0].measurements;
    }, [muscleRecords]);

    // Calculate progress over time
    const calculateProgress = useCallback((measurementType: MeasurementType, days: number = 30) => {
        if (muscleRecords.length < 2) return null;

        // Sort by date (oldest first)
        const sortedRecords = [...muscleRecords].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Find records within the time range
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - days);

        const startDateStr = startDate.toISOString().split('T')[0];

        // Find the earliest record after the start date
        const earliestValidRecord = sortedRecords.find(r =>
            r.date >= startDateStr && r.measurements[measurementType] !== undefined
        );

        // Find the latest record
        const latestRecord = sortedRecords.reverse()[0];

        if (!earliestValidRecord || !latestRecord.measurements[measurementType]) {
            return null;
        }

        const startValue = earliestValidRecord.measurements[measurementType] as number;
        const endValue = latestRecord.measurements[measurementType] as number;

        return {
            startValue,
            endValue,
            change: endValue - startValue,
            percentChange: ((endValue - startValue) / startValue) * 100,
        };
    }, [muscleRecords]);

    return {
        muscleRecords,
        addMuscleRecord,
        deleteMuscleRecord,
        updateMuscleRecord,
        gender,
        setGender,
        measurementUnit,
        setMeasurementUnit,
        getReferenceValues,
        getLatestMeasurements,
        calculateProgress,
        convertMeasurement
    };
}