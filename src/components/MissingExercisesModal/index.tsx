import React from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { styles } from './styles';

interface MissingExercisesModalProps {
  visible: boolean;
  missingExerciseNames: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const MissingExercisesModal = ({
  visible,
  missingExerciseNames,
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
            Você não registrou nenhuma série para os seguintes exercícios:
          </Text>

          <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollListContent}>
            {missingExerciseNames.map((name, index) => (
              <View key={index} style={styles.exerciseItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.exerciseName}>{name}</Text>
              </View>
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
