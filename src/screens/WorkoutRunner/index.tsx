import React from 'react';
import { Text, View, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

import { useAppRouteParams } from '@/hooks/useAppRouteParams';
import { useWorkoutRunner } from './useWorkoutRunner';
import { Header } from '@/components/Header';
import { getMuscleGroupMessage } from '@/models/MuscleGroup';
import { getSetTypeMessage, SetType } from '@/models/SetType';
import { FailureType, FailureTypeMessage } from '@/models/FailureType';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { FinishWorkoutModal } from '@/components/FinishWorkoutModal';
import { MissingExercisesModal } from '@/components/MissingExercisesModal';
import { EditDescriptionModal } from '@/components/EditDescriptionModal';

import { styles } from './styles';

export const WorkoutRunnerScreen = () => {
  const { routineTemplateId, workout } = useAppRouteParams<'WorkoutRunner'>();

  const {
    currentExerciseIndex,
    hint,
    weight,
    setWeight,
    reps,
    setReps,
    failureType,
    setFailureType,
    selectedSetType,
    setSelectedSetType,
    onEndPressed,
    onSaveSetPressed,
    isExitModalVisible,
    onConfirmExit,
    onCancelExit,
    currentExercise,
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
    isEditDescriptionModalVisible,
    onEditDescriptionPressed,
    handleSaveDescription,
    onCancelEditDescription,
    previousPerformance,
    personalRecord,

    // Evolver 2.0 properties
    exercisesState,
    loggedSetsForCurrentExercise,
    goToExercise,
    onSkipExercisePressed,
    onPrevExercisePressed,
    onNextExercisePressed,
    isMissingModalVisible,
    setIsMissingModalVisible,
    missingExerciseNames,
    onConfirmMissingExercises,
  } = useWorkoutRunner(routineTemplateId, workout);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title={workout.description || workout.dayOfWeek} onActionPress={onEndPressed} showBackButton />
      
      {/* Exercise Horizontal Tabs Bar */}
      <View style={styles.exerciseNavWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.exerciseNavContainer}
          contentContainerStyle={styles.exerciseNavContent}
        >
          {exercisesState.map((ex, index) => {
            const isActive = index === currentExerciseIndex;
            return (
              <Pressable
                key={ex.id}
                style={[
                  styles.exerciseNavTab,
                  isActive && styles.exerciseNavTabActive,
                  ex.isCompleted && styles.exerciseNavTabCompleted,
                  ex.isSkipped && styles.exerciseNavTabSkipped,
                ]}
                onPress={() => goToExercise(index)}
              >
                <Text style={[
                  styles.exerciseNavTabText,
                  isActive && styles.exerciseNavTabTextActive,
                  ex.isCompleted && styles.exerciseNavTabTextCompleted,
                  ex.isSkipped && styles.exerciseNavTabTextSkipped,
                ]}>
                  {ex.isCompleted ? '✓ ' : ex.isSkipped ? '⚠ ' : ''}{ex.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <Text style={styles.title}>{hint}</Text>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
      >
        {/* Active Exercise Detail */}
        <View style={styles.exerciseInfoContainer}>
          <View style={styles.muscleBadge}>
            <Text style={styles.muscleText} numberOfLines={1}>{getMuscleGroupMessage(currentExercise.muscleGroup)}</Text>
          </View>

          <View style={styles.exerciseInfoTextContainer}>
            <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          </View>
        </View>

        {/* Previous performance & personal record */}
        {(previousPerformance || personalRecord) && (
          <View style={styles.performanceContainer}>
            {previousPerformance && (
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>Anterior (Mesmo tipo)</Text>
                <Text style={styles.performanceValue}>
                  {previousPerformance.weight}kg x {previousPerformance.reps} {previousPerformance.failureType ? `(${FailureTypeMessage[previousPerformance.failureType]})` : ''}
                </Text>
              </View>
            )}
            {personalRecord && (
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>PR Geral</Text>
                <Text style={styles.performanceValue}>{personalRecord.weight}kg x {personalRecord.reps}</Text>
              </View>
            )}
          </View>
        )}

        {/* Exercise Description / Notes */}
        <Pressable 
          style={styles.exerciseDescriptionContainer}
          onPress={onEditDescriptionPressed}
        >
          {currentExercise.description ? (
            <Text style={styles.exerciseDescriptionText}>{currentExercise.description}</Text>
          ) : (
            <Text style={styles.addDescriptionText}>+ Adicionar observação ao exercício</Text>
          )}
        </Pressable>

        <View style={styles.divider} />

        {/* Logged Sets for this Exercise */}
        {loggedSetsForCurrentExercise.length > 0 && (
          <View style={styles.loggedSetsContainer}>
            <Text style={styles.sectionSubtitle}>Séries Realizadas</Text>
            {loggedSetsForCurrentExercise.map((set, idx) => (
              <View key={set.id} style={styles.loggedSetRow}>
                <Text style={styles.loggedSetIndex}>{idx + 1}º</Text>
                <View style={styles.loggedSetDetails}>
                  <Text style={styles.loggedSetTypeText}>{getSetTypeMessage(set.type)}</Text>
                  <Text style={styles.loggedSetValueText}>
                    {set.weight}kg x {set.reps} reps {set.failureType ? `(${FailureTypeMessage[set.failureType]})` : ''}
                  </Text>
                </View>
                {!!set.notes && <Text style={styles.loggedSetNotes}>{set.notes}</Text>}
              </View>
            ))}
            <View style={styles.divider} />
          </View>
        )}

        {/* Save Set Form */}
        <View style={styles.setFormContent}>
          {/* Dynamic Set Type Selector */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tipo de Série</Text>
            <View style={styles.setTypeSelector}>
              {Object.values(SetType).map((type) => (
                <Pressable
                  key={type}
                  style={[
                    styles.setTypeChip,
                    selectedSetType === type && styles.setTypeChipSelected
                  ]}
                  onPress={() => setSelectedSetType(type)}
                >
                  <Text style={[
                    styles.setTypeChipText,
                    selectedSetType === type && styles.setTypeChipTextSelected
                  ]}>
                    {getSetTypeMessage(type)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>Carga (kg)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>Repetições</Text>
              <TextInput
                style={styles.input}
                value={reps}
                onChangeText={setReps}
                keyboardType="numeric"
                placeholder="0"
                maxLength={3}
              />
            </View>
          </View>

          {shouldShowObservationField && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Observação da Série</Text>
              <TextInput
                style={styles.input}
                value={observation}
                onChangeText={setObservation}
                placeholder="Ex: Sentimento de esforço"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tipo de Falha</Text>
            <View style={styles.failureTypeSelector}>
              {Object.entries(FailureTypeMessage).map(([key, label]) => (
                <Pressable
                  key={key}
                  style={[
                    styles.failureTypeChip,
                    failureType === key && styles.failureTypeChipSelected
                  ]}
                  onPress={() => setFailureType(key as FailureType)}
                >
                  <Text style={[
                    styles.failureTypeChipText,
                    failureType === key && styles.failureTypeChipTextSelected
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

        {/* Exercise skipping / navigation */}
        <View style={styles.navigationButtonsRow}>
          <Pressable
            style={[styles.navBtn, currentExerciseIndex === 0 && styles.navBtnDisabled]}
            onPress={onPrevExercisePressed}
            disabled={currentExerciseIndex === 0}
          >
            <Text style={styles.navBtnText}>◀ Anterior</Text>
          </Pressable>

          <Pressable
            style={styles.skipBtn}
            onPress={onSkipExercisePressed}
          >
            <Text style={styles.skipBtnText}>Pular / Próximo ⏭</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Floating Action Button to manually trigger finish workout checklist */}
      <Pressable style={styles.fab} onPress={onEndPressed}>
        <Text style={styles.fabIcon}>🏁</Text>
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

      <MissingExercisesModal
        visible={isMissingModalVisible}
        missingExerciseNames={missingExerciseNames}
        onConfirm={onConfirmMissingExercises}
        onCancel={() => setIsMissingModalVisible(false)}
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
          <Text style={styles.timerTitle}>Descanso Inteligente</Text>
          <Text style={styles.timerSeconds}>{secondsLeft}</Text>
          <Text style={styles.timerLabel}>segundos</Text>

          <Pressable style={styles.skipTimerButton} onPress={skipRest}>
            <Text style={styles.skipTimerText}>Pular Descanso</Text>
          </Pressable>
        </View>
      )}

      <EditDescriptionModal
        visible={isEditDescriptionModalVisible}
        initialDescription={currentExercise.description || ''}
        onSave={handleSaveDescription}
        onCancel={onCancelEditDescription}
      />
    </KeyboardAvoidingView>
  );
}
