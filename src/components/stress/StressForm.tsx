// components/stress/StressForm.tsx

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
import { StressRecord } from '../../hooks/useStressData';

// Common stress factors
const COMMON_FACTORS = [
    'Work',
    'Family',
    'Financial',
    'Health',
    'Social',
    'Time Management',
    'Sleep',
    'Exercise',
    'Nutrition',
    'Environment',
];

export function StressForm({
                               addStressRecord,
                           }: {
    addStressRecord: (record: Omit<StressRecord, 'id'>) => void;
}) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [workedToday, setWorkedToday] = useState(true);
    const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
    const [customFactor, setCustomFactor] = useState('');

    const form = useTanstackForm({
        defaultValues: {
            stressLevel: '',
            workHours: '',
            notes: '',
        },
        onSubmit: async ({ value }) => {
            console.log("📝 Submitting new stress record:", value);

            if (!selectedDate) {
                toast.error('Please select a date.');
                return;
            }

            addStressRecord({
                date: format(selectedDate, 'yyyy-MM-dd'),
                stressLevel: Number(value.stressLevel),
                workedToday,
                workHours: workedToday ? Number(value.workHours) : 0,
                notes: value.notes,
                factors: [...selectedFactors],
            });

            toast.success('Stress record saved successfully! 🎉');
            form.reset();
            setSelectedDate(new Date());
            setWorkedToday(true);
            setSelectedFactors([]);
            setCustomFactor('');
        },
    });

    const toggleFactor = (factor: string) => {
        setSelectedFactors((prev) =>
            prev.includes(factor)
                ? prev.filter(f => f !== factor)
                : [...prev, factor]
        );
    };

    const addCustomFactor = () => {
        if (customFactor.trim() && !selectedFactors.includes(customFactor.trim())) {
            setSelectedFactors(prev => [...prev, customFactor.trim()]);
            setCustomFactor('');
        }
    };

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
                <label className="font-medium">Date</label>
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

            {/* Stress Level */}
            <div>
                <label className="font-medium">Stress Level (1-10)</label>
                <form.Field name="stressLevel">
                    {(field) => (
                        <Input
                            type="number"
                            min="1"
                            max="10"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Rate your stress level"
                        />
                    )}
                </form.Field>
            </div>

            {/* Work Status */}
            <div className="space-y-2">
                <label className="font-medium">Did you work today?</label>
                <div className="flex gap-4">
                    <Button
                        type="button"
                        variant={workedToday ? 'default' : 'outline'}
                        onClick={() => setWorkedToday(true)}
                    >
                        Yes
                    </Button>
                    <Button
                        type="button"
                        variant={!workedToday ? 'default' : 'outline'}
                        onClick={() => setWorkedToday(false)}
                    >
                        No
                    </Button>
                </div>
            </div>

            {/* Work Hours - Only show if worked today */}
            {workedToday && (
                <div>
                    <label className="font-medium">Hours Worked</label>
                    <form.Field name="workHours">
                        {(field) => (
                            <Input
                                type="number"
                                min="0"
                                max="24"
                                step="0.5"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                placeholder="Enter hours worked"
                            />
                        )}
                    </form.Field>
                </div>
            )}

            {/* Stress Factors */}
            <div className="space-y-2">
                <label className="font-medium">Stress Factors</label>
                <div className="flex flex-wrap gap-2">
                    {COMMON_FACTORS.map((factor) => (
                        <Button
                            key={factor}
                            type="button"
                            size="sm"
                            variant={selectedFactors.includes(factor) ? 'default' : 'outline'}
                            onClick={() => toggleFactor(factor)}
                        >
                            {factor}
                        </Button>
                    ))}
                </div>

                <div className="flex gap-2 mt-2">
                    <Input
                        value={customFactor}
                        onChange={(e) => setCustomFactor(e.target.value)}
                        placeholder="Add custom factor"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addCustomFactor();
                            }
                        }}
                    />
                    <Button type="button" onClick={addCustomFactor}>Add</Button>
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
                            placeholder="Any notes about your day (optional)"
                        />
                    )}
                </form.Field>
            </div>

            <Button type="submit" className="w-full">
                Log Stress
            </Button>
        </form>
    );
}