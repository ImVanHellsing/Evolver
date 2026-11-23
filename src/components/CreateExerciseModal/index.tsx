import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { MuscleGroup, MuscleGroupTranslate } from '@/models/MuscleGroup';

import { styles } from './styles';

interface CreateExerciseModalProps {
  visible: boolean;
  onSave: (
    name: string,
    muscleGroup: MuscleGroup,
    description: string
  ) => boolean | Promise<boolean>;
  onCancel: () => void;
}

const MUSCLE_GROUPS = Object.values(MuscleGroup) as MuscleGroup[];

export const CreateExerciseModal = ({
  visible,
  onSave,
  onCancel,
}: CreateExerciseModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const canSave = name.trim().length > 0 && muscleGroup !== null && !isSaving;

  const reset = () => {
    setName('');
    setDescription('');
    setMuscleGroup(null);
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleSave = async () => {
    if (!canSave || !muscleGroup) return;
    setIsSaving(true);
    try {
      const saved = await onSave(name.trim(), muscleGroup, description.trim());
      if (saved) reset();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={handleCancel}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Adicionar exercício</Text>
          <Text style={styles.modalSubtitle}>
            Informe o exercício e escolha seu principal grupamento muscular.
          </Text>

          <ScrollView
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>Nome do exercício</Text>
            <TextInput
              autoCapitalize="sentences"
              maxLength={80}
              onChangeText={setName}
              placeholder="Ex: Supino inclinado"
              style={styles.input}
              value={name}
            />

            <Text style={styles.label}>Grupamento muscular</Text>
            <View accessibilityRole="radiogroup" style={styles.muscleGrid}>
              {MUSCLE_GROUPS.map(group => {
                const selected = group === muscleGroup;
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    key={group}
                    onPress={() => setMuscleGroup(group)}
                    style={[styles.muscleChip, selected && styles.muscleChipSelected]}
                  >
                    <Text style={[styles.muscleChipText, selected && styles.muscleChipTextSelected]}>
                      {MuscleGroupTranslate[group]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Descrição (opcional)</Text>
            <TextInput
              maxLength={500}
              multiline
              onChangeText={setDescription}
              placeholder="Orientações de execução, ajustes ou observações"
              style={[styles.input, styles.descriptionInput]}
              textAlignVertical="top"
              value={description}
            />
          </ScrollView>

          <View style={styles.modalButtons}>
            <Pressable onPress={handleCancel} style={[styles.modalButton, styles.cancelButton]}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
            <Pressable
              disabled={!canSave}
              onPress={handleSave}
              style={[
                styles.modalButton,
                styles.confirmButton,
                !canSave && styles.disabledButton,
              ]}
            >
              <Text style={styles.confirmButtonText}>
                {isSaving ? 'Adicionando…' : 'Adicionar'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
