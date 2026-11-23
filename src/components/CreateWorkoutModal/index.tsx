import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, Pressable } from 'react-native';
import { DayOfWeek, DayOfWeekMessage } from '../../models/DayOfWeek';
import { styles } from './styles';

interface CreateWorkoutModalProps {
  visible: boolean;
  onSave: (dayOfWeek: DayOfWeek, description: string) => void;
  onCancel: () => void;
  initialDayOfWeek?: DayOfWeek;
  lockDaySelection?: boolean;
}

export const CreateWorkoutModal = ({
  visible,
  onSave,
  onCancel,
  initialDayOfWeek = DayOfWeek.MONDAY,
  lockDaySelection = false,
}: CreateWorkoutModalProps) => {
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(initialDayOfWeek);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (visible) setDayOfWeek(initialDayOfWeek);
  }, [initialDayOfWeek, visible]);

  const handleSave = () => {
    if (description.trim().length === 0) return;
    onSave(dayOfWeek, description.trim());
    setDescription('');
    setDayOfWeek(initialDayOfWeek);
  };

  const handleCancel = () => {
    setDescription('');
    setDayOfWeek(initialDayOfWeek);
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
          {lockDaySelection ? (
            <View style={styles.lockedDay}>
              <Text style={styles.lockedDayText}>{DayOfWeekMessage[dayOfWeek]}</Text>
            </View>
          ) : <View style={styles.daySelectorGrid}>
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
          </View>}

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
