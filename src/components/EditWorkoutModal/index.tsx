import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Pressable } from 'react-native';
import { DayOfWeek, DayOfWeekMessage } from '../../models/DayOfWeek';
import { styles } from './styles';

interface EditWorkoutModalProps {
  visible: boolean;
  initialDayOfWeek: DayOfWeek;
  initialDescription: string;
  onSave: (dayOfWeek: DayOfWeek, description: string) => void;
  onCancel: () => void;
}

export const EditWorkoutModal = ({
  visible,
  initialDayOfWeek,
  initialDescription,
  onSave,
  onCancel,
}: EditWorkoutModalProps) => {
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(initialDayOfWeek);
  const [description, setDescription] = useState(initialDescription);

  // Sync state with props when visible changes
  useEffect(() => {
    if (visible) {
      setDayOfWeek(initialDayOfWeek);
      setDescription(initialDescription);
    }
  }, [visible, initialDayOfWeek, initialDescription]);

  const handleSave = () => {
    if (description.trim().length === 0) return;
    onSave(dayOfWeek, description.trim());
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Editar Treino</Text>
          
          <Text style={styles.label}>Dia da Semana</Text>
          <View style={styles.daySelectorGrid}>
            {Object.entries(DayOfWeekMessage).map(([key, label]) => (
              <Pressable
                key={key}
                style={[
                  styles.dayChip,
                  dayOfWeek === key && styles.dayChipSelected
                ]}
                onPress={() => setDayOfWeek(key as DayOfWeek)}
              >
                <Text style={[
                  styles.dayChipText,
                  dayOfWeek === key && styles.dayChipTextSelected
                ]}>
                  {label.split('-')[0]}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Descrição / Foco</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Ex: Treino de Peito e Tríceps"
          />

          <View style={styles.modalButtons}>
            <Pressable style={[styles.modalButton, styles.modalButtonCancel]} onPress={onCancel}>
              <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={[
                styles.modalButton,
                styles.modalButtonConfirm,
                description.trim().length === 0 && styles.modalButtonDisabled
              ]}
              onPress={handleSave}
              disabled={description.trim().length === 0}
            >
              <Text style={styles.modalButtonTextConfirm}>Salvar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
