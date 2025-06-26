import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Workout } from "../../hooks/useWorkoutData";
import { useDebugSettings } from "./DebugSettingsContext";

export function WorkoutTable({
  workouts,
  deleteWorkout,
}: {
  workouts: Workout[];
  deleteWorkout: (id: string) => void;
}) {
  console.log("🏋️ Table data:", workouts);

  const [selectedExercise, setSelectedExercise] = useState("all");
  const { fieldVisibility } = useDebugSettings();

  const uniqueExercises = useMemo(
    () =>
      Array.from(
        new Set(
          workouts
            .map((w) => w.exercise)
            .filter((exercise) => exercise && exercise.trim() !== ""),
        ),
      ),
    [workouts],
  );

  // Group workouts by date and sort with pre-calculated stats
  const groupedWorkouts = useMemo(() => {
    console.log("🔍 Filter Debug:");
    console.log("  - selectedExercise:", selectedExercise);
    console.log("  - workouts length:", workouts.length);

    // First filter
    const filtered =
      selectedExercise === "all"
        ? workouts
        : workouts.filter((w) => {
            const workoutExercise = (w.exercise || "").toString().trim();
            const selectedEx = selectedExercise.toString().trim();
            const match = workoutExercise === selectedEx;
            console.log(
              `  - Comparing "${workoutExercise}" === "${selectedEx}": ${match}`,
            );
            return match;
          });

    console.log("  - filtered length:", filtered.length);

    // Group by date
    const grouped = filtered.reduce((acc, workout) => {
      const date = workout.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(workout);
      return acc;
    }, {} as Record<string, Workout[]>);

    // Sort dates (newest first) and return as array of [date, workouts, stats] tuples
    return Object.entries(grouped)
      .map(([date, dateWorkouts]) => {
        const totalVolume = dateWorkouts.reduce((sum, workout) => {
          const workoutVolume = (workout.sets || []).reduce(
            (setSum, set) => setSum + set.weight * set.repetitions,
            0
          );
          return sum + workoutVolume;
        }, 0);
        
        const isToday = new Date(date).toDateString() === new Date().toDateString();
        
        return [date, dateWorkouts, { totalVolume, isToday, totalWorkouts: dateWorkouts.length }] as const;
      })
      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime());
  }, [workouts, selectedExercise]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Workouts</h2>
        <Select value={selectedExercise} onValueChange={setSelectedExercise}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Exercises" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exercises</SelectItem>
            {uniqueExercises.map((exercise) => (
              <SelectItem key={exercise} value={exercise}>
                {exercise}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {groupedWorkouts.length > 0 ? (
        <div className="space-y-6">
          {groupedWorkouts.map(([date, dateWorkouts, stats]) => {
            return (
              <div key={date} className="space-y-3">
                {/* Date Header */}
                <div className={cn(
                  "flex items-center justify-between p-4 rounded-lg border-l-4",
                  stats.isToday 
                    ? "bg-green-50 border-l-green-500 dark:bg-green-900/20 dark:border-l-green-400" 
                    : "bg-gray-50 border-l-gray-300 dark:bg-gray-800/50 dark:border-l-gray-600"
                )}>
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {date}
                      {stats.isToday && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full dark:bg-green-800 dark:text-green-100">
                          Today
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stats.totalWorkouts} workout{stats.totalWorkouts !== 1 ? 's' : ''} • {stats.totalVolume}kg total volume
                    </p>
                  </div>
                </div>

                {/* Workouts Table for this date - Manual rendering without useReactTable */}
                <div className="overflow-x-auto rounded-lg border ml-4">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                          Exercise
                        </th>
                        {fieldVisibility.showMachineNumber && (
                          <th className="px-6 py-3 text-left text-sm font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                            Machine Number
                          </th>
                        )}
                        <th className="px-6 py-3 text-left text-sm font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                          Sets
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                          Total Volume
                        </th>
                        {fieldVisibility.showNotes && (
                          <th className="px-6 py-3 text-left text-sm font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                            Notes
                          </th>
                        )}
                        <th className="px-6 py-3 text-left text-sm font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                      {dateWorkouts.map((workout, index) => {
                        const totalVolume = (workout.sets || []).reduce(
                          (sum, set) => sum + set.weight * set.repetitions,
                          0,
                        );

                        return (
                          <tr
                            key={workout.id || index}
                            className="hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-700 dark:text-gray-200">
                              {workout.exercise || "-"}
                            </td>
                            {fieldVisibility.showMachineNumber && (
                              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-700 dark:text-gray-200">
                                {workout.machineNumber || "-"}
                              </td>
                            )}
                              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-700 dark:text-gray-200">
                                {!workout.sets || workout.sets.length === 0 ? "-" : (
                                  <div className="space-y-1">
                                    {workout.sets.map((set, setIndex) => (
                                      <div key={`${workout.id}-${set.weight}kg-${set.repetitions}reps`} className="text-xs">
                                        Set {setIndex + 1}: {set.weight}kg × {set.repetitions} reps
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-700 dark:text-gray-200">
                              {totalVolume > 0 ? `${totalVolume}kg` : "-"}
                            </td>
                            {fieldVisibility.showNotes && (
                              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-700 dark:text-gray-200">
                                {workout.notes || "-"}
                              </td>
                            )}
                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-700 dark:text-gray-200">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (workout.id) {
                                    deleteWorkout(workout.id);
                                    toast.success("Workout deleted!");
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500 border rounded-lg">
          {selectedExercise === "all"
            ? "No workouts yet. Add your first workout!"
            : "No workouts match the selected filter."}
        </div>
      )}
    </div>
  );
}