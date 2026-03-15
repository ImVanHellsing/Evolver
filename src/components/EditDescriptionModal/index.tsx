import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';

import { styles } from './styles';

interface EditDescriptionModalProps {
  visible: boolean;
  initialDescription: string;
  onSave: (newDescription: string) => void;
  onCancel: () => void;
}

export const EditDescriptionModal = ({
  visible,
  initialDescription,
  onSave,
  onCancel,
}: EditDescriptionModalProps) => {
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    if (visible) {
      setDescription(initialDescription);
    }
  }, [visible, initialDescription]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar Observação</Text>
            
            <TextInput
              style={styles.textInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Adicione uma observação sobre a execução, ajuste do banco, etc..."
              multiline
              autoFocus
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalButton, styles.modalButtonCancel]} onPress={onCancel}>
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </Pressable>

              <Pressable style={[styles.modalButton, styles.modalButtonConfirm]} onPress={() => onSave(description)}>
                <Text style={styles.modalButtonTextConfirm}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
