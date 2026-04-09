import { useEffect, useState, useRef } from 'react';
import { Vibration, Alert } from 'react-native';

import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useAppRouteParams } from '@/hooks/useAppRouteParams';
import { SetType } from '@/models/SetType';
import { WorkoutSession, WorkoutTemplate } from '@/models/Workout';
import { ExerciseLog } from '@/models/Exercise';
import { SetLog } from '@/models/Set';
import { FailureType } from '@/models/FailureType';
import { workoutSessionsRepository } from '@/services/workouts/workoutSessionsRepository';
import { activeWorkoutSessionRepository } from '@/services/workouts/activeWorkoutSessionRepository';
import { getRestTimeTypeSeconds } from '@/models/RestTimeType';
import { routinesRepository } from '@/services/routines/routinesRepository';

export const useWorkoutRunner = (routineTemplateId: string, workout: WorkoutTemplate) => {
  const navigation = useAppNavigation();
  const routeParams = useAppRouteParams<'WorkoutRunner'>();
  const isResuming = routeParams.resume === true;
  const hasRestoredSessionRef = useRef(false);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);

  const [currentWorkout, setCurrentWorkout] = useState<WorkoutTemplate>(workout);

  const currentExercise = currentWorkout.exercises[currentExerciseIndex];
  const currentSet = currentExercise.sets[currentSetIndex];

  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [observation, setObservation] = useState('');
  const [failureType, setFailureType] = useState<FailureType>(FailureType.REMAINING_REPS);
  const [isExitModalVisible, setIsExitModalVisible] = useState<any>(null);
  const [isFinishModalVisible, setIsFinishModalVisible] = useState(false);
  const [isEditDescriptionModalVisible, setIsEditDescriptionModalVisible] = useState(false);

  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');

  const [isResting, setIsResting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [timerEndTime, setTimerEndTime] = useState<number | null>(null);

  const [previousPerformance, setPreviousPerformance] = useState<{ weight: number; reps: number; failureType: FailureType } | null>(null);
  const [personalRecord, setPersonalRecord] = useState<{ weight: number; reps: number } | null>(null);

  const [savedWorkoutSession, setSavedWorkoutSession] = useState<WorkoutSession>({
    id: `workout-sessions-${new Date().toISOString()}`,
    routineTemplateId: routineTemplateId,
    workoutTemplateId: workout.id,
    date: new Date(),
    exercises: [],
  });

  // RESTORE SESSION
  useEffect(() => {
    if (isResuming && !hasRestoredSessionRef.current) {
      const restoreSession = async () => {
        const savedData = await activeWorkoutSessionRepository.getActiveSession();
        if (savedData) {
          setSavedWorkoutSession(savedData.savedWorkoutSession);
          setCurrentExerciseIndex(savedData.currentExerciseIndex);
          setCurrentSetIndex(savedData.currentSetIndex);
          setWeight(savedData.weight);
          setReps(savedData.reps);
          setObservation(savedData.observation);
          setIsResting(savedData.isResting);
          setTimerEndTime(savedData.timerEndTime);
        }
        hasRestoredSessionRef.current = true;
      };
      restoreSession();
    } else {
      hasRestoredSessionRef.current = true;
    }
  }, [isResuming]);

  // SAVE SESSION
  useEffect(() => {
    if (hasRestoredSessionRef.current) {
      activeWorkoutSessionRepository.saveActiveSession({
        routineTemplateId,
        workout,
        savedWorkoutSession,
        currentExerciseIndex,
        currentSetIndex,
        weight,
        reps,
        observation,
        isResting,
        timerEndTime
      });
    }
  }, [
    savedWorkoutSession, 
    currentExerciseIndex, 
    currentSetIndex, 
    weight, 
    reps, 
    observation, 
    isResting, 
    timerEndTime,
    routineTemplateId,
    workout,
    currentExercise.id,
    currentSetIndex
  ]);

  // FETCH HISTORICAL DATA
  useEffect(() => {
    const fetchHistory = async () => {
      const allSessions = await workoutSessionsRepository.list();
      
      // Sort by date desc
      const sortedSessions = allSessions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Previous performance: same exercise, same set index, last occurrence
      const lastSessionWithExercise = sortedSessions.find(session => 
        session.exercises.some(ex => ex.exerciseTemplateId === currentExercise.id)
      );

      if (lastSessionWithExercise) {
        const exerciseLog = lastSessionWithExercise.exercises.find(
          ex => ex.exerciseTemplateId === currentExercise.id
        );
        if (exerciseLog && exerciseLog.sets[currentSetIndex]) {
          const setLog = exerciseLog.sets[currentSetIndex];
          setPreviousPerformance({ weight: setLog.weight, reps: setLog.reps, failureType: setLog.failureType });
        } else {
          setPreviousPerformance(null);
        }
      } else {
        setPreviousPerformance(null);
      }

      // Personal Record: highest weight lifted for this exercise across all sessions
      let maxWeight = 0;
      let maxReps = 0;

      allSessions.forEach(session => {
        session.exercises.forEach(ex => {
          if (ex.exerciseTemplateId === currentExercise.id) {
            ex.sets.forEach(set => {
              if (set.weight > maxWeight || (set.weight === maxWeight && set.reps > maxReps)) {
                maxWeight = set.weight;
                maxReps = set.reps;
              }
            });
          }
        });
      });

      if (maxWeight > 0) {
        setPersonalRecord({ weight: maxWeight, reps: maxReps });
      } else {
        setPersonalRecord(null);
      }
    };

    fetchHistory();
  }, [currentExercise.id, currentSetIndex]);

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

  const getNextSetRestTime = () => {
    if (handleHasNextSet()) {
      return currentExercise.sets[currentSetIndex + 1].restTime;
    } else if (handleHasNextExercise()) {
      return workout.exercises[currentExerciseIndex + 1].sets[0].restTime;
    }
    return undefined;
  }

  const startRestTimer = () => {
    const nextRestTime = getNextSetRestTime();
    const restSeconds = getRestTimeTypeSeconds(nextRestTime);

    if (restSeconds > 0) {
      setTimerEndTime(Date.now() + restSeconds * 1000);
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
    if (isResting && timerEndTime) {
      timer = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((timerEndTime - Date.now()) / 1000));
        setSecondsLeft(remaining);

        if (remaining === 0) {
          Vibration.vibrate([0, 1000, 200, 1000, 200, 1000]);
          setIsResting(false);
          setTimerEndTime(null);
          goToNextSet();
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isResting, timerEndTime]);

  const onEndPressed = () => {
    navigation.goBack();
  }

  const onConfirmExit = async () => {
    await activeWorkoutSessionRepository.clearActiveSession();
    setIsExitModalVisible(false);
    navigation.dispatch(isExitModalVisible as any);
  }

  const onCancelExit = () => {
    setIsExitModalVisible(false);
  }

  const onEditDescriptionPressed = () => {
    setIsEditDescriptionModalVisible(true);
  }

  const handleSaveDescription = async (newDescription: string) => {
    try {
      const routine = await routinesRepository.getById(routineTemplateId);
      if (!routine) return;

      const workoutIndex = routine.workouts.findIndex(w => w.id === currentWorkout.id);
      if (workoutIndex === -1) return;

      const exerciseIndex = routine.workouts[workoutIndex].exercises.findIndex(e => e.id === currentExercise.id);
      if (exerciseIndex === -1) return;

      // Update the description in repository
      routine.workouts[workoutIndex].exercises[exerciseIndex].description = newDescription;
      await routinesRepository.save(routine);

      // Update local state to reflect changes instantly
      setCurrentWorkout(routine.workouts[workoutIndex]);

      setIsEditDescriptionModalVisible(false);
    } catch (error) {
      console.error('Error saving description:', error);
      Alert.alert('Erro', 'Ocorreu um problema ao tentar salvar a observação.');
    }
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
    await activeWorkoutSessionRepository.clearActiveSession();

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
    skipRest,
    isEditDescriptionModalVisible,
    onEditDescriptionPressed,
    handleSaveDescription,
    onCancelEditDescription: () => setIsEditDescriptionModalVisible(false),
    previousPerformance,
    personalRecord,
  };
}
