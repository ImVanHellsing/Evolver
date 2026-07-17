import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { Header } from '@/components/Header';
import { CreateWorkoutModal } from '@/components/CreateWorkoutModal';
import { EditWorkoutModal } from '@/components/EditWorkoutModal';
import { Routes } from '@/app/navigation/routes';
import { useAppRouteParams } from '@/hooks/useAppRouteParams';
import { ExerciseTemplate } from '@/models/Exercise';
import { DayOfWeek, getDayOfWeekMessage } from '@/models/DayOfWeek';
import { WorkoutSession, WorkoutTemplate } from '@/models/Workout';
import { routinesRepository } from '@/services/routines/routinesRepository';
import { createEntityId } from '@/utils/idUtils';

import { styles } from './styles';
import { useWorkouts } from './useWorkouts';

const MAX_EXERCISES_RESUMED_LIST = 2;

interface AddWorkoutButtonProps {
  onPress: () => void;
}

const AddWorkoutButton = ({ onPress }: AddWorkoutButtonProps) => (
  <Pressable accessibilityRole="button" style={styles.addWorkoutButton} onPress={onPress}>
    <Text style={styles.addWorkoutIcon}>＋</Text>
    <Text style={styles.addWorkoutText}>Adicionar treino</Text>
  </Pressable>
);

export const WorkoutScreen = () => {
  const navigation = useNavigation();
  const { routine } = useAppRouteParams<'Workouts'>();
  const [currentRoutine, setCurrentRoutine] = useState(routine);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutTemplate | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const runRefresh = async () => {
        const updatedRoutine = await routinesRepository.getById(routine.id);
        if (isActive && updatedRoutine) {
          setCurrentRoutine(updatedRoutine);
        }
      };

      runRefresh();

      return () => {
        isActive = false;
      };
    }, [routine.id])
  );

  const { workoutsWithLastSession } = useWorkouts({
    routineTemplateId: currentRoutine.id,
    workouts: currentRoutine.workouts,
  });

  const onWorkoutPressed = (workout: WorkoutTemplate) => {
    navigation.navigate(Routes.Exercises, {
      routineTemplateId: currentRoutine.id,
      workout,
    });
  };

  const onWorkoutLongPressed = (lastSession: WorkoutSession | null) => {
    if (lastSession) {
      navigation.navigate(Routes.WorkoutSessionDetail as any, { session: lastSession });
    } else {
      Alert.alert('Sem sessões', 'Não há sessões anteriores para este treino.');
    }
  };

  const handleCreateWorkout = async (dayOfWeek: DayOfWeek, description: string) => {
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
      setIsCreateModalVisible(false);
    } catch (error) {
      console.error('[WorkoutScreen.handleCreateWorkout]', error);
      Alert.alert('Erro', 'Não foi possível adicionar o treino. Tente novamente.');
    }
  };

  const handleEditWorkout = async (dayOfWeek: DayOfWeek, description: string) => {
    if (!editingWorkout) return;

    try {
      const updatedRoutine = {
        ...currentRoutine,
        workouts: currentRoutine.workouts.map(workout =>
          workout.id === editingWorkout.id
            ? { ...workout, dayOfWeek, description }
            : workout
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

    const names = resumedExercises.map(exercise => exercise.name).join(' - ');
    return `${names}${exercises.length > MAX_EXERCISES_RESUMED_LIST ? '...' : ''}`;
  };

  const hasWorkouts = workoutsWithLastSession.length > 0;

  return (
    <View style={styles.container}>
      <Header title={currentRoutine.name} showBackButton />
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Treinos</Text>
        {hasWorkouts ? (
          <Text style={styles.hint}>Toque para ver os detalhes de um treino</Text>
        ) : null}

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            !hasWorkouts && styles.emptyScrollContent,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {hasWorkouts ? (
            <>
              {workoutsWithLastSession.map(({ workout, lastSession }) => (
                <Pressable
                  key={workout.id}
                  style={styles.workoutCard}
                  onPress={() => onWorkoutPressed(workout)}
                  onLongPress={() => onWorkoutLongPressed(lastSession)}
                >
                  <View style={styles.workoutCardHeader}>
                    <Text style={styles.workoutCardTitle}>
                      {getDayOfWeekMessage(workout.dayOfWeek)}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Editar ${workout.description}`}
                      hitSlop={8}
                      style={styles.editWorkoutButton}
                      onPress={event => {
                        event.stopPropagation();
                        setEditingWorkout(workout);
                      }}
                    >
                      <Text style={styles.editWorkoutIcon}>✏️</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.workoutCardDescription}>{workout.description}</Text>
                  <Text style={styles.workoutCardDescription}>
                    {workout.exercises.length} exercícios
                  </Text>
                  <Text style={styles.workoutCardDescription}>
                    {getExercisesResumedList(workout.exercises)}
                  </Text>

                  {lastSession ? (
                    <>
                      <Text style={styles.workoutCardDescription}>
                        Última sessão:{' '}
                        {new Date(
                          (lastSession as any).endedAt ??
                          (lastSession as any).startedAt ??
                          lastSession.date
                        ).toLocaleDateString()}
                      </Text>
                      {lastSession.duration ? (
                        <Text style={styles.workoutCardDescription}>
                          Duração: {Math.round(lastSession.duration)} min
                        </Text>
                      ) : null}
                      {typeof lastSession.caloriesEstimated === 'number' ? (
                        <Text style={styles.workoutCardDescription}>
                          Calorias: {Math.round(lastSession.caloriesEstimated)} kcal
                        </Text>
                      ) : null}
                    </>
                  ) : (
                    <Text style={styles.workoutCardDescription}>Não iniciado ainda</Text>
                  )}
                </Pressable>
              ))}
              <AddWorkoutButton onPress={() => setIsCreateModalVisible(true)} />
            </>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyIcon}>＋</Text>
              </View>
              <Text style={styles.emptyTitle}>Nenhum treino adicionado</Text>
              <Text style={styles.emptyDescription}>
                Adicione o primeiro treino desta rotina para começar a organizar seus exercícios.
              </Text>
              <AddWorkoutButton onPress={() => setIsCreateModalVisible(true)} />
            </View>
          )}
        </ScrollView>
      </View>
      <CreateWorkoutModal
        visible={isCreateModalVisible}
        onSave={handleCreateWorkout}
        onCancel={() => setIsCreateModalVisible(false)}
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
