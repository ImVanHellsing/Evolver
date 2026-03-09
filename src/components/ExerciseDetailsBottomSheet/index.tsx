import React from 'react';
import { Modal, View, Text, TouchableWithoutFeedback, ScrollView } from 'react-native';

import { Exercise } from '@/models/Exercise';
import { getMuscleGroupMessage } from '@/models/MuscleGroup';
import { getSetTypeMessage, } from '@/models/SetType';

import { styles } from './styles';

interface ExerciseDetailsBottomSheetProps {
  exercise: Exercise;
  isVisible: boolean;
  onClose: () => void;
}

export const ExerciseDetailsBottomSheet = ({
  exercise,
  isVisible,
  onClose
}: ExerciseDetailsBottomSheetProps) => {

  const renderMuscleBadge = () => {
    return (
      <View style={styles.muscleBadge}>
        <Text style={styles.muscleText} numberOfLines={1}>{getMuscleGroupMessage(exercise.muscleGroup)}</Text>
      </View>
    );
  };

  const renderSets = () => {
    return <>
      <Text style={styles.subtitle}>Séries</Text>
      {exercise.sets.map((set, index) => (
        <View key={index}>
          <Text>1 x {getSetTypeMessage(set.type)}</Text>
        </View>
      ))}
    </>
  };

  const renderDescription = () => {
    return <View style={styles.descriptionContainer}>
      <Text style={styles.subtitle}>Observações</Text>
      <Text>{exercise.description}</Text>
    </View>
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <View style={styles.topRow}>
                {renderMuscleBadge()}
                <Text style={styles.title}>{exercise.name}</Text>
              </View>
              <ScrollView>
                {renderSets()}
                {renderDescription()}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
