// app/routes/stress.tsx
import { createFileRoute } from '@tanstack/react-router';
import { useStressData } from '../hooks/useStressData';
import { StressForm } from '../components/stress/StressForm';
import { StressTable } from '../components/stress/StressTable';
import { StressStats } from '../components/stress/StressStats';

export const Route = createFileRoute('/stress')({
    component: StressPage,
});

function StressPage() {
    const { stressRecords, addStressRecord, deleteStressRecord } = useStressData();

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Stress & Work Tracking</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Log Stress & Work</h2>
                        <StressForm addStressRecord={addStressRecord} />
                    </div>
                </div>

                {/* Stats & History Column */}
                <div className="lg:col-span-2 space-y-8">
                    <StressStats stressRecords={stressRecords} />

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <StressTable
                            stressRecords={stressRecords}
                            deleteStressRecord={deleteStressRecord}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}