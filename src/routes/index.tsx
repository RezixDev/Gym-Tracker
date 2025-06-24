
// app/routes/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { useWorkoutData } from '../hooks/useWorkoutData';
import { WorkoutForm } from '../components/workout/WorkoutForm';
import { WorkoutTable } from '../components/workout/WorkoutTable';

export const Route = createFileRoute('/')({
  component: Home,
})

export default function Home() {
  const { workouts, addWorkout, deleteWorkout } = useWorkoutData();

  return (
    <div className="container mx-auto p-8 space-y-12">
      <WorkoutForm addWorkout={addWorkout} workouts={workouts} />
      <WorkoutTable workouts={workouts} deleteWorkout={deleteWorkout} />
    </div>
  )
}
