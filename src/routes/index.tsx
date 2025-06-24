// app/routes/index.tsx

import { createFileRoute } from "@tanstack/react-router";
import { DebugSettings } from "~/components/workout/DebugSettings";
import { DebugSettingsProvider } from "../components/workout/DebugSettingsContext";
import { WorkoutForm } from "../components/workout/WorkoutForm";
import { WorkoutTable } from "../components/workout/WorkoutTable";
import { useWorkoutData } from "../hooks/useWorkoutData";

export const Route = createFileRoute("/")({
  component: Home,
});

export default function Home() {
  const { workouts, addWorkout, deleteWorkout } = useWorkoutData();

  return (
    <DebugSettingsProvider>
      <div className="container mx-auto space-y-12 p-8">
        <WorkoutForm addWorkout={addWorkout} workouts={workouts} />
        <WorkoutTable workouts={workouts} deleteWorkout={deleteWorkout} />
        <DebugSettings />
      </div>
    </DebugSettingsProvider>
  );
}
