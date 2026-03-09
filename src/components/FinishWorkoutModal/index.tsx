import React from 'react';
import { Modal, View, Text, Pressable, TextInput } from 'react-native';

import { styles } from './styles';

interface FinishWorkoutModalProps {
  visible: boolean;
  duration: string;
  setDuration: (value: string) => void;
  calories: string;
  setCalories: (value: string) => void;
  onFinish: () => void;
}

export const FinishWorkoutModal = ({
  visible,
  duration,
  setDuration,
  calories,
  setCalories,
  onFinish,
}: FinishWorkoutModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => { }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Finalizar Treino</Text>
          <Text style={styles.modalMessage}>Parabéns por concluir seu treino! Informe os dados abaixo para o registro final.</Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Duração (minutos)</Text>
              <TextInput
                style={styles.input}
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
                placeholder="Ex: 60"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Calorias Gastas (kcal)</Text>
              <TextInput
                style={styles.input}
                value={calories}
                onChangeText={setCalories}
                keyboardType="numeric"
                placeholder="Ex: 300"
              />
            </View>
          </View>

          <View style={styles.modalButtons}>
            <Pressable style={[styles.modalButton, styles.modalButtonConfirm]} onPress={onFinish}>
              <Text style={styles.modalButtonTextConfirm}>Finalizar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
