// hooks/useSleepData.ts

import { useCallback, useEffect, useState } from 'react';

export type Sleep = {
    id: string;
    date: string;
    hoursSlept: number;
    qualityRating: number; // 1-10
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    notes: string;
};

export function useSleepData() {
    const [sleepRecords, setSleepRecords] = useState<Sleep[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        console.log("📥 Loading sleep records from localStorage...");
        const storedRecords = localStorage.getItem('sleepRecords');
        if (storedRecords) {
            try {
                const parsed: Sleep[] = JSON.parse(storedRecords);
                setSleepRecords(parsed);
            } catch (err) {
                console.error("❌ Failed to parse sleep records", err);
                setSleepRecords([]);
            }
        }
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (loaded) {
            console.log("💾 Saving sleep records to localStorage...", sleepRecords);
            localStorage.setItem('sleepRecords', JSON.stringify(sleepRecords));
        }
    }, [sleepRecords, loaded]);

    const addSleepRecord = useCallback((sleep: Omit<Sleep, 'id'>) => {
        setSleepRecords((prev) => [
            ...prev,
            {
                ...sleep,
                id: crypto.randomUUID(),
            },
        ]);
    }, []);

    const deleteSleepRecord = useCallback((id: string) => {
        setSleepRecords((prev) => prev.filter((s) => s.id !== id));
    }, []);

    const updateSleepRecord = useCallback((id: string, updates: Partial<Omit<Sleep, 'id'>>) => {
        setSleepRecords((prev) =>
            prev.map((record) =>
                record.id === id ? { ...record, ...updates } : record
            )
        );
    }, []);

    // Calculate sleep statistics
    const sleepStats = useCallback(() => {
        if (sleepRecords.length === 0) {
            return {
                averageHours: 0,
                averageQuality: 0,
                longestSleep: 0,
                shortestSleep: 0,
            };
        }

        const totalHours = sleepRecords.reduce((sum, record) => sum + record.hoursSlept, 0);
        const totalQuality = sleepRecords.reduce((sum, record) => sum + record.qualityRating, 0);
        const longestSleep = Math.max(...sleepRecords.map(record => record.hoursSlept));
        const shortestSleep = Math.min(...sleepRecords.map(record => record.hoursSlept));

        return {
            averageHours: totalHours / sleepRecords.length,
            averageQuality: totalQuality / sleepRecords.length,
            longestSleep,
            shortestSleep,
        };
    }, [sleepRecords]);

    return {
        sleepRecords,
        addSleepRecord,
        deleteSleepRecord,
        updateSleepRecord,
        sleepStats
    };
}