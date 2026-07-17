import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable } from 'react-native';
import { DayOfWeek, DayOfWeekMessage } from '../../models/DayOfWeek';
import { styles } from './styles';

interface CreateWorkoutModalProps {
  visible: boolean;
  onSave: (dayOfWeek: DayOfWeek, description: string) => void;
  onCancel: () => void;
}

export const CreateWorkoutModal = ({
  visible,
  onSave,
  onCancel,
}: CreateWorkoutModalProps) => {
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(DayOfWeek.MONDAY);
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (description.trim().length === 0) return;
    onSave(dayOfWeek, description.trim());
    setDescription('');
    setDayOfWeek(DayOfWeek.MONDAY);
  };

  const handleCancel = () => {
    setDescription('');
    setDayOfWeek(DayOfWeek.MONDAY);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Novo Treino</Text>
          
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
                  {label.split('-')[0]} {/* Shorten name (e.g. "Segunda") */}
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
            <Pressable style={[styles.modalButton, styles.modalButtonCancel]} onPress={handleCancel}>
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
              <Text style={styles.modalButtonTextConfirm}>Adicionar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
