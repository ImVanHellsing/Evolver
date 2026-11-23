import React from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { styles } from './styles';

interface MissingExercisesModalProps {
  visible: boolean;
  missingExercises: Array<{ id: string; name: string; index: number }>;
  onSelectExercise: (index: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const MissingExercisesModal = ({
  visible,
  missingExercises,
  onSelectExercise,
  onConfirm,
  onCancel,
}: MissingExercisesModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Exercícios Não Realizados</Text>
          <Text style={styles.modalMessage}>
            Os exercícios abaixo ainda não foram finalizados. Toque em um deles para retomá-lo:
          </Text>

          <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollListContent}>
            {missingExercises.map(exercise => (
              <Pressable
                accessibilityRole="button"
                key={exercise.id}
                onPress={() => onSelectExercise(exercise.index)}
                style={styles.exerciseItem}
              >
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseAction}>Retomar →</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.warningMessage}>
            Deseja encerrar o treino mesmo com esses exercícios faltando?
          </Text>

          <View style={styles.modalButtons}>
            <Pressable style={[styles.modalButton, styles.modalButtonCancel]} onPress={onCancel}>
              <Text style={styles.modalButtonTextCancel}>Voltar a Treinar</Text>
            </Pressable>

            <Pressable style={[styles.modalButton, styles.modalButtonConfirm]} onPress={onConfirm}>
              <Text style={styles.modalButtonTextConfirm}>Encerrar Mesmo Assim</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
