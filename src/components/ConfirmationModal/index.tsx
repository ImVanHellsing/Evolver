import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { styles } from './styles';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal = ({
  visible,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{description}</Text>

          <View style={styles.modalButtons}>
            <Pressable style={[styles.modalButton, styles.modalButtonCancel]} onPress={onCancel}>
              <Text style={styles.modalButtonTextCancel}>{cancelText}</Text>
            </Pressable>

            <Pressable style={[styles.modalButton, styles.modalButtonConfirm]} onPress={onConfirm}>
              <Text style={styles.modalButtonTextConfirm}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
