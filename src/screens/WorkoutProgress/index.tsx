import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { useAppRouteParams } from "@/hooks/useAppRouteParams";
import { Header } from "@/components/Header";
import { workoutSessionsRepository } from "@/services/workouts/workoutSessionsRepository";
import { WorkoutSession } from "@/models/Workout";
import { FailureType, FAILURE_TYPE_PRIORITY } from "@/models/FailureType";
import { SetLog } from "@/models/Set";
import { routinesRepository } from "@/services/routines/routinesRepository";
import { RoutineTemplate } from "@/models/Routine";

import { styles } from "./styles";

type ProgressionStatus = 'evolution' | 'stagnation' | 'involution';

interface SetComparison {
  current: SetLog;
  previous?: SetLog;
  status: ProgressionStatus;
}

interface ExerciseComparison {
  exerciseTemplateId: string;
  name: string;
  sets: SetComparison[];
}

export const WorkoutProgressScreen = () => {
  const { session } = useAppRouteParams<'WorkoutProgress'>();
  const [previousSession, setPreviousSession] = useState<WorkoutSession | null>(null);
  const [routine, setRoutine] = useState<RoutineTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comparisons, setComparisons] = useState<ExerciseComparison[]>([]);
  const [stats, setStats] = useState<{ avgDuration: number, avgCalories: number } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [allSessions, routineData] = await Promise.all([
          workoutSessionsRepository.listByRoutineWorkout(session.routineTemplateId, session.workoutTemplateId),
          routinesRepository.getById(session.routineTemplateId)
        ]);

        setRoutine(routineData);

        // Sort sessions by date descending
        const sorted = allSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Find the one before the current session
        const currentIndex = sorted.findIndex(s => s.id === session.id);
        const prev = sorted[currentIndex + 1] || null;
        setPreviousSession(prev);

        if (prev && routineData) {
          calculateComparisons(session, prev, routineData);
        }

        if (allSessions.length > 0) {
          const validSessions = allSessions.filter(s => s.duration || s.caloriesEstimated);
          const totalDuration = validSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
          const totalCalories = validSessions.reduce((acc, s) => acc + (s.caloriesEstimated || 0), 0);
          
          setStats({
            avgDuration: totalDuration / (validSessions.filter(s => s.duration).length || 1),
            avgCalories: totalCalories / (validSessions.filter(s => s.caloriesEstimated).length || 1),
          });
        }
      } catch (error) {
        console.error('[WorkoutProgressScreen.loadData]', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [session.id]);

  const getExerciseName = (templateId: string, routineData: RoutineTemplate) => {
    for (const workout of routineData.workouts) {
      const exercise = workout.exercises.find(e => e.id === templateId);
      if (exercise) return exercise.name;
    }
    return "Exercício Desconhecido";
  };

  const calculateComparisons = (curr: WorkoutSession, prev: WorkoutSession, routineData: RoutineTemplate) => {
    const results: ExerciseComparison[] = curr.exercises.map(currExercise => {
      const prevExercise = prev.exercises.find(e => e.exerciseTemplateId === currExercise.exerciseTemplateId);

      const sets: SetComparison[] = currExercise.sets.map(currSet => {
        const prevSet = prevExercise?.sets.find(s => s.templateSetId === currSet.templateSetId);

        let status: ProgressionStatus = 'stagnation';

        if (prevSet) {
          const currPriority = FAILURE_TYPE_PRIORITY[currSet.failureType] ?? -1;
          const prevPriority = FAILURE_TYPE_PRIORITY[prevSet.failureType] ?? -1;

          if (currSet.weight > prevSet.weight) {
            status = 'evolution';
          } else if (currSet.weight < prevSet.weight) {
            status = 'involution';
          } else {
            // Same weight
            if (currSet.reps > prevSet.reps) {
              status = 'evolution';
            } else if (currSet.reps < prevSet.reps) {
              status = 'involution';
            } else {
              // Same weight and reps
              if (currPriority > prevPriority) {
                status = 'evolution';
              } else if (currPriority < prevPriority) {
                status = 'involution';
              } else {
                status = 'stagnation';
              }
            }
          }
        }

        return {
          current: currSet,
          previous: prevSet,
          status
        };
      });

      return {
        exerciseTemplateId: currExercise.exerciseTemplateId,
        name: getExerciseName(currExercise.exerciseTemplateId, routineData),
        sets
      };
    });

    setComparisons(results);
  };

  const getStatusIcon = (status: ProgressionStatus) => {
    switch (status) {
      case 'evolution': return '▲';
      case 'involution': return '▼';
      case 'stagnation': return '●';
    }
  };

  const getStatusColor = (status: ProgressionStatus) => {
    switch (status) {
      case 'evolution': return '#34C759'; // Green
      case 'involution': return '#FF3B30'; // Red
      case 'stagnation': return '#AFABB3'; // Gray
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title="Progressão da Sessão" showBackButton />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </View>
    );
  }

  if (!previousSession) {
    return (
      <View style={styles.container}>
        <Header title="Progressão da Sessão" showBackButton />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📈</Text>
          <Text style={styles.emptyTitle}>Sessão Inicial</Text>
          <Text style={styles.emptySubtitle}>
            Esta é a primeira vez que você realiza este treino ou não há sessões anteriores para comparar.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Progressão da Sessão" showBackButton />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Comparando com a sessão de {new Date(previousSession.date).toLocaleDateString()}
          </Text>
        </View>

        {stats && (
          <View style={styles.statsRow}>
            <View style={styles.statsItem}>
              <Text style={styles.statsLabel}>Duração Média</Text>
              <Text style={styles.statsValue}>{Math.round(stats.avgDuration)} min</Text>
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.statsItem}>
              <Text style={styles.statsLabel}>Gasto Médio</Text>
              <Text style={styles.statsValue}>{Math.round(stats.avgCalories)} kcal</Text>
            </View>
          </View>
        )}

        {comparisons.map((exercise) => (
          <View key={exercise.exerciseTemplateId} style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>

            <View style={styles.setsHeader}>
              <Text style={[styles.headerText, { flex: 0.5 }]}>Série</Text>
              <Text style={[styles.headerText, { flex: 1.5 }]}>Anterior</Text>
              <Text style={[styles.headerText, { flex: 1 }]}>Atual</Text>
              <Text style={[styles.headerText, { flex: 1, textAlign: 'right' }]}></Text>
            </View>

            {exercise.sets.map((set, index) => (
              <View key={set.current.id} style={styles.setRow}>
                <Text style={styles.setNumber}>{index + 1}º</Text>

                <View style={styles.setComparisonBoxPrev}>
                  {set.previous ? (
                    <Text style={styles.prevText}>{set.previous.weight}kg x {set.previous.reps}</Text>
                  ) : (
                    <Text style={styles.noDataText}>-</Text>
                  )}
                </View>

                <View style={styles.setComparisonBoxCurr}>
                  <Text style={styles.currText}>{set.current.weight}kg x {set.current.reps}</Text>
                </View>

                <View style={styles.statusBox}>
                  <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(set.status) }]}>
                    <Text style={styles.statusIcon}>{getStatusIcon(set.status)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
            <Text style={styles.legendText}>Evolução</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#AFABB3' }]} />
            <Text style={styles.legendText}>Estagnação</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
            <Text style={styles.legendText}>Involução</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
