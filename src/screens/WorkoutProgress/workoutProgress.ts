import { ExerciseLog } from '@/models/Exercise';
import { FAILURE_TYPE_PRIORITY } from '@/models/FailureType';
import { RoutineTemplate } from '@/models/Routine';
import { SetLog } from '@/models/Set';
import { SetType } from '@/models/SetType';
import { WorkoutSession } from '@/models/Workout';

export type ProgressionStatus = 'evolution' | 'stagnation' | 'involution';

export interface SetComparison {
  current: SetLog;
  previous?: SetLog;
  status: ProgressionStatus;
}

export interface ExerciseRecord {
  exercise: ExerciseLog;
  name: string;
  sets: SetLog[];
}

export interface PositionComparison {
  position: number;
  kind: 'compared' | 'different' | 'added' | 'removed';
  current?: ExerciseRecord;
  previous?: ExerciseRecord;
  sets: SetComparison[];
}

export const isProgressionSet = (set: SetLog) =>
  set.type === SetType.WorkSet || set.type === SetType.TopSet;

export const getExerciseName = (
  exerciseLog: ExerciseLog,
  routine: RoutineTemplate | null
) => {
  if (exerciseLog.exerciseNameSnapshot) return exerciseLog.exerciseNameSnapshot;

  for (const workout of routine?.workouts ?? []) {
    const exercise = workout.exercises.find(item => item.id === exerciseLog.exerciseTemplateId);
    if (exercise) return exercise.name;
  }
  return 'Exercício desconhecido';
};

const toExerciseRecord = (
  exercise: ExerciseLog,
  routine: RoutineTemplate | null
): ExerciseRecord => ({
  exercise,
  name: getExerciseName(exercise, routine),
  sets: exercise.sets.filter(isProgressionSet),
});

const compareSets = (
  currentExercise: ExerciseLog,
  previousExercise: ExerciseLog
): SetComparison[] => {
  const validCurrentSets = currentExercise.sets.filter(isProgressionSet);
  const validPreviousSets = previousExercise.sets.filter(isProgressionSet);

  return validCurrentSets.map(currentSet => {
    const currentSetsOfType = validCurrentSets.filter(set => set.type === currentSet.type);
    const indexInType = currentSetsOfType.indexOf(currentSet);
    const previousSet = validPreviousSets.filter(set => set.type === currentSet.type)[indexInType];
    let status: ProgressionStatus = 'stagnation';

    if (previousSet) {
      const currentPriority = FAILURE_TYPE_PRIORITY[currentSet.failureType] ?? -1;
      const previousPriority = FAILURE_TYPE_PRIORITY[previousSet.failureType] ?? -1;

      if (currentSet.weight > previousSet.weight) {
        status = 'evolution';
      } else if (currentSet.weight < previousSet.weight) {
        status = 'involution';
      } else if (currentSet.reps > previousSet.reps) {
        status = 'evolution';
      } else if (currentSet.reps < previousSet.reps) {
        status = 'involution';
      } else if (currentPriority > previousPriority) {
        status = 'evolution';
      } else if (currentPriority < previousPriority) {
        status = 'involution';
      }
    }

    return { current: currentSet, previous: previousSet, status };
  });
};

export const calculatePositionComparisons = (
  currentSession: WorkoutSession,
  previousSession: WorkoutSession,
  routine: RoutineTemplate | null
): PositionComparison[] => {
  const amountOfPositions = Math.max(
    currentSession.exercises.length,
    previousSession.exercises.length
  );

  return Array.from({ length: amountOfPositions }, (_, index) => {
    const currentExercise = currentSession.exercises[index];
    const previousExercise = previousSession.exercises[index];
    const current = currentExercise
      ? toExerciseRecord(currentExercise, routine)
      : undefined;
    const previous = previousExercise
      ? toExerciseRecord(previousExercise, routine)
      : undefined;

    if (!previousExercise) {
      return { position: index + 1, kind: 'added', current, sets: [] };
    }

    if (!currentExercise) {
      return { position: index + 1, kind: 'removed', previous, sets: [] };
    }

    if (currentExercise.exerciseTemplateId !== previousExercise.exerciseTemplateId) {
      return { position: index + 1, kind: 'different', current, previous, sets: [] };
    }

    return {
      position: index + 1,
      kind: 'compared',
      current,
      previous,
      sets: compareSets(currentExercise, previousExercise),
    };
  });
};

const getSessionTimestamp = (session: WorkoutSession) => {
  const rawDate = session.completedAt ?? session.startedAt ?? session.date;
  return new Date(rawDate).getTime();
};

export const findImmediatelyPreviousSession = (
  session: WorkoutSession,
  sessionsFromSameWorkout: WorkoutSession[]
): WorkoutSession | null => {
  const sortedSessions = [...sessionsFromSameWorkout].sort(
    (a, b) => getSessionTimestamp(b) - getSessionTimestamp(a)
  );
  const currentIndex = sortedSessions.findIndex(item => item.id === session.id);

  if (currentIndex >= 0) return sortedSessions[currentIndex + 1] ?? null;

  const currentTimestamp = getSessionTimestamp(session);
  return sortedSessions.find(item => getSessionTimestamp(item) < currentTimestamp) ?? null;
};
