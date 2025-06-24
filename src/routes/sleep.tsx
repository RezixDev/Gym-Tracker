// app/routes/sleep.tsx
import { createFileRoute } from '@tanstack/react-router';
import { useSleepData } from '../hooks/useSleepData';
import { SleepForm } from '../components/sleep/SleepForm';
import { SleepTable } from '../components/sleep/SleepTable';
import { SleepStats } from '../components/sleep/SleepStats';

export const Route = createFileRoute('/sleep')({
    component: SleepPage,
});

function SleepPage() {
    const { sleepRecords, addSleepRecord, deleteSleepRecord } = useSleepData();

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Sleep Tracking</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Log Sleep</h2>
                        <SleepForm addSleepRecord={addSleepRecord} />
                    </div>
                </div>

                {/* Stats & History Column */}
                <div className="lg:col-span-2 space-y-8">
                    <SleepStats sleepRecords={sleepRecords} />

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <SleepTable
                            sleepRecords={sleepRecords}
                            deleteSleepRecord={deleteSleepRecord}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}