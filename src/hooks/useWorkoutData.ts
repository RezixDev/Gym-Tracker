import { useCallback, useEffect, useState } from "react";

export type WorkoutSet = {
  weight: number;
  repetitions: number;
};

export type Workout = {
  id: string;
  date: string;
  exercise: string;
  sets: WorkoutSet[];
  notes: string;
  machineNumber: string;
};

export function useWorkoutData() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    console.log("📥 Loading workouts from localStorage...");
    const storedWorkouts = localStorage.getItem("workouts");
    if (storedWorkouts) {
      try {
        const parsed: Workout[] = JSON.parse(storedWorkouts);
        // Migration logic for old data structure
        const migratedWorkouts = parsed.map((workout) => {
          // If workout has old structure (weight/repetitions instead of sets)
          if ("weight" in workout && "repetitions" in workout && !("sets" in workout)) {
            return {
              ...workout,
              sets: [{ weight: workout.weight, repetitions: workout.repetitions }],
              // Remove old properties
              weight: undefined,
              repetitions: undefined,
            };
          }
          return workout;
        });
        setWorkouts(migratedWorkouts);
      } catch (err) {
        console.error("❌ Failed to parse workouts", err);
        setWorkouts([]);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      console.log("💾 Saving workouts to localStorage...", workouts);
      localStorage.setItem("workouts", JSON.stringify(workouts));
    }
  }, [workouts, loaded]);

  const addWorkout = useCallback((workout: Omit<Workout, "id">) => {
    setWorkouts((prev) => [
      ...prev,
      {
        ...workout,
        id: crypto.randomUUID(),
      },
    ]);
  }, []);

  const deleteWorkout = useCallback((id: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }, []);

  return { workouts, addWorkout, deleteWorkout };
}
