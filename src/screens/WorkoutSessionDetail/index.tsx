import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";

import { useAppRouteParams } from "@/hooks/useAppRouteParams";
import { Header } from "@/components/Header";
import { routinesRepository } from "@/services/routines/routinesRepository";
import { RoutineTemplate } from "@/models/Routine";
import { ExerciseLog } from "@/models/Exercise";
import { getFailureTypeMessage } from "@/models/FailureType";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { Routes } from "@/app/navigation/routes";

import { styles } from "./styles";

interface ExerciseItemProps {
  exercise: ExerciseLog;
  exerciseName: string;
}

const ExerciseItem = ({ exercise, exerciseName }: ExerciseItemProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.exerciseCard}>
      <Pressable
        style={styles.exerciseHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{exerciseName}</Text>
          <Text style={styles.exerciseSetsCount}>
            {exercise.sets.length} séries
          </Text>
        </View>
        <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>

      {expanded && (
        <View style={styles.setsList}>
          {exercise.sets.map((set, index) => (
            <View key={set.id} style={styles.setRow}>
              <Text style={styles.setNumber}>{index + 1}º</Text>
              <View style={styles.setData}>
                <Text style={styles.setText}>
                  <Text style={styles.setBold}>{set.weight}kg</Text> x <Text style={styles.setBold}>{set.reps}</Text> reps
                </Text>
                {!!set.failureType && (
                  <Text style={styles.failureType}>
                    {getFailureTypeMessage(set.failureType)}
                  </Text>
                )}
              </View>
              {!!set.notes && (
                <Text style={styles.setNotes}>{set.notes}</Text>
              )}
            </View>
          ))}
          {!!exercise.notes && (
            <View style={styles.exerciseNotesContainer}>
              <Text style={styles.exerciseNotesTitle}>Observações:</Text>
              <Text style={styles.exerciseNotes}>{exercise.notes}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export const WorkoutSessionDetailScreen = () => {
  const navigation = useAppNavigation();
  const { session } = useAppRouteParams<'WorkoutSessionDetail'>();
  const [routine, setRoutine] = useState<RoutineTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRoutine() {
      try {
        const data = await routinesRepository.getById(session.routineTemplateId);
        setRoutine(data);
      } catch (error) {
        console.error('[WorkoutSessionDetailScreen.loadRoutine]', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadRoutine();
  }, [session.routineTemplateId]);

  const getExerciseName = (exerciseLog: ExerciseLog) => {
    if (exerciseLog.exerciseNameSnapshot) return exerciseLog.exerciseNameSnapshot;
    if (!routine) return "Exercício Desconhecido";

    for (const workout of routine.workouts) {
      const exercise = workout.exercises.find(e => e.id === exerciseLog.exerciseTemplateId);
      if (exercise) return exercise.name;
    }

    return "Exercício Desconhecido";
  };

  const formatDuration = (min?: number) => {
    if (!min) return "--";
    const hours = Math.floor(min / 60);
    const remainingMinutes = Math.round(min % 60);
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes} min`;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title="Detalhes da Sessão" showBackButton />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Detalhes da Sessão" showBackButton />

      <View style={styles.summaryHeader}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Duração</Text>
          <Text style={styles.summaryValue}>{formatDuration(session.duration)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Calorias</Text>
          <Text style={styles.summaryValue}>
            {session.caloriesEstimated ? Math.round(session.caloriesEstimated) : '--'} kcal
          </Text>
        </View>
      </View>

      <Pressable
        style={styles.progressButton}
        onPress={() => navigation.navigate(Routes.WorkoutProgress, { session })}
      >
        <Text style={styles.progressButtonText}>Visualizar Progressão</Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Relatório de Exercícios</Text>

        {session.exercises.map((exercise, index) => (
          <ExerciseItem
            key={`${exercise.exerciseTemplateId}-${index}`}
            exercise={exercise}
            exerciseName={getExerciseName(exercise)}
          />
        ))}

        <View style={styles.footerInfo}>
          <Text style={styles.footerDate}>
            Realizado em: {new Date(session.date).toLocaleDateString()} às {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};
