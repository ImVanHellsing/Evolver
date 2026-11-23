import { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Alert, PanResponder, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { CreateWorkoutModal } from '@/components/CreateWorkoutModal';
import { EditWorkoutModal } from '@/components/EditWorkoutModal';
import { Header } from '@/components/Header';
import { Routes } from '@/app/navigation/routes';
import { useAppRouteParams } from '@/hooks/useAppRouteParams';
import { ExerciseTemplate } from '@/models/Exercise';
import { DayOfWeek, getDayOfWeekMessage } from '@/models/DayOfWeek';
import { WorkoutSession, WorkoutTemplate } from '@/models/Workout';
import { routinesRepository } from '@/services/routines/routinesRepository';
import { createEntityId } from '@/utils/idUtils';

import { styles } from './styles';
import { useWorkouts } from './useWorkouts';
import { moveWorkoutToDay, WEEK_DAYS } from './workoutSchedule';

const MAX_EXERCISES_RESUMED_LIST = 2;

interface DraggableWorkoutProps {
  workout: WorkoutTemplate;
  onDragStart: () => void;
  onDrop: (workoutId: string, screenY: number) => void;
}

const DraggableWorkout = ({ workout, onDragStart, onDrop }: DraggableWorkoutProps) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const [isDragging, setIsDragging] = useState(false);
  const workoutIdRef = useRef(workout.id);
  const onDragStartRef = useRef(onDragStart);
  const onDropRef = useRef(onDrop);

  workoutIdRef.current = workout.id;
  onDragStartRef.current = onDragStart;
  onDropRef.current = onDrop;

  const finishDrag = (screenY: number) => {
    translateY.setValue(0);
    setIsDragging(false);
    if (screenY > 0) onDropRef.current(workoutIdRef.current, screenY);
  };

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: () => {
      onDragStartRef.current();
      setIsDragging(true);
    },
    onPanResponderMove: (_, gesture) => translateY.setValue(gesture.dy),
    onPanResponderRelease: (_, gesture) => finishDrag(gesture.moveY),
    onPanResponderTerminate: (_, gesture) => finishDrag(gesture.moveY),
    onPanResponderTerminationRequest: () => false,
  })).current;

  return (
    <Animated.View
      style={[
        styles.draggableWorkout,
        isDragging && styles.draggableWorkoutActive,
        { transform: [{ translateY }] },
      ]}
    >
      <View style={styles.editWorkoutCard}>
        <View
          accessibilityLabel={`Arrastar ${workout.description} para outro dia`}
          accessibilityRole="adjustable"
          style={styles.dragHandle}
          {...panResponder.panHandlers}
        >
          <Text style={styles.dragHandleIcon}>↕</Text>
        </View>
        <View style={styles.editWorkoutContent}>
          <Text numberOfLines={2} style={styles.editWorkoutTitle}>
            {workout.description || 'Treino sem descrição'}
          </Text>
          <Text style={styles.workoutCardDescription}>
            {workout.exercises.length}{' '}
            {workout.exercises.length === 1 ? 'exercício' : 'exercícios'}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

export const WorkoutScreen = () => {
  const navigation = useNavigation();
  const { routine } = useAppRouteParams<'Workouts'>();
  const [currentRoutine, setCurrentRoutine] = useState(routine);
  const [creatingDay, setCreatingDay] = useState<DayOfWeek | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutTemplate | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [draftWorkouts, setDraftWorkouts] = useState<WorkoutTemplate[]>(routine.workouts);
  const daySlotRefs = useRef<Partial<Record<DayOfWeek, View | null>>>({});
  const dayBounds = useRef<Partial<Record<DayOfWeek, { top: number; bottom: number }>>>({});

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const runRefresh = async () => {
        const updatedRoutine = await routinesRepository.getById(routine.id);
        if (isActive && updatedRoutine) {
          setCurrentRoutine(updatedRoutine);
          if (!isReordering) setDraftWorkouts(updatedRoutine.workouts);
        }
      };
      runRefresh();
      return () => { isActive = false; };
    }, [isReordering, routine.id])
  );

  const { workoutsWithLastSession } = useWorkouts({
    routineTemplateId: currentRoutine.id,
    workouts: currentRoutine.workouts,
  });
  const lastSessionByWorkoutId = useMemo(
    () => new Map(workoutsWithLastSession.map(item => [item.workout.id, item.lastSession])),
    [workoutsWithLastSession]
  );
  const displayedWorkouts = isReordering ? draftWorkouts : currentRoutine.workouts;

  const onWorkoutPressed = (workout: WorkoutTemplate) => {
    navigation.navigate(Routes.Exercises, {
      routineTemplateId: currentRoutine.id,
      workout,
    });
  };

  const enterReorderMode = () => {
    setDraftWorkouts(currentRoutine.workouts);
    setIsReordering(true);
  };
  const revertSchedule = () => {
    setDraftWorkouts(currentRoutine.workouts);
    setIsReordering(false);
  };
  const saveSchedule = async () => {
    try {
      const updatedRoutine = { ...currentRoutine, workouts: draftWorkouts };
      await routinesRepository.save(updatedRoutine);
      setCurrentRoutine(updatedRoutine);
      setIsReordering(false);
    } catch (error) {
      console.error('[WorkoutScreen.saveSchedule]', error);
      Alert.alert('Erro', 'Não foi possível salvar os novos dias dos treinos.');
    }
  };

  const measureDaySlots = () => {
    dayBounds.current = {};
    WEEK_DAYS.forEach(day => {
      daySlotRefs.current[day]?.measureInWindow((_, y, __, height) => {
        dayBounds.current[day] = { top: y, bottom: y + height };
      });
    });
  };
  const dropWorkout = (workoutId: string, screenY: number) => {
    const measuredDays = WEEK_DAYS.filter(day => dayBounds.current[day]);
    if (measuredDays.length === 0) return;
    const containingDay = measuredDays.find(day => {
      const bounds = dayBounds.current[day]!;
      return screenY >= bounds.top && screenY <= bounds.bottom;
    });
    const targetDay = containingDay ?? measuredDays.reduce((closest, day) => {
      const currentBounds = dayBounds.current[day]!;
      const closestBounds = dayBounds.current[closest]!;
      const currentDistance = Math.abs(screenY - (currentBounds.top + currentBounds.bottom) / 2);
      const closestDistance = Math.abs(screenY - (closestBounds.top + closestBounds.bottom) / 2);
      return currentDistance < closestDistance ? day : closest;
    });
    setDraftWorkouts(workouts => moveWorkoutToDay(workouts, workoutId, targetDay));
  };

  const handleCreateWorkout = async (dayOfWeek: DayOfWeek, description: string) => {
    if (currentRoutine.workouts.some(workout => workout.dayOfWeek === dayOfWeek)) {
      Alert.alert('Dia ocupado', 'Já existe um treino nesse dia da semana.');
      return;
    }
    try {
      const newWorkout: WorkoutTemplate = {
        id: createEntityId('workout'),
        dayOfWeek,
        description,
        exercises: [],
      };
      const updatedRoutine = {
        ...currentRoutine,
        workouts: [...currentRoutine.workouts, newWorkout],
      };
      await routinesRepository.save(updatedRoutine);
      setCurrentRoutine(updatedRoutine);
      setCreatingDay(null);
    } catch (error) {
      console.error('[WorkoutScreen.handleCreateWorkout]', error);
      Alert.alert('Erro', 'Não foi possível adicionar o treino. Tente novamente.');
    }
  };

  const handleEditWorkout = async (dayOfWeek: DayOfWeek, description: string) => {
    if (!editingWorkout) return;
    try {
      const movedWorkouts = moveWorkoutToDay(
        currentRoutine.workouts,
        editingWorkout.id,
        dayOfWeek
      );
      const updatedRoutine = {
        ...currentRoutine,
        workouts: movedWorkouts.map(workout =>
          workout.id === editingWorkout.id ? { ...workout, description } : workout
        ),
      };
      await routinesRepository.save(updatedRoutine);
      setCurrentRoutine(updatedRoutine);
      setEditingWorkout(null);
    } catch (error) {
      console.error('[WorkoutScreen.handleEditWorkout]', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações do treino.');
    }
  };

  const getExercisesResumedList = (exercises: ExerciseTemplate[]) => {
    const resumedExercises = exercises.slice(0, MAX_EXERCISES_RESUMED_LIST);
    if (resumedExercises.length === 0) return 'Sem exercícios cadastrados';
    const names = resumedExercises.map(exercise => exercise.name).join(' · ');
    return `${names}${exercises.length > MAX_EXERCISES_RESUMED_LIST ? '…' : ''}`;
  };

  const renderWorkoutCard = (workout: WorkoutTemplate, lastSession: WorkoutSession | null) => (
    <Pressable
      delayLongPress={350}
      key={workout.id}
      onLongPress={enterReorderMode}
      onPress={() => onWorkoutPressed(workout)}
      style={styles.workoutCard}
    >
      <View style={styles.workoutCardHeader}>
        <Text numberOfLines={2} style={styles.workoutCardTitle}>
          {workout.description || 'Treino sem descrição'}
        </Text>
        <Pressable
          accessibilityLabel={`Editar ${workout.description}`}
          accessibilityRole="button"
          hitSlop={8}
          onPress={event => {
            event.stopPropagation();
            setEditingWorkout(workout);
          }}
          style={styles.editWorkoutButton}
        >
          <Text style={styles.editWorkoutIcon}>✏️</Text>
        </Pressable>
      </View>
      <Text style={styles.workoutCardDescription}>
        {workout.exercises.length} {workout.exercises.length === 1 ? 'exercício' : 'exercícios'}
        {' · '}{getExercisesResumedList(workout.exercises)}
      </Text>
      <Text style={styles.workoutSessionText}>
        {lastSession
          ? `Última sessão: ${new Date(
            (lastSession as any).endedAt ??
            (lastSession as any).startedAt ??
            lastSession.date
          ).toLocaleDateString('pt-BR')}`
          : 'Ainda não realizado'}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Header title={currentRoutine.name} showBackButton />
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Agenda semanal</Text>
        <Text style={styles.hint}>
          {isReordering
            ? 'Arraste um treino para outro dia. Em um dia ocupado, os treinos trocam de posição.'
            : 'Toque para abrir. Pressione e segure um treino para reorganizar os dias.'}
        </Text>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={isReordering}
        >
          {WEEK_DAYS.map(day => {
            const workoutsForDay = displayedWorkouts.filter(workout => workout.dayOfWeek === day);
            return (
              <View
                key={day}
                ref={node => { daySlotRefs.current[day] = node; }}
                style={[styles.daySlot, isReordering && styles.daySlotEditing]}
              >
                <Text style={styles.dayLabel}>{getDayOfWeekMessage(day)}</Text>
                {workoutsForDay.length > 0 ? workoutsForDay.map(workout => (
                  isReordering ? (
                    <DraggableWorkout
                      key={workout.id}
                      workout={workout}
                      onDragStart={measureDaySlots}
                      onDrop={dropWorkout}
                    />
                  ) : renderWorkoutCard(workout, lastSessionByWorkoutId.get(workout.id) ?? null)
                )) : isReordering ? (
                  <View style={styles.emptyDayEditing}>
                    <Text style={styles.emptyDayEditingText}>Solte um treino aqui</Text>
                  </View>
                ) : (
                  <Pressable
                    accessibilityLabel={`Adicionar treino em ${getDayOfWeekMessage(day)}`}
                    accessibilityRole="button"
                    onPress={() => setCreatingDay(day)}
                    style={styles.emptyDayButton}
                  >
                    <Text style={styles.emptyDayIcon}>＋</Text>
                    <Text style={styles.emptyDayText}>Adicionar treino</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>

      {isReordering ? (
        <View style={styles.reorderActions}>
          <Pressable onPress={revertSchedule} style={styles.revertButton}>
            <Text style={styles.revertButtonText}>Reverter</Text>
          </Pressable>
          <Pressable onPress={saveSchedule} style={styles.saveScheduleButton}>
            <Text style={styles.saveScheduleButtonText}>Salvar dias</Text>
          </Pressable>
        </View>
      ) : null}

      <CreateWorkoutModal
        initialDayOfWeek={creatingDay ?? DayOfWeek.MONDAY}
        lockDaySelection
        visible={creatingDay !== null}
        onSave={handleCreateWorkout}
        onCancel={() => setCreatingDay(null)}
      />
      {editingWorkout ? (
        <EditWorkoutModal
          visible
          initialDayOfWeek={editingWorkout.dayOfWeek}
          initialDescription={editingWorkout.description}
          onSave={handleEditWorkout}
          onCancel={() => setEditingWorkout(null)}
        />
      ) : null}
    </View>
  );
};
