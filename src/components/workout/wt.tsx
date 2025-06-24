import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Workout } from "../../hooks/useWorkoutData";

const columnHelper = createColumnHelper<Workout>();

export function WorkoutTable({
  workouts,
  deleteWorkout,
}: {
  workouts: Workout[];
  deleteWorkout: (id: string) => void;
}) {
  console.log("🏋️ Table data:", workouts);

  const [selectedExercise, setSelectedExercise] = useState("all");

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

  // Add this to see what's causing the issue
  console.log("🏃 uniqueExercises:", uniqueExercises);
  console.log(
    "🏃 uniqueExercises with types:",
    uniqueExercises.map((ex) => ({ value: ex, type: typeof ex, length: ex?.length })),
  );

  // Combine filtering and sorting in a single useMemo
  const processedWorkouts = useMemo(() => {
    console.log("🔍 Filter Debug:");
    console.log("  - selectedExercise:", selectedExercise);
    console.log("  - workouts length:", workouts.length);

    // First filter
    const filtered =
      selectedExercise === "all"
        ? workouts
        : workouts.filter((w) => {
            // Normalize both values for comparison
            const workoutExercise = (w.exercise || "").toString().trim();
            const selectedEx = selectedExercise.toString().trim();
            const match = workoutExercise === selectedEx;
            console.log(
              `  - Comparing "${workoutExercise}" === "${selectedEx}": ${match}`,
            );
            return match;
          });

    console.log("  - filtered length:", filtered.length);

    // Then sort (newest first)
    return [...filtered].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [workouts, selectedExercise]);

  console.log("🎯 selectedExercise:", selectedExercise);
  console.log("🔎 filtered workouts:", processedWorkouts);

  const columns = useMemo(
    () => [
      columnHelper.accessor("date", {
        header: "Date",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("exercise", {
        header: "Exercise",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor("machineNumber", {
        header: "Machine Number",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor("weight", {
        header: "Weight (kg)",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("repetitions", {
        header: "Reps",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("notes", {
        header: "Notes",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (row.original.id) {
                deleteWorkout(row.original.id);
                toast.success("Workout deleted!");
              }
            }}
          >
            Delete
          </Button>
        ),
      }),
    ],
    [deleteWorkout],
  );

  const table = useReactTable({
    data: processedWorkouts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const tableRows = table.getRowModel().rows;

  if (tableRows.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        No matching workouts. Try changing the filter or add your first workout.
      </div>
    );
  }

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

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-sm font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "hover:bg-gray-100 dark:hover:bg-gray-800",
                    new Date(row.original.date).toDateString() ===
                      new Date().toDateString()
                      ? "bg-green-100 dark:bg-green-800"
                      : "",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 text-sm whitespace-nowrap text-gray-700 dark:text-gray-200"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-gray-500">
                  No workouts match the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
