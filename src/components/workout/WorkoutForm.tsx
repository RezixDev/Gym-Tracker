"use client";

import { useForm as useTanstackForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
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
  const [sets, setSets] = useState<WorkoutSet[]>([{ weight: 0, repetitions: 0 }]);

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

  const addSet = () => {
    const lastSet = sets[sets.length - 1];
    setSets([
      ...sets,
      { weight: lastSet?.weight || 0, repetitions: lastSet?.repetitions || 0 },
    ]);
  };

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      setSets(sets.filter((_, i) => i !== index));
    }
  };

  const updateSet = (index: number, field: keyof WorkoutSet, value: number) => {
    setSets(sets.map((set, i) => (i === index ? { ...set, [field]: value } : set)));
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

      const validSets = sets.filter((set) => set.weight > 0 && set.repetitions > 0);
      if (validSets.length === 0) {
        toast.error("Please add at least one set with weight and repetitions.");
        return;
      }

      addWorkout({
        date: format(selectedDate, "yyyy-MM-dd"),
        exercise: usePastExercise ? selectedPastExercise : value.exercise,
        sets: validSets,
        notes: fieldVisibility.showNotes ? value.notes : "",
        machineNumber: fieldVisibility.showMachineNumber ? value.machineNumber : "",
      });

      toast.success("Workout saved successfully! 🎉");
      form.reset();
      setSelectedPastExercise("");
      setSets([{ weight: 0, repetitions: 0 }]);
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
              autoFocus
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
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSet}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Set
          </Button>
        </div>

        <div className="space-y-3">
          {sets.map((set, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-lg border bg-gray-50 p-4 dark:bg-gray-800"
            >
              <span className="min-w-[60px] text-sm font-medium text-gray-600 dark:text-gray-300">
                Set {index + 1}:
              </span>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={set.weight || ""}
                  onChange={(e) => updateSet(index, "weight", Number(e.target.value))}
                  placeholder="Weight"
                  className="w-24"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">kg</span>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={set.repetitions || ""}
                  onChange={(e) =>
                    updateSet(index, "repetitions", Number(e.target.value))
                  }
                  placeholder="Reps"
                  className="w-24"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">reps</span>
              </div>

              {sets.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeSet(index)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full">
        Log Workout
      </Button>
    </form>
  );
}
