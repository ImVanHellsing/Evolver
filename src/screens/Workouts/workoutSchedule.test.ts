import { DayOfWeek } from '../../models/DayOfWeek';
import { WorkoutTemplate } from '../../models/Workout';
import { moveWorkoutToDay, WEEK_DAYS } from './workoutSchedule';

const workout = (id: string, dayOfWeek: DayOfWeek): WorkoutTemplate => ({
  id,
  dayOfWeek,
  description: id,
  exercises: [],
});

test('lists every weekday in calendar order', () => {
  expect(WEEK_DAYS).toEqual([
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
    DayOfWeek.SUNDAY,
  ]);
});

test('moves a workout to an empty day without mutating the source', () => {
  const source = [workout('a', DayOfWeek.MONDAY)];
  const moved = moveWorkoutToDay(source, 'a', DayOfWeek.FRIDAY);

  expect(moved[0].dayOfWeek).toBe(DayOfWeek.FRIDAY);
  expect(source[0].dayOfWeek).toBe(DayOfWeek.MONDAY);
});

test('swaps workouts when the target day is occupied', () => {
  const moved = moveWorkoutToDay([
    workout('a', DayOfWeek.MONDAY),
    workout('b', DayOfWeek.FRIDAY),
  ], 'a', DayOfWeek.FRIDAY);

  expect(moved.find(item => item.id === 'a')?.dayOfWeek).toBe(DayOfWeek.FRIDAY);
  expect(moved.find(item => item.id === 'b')?.dayOfWeek).toBe(DayOfWeek.MONDAY);
});
