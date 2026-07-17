import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { CreateRoutineModal } from '@/components/CreateRoutineModal';
import { Header } from '@/components/Header';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { RoutineTemplate } from '@/models/Routine';
import { routinesRepository } from '@/services/routines/routinesRepository';
import { createEntityId } from '@/utils/idUtils';

import { styles } from './styles';
import { useRoutines } from './useRoutines';

interface RoutinesScreenProps {
  showBackButton?: boolean;
}

interface AddRoutineButtonProps {
  onPress: () => void;
}

const AddRoutineButton = ({ onPress }: AddRoutineButtonProps) => (
  <Pressable accessibilityRole="button" style={styles.addRoutineButton} onPress={onPress}>
    <Text style={styles.addRoutineIcon}>＋</Text>
    <Text style={styles.addRoutineText}>Adicionar rotina</Text>
  </Pressable>
);

export const RoutinesScreen = ({ showBackButton = true }: RoutinesScreenProps) => {
  const navigation = useAppNavigation();
  const { routines, sessions, loading, reload, isRoutineStartedText } = useRoutines();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  const handleCreateRoutine = async (name: string) => {
    const now = new Date().toISOString();
    const newRoutine: RoutineTemplate = {
      id: createEntityId('routine'),
      name,
      workouts: [],
      source: 'custom',
      createdAt: now,
      updatedAt: now,
    };
    await routinesRepository.save(newRoutine);
    setIsCreateModalVisible(false);
    reload();
  };

  const onRoutinePressed = (routine: RoutineTemplate) => {
    navigation.navigate('Workouts', { routine });
  };

  const onRoutineLongPressed = (routine: RoutineTemplate) => {
    Alert.alert(
      'Excluir rotina?',
      `A rotina “${routine.name}” será removida. O histórico de treinos não será apagado.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await routinesRepository.delete(routine.id);
            reload();
          },
        },
      ]
    );
  };

  const hasRoutines = routines.length > 0;

  return (
    <View style={styles.container}>
      <Header title="Treinos" showBackButton={showBackButton} />
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            !hasRoutines && styles.emptyScrollContent,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {hasRoutines ? (
            <>
              <View style={styles.disclaimer}>
                <Text style={styles.disclaimerIcon}>i</Text>
                <Text style={styles.disclaimerText}>
                  Pressione e segure uma rotina personalizada para excluí-la. Rotinas padrão são fixas.
                </Text>
              </View>
              {routines.map(routine => (
                <Pressable
                  key={routine.id}
                  style={styles.routineCard}
                  onPress={() => onRoutinePressed(routine)}
                  onLongPress={
                    routine.source === 'custom'
                      ? () => onRoutineLongPressed(routine)
                      : undefined
                  }
                >
                  <View style={styles.routineCardHeader}>
                    <Text style={styles.routineCardTitle}>{routine.name}</Text>
                    {routine.source === 'template' ? (
                      <View style={styles.templateBadge}>
                        <Text style={styles.templateBadgeText}>Padrão</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.routineCardDescription}>
                    {isRoutineStartedText(routine.id, sessions)}
                  </Text>
                </Pressable>
              ))}
              <AddRoutineButton onPress={() => setIsCreateModalVisible(true)} />
            </>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyIcon}>＋</Text>
              </View>
              <Text style={styles.emptyTitle}>Nenhuma rotina adicionada</Text>
              <Text style={styles.emptyDescription}>
                Crie sua primeira rotina para organizar os treinos da semana.
              </Text>
              <AddRoutineButton onPress={() => setIsCreateModalVisible(true)} />
            </View>
          )}
        </ScrollView>
      )}

      <CreateRoutineModal
        visible={isCreateModalVisible}
        onSave={handleCreateRoutine}
        onCancel={() => setIsCreateModalVisible(false)}
      />
    </View>
  );
};
