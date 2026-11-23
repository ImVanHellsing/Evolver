import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { DayOfWeek } from '../../models/DayOfWeek';
import { MuscleGroup } from '../../models/MuscleGroup';
import { SetType } from '../../models/SetType';
import { WorkoutTemplate } from '../../models/Workout';
import { activeWorkoutSessionRepository } from '../../services/workouts/activeWorkoutSessionRepository';
import { useWorkoutRunner } from './useWorkoutRunner';

jest.mock('../../hooks/useAppNavigation', () => ({
  useAppNavigation: () => ({ addListener: () => () => {} }),
}));
jest.mock('../../hooks/useAppRouteParams', () => ({
  useAppRouteParams: () => ({}),
}));
jest.mock('../../services/workouts/workoutSessionsRepository', () => ({
  workoutSessionsRepository: { list: jest.fn().mockResolvedValue([]) },
}));
jest.mock('../../services/workouts/activeWorkoutSessionRepository', () => ({
  activeWorkoutSessionRepository: { saveActiveSession: jest.fn().mockResolvedValue(undefined) },
}));

const workout: WorkoutTemplate = {
  id: 'workout-test',
  description: 'Teste',
  dayOfWeek: DayOfWeek.MONDAY,
  exercises: ['exercise-1', 'exercise-2'].map(id => ({
    id, name: id, description: '', muscleGroup: MuscleGroup.Chest,
  })),
};

let runner: ReturnType<typeof useWorkoutRunner>;
let renderer: ReactTestRenderer;

function Harness() {
  runner = useWorkoutRunner('routine-test', workout);
  return null;
}

beforeEach(async () => {
  jest.clearAllMocks();
  await act(async () => { renderer = create(<Harness />); });
});

afterEach(async () => {
  await act(async () => { renderer.unmount(); });
});

async function saveSet(type: SetType) {
  await act(async () => {
    runner.selectInitialSetType(type);
    runner.setWeight('26.3');
    runner.setReps('6');
    if (type === SetType.ClusterSet) runner.setClusterBlocks([4, 2]);
  });
  await act(async () => { runner.onSaveSetPressed(); });
}

const finishingTypes = [SetType.BackoffSet, SetType.ClusterSet];

test.each(finishingTypes)('saves %s and completes the exercise before advancing without the sheet', async type => {
  await saveSet(type);
  expect(runner.currentExerciseIndex).toBe(1);
  expect(runner.exercisesState[0].isCompleted).toBe(true);
  expect(runner.isChoosingNextAction).toBe(false);
  expect(runner.isResting).toBe(false);
  expect(runner.hasSelectedInitialSetType).toBe(false);
  const save = jest.mocked(activeWorkoutSessionRepository.saveActiveSession);
  const session = save.mock.calls[save.mock.calls.length - 1][0];
  expect(session.savedWorkoutSession.exercises[0].sets).toEqual([
    expect.objectContaining({ type, weight: 26.3, reps: 6 }),
  ]);
  if (type === SetType.ClusterSet) {
    expect(session.savedWorkoutSession.exercises[0].sets[0].clusterBlocks).toEqual([4, 2]);
  }
  expect(session.completedExerciseIds).toContain('exercise-1');
});

test.each(finishingTypes)('opens the finish flow after the final %s when all exercises are completed', async type => {
  await saveSet(SetType.BackoffSet);
  await saveSet(type);
  expect(runner.isFinishModalVisible).toBe(true);
  expect(runner.isMissingModalVisible).toBe(false);
  expect(runner.isChoosingNextAction).toBe(false);
  expect(runner.loggedSetsForCurrentExercise).toHaveLength(1);
});

test.each(finishingTypes)('still offers pending exercises after completing the final %s', async type => {
  await act(async () => { runner.onSkipExercisePressed(); });
  await saveSet(type);
  expect(runner.isFinishModalVisible).toBe(false);
  expect(runner.isMissingModalVisible).toBe(true);
  expect(runner.missingExercises.map(exercise => exercise.id)).toEqual(['exercise-1']);
  expect(runner.isCurrentExerciseCompleted).toBe(true);
});

test.each([SetType.WarmUpSet, SetType.RampUpSet, SetType.WorkSet, SetType.TopSet])('keeps the next-series sheet for %s', async type => {
  await saveSet(type);
  expect(runner.currentExerciseIndex).toBe(0);
  expect(runner.isCurrentExerciseCompleted).toBe(false);
  expect(runner.isChoosingNextAction).toBe(true);
});
