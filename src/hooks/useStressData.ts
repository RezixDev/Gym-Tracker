// hooks/useStressData.ts

import { useCallback, useEffect, useState } from 'react';

export type StressRecord = {
    id: string;
    date: string;
    stressLevel: number; // 1-10
    workedToday: boolean;
    workHours: number;
    notes: string;
    factors: string[]; // Factors that contributed to stress
};

export function useStressData() {
    const [stressRecords, setStressRecords] = useState<StressRecord[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        console.log("📥 Loading stress records from localStorage...");
        const storedRecords = localStorage.getItem('stressRecords');
        if (storedRecords) {
            try {
                const parsed: StressRecord[] = JSON.parse(storedRecords);
                setStressRecords(parsed);
            } catch (err) {
                console.error("❌ Failed to parse stress records", err);
                setStressRecords([]);
            }
        }
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (loaded) {
            console.log("💾 Saving stress records to localStorage...", stressRecords);
            localStorage.setItem('stressRecords', JSON.stringify(stressRecords));
        }
    }, [stressRecords, loaded]);

    const addStressRecord = useCallback((record: Omit<StressRecord, 'id'>) => {
        setStressRecords((prev) => [
            ...prev,
            {
                ...record,
                id: crypto.randomUUID(),
            },
        ]);
    }, []);

    const deleteStressRecord = useCallback((id: string) => {
        setStressRecords((prev) => prev.filter((r) => r.id !== id));
    }, []);

    const updateStressRecord = useCallback((id: string, updates: Partial<Omit<StressRecord, 'id'>>) => {
        setStressRecords((prev) =>
            prev.map((record) =>
                record.id === id ? { ...record, ...updates } : record
            )
        );
    }, []);

    // Calculate stress statistics
    const getStressStats = useCallback((startDate?: string, endDate?: string) => {
        let filteredRecords = [...stressRecords];

        if (startDate) {
            filteredRecords = filteredRecords.filter(record => record.date >= startDate);
        }

        if (endDate) {
            filteredRecords = filteredRecords.filter(record => record.date <= endDate);
        }

        if (filteredRecords.length === 0) {
            return {
                averageStressLevel: 0,
                workDaysCount: 0,
                restDaysCount: 0,
                totalWorkHours: 0,
                averageWorkHours: 0,
                stressFactorCounts: {},
                highestStressDay: null,
                lowestStressDay: null
            };
        }

        const totalStressLevel = filteredRecords.reduce((sum, record) => sum + record.stressLevel, 0);
        const workDays = filteredRecords.filter(record => record.workedToday);
        const workDaysCount = workDays.length;
        const restDaysCount = filteredRecords.length - workDaysCount;
        const totalWorkHours = workDays.reduce((sum, record) => sum + record.workHours, 0);

        // Gather stress factors
        const stressFactorCounts: Record<string, number> = {};
        filteredRecords.forEach(record => {
            record.factors.forEach(factor => {
                stressFactorCounts[factor] = (stressFactorCounts[factor] || 0) + 1;
            });
        });

        // Find highest and lowest stress days
        const sortedByStress = [...filteredRecords].sort((a, b) => b.stressLevel - a.stressLevel);
        const highestStressDay = sortedByStress.length > 0 ? sortedByStress[0] : null;
        const lowestStressDay = sortedByStress.length > 0 ? sortedByStress[sortedByStress.length - 1] : null;

        return {
            averageStressLevel: totalStressLevel / filteredRecords.length,
            workDaysCount,
            restDaysCount,
            totalWorkHours,
            averageWorkHours: workDaysCount > 0 ? totalWorkHours / workDaysCount : 0,
            stressFactorCounts,
            highestStressDay,
            lowestStressDay
        };
    }, [stressRecords]);

    // Check if worked on a specific date
    const hasWorkedOnDate = useCallback((date: string) => {
        const record = stressRecords.find(r => r.date === date);
        return record ? record.workedToday : false;
    }, [stressRecords]);

    return {
        stressRecords,
        addStressRecord,
        deleteStressRecord,
        updateStressRecord,
        getStressStats,
        hasWorkedOnDate
    };
}