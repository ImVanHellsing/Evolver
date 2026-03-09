import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';

import { Exercise } from '@/models/Exercise';
import { getFailureTypeMessage } from '@/models/FailureType';
import { getMuscleGroupMessage } from '@/models/MuscleGroup';
import { Set } from '@/models/Set';
import { SetType } from '@/models/SetType';

import { styles } from './styles';

interface ExerciseResumeDemonstrationProps {
  exercise: Exercise;
  onPress: (exercise: Exercise) => void;
}

export const ExerciseResumeDemonstration = ({ exercise, onPress }: ExerciseResumeDemonstrationProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const getExercisePersonalRecordText = (exercise: Exercise) => {
    if (!exercise.sets || exercise.sets.length === 0) return 'Sem séries';
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const shouldShowPersonalRecord = lastSet && lastSet.weight && lastSet.reps
    const personalRecordText = shouldShowPersonalRecord ? `PR ${lastSet.weight} kgs x ${lastSet.reps} ${getFailureTypeMessage(lastSet.failureType)}` : '';
    return shouldShowPersonalRecord ? <Text style={styles.desc}>{personalRecordText}</Text> : null;
  };

  const getAmountOfSetsText = (sets: Set[]) => {
    const validSetTypes = [SetType.TopSet, SetType.WorkSet];
    const validSets = sets.filter((set) => validSetTypes.includes(set.type));
    if (!validSets || validSets.length === 0) return '0 séries';
    return `${validSets.length} ${validSets.length === 1 ? 'x Série válida' : 'x Séries válidas'}`;
  };

  return (
    <Pressable
      style={styles.pressableContainer}
      onPress={() => onPress(exercise)}
    >
      <View style={styles.topRow}>
        <View style={styles.muscleBadge}>
          <Text style={styles.muscleText} numberOfLines={1}>{getMuscleGroupMessage(exercise.muscleGroup)}</Text>
        </View>
        <View style={styles.leftContent}>
          <Text style={styles.title}>{exercise.name}</Text>
          <Text style={styles.desc}>{getAmountOfSetsText(exercise.sets)}</Text>
          {getExercisePersonalRecordText(exercise)}
        </View>
        <View style={styles.rightContent}>
          <Pressable onPress={(e) => {
            e.stopPropagation();
            toggleExpand();
          }}>
            <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
          </Pressable>
        </View>
      </View>

      {isExpanded && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{exercise.description}</Text>
        </View>
      )}
    </Pressable>
  );
};
