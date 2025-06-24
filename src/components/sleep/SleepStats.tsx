// components/sleep/SleepStats.tsx

import { useMemo } from 'react';
import { Sleep } from '../../hooks/useSleepData';

export function SleepStats({
                               sleepRecords
                           }: {
    sleepRecords: Sleep[];
}) {
    // Calculate sleep statistics
    const stats = useMemo(() => {
        if (sleepRecords.length === 0) {
            return {
                averageHours: 0,
                averageQuality: 0,
                longestSleep: 0,
                shortestSleep: 0,
                totalRecords: 0,
                lastWeekAverage: 0,
            };
        }

        // Calculate overall averages
        const totalHours = sleepRecords.reduce((sum, record) => sum + record.hoursSlept, 0);
        const totalQuality = sleepRecords.reduce((sum, record) => sum + record.qualityRating, 0);
        const sleepHours = sleepRecords.map(record => record.hoursSlept);
        const longestSleep = Math.max(...sleepHours);
        const shortestSleep = Math.min(...sleepHours);

        // Calculate last week's average
        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);

        const lastWeekRecords = sleepRecords.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= oneWeekAgo && recordDate <= today;
        });

        const lastWeekHours = lastWeekRecords.reduce((sum, record) => sum + record.hoursSlept, 0);
        const lastWeekAverage = lastWeekRecords.length > 0 ? lastWeekHours / lastWeekRecords.length : 0;

        return {
            averageHours: totalHours / sleepRecords.length,
            averageQuality: totalQuality / sleepRecords.length,
            longestSleep,
            shortestSleep,
            totalRecords: sleepRecords.length,
            lastWeekAverage,
        };
    }, [sleepRecords]);

    // Determine sleep quality message
    const sleepQualityMessage = useMemo(() => {
        if (stats.averageHours < 6) {
            return "You might not be getting enough sleep. Most adults need 7-9 hours.";
        } else if (stats.averageHours >= 7 && stats.averageHours <= 9) {
            return "You're getting a healthy amount of sleep. Keep it up!";
        } else if (stats.averageHours > 9) {
            return "You're getting more sleep than average. This is fine if you feel rested.";
        }
        return "Try to aim for 7-9 hours of sleep for optimal health.";
    }, [stats.averageHours]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold">Sleep Statistics</h2>

            {sleepRecords.length === 0 ? (
                <p className="text-gray-500 italic">No sleep data available yet. Start tracking to see your statistics.</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Average Sleep</p>
                            <p className="text-2xl font-bold">{stats.averageHours.toFixed(1)}h</p>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Average Quality</p>
                            <p className="text-2xl font-bold">{stats.averageQuality.toFixed(1)}/10</p>
                        </div>

                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Last 7 Days Avg</p>
                            <p className="text-2xl font-bold">{stats.lastWeekAverage.toFixed(1)}h</p>
                        </div>

                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Sleep Records</p>
                            <p className="text-2xl font-bold">{stats.totalRecords}</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <h3 className="font-medium mb-2">Sleep Range</h3>
                        <p>Your sleep duration ranges from <span className="font-semibold">{stats.shortestSleep.toFixed(1)}h</span> to <span className="font-semibold">{stats.longestSleep.toFixed(1)}h</span>.</p>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h3 className="font-medium mb-2">Sleep Insight</h3>
                        <p>{sleepQualityMessage}</p>
                    </div>
                </>
            )}
        </div>
    );
}