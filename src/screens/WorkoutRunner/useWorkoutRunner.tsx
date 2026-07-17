import { useEffect, useMemo, useRef, useState } from 'react';
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
import { getIntelligentRestTime, getNextSetType } from '@/utils/timerUtils';
import { createEntityId } from '@/utils/idUtils';

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
  const [personalRecord, setPersonalRecord] = useState<{
    weight: number;
    reps: number;
    failureType?: FailureType;
    type?: SetType;
    date?: string;
  } | null>(null);

  // Evolver 2.0: Tracking skipped exercises explicitly
  const [skippedExerciseIds, setSkippedExerciseIds] = useState<string[]>([]);

  // Dynamic rest time states
  const [lastCompletedSetType, setLastCompletedSetType] = useState<SetType | null>(null);
  const [lastCompletedSetTime, setLastCompletedSetTime] = useState<number | null>(null);
  const [lastLoggedWeight, setLastLoggedWeight] = useState<number | null>(null);
  const [lastLoggedReps, setLastLoggedReps] = useState<number | null>(null);

  // Modal UX states
  const [hasSelectedInitialSetType, setHasSelectedInitialSetType] = useState(false);
  const [isChoosingNextAction, setIsChoosingNextAction] = useState(false);

  const [savedWorkoutSession, setSavedWorkoutSession] = useState<WorkoutSession>(() => {
    const startedAt = new Date().toISOString();
    return {
      id: createEntityId('session'),
      routineTemplateId,
      workoutTemplateId: workout.id,
      workoutDescriptionSnapshot: workout.description,
      workoutDayOfWeekSnapshot: workout.dayOfWeek,
      startedAt,
      schemaVersion: 2,
      date: new Date(startedAt),
      exercises: [],
    };
  });

  const loggedSetsForCurrentExercise = useMemo(
    () => savedWorkoutSession.exercises.find(
      ex => ex.exerciseTemplateId === currentExercise?.id
    )?.sets || [],
    [currentExercise?.id, savedWorkoutSession.exercises]
  );

  // Suggest next set type automatically based on current logged sets
  const suggestNextSetType = (loggedSets: SetLog[]) => {
    setSelectedSetType(getNextSetType(loggedSets));
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
          
          if (savedData.skippedExerciseIds) {
            setSkippedExerciseIds(savedData.skippedExerciseIds);
          }
          if (savedData.selectedSetType) {
            setSelectedSetType(savedData.selectedSetType);
          }
          if (savedData.lastCompletedSetType) {
            setLastCompletedSetType(savedData.lastCompletedSetType);
          }
          if (savedData.lastCompletedSetTime) {
            setLastCompletedSetTime(savedData.lastCompletedSetTime);
          }
          if (savedData.lastLoggedWeight !== undefined) {
            setLastLoggedWeight(savedData.lastLoggedWeight);
          }
          if (savedData.lastLoggedReps !== undefined) {
            setLastLoggedReps(savedData.lastLoggedReps);
          }
          if (savedData.hasSelectedInitialSetType !== undefined) {
            setHasSelectedInitialSetType(savedData.hasSelectedInitialSetType);
          }
          if (savedData.isChoosingNextAction !== undefined) {
            setIsChoosingNextAction(savedData.isChoosingNextAction);
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
        selectedSetType,
        lastCompletedSetType,
        lastCompletedSetTime,
        lastLoggedWeight,
        lastLoggedReps,
        hasSelectedInitialSetType,
        isChoosingNextAction
      });
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
    lastCompletedSetType,
    lastCompletedSetTime,
    lastLoggedWeight,
    lastLoggedReps,
    hasSelectedInitialSetType,
    isChoosingNextAction,
    loggedSetsForCurrentExercise.length
  ]);

  // FETCH HISTORICAL DATA
  useEffect(() => {
    if (!currentExercise) return;
    const fetchHistory = async () => {
      const allSessions = await workoutSessionsRepository.list();
      
      // Sort by date desc
      const sortedSessions = [...allSessions].sort((a, b) =>
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

      // Personal Record: highest intensity set from the most recent session
      const lastSessionWithPR = sortedSessions.find(session => {
        const ex = session.exercises.find(e => e.exerciseTemplateId === currentExercise.id);
        return ex && ex.sets.length > 0;
      });

      if (lastSessionWithPR) {
        const exerciseLog = lastSessionWithPR.exercises.find(
          ex => ex.exerciseTemplateId === currentExercise.id
        );
        if (exerciseLog && exerciseLog.sets.length > 0) {
          const topSets = exerciseLog.sets.filter(s => s.type === SetType.TopSet);
          let prSet: SetLog;
          if (topSets.length > 0) {
            // Top Set has priority. Multiple Top Sets are invalid in normal use;
            // if legacy data contains them, the last one performed wins.
            prSet = topSets[topSets.length - 1];
          } else {
            // Priority 2: Highest weight. If tie, take the last one logged (using reduce)
            prSet = exerciseLog.sets.reduce((max, s) => {
              if (s.weight > max.weight) return s;
              if (s.weight === max.weight) return s; // last one logged
              return max;
            }, exerciseLog.sets[0]);
          }

          setPersonalRecord({
            weight: prSet.weight,
            reps: prSet.reps,
            failureType: prSet.failureType,
            type: prSet.type,
            date: new Date(lastSessionWithPR.date).toLocaleDateString('pt-BR'),
          });
        } else {
          setPersonalRecord(null);
        }
      } else {
        setPersonalRecord(null);
      }
    };

    fetchHistory();
  }, [currentExercise, loggedSetsForCurrentExercise, selectedSetType]);

  // Reset exercise-specific guided states when navigation occurs
  useEffect(() => {
    setHasSelectedInitialSetType(false);
    setIsChoosingNextAction(false);
  }, [currentExerciseIndex]);

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

  const skipRest = () => {
    setIsResting(false);
    setSecondsLeft(0);
    setTimerEndTime(null);
    setLastCompletedSetType(null);
    setLastCompletedSetTime(null);
  }

  // Dynamically update rest time when next set type changes during rest
  useEffect(() => {
    if (isResting && lastCompletedSetTime && lastCompletedSetType && currentExercise) {
      const elapsedSeconds = Math.floor((Date.now() - lastCompletedSetTime) / 1000);
      const totalRestSeconds = getIntelligentRestTime(
        currentExercise.name,
        currentExercise.muscleGroup,
        lastCompletedSetType,
        selectedSetType
      );
      const remaining = Math.max(0, totalRestSeconds - elapsedSeconds);

      if (remaining > 0) {
        setSecondsLeft(remaining);
        setTimerEndTime(Date.now() + remaining * 1000);
      } else {
        setIsResting(false);
        setSecondsLeft(0);
        setTimerEndTime(null);
        setLastCompletedSetType(null);
        setLastCompletedSetTime(null);
      }
    }
  }, [
    currentExercise,
    isResting,
    lastCompletedSetTime,
    lastCompletedSetType,
    selectedSetType,
  ]);

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
      if (!currentExercise) return;
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
    const routine = await routinesRepository.getById(routineTemplateId);
    const finalWorkoutSession: WorkoutSession = {
      ...savedWorkoutSession,
      routineNameSnapshot: routine?.name ?? savedWorkoutSession.routineNameSnapshot,
      workoutDescriptionSnapshot: currentWorkout.description,
      workoutDayOfWeekSnapshot: currentWorkout.dayOfWeek,
      completedAt: new Date().toISOString(),
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
    if (!currentExercise) return;
    const completedType = selectedSetType;
    const completedAt = new Date().toISOString();
    const parsedWeight = Number(weight.replace(',', '.'));
    const newSetLog: SetLog = {
      id: createEntityId('set_log'),
      completedAt,
      type: completedType,
      weight: parsedWeight,
      reps: Number.parseInt(reps, 10),
      failureType,
      notes: observation,
    };

    setLastCompletedSetType(completedType);
    setLastCompletedSetTime(Date.now());
    setLastLoggedWeight(parsedWeight);
    setLastLoggedReps(Number(reps));

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

        return { ...prev, exercises: nextExercisesLog };
      }

      // Add new exercise log holding the set
      const newExerciseLog: ExerciseLog = {
        id: createEntityId('exercise_log'),
        exerciseTemplateId: currentExercise.id,
        exerciseNameSnapshot: currentExercise.name,
        notes: observation,
        sets: [newSetLog],
      };

      return { ...prev, exercises: [...prev.exercises, newExerciseLog] };
    });

    setIsChoosingNextAction(true);
  }

  const onChooseNextAction = (actionType: 'set' | 'finish', nextType?: SetType) => {
    if (actionType === 'set' && nextType) {
      setSelectedSetType(nextType);
      setIsChoosingNextAction(false);

      // Start the rest timer using transition from lastCompletedSetType to nextType
      if (lastCompletedSetType && currentExercise) {
        const now = Date.now();
        setLastCompletedSetTime(now);

        const restSeconds = getIntelligentRestTime(
          currentExercise.name,
          currentExercise.muscleGroup,
          lastCompletedSetType,
          nextType
        );

        if (restSeconds > 0) {
          setTimerEndTime(now + restSeconds * 1000);
          setSecondsLeft(restSeconds);
          setIsResting(true);
        }
      }
    } else if (actionType === 'finish') {
      setIsChoosingNextAction(false);
      onNextExercisePressed();
    }
  };

  const selectInitialSetType = (type: SetType) => {
    setSelectedSetType(type);
    setHasSelectedInitialSetType(true);
  };

  const onSaveSetPressed = () => {
    handleSaveNewSet();
    // Keep the latest load ready for the next set of this exercise.
    setReps('');
    setObservation('');
    setFailureType(FailureType.REMAINING_REPS);
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
    if (!currentExercise) return;
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

    // Guided UX properties
    hasSelectedInitialSetType,
    setHasSelectedInitialSetType,
    selectInitialSetType,
    isChoosingNextAction,
    setIsChoosingNextAction,
    lastLoggedWeight,
    lastLoggedReps,
    lastCompletedSetType,
    onChooseNextAction,
    getNextSetType,
  };
}
