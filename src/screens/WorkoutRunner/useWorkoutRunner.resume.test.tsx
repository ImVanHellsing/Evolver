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
  useAppRouteParams: () => ({ resume: true }),
}));
jest.mock('../../services/workouts/workoutSessionsRepository', () => ({
  workoutSessionsRepository: { list: jest.fn().mockResolvedValue([]) },
}));
jest.mock('../../services/workouts/activeWorkoutSessionRepository', () => ({
  activeWorkoutSessionRepository: {
    saveActiveSession: jest.fn().mockResolvedValue(undefined),
    getActiveSession: jest.fn(),
  },
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

afterEach(async () => {
  await act(async () => { renderer.unmount(); });
});

test('keeps the guided state when resuming on an exercise other than the first', async () => {
  jest.mocked(activeWorkoutSessionRepository.getActiveSession).mockResolvedValue({
    routineTemplateId: 'routine-test',
    workout,
    savedWorkoutSession: {
      id: 'session-1',
      routineTemplateId: 'routine-test',
      workoutTemplateId: workout.id,
      exercises: [],
      date: new Date(),
    },
    currentExerciseIndex: 1,
    currentSetIndex: 0,
    weight: '40',
    reps: '',
    observation: '',
    isResting: false,
    timerEndTime: null,
    completedExerciseIds: ['exercise-1'],
    selectedSetType: SetType.WorkSet,
    hasSelectedInitialSetType: true,
    isChoosingNextAction: false,
  });

  await act(async () => { renderer = create(<Harness />); });

  expect(runner.currentExerciseIndex).toBe(1);
  expect(runner.hasSelectedInitialSetType).toBe(true);
  expect(runner.selectedSetType).toBe(SetType.WorkSet);
  expect(runner.weight).toBe('40');

  // A normal navigation afterwards still resets the guided state.
  await act(async () => { runner.onPrevExercisePressed(); });
  expect(runner.hasSelectedInitialSetType).toBe(false);
});
