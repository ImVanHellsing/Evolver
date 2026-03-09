import { useEffect, useState } from 'react';

import { useAppNavigation } from '@/hooks/useAppNavigation';
import { SetType } from '@/models/SetType';
import { WorkoutSession, WorkoutTemplate } from '@/models/Workout';
import { ExerciseLog } from '@/models/Exercise';
import { SetLog } from '@/models/Set';
import { FailureType } from '@/models/FailureType';
import { workoutSessionsRepository } from '@/services/workouts/workoutSessionsRepository';
import { getRestTimeTypeSeconds } from '@/models/RestTimeType';

export const useWorkoutRunner = (routineTemplateId: string, workout: WorkoutTemplate) => {
  const navigation = useAppNavigation();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);

  const currentExercise = workout.exercises[currentExerciseIndex];
  const currentSet = currentExercise.sets[currentSetIndex];

  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [observation, setObservation] = useState('');
  const [failureType, setFailureType] = useState<FailureType>(FailureType.REMAINING_REPS);
  const [isExitModalVisible, setIsExitModalVisible] = useState<any>(null);
  const [isFinishModalVisible, setIsFinishModalVisible] = useState(false);

  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');

  const [isResting, setIsResting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const [savedWorkoutSession, setSavedWorkoutSession] = useState<WorkoutSession>({
    id: `workout-sessions-${new Date().toISOString()}`,
    routineTemplateId: routineTemplateId,
    workoutTemplateId: workout.id,
    date: new Date(),
    exercises: [],
  });

  const clearSetForm = () => {
    setWeight('');
    setReps('');
    setObservation('');
    setFailureType(FailureType.REMAINING_REPS);
  }

  const goToNextExercise = () => {
    setCurrentSetIndex(0);
    setCurrentExerciseIndex(prev => prev + 1);
  }

  const handleHasNextSet = () => {
    return currentSetIndex < currentExercise.sets.length - 1;
  }

  const handleHasNextExercise = () => {
    return currentExerciseIndex < workout.exercises.length - 1;
  }

  const goToNextSet = () => {
    if (handleHasNextSet()) {
      setCurrentSetIndex(prev => prev + 1);
    } else if (handleHasNextExercise()) {
      goToNextExercise();
    } else {
      setIsFinishModalVisible(true);
    }
  }

  const startRestTimer = () => {
    const restSeconds = getRestTimeTypeSeconds(currentSet.restTime);
    console.log(restSeconds);
    if (restSeconds > 0) {
      setSecondsLeft(restSeconds);
      setIsResting(true);
    } else {
      goToNextSet();
    }
  }

  const skipRest = () => {
    setIsResting(false);
    setSecondsLeft(0);
    goToNextSet();
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isFinishModalVisible) {
        return;
      }

      e.preventDefault();
      setIsExitModalVisible(e.data.action);
    });

    return unsubscribe;
  }, [navigation, isFinishModalVisible]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isResting && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (isResting && secondsLeft === 0) {
      setIsResting(false);
      goToNextSet();
    }
    return () => clearInterval(timer);

  }, [isResting, secondsLeft]);

  const onEndPressed = () => {
    navigation.goBack();
  }

  const onConfirmExit = () => {
    setIsExitModalVisible(false);
    navigation.dispatch(isExitModalVisible as any);
  }

  const onCancelExit = () => {
    setIsExitModalVisible(false);
  }

  const onFinishWorkout = async () => {
    const finalWorkoutSession: WorkoutSession = {
      ...savedWorkoutSession,
      duration: Number(duration),
      caloriesEstimated: Number(calories),
    };

    console.log('--- TREINO FINALIZADO ---');
    console.log(JSON.stringify(finalWorkoutSession, null, 2));
    console.log('-------------------------');

    await workoutSessionsRepository.save(finalWorkoutSession);

    setIsFinishModalVisible(false);
    navigation.goBack();
  }

  const handleSaveNewSet = () => {
    const newSetLog: SetLog = {
      id: Date.now().toString(),
      templateSetId: currentSet.id,
      type: currentSet.type,
      weight: Number(weight),
      reps: Number(reps),
      failureType,
      notes: observation,
    };

    setSavedWorkoutSession(prev => {
      const existingIndex = prev.exercises.findIndex(
        ex => ex.exerciseTemplateId === currentExercise.id
      );

      // Update current exercise log with a new set
      if (existingIndex >= 0) {
        const updatedExerciseLog: ExerciseLog = {
          ...prev.exercises[existingIndex],
          sets: [...prev.exercises[existingIndex].sets, newSetLog],
        };

        const nextExercisesLog = [...prev.exercises];
        nextExercisesLog[existingIndex] = updatedExerciseLog;

        return { ...prev, exercises: nextExercisesLog };
      }

      // Add new exercise log holding the old one
      const newExerciseLog: ExerciseLog = {
        exerciseTemplateId: currentExercise.id,
        notes: observation,
        sets: [newSetLog],
      };

      return { ...prev, exercises: [...prev.exercises, newExerciseLog] };

    });
  }

  const onSaveSetPressed = () => {
    handleSaveNewSet();
    startRestTimer();
    clearSetForm();
  }

  const exText = `Exercício ${currentExerciseIndex + 1}/${workout.exercises.length}`;
  const setText = `Série ${currentSetIndex + 1}/${workout.exercises[currentExerciseIndex].sets.length}`;
  const hint = `${exText} • ${setText}`;

  const shouldShowObservationField = currentSet.type === SetType.TopSet || currentSet.type === SetType.WorkSet

  return {
    currentExerciseIndex,
    currentSetIndex,
    weight,
    setWeight,
    reps,
    setReps,
    observation,
    setObservation,
    failureType,
    setFailureType,
    hint,
    onEndPressed,
    onSaveSetPressed,
    isExitModalVisible: !!isExitModalVisible,
    onConfirmExit,
    onCancelExit,
    currentExercise,
    currentSet,
    shouldShowObservationField,
    isFinishModalVisible,
    duration,
    setDuration,
    calories,
    setCalories,
    onFinishWorkout,
    isResting,
    secondsLeft,
    skipRest
  };
}
