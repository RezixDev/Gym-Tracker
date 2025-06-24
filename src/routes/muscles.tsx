// app/routes/muscles.tsx
import { createFileRoute } from '@tanstack/react-router';
import { useMuscleData } from '../hooks/useMuscleData';
import { MuscleForm } from '../components/muscles/MuscleForm';
import { MuscleVisual } from '../components/muscles/MuscleVisual';
import { MuscleTable } from '../components/muscles/MuscleTable';
import { MuscleStats } from '../components/muscles/MuscleStats';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/muscles')({
    component: MusclesPage,
});

function MusclesPage() {
    const {
        muscleRecords,
        addMuscleRecord,
        deleteMuscleRecord,
        gender,
        setGender,
        measurementUnit,
        setMeasurementUnit,
        getReferenceValues,
        getLatestMeasurements
    } = useMuscleData();

    const referenceValues = getReferenceValues();
    const latestMeasurements = getLatestMeasurements();

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Muscle Measurements</h1>

            {/* Settings bar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-8 flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-lg font-medium">Measurement Settings</h2>
                </div>
                <div className="flex gap-4 items-center">
                    <div>
                        <span className="mr-2 text-sm font-medium">Reference Model:</span>
                        <div className="inline-flex rounded-md shadow-sm">
                            <Button
                                type="button"
                                variant={gender === 'male' ? 'default' : 'outline'}
                                onClick={() => setGender('male')}
                                className="rounded-r-none"
                            >
                                Male
                            </Button>
                            <Button
                                type="button"
                                variant={gender === 'female' ? 'default' : 'outline'}
                                onClick={() => setGender('female')}
                                className="rounded-l-none"
                            >
                                Female
                            </Button>
                        </div>
                    </div>

                    <div>
                        <span className="mr-2 text-sm font-medium">Unit:</span>
                        <div className="inline-flex rounded-md shadow-sm">
                            <Button
                                type="button"
                                variant={measurementUnit === 'cm' ? 'default' : 'outline'}
                                onClick={() => setMeasurementUnit('cm')}
                                className="rounded-r-none"
                            >
                                cm
                            </Button>
                            <Button
                                type="button"
                                variant={measurementUnit === 'in' ? 'default' : 'outline'}
                                onClick={() => setMeasurementUnit('in')}
                                className="rounded-l-none"
                            >
                                in
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Record Measurements</h2>
                        <MuscleForm
                            addMuscleRecord={addMuscleRecord}
                            measurementUnit={measurementUnit}
                        />
                    </div>
                </div>

                {/* Visual & Stats Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Visual Reference */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Measurement Visual</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            This diagram shows your latest measurements compared to reference values.
                            {latestMeasurements ? '' : ' Add your first measurements to see them on the diagram.'}
                        </p>
                        <MuscleVisual
                            referenceValues={referenceValues}
                            currentValues={latestMeasurements || undefined}
                            gender={gender}
                            measurementUnit={measurementUnit}
                        />
                    </div>

                    {/* Statistics */}
                    <MuscleStats
                        muscleRecords={muscleRecords}
                        measurementUnit={measurementUnit}
                    />

                    {/* History Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <MuscleTable
                            muscleRecords={muscleRecords}
                            deleteMuscleRecord={deleteMuscleRecord}
                            measurementUnit={measurementUnit}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}