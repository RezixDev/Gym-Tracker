// components/sleep/SleepForm.tsx

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
import { Sleep } from '../../hooks/useSleepData';

export function SleepForm({
                              addSleepRecord,
                          }: {
    addSleepRecord: (sleep: Omit<Sleep, 'id'>) => void;
}) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    const form = useTanstackForm({
        defaultValues: {
            hoursSlept: '',
            qualityRating: '',
            startTime: '',
            endTime: '',
            notes: '',
        },
        onSubmit: async ({ value }) => {
            console.log("📝 Submitting new sleep record:", value);

            if (!selectedDate) {
                toast.error('Please select a date.');
                return;
            }

            if (!value.startTime || !value.endTime) {
                toast.error('Please enter both sleep and wake times.');
                return;
            }

            addSleepRecord({
                date: format(selectedDate, 'yyyy-MM-dd'),
                hoursSlept: Number(value.hoursSlept),
                qualityRating: Number(value.qualityRating),
                startTime: value.startTime,
                endTime: value.endTime,
                notes: value.notes,
            });

            toast.success('Sleep record saved successfully! 🎉');
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

            {/* Sleep Time Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="font-medium">Sleep Time</label>
                    <form.Field name="startTime">
                        {(field) => (
                            <Input
                                type="time"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                            />
                        )}
                    </form.Field>
                </div>
                <div>
                    <label className="font-medium">Wake Time</label>
                    <form.Field name="endTime">
                        {(field) => (
                            <Input
                                type="time"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                            />
                        )}
                    </form.Field>
                </div>
            </div>

            {/* Hours and Quality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="font-medium">Hours Slept</label>
                    <form.Field name="hoursSlept">
                        {(field) => (
                            <Input
                                type="number"
                                min="0"
                                max="24"
                                step="0.1"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                placeholder="Enter hours slept"
                            />
                        )}
                    </form.Field>
                </div>
                <div>
                    <label className="font-medium">Sleep Quality (1-10)</label>
                    <form.Field name="qualityRating">
                        {(field) => (
                            <Input
                                type="number"
                                min="1"
                                max="10"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                placeholder="Rate your sleep quality"
                            />
                        )}
                    </form.Field>
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
                            placeholder="Any notes about your sleep (optional)"
                        />
                    )}
                </form.Field>
            </div>

            <Button type="submit" className="w-full">
                Log Sleep
            </Button>
        </form>
    );
}