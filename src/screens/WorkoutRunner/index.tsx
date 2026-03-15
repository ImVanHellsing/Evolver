import React from 'react';
import { Text, View, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

import { useAppRouteParams } from '@/hooks/useAppRouteParams';
import { useWorkoutRunner } from './useWorkoutRunner';
import { Header } from '@/components/Header';
import { getMuscleGroupMessage } from '@/models/MuscleGroup';
import { getSetTypeMessage } from '@/models/SetType';
import { FailureType, FailureTypeMessage } from '@/models/FailureType';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { FinishWorkoutModal } from '@/components/FinishWorkoutModal';

import { styles } from './styles';

export const WorkoutRunnerScreen = () => {
  const { routineTemplateId, workout } = useAppRouteParams<'WorkoutRunner'>();

  const {
    hint,
    weight,
    setWeight,
    reps,
    setReps,
    failureType,
    setFailureType,
    onEndPressed,
    onSaveSetPressed,
    isExitModalVisible,
    onConfirmExit,
    onCancelExit,
    currentExercise,
    currentSet,
    observation,
    setObservation,
    shouldShowObservationField,
    isFinishModalVisible,
    calories,
    setCalories,
    onFinishWorkout,
    isResting,
    secondsLeft,
    skipRest,
    duration,
    setDuration,
  } = useWorkoutRunner(routineTemplateId, workout);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title={workout.dayOfWeek} onActionPress={onEndPressed} showBackButton />
      <Text style={styles.title}>{hint}</Text>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
      >

        <View style={styles.exerciseInfoContainer}>

          <View style={styles.muscleBadge}>
            <Text style={styles.muscleText} numberOfLines={1}>{getMuscleGroupMessage(currentExercise.muscleGroup)}</Text>
          </View>

          <View style={styles.exerciseInfoTextContainer}>
            <Text style={styles.exerciseName}>{currentExercise.name}</Text>
            <Text style={styles.currentSetType}>{getSetTypeMessage(currentSet.type)}</Text>
          </View>

        </View>

        {!!currentExercise.description && (
          <View style={styles.exerciseDescriptionContainer}>
            <Text style={styles.exerciseDescriptionText}>{currentExercise.description}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.setFormContent}>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Carga (kg)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholder="0"
              autoFocus={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Repetições</Text>
            <TextInput
              style={styles.input}
              value={reps}
              onChangeText={setReps}
              keyboardType="numeric"
              placeholder="0"
              maxLength={2}
            />
          </View>

          {
            shouldShowObservationField && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Observação</Text>
                <TextInput
                  style={styles.input}
                  value={observation}
                  onChangeText={setObservation}
                  keyboardType="default"
                />
              </View>
            )
          }

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tipo de Falha</Text>
            <View style={styles.setTypeSelector}>
              {Object.entries(FailureTypeMessage).map(([key, label]) => (
                <Pressable
                  key={key}
                  style={[
                    styles.setTypeChip,
                    failureType === key && styles.setTypeChipSelected
                  ]}
                  onPress={() => setFailureType(key as FailureType)}
                >
                  <Text style={[
                    styles.setTypeChipText,
                    failureType === key && styles.setTypeChipTextSelected
                  ]}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {weight === '' || reps === '' ? (
            <Text style={styles.waitingText}>Aguardando preenchimento da série...</Text>
          ) : (
            <Pressable style={styles.saveButton} onPress={onSaveSetPressed}>
              <Text style={styles.saveButtonText}>Salvar série</Text>
            </Pressable>
          )}
        </View>

      </ScrollView>

      <Pressable style={styles.fab} onPress={onEndPressed}>
        <Text style={styles.fabIcon}>✋</Text>
      </Pressable>

      <ConfirmationModal
        visible={isExitModalVisible}
        title="Interromper treino?"
        description="O progresso atual do treino não será salvo."
        confirmText="Sim, sair"
        cancelText="Não"
        onConfirm={onConfirmExit}
        onCancel={onCancelExit}
      />

      <FinishWorkoutModal
        visible={isFinishModalVisible}
        duration={duration}
        setDuration={setDuration}
        calories={calories}
        setCalories={setCalories}
        onFinish={onFinishWorkout}
      />

      {isResting && (
        <View style={styles.timerOverlay}>
          <Text style={styles.timerTitle}>Descanso</Text>
          <Text style={styles.timerSeconds}>{secondsLeft}</Text>
          <Text style={styles.timerLabel}>segundos</Text>

          <Pressable style={styles.skipTimerButton} onPress={skipRest}>
            <Text style={styles.skipTimerText}>Pular Descanso</Text>
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
