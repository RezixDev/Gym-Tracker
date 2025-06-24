"use client";

import { useForm as useTanstackForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Workout } from "../../hooks/useWorkoutData";
import { useDebugSettings } from "./DebugSettingsContext";

export function WorkoutForm({
  addWorkout,
  workouts,
}: {
  addWorkout: (workout: Omit<Workout, "id">) => void;
  workouts: Workout[];
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [usePastExercise, setUsePastExercise] = useState(true);
  const [selectedPastExercise, setSelectedPastExercise] = useState("");
  const { fieldVisibility } = useDebugSettings();

  const pastExercises = Array.from(new Set(workouts.map((w) => w.exercise)));

  const getMostRecentWorkoutForExercise = (exerciseName: string) => {
    return workouts
      .filter((w) => w.exercise === exerciseName)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  const handlePastExerciseSelection = (exerciseName: string) => {
    setSelectedPastExercise(exerciseName);

    if (exerciseName) {
      const mostRecent = getMostRecentWorkoutForExercise(exerciseName);
      if (mostRecent) {
        // Auto-fill form fields with most recent data
        form.setFieldValue("weight", mostRecent.weight.toString());
        form.setFieldValue("repetitions", mostRecent.repetitions.toString());
        if (fieldVisibility.showMachineNumber) {
          form.setFieldValue("machineNumber", mostRecent.machineNumber || "");
        }
        if (fieldVisibility.showNotes) {
          form.setFieldValue("notes", mostRecent.notes || "");
        }
      }
    }
  };

  const form = useTanstackForm({
    defaultValues: {
      exercise: "",
      weight: "",
      repetitions: "",
      notes: "",
      machineNumber: "",
    },
    onSubmit: async ({ value }) => {
      console.log("📝 Submitting new workout:", value);

      if (!selectedDate) {
        toast.error("Please select a workout date.");
        return;
      }

      addWorkout({
        date: format(selectedDate, "yyyy-MM-dd"),
        exercise: usePastExercise ? selectedPastExercise : value.exercise,
        weight: Number(value.weight),
        repetitions: Number(value.repetitions),
        notes: fieldVisibility.showNotes ? value.notes : "",
        machineNumber: fieldVisibility.showMachineNumber ? value.machineNumber : "",
      });

      toast.success("Workout saved successfully! 🎉");
      form.reset();
      setSelectedDate(new Date());
      setSelectedPastExercise("");
    },
  });

  // Calculate dynamic grid columns based on visible fields
  const getGridColumns = () => {
    let count = 2; // weight and repetitions are always shown
    if (fieldVisibility.showMachineNumber) count++;
    if (fieldVisibility.showNotes) count++;

    return {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    }[count];
  };

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
                !selectedDate && "text-muted-foreground",
              )}
            >
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
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
            variant={usePastExercise ? "default" : "outline"}
            onClick={() => setUsePastExercise(true)}
          >
            Select from Past
          </Button>
          <Button
            type="button"
            variant={!usePastExercise ? "default" : "outline"}
            onClick={() => setUsePastExercise(false)}
          >
            Enter New
          </Button>
        </div>

        {usePastExercise ? (
          <select
            value={selectedPastExercise}
            onChange={(e) => handlePastExerciseSelection(e.target.value)}
            className="rounded-md border p-2"
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

      {/* Form Fields - Dynamically shown based on settings */}
      <div className={`grid gap-4 ${getGridColumns()}`}>
        {fieldVisibility.showMachineNumber && (
          <form.Field name="machineNumber">
            {(field) => (
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Machine Number</label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter Machine Number"
                />
              </div>
            )}
          </form.Field>
        )}

        <form.Field name="weight">
          {(field) => (
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Weight (kg)</label>
              <Input
                type="number"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter weight in kg"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="repetitions">
          {(field) => (
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Repetitions</label>
              <Input
                type="number"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter number of repetitions"
              />
            </div>
          )}
        </form.Field>

        {fieldVisibility.showNotes && (
          <form.Field name="notes">
            {(field) => (
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Notes"
                />
              </div>
            )}
          </form.Field>
        )}
      </div>

      <Button type="submit" className="w-full">
        Log Workout
      </Button>
    </form>
  );
}
