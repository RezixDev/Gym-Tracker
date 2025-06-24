'use client';

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
import { Workout } from '../../hooks/useWorkoutData';

export function WorkoutForm({
  addWorkout,
  workouts,
}: {
  addWorkout: (workout: Workout) => void;
  workouts: Workout[];
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [usePastExercise, setUsePastExercise] = useState(true);
  const [selectedPastExercise, setSelectedPastExercise] = useState('');

  const pastExercises = Array.from(new Set(workouts.map((w) => w.exercise)));

  const form = useTanstackForm({
    defaultValues: {
      exercise: '',
      weight: '',
      repetitions: '',
      notes: '',
      machineNumber: '',
    },
    onSubmit: async ({ value }) => {
      console.log("📝 Submitting new workout:", value);

      if (!selectedDate) {
        toast.error('Please select a workout date.');
        return;
      }

      addWorkout({
        date: format(selectedDate, 'yyyy-MM-dd'),
        exercise: usePastExercise ? selectedPastExercise : value.exercise,
        weight: Number(value.weight),
        repetitions: Number(value.repetitions),
        notes: value.notes,
        machineNumber: value.machineNumber,
      });

      toast.success('Workout saved successfully! 🎉');
      form.reset();
      setSelectedDate(new Date());
      setSelectedPastExercise('');
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-8"
    >
      {/* Pick a Date */}
      <div className="flex flex-col space-y-2">
        <label className="font-medium">Workout Date</label>
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

      {/* Select Past or Enter New Exercise */}
      <div className="flex flex-col space-y-2">
        <label className="font-medium">Exercise</label>
        <div className="flex gap-4">
          <Button
            type="button"
            variant={usePastExercise ? 'default' : 'outline'}
            onClick={() => setUsePastExercise(true)}
          >
            Select from Past
          </Button>
          <Button
            type="button"
            variant={!usePastExercise ? 'default' : 'outline'}
            onClick={() => setUsePastExercise(false)}
          >
            Enter New
          </Button>
        </div>

        {usePastExercise ? (
          <select
            value={selectedPastExercise}
            onChange={(e) => setSelectedPastExercise(e.target.value)}
            className="border rounded-md p-2"
          >
            <option value="">Select an exercise</option>
            {pastExercises.map((exercise) => (
              <option key={exercise} value={exercise}>
                {exercise}
              </option>
            ))}
          </select>
        ) : (
          <form.Field name="exercise">
            {(field) => (
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter exercise name"
              />
            )}
          </form.Field>
        )}
      </div>

      {/* Form Fields */}
      <form.Field name="machineNumber">
        {(field) => (
          <Input
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder="Enter Machine Number"
          />
        )}
      </form.Field>

      <form.Field name="weight">
        {(field) => (
          <Input
            type="number"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder="Enter weight in kg"
          />
        )}
      </form.Field>

      <form.Field name="repetitions">
        {(field) => (
          <Input
            type="number"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder="Enter number of repetitions"
          />
        )}
      </form.Field>

      <form.Field name="notes">
        {(field) => (
          <Input
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder="Notes (optional)"
          />
        )}
      </form.Field>

      <Button type="submit" className="w-full">
        Log Workout
      </Button>
    </form>
  );
}
