import { useState, useMemo, useCallback } from "react";
import { Text, View, Pressable, Modal, ScrollView, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { useAppRouteParams } from "@/hooks/useAppRouteParams";
import { Header } from "@/components/Header";
import { ExerciseTemplate } from "@/models/Exercise";
import { useNavigation } from "@react-navigation/native";
import { Routes } from "@/app/navigation/routes";
import { getWorkoutAmountOfValidSets, WorkoutTemplate } from "@/models/Workout";
import { SetType } from "@/models/SetType";
import { getMuscleGroupTranslate, MuscleGroup } from "@/models/MuscleGroup";
import { getDayOfWeekMessage } from "@/models/DayOfWeek";
import { useWorkouts } from "./useWorkouts";
import { routinesRepository } from "@/services/routines/routinesRepository";

import { styles } from "./styles";

const MAX_EXERCISES_RESUMED_LIST = 2;

export const WorkoutScreen = () => {
  const navigation = useNavigation();

  const { routine } = useAppRouteParams<'Workouts'>();

  const [isModalVisible, setModalVisible] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState(routine);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const refreshRoutine = async () => {
        const updatedRoutine = await routinesRepository.getById(routine.id);
        if (isActive && updatedRoutine) {
          setCurrentRoutine(updatedRoutine);
        }
      };

      refreshRoutine();

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
    navigation.navigate(Routes.Exercises, { routineTemplateId: currentRoutine.id, workout });
  }

  const onWorkoutLongPressed = (lastSession: import("@/models/Workout").WorkoutSession | null) => {
    if (lastSession) {
      navigation.navigate(Routes.WorkoutSessionDetail as any, { session: lastSession });
    } else {
      Alert.alert('Sem sessões', 'Não há sessões anteriores para este treino.');
    }
  }

  const getExercisesResumedList = (exercises: ExerciseTemplate[]) => {
    const filteredExercises = exercises.filter((_, index) => index < MAX_EXERCISES_RESUMED_LIST);
    return `${filteredExercises.map((exercise, index) => {
      return `${index > 0 ? ' - ' : ''}${exercise.name}`;
    }).join('')}${exercises.length > MAX_EXERCISES_RESUMED_LIST ? '...' : ''}`
  }

  const volumeSummary = useMemo(() => {
    const summary: Record<string, number> = {};

    routine.workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        const validSets = exercise.sets.filter(set =>
          set.type === SetType.WorkSet || set.type === SetType.TopSet
        ).length;

        if (validSets > 0) {
          const muscle = exercise.muscleGroup;
          summary[muscle] = (summary[muscle] || 0) + validSets;
        }
      });
    });

    return Object.entries(summary)
      .map(([muscle, count]) => ({
        muscle: muscle as MuscleGroup,
        count
      }))
      .sort((a, b) => b.count - a.count);
  }, [currentRoutine]);

  return (
    <View style={styles.container}>
      <Header title={currentRoutine.name} showBackButton />
      <View style={styles.innerContainer}>
        <Text style={styles.hint}>Pressione para ver os detalhes de um treino</Text>
        <Pressable style={styles.summaryButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.summaryButtonText}>📊 Ver Resumo de Volume</Text>
        </Pressable>

        <Text style={styles.title}>Treinos</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {workoutsWithLastSession.map(({ workout, lastSession }) => (
            <Pressable
              key={workout.id}
              style={styles.bigButton}
              onPress={() => onWorkoutPressed(workout)}
              onLongPress={() => onWorkoutLongPressed(lastSession)}
            >
              <Text style={styles.bigButtonTitle}>{getDayOfWeekMessage(workout.dayOfWeek)}</Text>
              <Text style={styles.bigButtonDesc}>{workout.description}</Text>
              <Text style={styles.bigButtonDesc}>{getWorkoutAmountOfValidSets(workout)} séries</Text>
              <Text style={styles.bigButtonDesc}>{getExercisesResumedList(workout.exercises)}</Text>

              {!!lastSession && (
                <>
                  <Text style={styles.bigButtonDesc}>
                    Última sessão: {new Date((lastSession as any).endedAt ?? (lastSession as any).startedAt ?? (lastSession as any).date).toLocaleDateString()}
                  </Text>

                  {!!lastSession.duration && (
                    <Text style={styles.bigButtonDesc}>Duração: {Math.round(lastSession.duration / 60)} min</Text>
                  )}

                  {typeof lastSession.caloriesEstimated === 'number' && (
                    <Text style={styles.bigButtonDesc}>Calorias: {Math.round(lastSession.caloriesEstimated)} kcal</Text>
                  )}
                </>
              )}

              {!lastSession && (
                <Text style={styles.bigButtonDesc}>Não iniciado ainda</Text>
              )}
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable style={{ flex: 1 }} onPress={() => setModalVisible(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Volume por Grupamento</Text>
            <ScrollView>
              {volumeSummary.map((item) => (
                <View key={item.muscle} style={styles.volumeItem}>
                  <Text style={styles.volumeMuscle}>{getMuscleGroupTranslate(item.muscle)}</Text>
                  <Text style={styles.volumeCount}>{item.count} séries</Text>
                </View>
              ))}
            </ScrollView>
            <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}