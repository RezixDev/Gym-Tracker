// components/muscles/MuscleForm.tsx

import { useForm as useTanstackForm } from '@tanstack/react-form';
import { format } from 'date-fns';
import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { MuscleRecord, MeasurementType, MEASUREMENT_LABELS } from '../../hooks/useMuscleData';

export function MuscleForm({
                               addMuscleRecord,
                               measurementUnit,
                           }: {
    addMuscleRecord: (record: Omit<MuscleRecord, 'id'>) => void;
    measurementUnit: 'cm' | 'in';
}) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    // Group measurement types for better UI organization
    const measurementGroups = {
        upper: ['neck', 'shoulders', 'chest'] as MeasurementType[],
        arms: ['leftBicep', 'rightBicep', 'leftForearm', 'rightForearm'] as MeasurementType[],
        lower: ['waist', 'hips', 'leftThigh', 'rightThigh', 'leftCalf', 'rightCalf'] as MeasurementType[],
    };

    const form = useTanstackForm({
        defaultValues: {
            // Initialize all measurement fields to empty strings
            neck: '',
            shoulders: '',
            chest: '',
            leftBicep: '',
            rightBicep: '',
            leftForearm: '',
            rightForearm: '',
            waist: '',
            hips: '',
            leftThigh: '',
            rightThigh: '',
            leftCalf: '',
            rightCalf: '',
            notes: '',
        },
        onSubmit: async ({ value }) => {
            console.log("📝 Submitting new muscle measurements:", value);

            if (!selectedDate) {
                toast.error('Please select a date.');
                return;
            }

            // Check if at least one measurement is provided
            const hasMeasurements = Object.values(measurementGroups).flat().some(
                type => value[type] !== ''
            );

            if (!hasMeasurements) {
                toast.error('Please enter at least one measurement.');
                return;
            }

            // Convert string values to numbers or undefined for the measurements object
            const measurements: Record<MeasurementType, number | undefined> = {} as any;

            Object.values(measurementGroups).flat().forEach(type => {
                if (value[type]) {
                    measurements[type] = Number(value[type]);
                }
            });

            // Create the record
            addMuscleRecord({
                date: format(selectedDate, 'yyyy-MM-dd'),
                measurements,
                notes: value.notes,
            });

            toast.success('Measurements saved successfully! 🎉');
            form.reset();
            setSelectedDate(new Date());
        },
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
            }}
            className="space-y-6"
        >
            {/* Date Picker */}
            <div className="flex flex-col space-y-2">
                <label className="font-medium">Measurement Date</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                            )}
                        >
                            {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Upper Body Measurements */}
            <div className="space-y-4">
                <h3 className="font-medium text-lg">Upper Body</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {measurementGroups.upper.map((type) => (
                        <div key={type}>
                            <label className="font-medium text-sm">
                                {MEASUREMENT_LABELS[type]} ({measurementUnit})
                            </label>
                            <form.Field name={type}>
                                {(field) => (
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder={`Enter ${MEASUREMENT_LABELS[type]}`}
                                    />
                                )}
                            </form.Field>
                        </div>
                    ))}
                </div>
            </div>

            {/* Arm Measurements */}
            <div className="space-y-4">
                <h3 className="font-medium text-lg">Arms</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {measurementGroups.arms.map((type) => (
                        <div key={type}>
                            <label className="font-medium text-sm">
                                {MEASUREMENT_LABELS[type]} ({measurementUnit})
                            </label>
                            <form.Field name={type}>
                                {(field) => (
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder={`Enter ${MEASUREMENT_LABELS[type]}`}
                                    />
                                )}
                            </form.Field>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lower Body Measurements */}
            <div className="space-y-4">
                <h3 className="font-medium text-lg">Lower Body</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {measurementGroups.lower.map((type) => (
                        <div key={type}>
                            <label className="font-medium text-sm">
                                {MEASUREMENT_LABELS[type]} ({measurementUnit})
                            </label>
                            <form.Field name={type}>
                                {(field) => (
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder={`Enter ${MEASUREMENT_LABELS[type]}`}
                                    />
                                )}
                            </form.Field>
                        </div>
                    ))}
                </div>
            </div>

            {/* Notes */}
            <div>
                <label className="font-medium">Notes</label>
                <form.Field name="notes">
                    {(field) => (
                        <Input
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Any notes about your measurements (optional)"
                        />
                    )}
                </form.Field>
            </div>

            <Button type="submit" className="w-full">
                Save Measurements
            </Button>
        </form>
    );
}
