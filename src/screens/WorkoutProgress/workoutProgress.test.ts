import { ExerciseLog } from '@/models/Exercise';
import { FailureType } from '@/models/FailureType';
import { SetType } from '@/models/SetType';
import { WorkoutSession } from '@/models/Workout';

import {
  calculatePositionComparisons,
  findImmediatelyPreviousSession,
} from './workoutProgress';

const exercise = (
  id: string,
  weight = 20,
  type: SetType = SetType.WorkSet
): ExerciseLog => ({
  id: `log-${id}`,
  exerciseTemplateId: id,
  exerciseNameSnapshot: `Exercício ${id}`,
  notes: '',
  sets: [{
    id: `set-${id}-${type}`,
    reps: 10,
    weight,
    failureType: FailureType.ONE_RESERVED,
    notes: '',
    type,
  }],
});

const session = (
  id: string,
  date: string,
  exercises: ExerciseLog[]
): WorkoutSession => ({
  id,
  routineTemplateId: 'routine-1',
  workoutTemplateId: 'workout-1',
  exercises,
  date: new Date(date),
});

describe('workoutProgress', () => {
  it('compares cluster total reps using the normal progression rules', () => {
    const previousExercise = exercise('A', 60, SetType.ClusterSet);
    previousExercise.sets[0] = { ...previousExercise.sets[0], reps: 9, clusterBlocks: [4, 3, 2] };
    const currentExercise = exercise('A', 60, SetType.ClusterSet);
    currentExercise.sets[0] = { ...currentExercise.sets[0], reps: 12, clusterBlocks: [4, 4, 4] };
    const previous = session('previous', '2026-07-01', [previousExercise]);
    const current = session('current', '2026-07-08', [currentExercise]);
    expect(calculatePositionComparisons(current, previous, null)[0].sets[0].status).toBe('evolution');
    currentExercise.sets[0].reps = 9;
    expect(calculatePositionComparisons(current, previous, null)[0].sets[0].status).toBe('stagnation');
    currentExercise.sets[0].reps = 6;
    expect(calculatePositionComparisons(current, previous, null)[0].sets[0].status).toBe('involution');
  });
  it('compares strictly by position and continues after a different exercise', () => {
    const previous = session('previous', '2026-07-01', [
      exercise('A', 20),
      exercise('B', 30),
      exercise('C', 40),
    ]);
    const current = session('current', '2026-07-08', [
      exercise('A', 22),
      exercise('X', 35),
      exercise('C', 40),
      exercise('D', 50),
    ]);

    const result = calculatePositionComparisons(current, previous, null);

    expect(result.map(item => item.kind)).toEqual([
      'compared',
      'different',
      'compared',
      'added',
    ]);
    expect(result[0].sets[0].status).toBe('evolution');
    expect(result[2].sets[0].status).toBe('stagnation');
    expect(result[1].current?.exercise.exerciseTemplateId).toBe('X');
    expect(result[1].previous?.exercise.exerciseTemplateId).toBe('B');
  });

  it('does not realign the same exercises when their positions change', () => {
    const previous = session('previous', '2026-07-01', [exercise('A'), exercise('B')]);
    const current = session('current', '2026-07-08', [exercise('B'), exercise('A')]);

    const result = calculatePositionComparisons(current, previous, null);

    expect(result.map(item => item.kind)).toEqual(['different', 'different']);
    expect(result.every(item => item.sets.length === 0)).toBe(true);
  });

  it('marks an exercise that only existed previously as removed', () => {
    const previous = session('previous', '2026-07-01', [exercise('A'), exercise('B')]);
    const current = session('current', '2026-07-08', [exercise('A')]);

    const result = calculatePositionComparisons(current, previous, null);

    expect(result[1].kind).toBe('removed');
    expect(result[1].previous?.exercise.exerciseTemplateId).toBe('B');
  });

  it('shows and compares every logged set type', () => {
    const previous = session('previous', '2026-07-01', [
      exercise('A', 10, SetType.WarmUpSet),
    ]);
    const current = session('current', '2026-07-08', [
      {
        ...exercise('A', 10, SetType.WarmUpSet),
        sets: [
          ...exercise('A', 10, SetType.WarmUpSet).sets,
          ...exercise('A', 30, SetType.TopSet).sets,
        ],
      },
    ]);

    const result = calculatePositionComparisons(current, previous, null);

    expect(result[0].current?.sets).toHaveLength(2);
    expect(result[0].sets).toHaveLength(2);
    expect(result[0].sets[0].current.type).toBe(SetType.WarmUpSet);
    expect(result[0].sets[0].previous).toBeDefined();
    expect(result[0].sets[1].current.type).toBe(SetType.TopSet);
  });

  it('selects only the immediately previous session of the same workout list', () => {
    const oldest = session('oldest', '2026-07-01', []);
    const previous = session('previous', '2026-07-08', []);
    const current = session('current', '2026-07-15', []);

    expect(findImmediatelyPreviousSession(current, [oldest, current, previous])).toBe(previous);
    expect(findImmediatelyPreviousSession(previous, [current, oldest, previous])).toBe(oldest);
  });
});
