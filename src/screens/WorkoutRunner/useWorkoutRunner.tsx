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
import { routinesRepository } from '@/services/routines/routinesRepository';
import { getIntelligentRestTime } from '@/utils/timerUtils';

export const useWorkoutRunner = (routineTemplateId: string, workout: WorkoutTemplate) => {
  const navigation = useAppNavigation();
  const routeParams = useAppRouteParams<'WorkoutRunner'>();
  const isResuming = routeParams.resume === true;
  const hasRestoredSessionRef = useRef(false);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutTemplate>(workout);

  const currentExercise = currentWorkout.exercises[currentExerciseIndex];

  // Evolver 2.0: selected set type to log
  const [selectedSetType, setSelectedSetType] = useState<SetType>(SetType.WarmUpSet);

  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [observation, setObservation] = useState('');
  const [failureType, setFailureType] = useState<FailureType>(FailureType.REMAINING_REPS);
  const [isExitModalVisible, setIsExitModalVisible] = useState<any>(null);
  
  // Finish workout flow
  const [isFinishModalVisible, setIsFinishModalVisible] = useState(false);
  const [isMissingModalVisible, setIsMissingModalVisible] = useState(false);
  const [isEditDescriptionModalVisible, setIsEditDescriptionModalVisible] = useState(false);

  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');

  const [isResting, setIsResting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [timerEndTime, setTimerEndTime] = useState<number | null>(null);

  const [previousPerformance, setPreviousPerformance] = useState<{ weight: number; reps: number; failureType: FailureType } | null>(null);
  const [personalRecord, setPersonalRecord] = useState<{ weight: number; reps: number } | null>(null);

  // Evolver 2.0: Tracking skipped exercises explicitly
  const [skippedExerciseIds, setSkippedExerciseIds] = useState<string[]>([]);

  const [savedWorkoutSession, setSavedWorkoutSession] = useState<WorkoutSession>({
    id: `workout-sessions-${new Date().toISOString()}`,
    routineTemplateId: routineTemplateId,
    workoutTemplateId: workout.id,
    date: new Date(),
    exercises: [],
  });

  const loggedSetsForCurrentExercise = savedWorkoutSession.exercises.find(
    ex => ex.exerciseTemplateId === currentExercise.id
  )?.sets || [];

  // Suggest next set type automatically based on current logged sets
  const suggestNextSetType = (loggedSets: SetLog[]) => {
    if (loggedSets.length === 0) {
      setSelectedSetType(SetType.WarmUpSet);
      return;
    }
    const lastSet = loggedSets[loggedSets.length - 1];
    if (lastSet.type === SetType.WarmUpSet) {
      const warmupCount = loggedSets.filter(s => s.type === SetType.WarmUpSet).length;
      setSelectedSetType(warmupCount >= 2 ? SetType.RampUpSet : SetType.WarmUpSet);
    } else if (lastSet.type === SetType.RampUpSet) {
      setSelectedSetType(SetType.WorkSet);
    } else if (lastSet.type === SetType.WorkSet) {
      const workCount = loggedSets.filter(s => s.type === SetType.WorkSet).length;
      setSelectedSetType(workCount >= 2 ? SetType.TopSet : SetType.WorkSet);
    } else if (lastSet.type === SetType.TopSet) {
      setSelectedSetType(SetType.BackoffSet);
    } else if (lastSet.type === SetType.BackoffSet) {
      setSelectedSetType(SetType.BackoffSet);
    }
  };

  // RESTORE SESSION
  useEffect(() => {
    if (isResuming && !hasRestoredSessionRef.current) {
      const restoreSession = async () => {
        const savedData = await activeWorkoutSessionRepository.getActiveSession();
        if (savedData) {
          setSavedWorkoutSession(savedData.savedWorkoutSession);
          setCurrentExerciseIndex(savedData.currentExerciseIndex);
          setWeight(savedData.weight);
          setReps(savedData.reps);
          setObservation(savedData.observation);
          setIsResting(savedData.isResting);
          setTimerEndTime(savedData.timerEndTime);
          
          if ((savedData as any).skippedExerciseIds) {
            setSkippedExerciseIds((savedData as any).skippedExerciseIds);
          }
          if ((savedData as any).selectedSetType) {
            setSelectedSetType((savedData as any).selectedSetType);
          }
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
        currentSetIndex: loggedSetsForCurrentExercise.length,
        weight,
        reps,
        observation,
        isResting,
        timerEndTime,
        skippedExerciseIds,
        selectedSetType
      } as any);
    }
  }, [
    savedWorkoutSession, 
    currentExerciseIndex, 
    weight, 
    reps, 
    observation, 
    isResting, 
    timerEndTime,
    routineTemplateId,
    workout,
    skippedExerciseIds,
    selectedSetType,
    loggedSetsForCurrentExercise.length
  ]);

  // FETCH HISTORICAL DATA
  useEffect(() => {
    const fetchHistory = async () => {
      const allSessions = await workoutSessionsRepository.list();
      
      // Sort by date desc
      const sortedSessions = allSessions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Previous performance: same exercise, same set type and index-in-type, last occurrence
      const lastSessionWithExercise = sortedSessions.find(session => 
        session.exercises.some(ex => ex.exerciseTemplateId === currentExercise.id)
      );

      if (lastSessionWithExercise) {
        const exerciseLog = lastSessionWithExercise.exercises.find(
          ex => ex.exerciseTemplateId === currentExercise.id
        );
        if (exerciseLog) {
          const currentSetsOfType = loggedSetsForCurrentExercise.filter(s => s.type === selectedSetType);
          const currentSetIndexInType = currentSetsOfType.length;
          
          const prevSetsOfType = exerciseLog.sets.filter(s => s.type === selectedSetType);
          const prevSet = prevSetsOfType[currentSetIndexInType];

          if (prevSet) {
            setPreviousPerformance({ weight: prevSet.weight, reps: prevSet.reps, failureType: prevSet.failureType });
          } else {
            // Fallback to first set of this type
            setPreviousPerformance(prevSetsOfType[0] ? { weight: prevSetsOfType[0].weight, reps: prevSetsOfType[0].reps, failureType: prevSetsOfType[0].failureType } : null);
          }
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
  }, [currentExercise.id, selectedSetType, loggedSetsForCurrentExercise.length]);

  const clearSetForm = () => {
    setWeight('');
    setReps('');
    setObservation('');
    setFailureType(FailureType.REMAINING_REPS);
  }

  const handleTriggerFinishFlow = () => {
    // Check if there are exercises with no logged sets
    const uncompleted = currentWorkout.exercises.filter(ex => {
      const sets = savedWorkoutSession.exercises.find(e => e.exerciseTemplateId === ex.id)?.sets || [];
      return sets.length === 0;
    });

    if (uncompleted.length > 0) {
      setIsMissingModalVisible(true);
    } else {
      setIsFinishModalVisible(true);
    }
  }

  const startRestTimer = () => {
    const restSeconds = getIntelligentRestTime(
      currentExercise.name,
      currentExercise.muscleGroup,
      selectedSetType
    );

    if (restSeconds > 0) {
      setTimerEndTime(Date.now() + restSeconds * 1000);
      setSecondsLeft(restSeconds);
      setIsResting(true);
    }
  }

  const skipRest = () => {
    setIsResting(false);
    setSecondsLeft(0);
    setTimerEndTime(null);
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isFinishModalVisible || isMissingModalVisible) {
        return;
      }

      e.preventDefault();
      setIsExitModalVisible(e.data.action);
    });

    return unsubscribe;
  }, [navigation, isFinishModalVisible, isMissingModalVisible]);

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
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isResting, timerEndTime]);

  const onEndPressed = () => {
    handleTriggerFinishFlow();
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
      type: selectedSetType,
      weight: Number(weight),
      reps: Number(reps),
      failureType,
      notes: observation,
    };

    // Remove current exercise from skipped list if it was there
    if (skippedExerciseIds.includes(currentExercise.id)) {
      setSkippedExerciseIds(prev => prev.filter(id => id !== currentExercise.id));
    }

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

        const updatedSession = { ...prev, exercises: nextExercisesLog };
        
        // Auto-suggest next set type based on the newly saved sets
        suggestNextSetType(updatedExerciseLog.sets);
        
        return updatedSession;
      }

      // Add new exercise log holding the set
      const newExerciseLog: ExerciseLog = {
        exerciseTemplateId: currentExercise.id,
        notes: observation,
        sets: [newSetLog],
      };

      const updatedSession = { ...prev, exercises: [...prev.exercises, newExerciseLog] };
      
      // Auto-suggest next set type based on the newly saved sets
      suggestNextSetType(newExerciseLog.sets);

      return updatedSession;
    });
  }

  const onSaveSetPressed = () => {
    handleSaveNewSet();
    startRestTimer();
    clearSetForm();
  }

  const exText = `Exercício ${currentExerciseIndex + 1}/${workout.exercises.length}`;
  const setText = `Série ${loggedSetsForCurrentExercise.length + 1}`;
  const hint = `${exText} • ${setText}`;

  const shouldShowObservationField = selectedSetType === SetType.TopSet || selectedSetType === SetType.WorkSet;

  // Horizontal list of exercises and their statuses
  const exercisesState = currentWorkout.exercises.map(ex => {
    const loggedSets = savedWorkoutSession.exercises.find(e => e.exerciseTemplateId === ex.id)?.sets || [];
    const isCompleted = loggedSets.length > 0;
    const isSkipped = skippedExerciseIds.includes(ex.id);
    return {
      id: ex.id,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      isCompleted,
      isSkipped,
      loggedSetsCount: loggedSets.length,
    };
  });

  const goToExercise = (index: number) => {
    if (index >= 0 && index < currentWorkout.exercises.length) {
      setCurrentExerciseIndex(index);
      clearSetForm();
      const existingSets = savedWorkoutSession.exercises.find(
        ex => ex.exerciseTemplateId === currentWorkout.exercises[index].id
      )?.sets || [];
      suggestNextSetType(existingSets);
    }
  };

  const onSkipExercisePressed = () => {
    const loggedSets = savedWorkoutSession.exercises.find(
      ex => ex.exerciseTemplateId === currentExercise.id
    )?.sets || [];
    
    if (loggedSets.length === 0) {
      setSkippedExerciseIds(prev => [...new Set([...prev, currentExercise.id])]);
    }
    
    if (currentExerciseIndex < currentWorkout.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      clearSetForm();
    } else {
      handleTriggerFinishFlow();
    }
  };

  const onPrevExercisePressed = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
      clearSetForm();
    }
  };

  const onNextExercisePressed = () => {
    if (currentExerciseIndex < currentWorkout.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      clearSetForm();
    } else {
      handleTriggerFinishFlow();
    }
  };

  const uncompletedExercises = currentWorkout.exercises.filter(ex => {
    const sets = savedWorkoutSession.exercises.find(e => e.exerciseTemplateId === ex.id)?.sets || [];
    return sets.length === 0;
  });
  const missingExerciseNames = uncompletedExercises.map(ex => ex.name);

  return {
    currentExerciseIndex,
    weight,
    setWeight,
    reps,
    setReps,
    observation,
    setObservation,
    failureType,
    setFailureType,
    selectedSetType,
    setSelectedSetType,
    hint,
    onEndPressed,
    onSaveSetPressed,
    isExitModalVisible: !!isExitModalVisible,
    onConfirmExit,
    onCancelExit,
    currentExercise,
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

    // Evolver 2.0 properties
    exercisesState,
    loggedSetsForCurrentExercise,
    goToExercise,
    onSkipExercisePressed,
    onPrevExercisePressed,
    onNextExercisePressed,
    isMissingModalVisible,
    setIsMissingModalVisible,
    missingExerciseNames,
    onConfirmMissingExercises: () => {
      setIsMissingModalVisible(false);
      setIsFinishModalVisible(true);
    },
  };
}
