import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { Header } from '@/components/Header';
import { useAppRouteParams } from '@/hooks/useAppRouteParams';
import { WorkoutSession } from '@/models/Workout';
import { routinesRepository } from '@/services/routines/routinesRepository';
import { workoutSessionsRepository } from '@/services/workouts/workoutSessionsRepository';

import { styles } from './styles';
import {
  calculatePositionComparisons,
  ExerciseRecord,
  findImmediatelyPreviousSession,
  PositionComparison,
  ProgressionStatus,
} from './workoutProgress';

const getPositionMessage = (comparison: PositionComparison) => {
  switch (comparison.kind) {
    case 'different':
      return `Posição ${comparison.position} · exercícios diferentes`;
    case 'added':
      return `Posição ${comparison.position} · exercício adicionado`;
    case 'removed':
      return `Posição ${comparison.position} · exercício removido`;
    default:
      return `Posição ${comparison.position}`;
  }
};

interface ExerciseRecordCardProps {
  record: ExerciseRecord;
  label: 'Atual' | 'Anterior';
  change: 'different' | 'added' | 'removed';
}

const ExerciseRecordCard = ({ record, label, change }: ExerciseRecordCardProps) => (
  <View style={styles.exerciseCard}>
    <View style={styles.exerciseTitleRow}>
      <Text style={styles.exerciseName}>{record.name}</Text>
      <View
        style={[
          styles.changeBadge,
          change === 'added' && styles.changeBadgeAdded,
          change === 'removed' && styles.changeBadgeRemoved,
        ]}
      >
        <Text
          style={[
            styles.changeBadgeText,
            change === 'added' && styles.changeBadgeTextAdded,
            change === 'removed' && styles.changeBadgeTextRemoved,
          ]}
        >
          {change === 'added' ? 'Adicionado' : change === 'removed' ? 'Removido' : label}
        </Text>
      </View>
    </View>

    {change === 'different' ? (
      <Text style={styles.recordLabel}>Registro {label.toLowerCase()} · sem comparação</Text>
    ) : null}

    {record.sets.length > 0 ? (
      record.sets.map((set, index) => (
        <View key={set.id} style={styles.standaloneSetRow}>
          <Text style={styles.setNumber}>{index + 1}º</Text>
          <Text style={label === 'Atual' ? styles.currText : styles.prevText}>
            {set.weight}kg x {set.reps}
          </Text>
        </View>
      ))
    ) : (
      <Text style={styles.noValidSetsText}>Sem séries de trabalho ou Top Set.</Text>
    )}
  </View>
);

export const WorkoutProgressScreen = () => {
  const { session } = useAppRouteParams<'WorkoutProgress'>();
  const [previousSession, setPreviousSession] = useState<WorkoutSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comparisons, setComparisons] = useState<PositionComparison[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [sessionsFromSameWorkout, routineData] = await Promise.all([
          workoutSessionsRepository.listByRoutineWorkout(
            session.routineTemplateId,
            session.workoutTemplateId
          ),
          routinesRepository.getById(session.routineTemplateId),
        ]);

        const previous = findImmediatelyPreviousSession(session, sessionsFromSameWorkout);
        setPreviousSession(previous);
        setComparisons(
          previous ? calculatePositionComparisons(session, previous, routineData) : []
        );
      } catch (error) {
        console.error('[WorkoutProgressScreen.loadData]', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [session]);

  const getStatusIcon = (status: ProgressionStatus) => {
    switch (status) {
      case 'evolution': return '▲';
      case 'involution': return '▼';
      case 'stagnation': return '●';
    }
  };

  const getStatusStyle = (status: ProgressionStatus) => {
    switch (status) {
      case 'evolution': return styles.statusEvolution;
      case 'involution': return styles.statusInvolution;
      case 'stagnation': return styles.statusStagnation;
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
          <Text style={styles.emptyTitle}>Sessão inicial</Text>
          <Text style={styles.emptySubtitle}>
            Esta é a primeira sessão deste treino e ainda não existe um registro anterior para comparar.
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
            Comparando somente com a sessão de{' '}
            {new Date(previousSession.date).toLocaleDateString('pt-BR')}
          </Text>
        </View>

        {comparisons.map(comparison => (
          <View key={comparison.position} style={styles.positionSection}>
            <Text style={styles.positionLabel}>{getPositionMessage(comparison)}</Text>

            {comparison.kind === 'compared' && comparison.current ? (
              <View style={styles.exerciseCard}>
                <Text style={styles.exerciseName}>{comparison.current.name}</Text>

                <View style={styles.setsHeader}>
                  <Text style={[styles.headerText, styles.setNumberHeader]}>Série</Text>
                  <Text style={[styles.headerText, styles.previousHeader]}>Anterior</Text>
                  <Text style={[styles.headerText, styles.currentHeader]}>Atual</Text>
                  <View style={styles.statusHeader} />
                </View>

                {comparison.sets.length > 0 ? comparison.sets.map((set, index) => (
                  <View key={set.current.id} style={styles.setRow}>
                    <Text style={styles.setNumber}>{index + 1}º</Text>

                    <View style={styles.setComparisonBoxPrev}>
                      {set.previous ? (
                        <Text style={styles.prevText}>
                          {set.previous.weight}kg x {set.previous.reps}
                        </Text>
                      ) : (
                        <Text style={styles.noDataText}>-</Text>
                      )}
                    </View>

                    <View style={styles.setComparisonBoxCurr}>
                      <Text style={styles.currText}>
                        {set.current.weight}kg x {set.current.reps}
                      </Text>
                    </View>

                    <View style={styles.statusBox}>
                      {set.previous ? (
                        <View style={[styles.statusIndicator, getStatusStyle(set.status)]}>
                          <Text style={styles.statusIcon}>{getStatusIcon(set.status)}</Text>
                        </View>
                      ) : (
                        <Text style={styles.noDataText}>-</Text>
                      )}
                    </View>
                  </View>
                )) : (
                  <Text style={styles.noValidSetsText}>Sem séries de trabalho ou Top Set.</Text>
                )}
              </View>
            ) : null}

            {comparison.kind === 'different' && comparison.previous ? (
              <ExerciseRecordCard record={comparison.previous} label="Anterior" change="different" />
            ) : null}
            {comparison.kind === 'different' && comparison.current ? (
              <ExerciseRecordCard record={comparison.current} label="Atual" change="different" />
            ) : null}
            {comparison.kind === 'added' && comparison.current ? (
              <ExerciseRecordCard record={comparison.current} label="Atual" change="added" />
            ) : null}
            {comparison.kind === 'removed' && comparison.previous ? (
              <ExerciseRecordCard record={comparison.previous} label="Anterior" change="removed" />
            ) : null}
          </View>
        ))}

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.statusEvolution]} />
            <Text style={styles.legendText}>Progressão</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.statusStagnation]} />
            <Text style={styles.legendText}>Manutenção</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.statusInvolution]} />
            <Text style={styles.legendText}>Regressão</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
