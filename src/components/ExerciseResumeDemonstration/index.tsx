import React from 'react';
import { PanResponderInstance, Pressable, Text, View } from 'react-native';

import { ExerciseTemplate } from '@/models/Exercise';
import { getFailureTypeMessage } from '@/models/FailureType';
import { getMuscleGroupMessage } from '@/models/MuscleGroup';
import { SetTemplate } from '@/models/Set';
import { SetType } from '@/models/SetType';

import { styles } from './styles';

interface ExerciseResumeDemonstrationProps {
  exercise: ExerciseTemplate;
  onEditDescription?: (exercise: ExerciseTemplate) => void;
  isReordering?: boolean;
  onRemove?: (exercise: ExerciseTemplate) => void;
  dragHandlers?: PanResponderInstance['panHandlers'];
}

export const ExerciseResumeDemonstration = ({
  exercise,
  onEditDescription,
  isReordering = false,
  onRemove,
  dragHandlers,
}: ExerciseResumeDemonstrationProps) => {
  const getExercisePersonalRecordText = (item: ExerciseTemplate) => {
    const sets = item.sets || [];
    if (sets.length === 0) return null;
    const lastSet = sets[sets.length - 1];
    const shouldShowPersonalRecord = lastSet && lastSet.weight && lastSet.reps;
    const personalRecordText = shouldShowPersonalRecord
      ? `PR ${lastSet.weight} kgs x ${lastSet.reps} ${getFailureTypeMessage(lastSet.failureType)}`
      : '';
    return shouldShowPersonalRecord
      ? <Text style={styles.desc}>{personalRecordText}</Text>
      : null;
  };

  const getAmountOfSetsText = (sets?: SetTemplate[]) => {
    if (!sets || sets.length === 0) return 'Séries livres';
    const validSetTypes = [SetType.TopSet, SetType.WorkSet];
    const validSets = sets.filter(set => validSetTypes.includes(set.type));
    if (validSets.length === 0) return 'Séries livres';
    return `${validSets.length} ${validSets.length === 1 ? 'x Série válida' : 'x Séries válidas'}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {isReordering ? (
          <View
            accessibilityLabel={`Arrastar ${exercise.name} para alterar a ordem`}
            accessibilityRole="adjustable"
            style={styles.dragHandle}
            {...dragHandlers}
          >
            <Text style={styles.dragHandleIcon}>↕</Text>
          </View>
        ) : null}
        <View style={styles.muscleBadge}>
          <Text numberOfLines={1} style={styles.muscleText}>
            {getMuscleGroupMessage(exercise.muscleGroup)}
          </Text>
        </View>
        <View style={styles.leftContent}>
          <Text style={styles.title}>{exercise.name}</Text>
          <Text style={styles.desc}>{getAmountOfSetsText(exercise.sets)}</Text>
          {getExercisePersonalRecordText(exercise)}
        </View>
        {isReordering && onRemove ? (
          <View style={styles.rightContent}>
            <Pressable
              accessibilityLabel={`Remover ${exercise.name}`}
              hitSlop={8}
              onPress={() => onRemove(exercise)}
              style={styles.removeIconButton}
            >
              <Text style={styles.removeIcon}>−</Text>
            </Pressable>
          </View>
        ) : onEditDescription ? (
          <View style={styles.rightContent}>
            <Pressable
              accessibilityLabel="Editar observação do exercício"
              hitSlop={8}
              onPress={() => onEditDescription(exercise)}
              style={styles.editIconButton}
            >
              <Text style={styles.editIcon}>✏️</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      {!isReordering && exercise.description ? (
        <View style={styles.descriptionContainer}>
          <Text numberOfLines={3} style={styles.descriptionText}>
            {exercise.description}
          </Text>
        </View>
      ) : null}
    </View>
  );
};
