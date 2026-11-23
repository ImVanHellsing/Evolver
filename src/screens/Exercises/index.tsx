import React, { useRef, useState } from "react";
import { Animated, Pressable, ScrollView, Text, View, Alert, PanResponder } from "react-native";

import { useAppRouteParams } from "@/hooks/useAppRouteParams";
import { Header } from "@/components/Header";
import { ExerciseTemplate } from "@/models/Exercise";
import { ExerciseResumeDemonstration } from "@/components/ExerciseResumeDemonstration";
import { EditDescriptionModal } from "@/components/EditDescriptionModal";
import { EditWorkoutModal } from "@/components/EditWorkoutModal";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { routinesRepository } from "@/services/routines/routinesRepository";
import { DayOfWeek, getDayOfWeekMessage } from "@/models/DayOfWeek";

import { styles } from "./styles";

const REORDER_ITEM_HEIGHT = 94;

const AddExerciseButton = () => (
  <Pressable
    accessibilityRole="button"
    style={styles.addExerciseButton}
    onPress={() => Alert.alert(
      'Funcionalidade indisponível',
      'A adição de exercícios estará disponível em uma próxima atualização.'
    )}
  >
    <Text style={styles.addExerciseIcon}>＋</Text>
    <Text style={styles.addExerciseText}>Adicionar exercício</Text>
  </Pressable>
);

export const reorderExercise = (
  exercises: ExerciseTemplate[],
  fromIndex: number,
  toIndex: number
) => {
  const next = [...exercises];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

interface ReorderableExerciseProps {
  exercise: ExerciseTemplate;
  index: number;
  itemCount: number;
  onMove: (fromIndex: number, toIndex: number) => void;
  onRemove: (exercise: ExerciseTemplate) => void;
}

const ReorderableExercise = ({
  exercise,
  index,
  itemCount,
  onMove,
  onRemove,
}: ReorderableExerciseProps) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const [isDragging, setIsDragging] = useState(false);
  const indexRef = useRef(index);
  const itemCountRef = useRef(itemCount);
  const onMoveRef = useRef(onMove);

  indexRef.current = index;
  itemCountRef.current = itemCount;
  onMoveRef.current = onMove;

  const finishDrag = (distanceY: number) => {
    const fromIndex = indexRef.current;
    const toIndex = Math.max(
      0,
      Math.min(
        itemCountRef.current - 1,
        fromIndex + Math.round(distanceY / REORDER_ITEM_HEIGHT)
      )
    );
    translateY.setValue(0);
    setIsDragging(false);
    if (toIndex !== fromIndex) onMoveRef.current(fromIndex, toIndex);
  };

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: () => setIsDragging(true),
    onPanResponderMove: (_, gesture) => translateY.setValue(gesture.dy),
    onPanResponderRelease: (_, gesture) => finishDrag(gesture.dy),
    onPanResponderTerminate: (_, gesture) => finishDrag(gesture.dy),
    onPanResponderTerminationRequest: () => false,
  })).current;

  return (
    <Animated.View
      style={[
        styles.reorderableItem,
        isDragging && styles.reorderableItemDragging,
        { transform: [{ translateY }] },
      ]}
    >
      <ExerciseResumeDemonstration
        exercise={exercise}
        isReordering
        dragHandlers={panResponder.panHandlers}
        onRemove={onRemove}
      />
    </Animated.View>
  );
};

export const ExercisesScreen = () => {
  const navigation = useAppNavigation();

  const { routineTemplateId, workout } = useAppRouteParams<'Exercises'>();

  const [currentWorkout, setCurrentWorkout] = useState(workout);
  
  const [isEditDescriptionModalVisible, setIsEditDescriptionModalVisible] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseTemplate | null>(null);

  const [isEditWorkoutModalVisible, setIsEditWorkoutModalVisible] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [draftExercises, setDraftExercises] = useState<ExerciseTemplate[]>(workout.exercises);

  const onRunWorkoutPressed = () => {
    if (currentWorkout.exercises.length === 0) return;
    navigation.navigate('WorkoutRunner', { routineTemplateId, workout: currentWorkout });
  }

  const onEditWorkoutPressed = () => {
    setIsEditWorkoutModalVisible(true);
  }

  const enterReorderMode = () => {
    setDraftExercises(currentWorkout.exercises);
    setIsReordering(true);
  };

  const revertOrder = () => {
    setDraftExercises(currentWorkout.exercises);
    setIsReordering(false);
  };

  const saveOrder = async () => {
    try {
      const routine = await routinesRepository.getById(routineTemplateId);
      if (!routine) return;
      const workoutIndex = routine.workouts.findIndex(item => item.id === currentWorkout.id);
      if (workoutIndex === -1) return;

      routine.workouts[workoutIndex].exercises = [...draftExercises];
      await routinesRepository.save(routine);
      setCurrentWorkout(routine.workouts[workoutIndex]);
      setIsReordering(false);
    } catch (error) {
      console.error('Error saving exercise order:', error);
      Alert.alert('Erro', 'Não foi possível salvar a nova ordem dos exercícios.');
    }
  };

  const removeExercise = (exercise: ExerciseTemplate) => {
    Alert.alert(
      'Remover exercício',
      `Deseja remover “${exercise.name}” deste treino? A remoção só será aplicada ao salvar a ordem.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => setDraftExercises(items => items.filter(item => item.id !== exercise.id)),
        },
      ]
    );
  };

  const moveExercise = (fromIndex: number, toIndex: number) => {
    setDraftExercises(items => reorderExercise(items, fromIndex, toIndex));
  };

  const handleEditWorkout = async (dayOfWeek: DayOfWeek, description: string) => {
    try {
      const routine = await routinesRepository.getById(routineTemplateId);
      if (!routine) return;

      const workoutIndex = routine.workouts.findIndex(w => w.id === currentWorkout.id);
      if (workoutIndex === -1) return;

      // Update the workout
      routine.workouts[workoutIndex].dayOfWeek = dayOfWeek;
      routine.workouts[workoutIndex].description = description;

      // Save to repository
      await routinesRepository.save(routine);

      // Update local state to reflect changes instantly
      setCurrentWorkout(routine.workouts[workoutIndex]);
      setIsEditWorkoutModalVisible(false);
    } catch (error) {
      console.error('Error updating workout:', error);
      Alert.alert('Erro', 'Ocorreu um problema ao salvar as alterações do treino.');
    }
  }

  const onEditDescriptionPressed = (exercise: ExerciseTemplate) => {
    setEditingExercise(exercise);
    setIsEditDescriptionModalVisible(true);
  }

  const handleSaveDescription = async (newDescription: string) => {
    if (!editingExercise) return;

    try {
      const routine = await routinesRepository.getById(routineTemplateId);
      if (!routine) return;

      const workoutIndex = routine.workouts.findIndex(w => w.id === currentWorkout.id);
      if (workoutIndex === -1) return;

      const exerciseIndex = routine.workouts[workoutIndex].exercises.findIndex(e => e.id === editingExercise.id);
      if (exerciseIndex === -1) return;

      // Update the description
      routine.workouts[workoutIndex].exercises[exerciseIndex].description = newDescription;

      // Save to repository
      await routinesRepository.save(routine);

      // Update local state to reflect changes instantly
      setCurrentWorkout(routine.workouts[workoutIndex]);

      setIsEditDescriptionModalVisible(false);
      setEditingExercise(null);
    } catch (error) {
      console.error('Error saving description:', error);
      Alert.alert('Erro', 'Ocorreu um problema ao tentar salvar a observação.');
    }
  }

  const renderActionButtons = () => {
    if (isReordering) {
      return (
        <View style={styles.reorderActions}>
          <Pressable accessibilityRole="button" style={styles.revertButton} onPress={revertOrder}>
            <Text style={styles.revertButtonText}>Reverter</Text>
          </Pressable>
          <Pressable accessibilityRole="button" style={styles.saveOrderButton} onPress={saveOrder}>
            <Text style={styles.saveOrderButtonText}>Salvar ordem</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <>
        {currentWorkout.exercises.length > 0 ? (
          <Pressable style={styles.fabRunWorkout} onPress={onRunWorkoutPressed}>
            <Text style={styles.fabIcon}>🏋️</Text>
          </Pressable>
        ) : null}
        <Pressable accessibilityLabel="Alterar exercícios" style={styles.fab} onPress={enterReorderMode}>
          <Text style={styles.fabIcon}>✏️</Text>
        </Pressable>
      </>
    )
  }

  const displayedExercises = isReordering ? draftExercises : currentWorkout.exercises;

  return (
    <View style={styles.container}>
      <Header title="Exercícios" showBackButton />
      <ScrollView 
        style={styles.innerContainer} 
        contentContainerStyle={[
          styles.scrollContent,
        ]}
        showsVerticalScrollIndicator={isReordering}
      >
        <View style={styles.workoutSectionHeader}>
          <View style={styles.workoutSectionContent}>
            <Text style={styles.workoutSectionEyebrow}>TREINO</Text>
            <Text style={styles.workoutSectionTitle} numberOfLines={2}>
              {currentWorkout.description || 'Treino sem descrição'}
            </Text>
            <Text style={styles.workoutSectionSubtitle}>
              {getDayOfWeekMessage(currentWorkout.dayOfWeek)}
            </Text>
            <Text style={styles.workoutSectionExerciseCount}>
              {displayedExercises.length}{' '}
              {displayedExercises.length === 1 ? 'exercício neste treino' : 'exercícios neste treino'}
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Editar dia e descrição do treino"
            hitSlop={8}
            onPress={onEditWorkoutPressed}
            style={styles.sectionEditButton}
          >
            <Text style={styles.sectionEditIcon}>✏️</Text>
          </Pressable>
        </View>
        {isReordering ? (
          <View style={styles.reorderHint}>
            <Text style={styles.reorderHintTitle}>Organizar exercícios</Text>
            <Text style={styles.reorderHintText}>
              Arraste pelo controle à esquerda. Use o botão vermelho para remover.
            </Text>
          </View>
        ) : null}
        {displayedExercises.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>＋</Text>
            </View>
            <Text style={styles.emptyTitle}>
              {isReordering ? 'Todos os exercícios foram removidos' : 'Nenhum exercício adicionado'}
            </Text>
            <Text style={styles.emptyDescription}>
              {isReordering
                ? 'Reverta as alterações ou salve para manter este treino sem exercícios.'
                : 'Este treino foi criado sem exercícios. Você poderá montar a lista de exercícios posteriormente.'}
            </Text>
            {!isReordering ? <AddExerciseButton /> : null}
          </View>
        ) : (
          <>
            {displayedExercises.map((exercise, index) => isReordering ? (
              <ReorderableExercise
                key={exercise.id}
                exercise={exercise}
                index={index}
                itemCount={displayedExercises.length}
                onMove={moveExercise}
                onRemove={removeExercise}
              />
            ) : (
              <ExerciseResumeDemonstration
                key={exercise.id}
                exercise={exercise}
                onEditDescription={onEditDescriptionPressed}
              />
            ))}
            {!isReordering ? <AddExerciseButton /> : null}
          </>
        )}
      </ScrollView>

      {renderActionButtons()}

      {editingExercise && (
        <EditDescriptionModal
          visible={isEditDescriptionModalVisible}
          initialDescription={editingExercise.description || ''}
          onSave={handleSaveDescription}
          onCancel={() => {
            setIsEditDescriptionModalVisible(false);
            setEditingExercise(null);
          }}
        />
      )}

      <EditWorkoutModal
        visible={isEditWorkoutModalVisible}
        initialDayOfWeek={currentWorkout.dayOfWeek}
        initialDescription={currentWorkout.description || ''}
        onSave={handleEditWorkout}
        onCancel={() => setIsEditWorkoutModalVisible(false)}
      />
    </View>
  );
}
