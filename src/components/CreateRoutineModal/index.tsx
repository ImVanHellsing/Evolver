import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable } from 'react-native';
import { styles } from './styles';

interface CreateRoutineModalProps {
  visible: boolean;
  onSave: (name: string) => void;
  onCancel: () => void;
}

export const CreateRoutineModal = ({
  visible,
  onSave,
  onCancel,
}: CreateRoutineModalProps) => {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (name.trim().length === 0) return;
    onSave(name.trim());
    setName('');
  };

  const handleCancel = () => {
    setName('');
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
          <Text style={styles.modalTitle}>Nova Rotina</Text>
          <Text style={styles.modalMessage}>Digite o nome para a sua nova rotina de treinos.</Text>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Minha Rotina PPL"
            autoFocus={true}
          />

          <View style={styles.modalButtons}>
            <Pressable style={[styles.modalButton, styles.modalButtonCancel]} onPress={handleCancel}>
              <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={[
                styles.modalButton,
                styles.modalButtonConfirm,
                name.trim().length === 0 && styles.modalButtonDisabled
              ]}
              onPress={handleSave}
              disabled={name.trim().length === 0}
            >
              <Text style={styles.modalButtonTextConfirm}>Criar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
