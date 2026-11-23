import { DayOfWeek, DAY_OF_WEEK_ORDER } from '@/models/DayOfWeek';
import { WorkoutTemplate } from '@/models/Workout';

export const WEEK_DAYS = (Object.values(DayOfWeek) as DayOfWeek[])
  .sort((a, b) => DAY_OF_WEEK_ORDER[a] - DAY_OF_WEEK_ORDER[b]);

export const moveWorkoutToDay = (
  workouts: WorkoutTemplate[],
  workoutId: string,
  targetDay: DayOfWeek
): WorkoutTemplate[] => {
  const source = workouts.find(workout => workout.id === workoutId);
  if (!source || source.dayOfWeek === targetDay) return workouts;

  const target = workouts.find(
    workout => workout.id !== workoutId && workout.dayOfWeek === targetDay
  );

  return workouts.map(workout => {
    if (workout.id === source.id) return { ...workout, dayOfWeek: targetDay };
    if (target && workout.id === target.id) {
      return { ...workout, dayOfWeek: source.dayOfWeek };
    }
    return workout;
  });
};
