// components/stress/StressStats.tsx

import { useMemo } from 'react';
import { StressRecord } from '../../hooks/useStressData';

export function StressStats({
                                stressRecords
                            }: {
    stressRecords: StressRecord[];
}) {
    // Calculate stress statistics
    const stats = useMemo(() => {
        if (stressRecords.length === 0) {
            return {
                averageStressLevel: 0,
                workDaysCount: 0,
                restDaysCount: 0,
                totalWorkHours: 0,
                averageWorkHours: 0,
                stressFactorCounts: {},
                weeklyStressAvg: 0,
                monthlyStressAvg: 0,
            };
        }

        // Sort records by date (newest first)
        const sortedRecords = [...stressRecords].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Calculate overall stats
        const totalStressLevel = stressRecords.reduce((sum, record) => sum + record.stressLevel, 0);
        const workDays = stressRecords.filter(record => record.workedToday);
        const workDaysCount = workDays.length;
        const restDaysCount = stressRecords.length - workDaysCount;
        const totalWorkHours = workDays.reduce((sum, record) => sum + record.workHours, 0);

        // Calculate stress factors frequency
        const stressFactorCounts: Record<string, number> = {};
        stressRecords.forEach(record => {
            record.factors.forEach(factor => {
                stressFactorCounts[factor] = (stressFactorCounts[factor] || 0) + 1;
            });
        });

        // Calculate weekly and monthly averages
        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);

        const weeklyRecords = stressRecords.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= oneWeekAgo && recordDate <= today;
        });

        const monthlyRecords = stressRecords.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= oneMonthAgo && recordDate <= today;
        });

        const weeklyStressTotal = weeklyRecords.reduce((sum, record) => sum + record.stressLevel, 0);
        const monthlyStressTotal = monthlyRecords.reduce((sum, record) => sum + record.stressLevel, 0);

        const weeklyStressAvg = weeklyRecords.length > 0 ? weeklyStressTotal / weeklyRecords.length : 0;
        const monthlyStressAvg = monthlyRecords.length > 0 ? monthlyStressTotal / monthlyRecords.length : 0;

        // Get top stress factors
        const topFactors = Object.entries(stressFactorCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([factor, count]) => ({ factor, count }));

        return {
            averageStressLevel: totalStressLevel / stressRecords.length,
            workDaysCount,
            restDaysCount,
            totalWorkHours,
            averageWorkHours: workDaysCount > 0 ? totalWorkHours / workDaysCount : 0,
            stressFactorCounts,
            topFactors,
            weeklyStressAvg,
            monthlyStressAvg,
            latestRecord: sortedRecords[0],
        };
    }, [stressRecords]);

    // Determine stress level message
    const stressLevelMessage = useMemo(() => {
        if (stats.averageStressLevel < 4) {
            return "Your stress levels are generally low. Great job managing stress!";
        } else if (stats.averageStressLevel < 7) {
            return "Your stress levels are moderate. Consider implementing stress management techniques.";
        } else {
            return "Your stress levels are high. It might be worth exploring stress reduction strategies.";
        }
    }, [stats.averageStressLevel]);

    // Get stress level color
    const getStressLevelColor = (level: number) => {
        if (level <= 3) return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
        if (level <= 6) return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20";
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold">Stress Analysis</h2>

            {stressRecords.length === 0 ? (
                <p className="text-gray-500 italic">No stress data available yet. Start tracking to see your statistics.</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className={`p-4 rounded-lg ${getStressLevelColor(stats.averageStressLevel)}`}>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Average Stress</p>
                            <p className="text-2xl font-bold">{stats.averageStressLevel.toFixed(1)}/10</p>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Work/Rest Ratio</p>
                            <p className="text-2xl font-bold">{stats.workDaysCount} / {stats.restDaysCount}</p>
                        </div>

                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Hours Worked</p>
                            <p className="text-2xl font-bold">{stats.averageWorkHours.toFixed(1)}h</p>
                        </div>

                        <div className={`p-4 rounded-lg ${getStressLevelColor(stats.weeklyStressAvg)}`}>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Last 7 Days Avg</p>
                            <p className="text-2xl font-bold">{stats.weeklyStressAvg.toFixed(1)}/10</p>
                        </div>
                    </div>

                    {stats.topFactors.length > 0 && (
                        <div className="mt-4">
                            <h3 className="font-medium mb-2">Top Stress Factors</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {stats.topFactors.map((item, index) => (
                                    <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                        <p className="font-medium">{item.factor}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Occurred {item.count} time{item.count !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h3 className="font-medium mb-2">Stress Insight</h3>
                        <p>{stressLevelMessage}</p>
                        {stats.latestRecord && (
                            <p className="mt-2 text-sm">
                                Your most recent entry on {stats.latestRecord.date} had a stress level of {' '}
                                <span className={stats.latestRecord.stressLevel <= 3 ? 'text-green-600' : stats.latestRecord.stressLevel <= 6 ? 'text-yellow-600' : 'text-red-600'}>
                  {stats.latestRecord.stressLevel}/10
                </span>.
                            </p>
                        )}
                    </div>

                    {/* Work-Stress Correlation */}
                    {stats.workDaysCount > 0 && stats.restDaysCount > 0 && (
                        <div className="mt-4">
                            <h3 className="font-medium mb-2">Work vs. Rest Day Analysis</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                    <p className="font-medium">Work Days</p>
                                    <p className="text-sm">
                                        You've recorded {stats.workDaysCount} work days with an average of {stats.averageWorkHours.toFixed(1)} hours worked.
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                    <p className="font-medium">Rest Days</p>
                                    <p className="text-sm">
                                        You've recorded {stats.restDaysCount} rest days, which is {((stats.restDaysCount / stressRecords.length) * 100).toFixed(0)}% of your entries.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}