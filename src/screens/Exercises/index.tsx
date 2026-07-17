import React, { useState } from "react";
import { Pressable, ScrollView, Text, View, Alert } from "react-native";

import { useAppRouteParams } from "@/hooks/useAppRouteParams";
import { Header } from "@/components/Header";
import { ExerciseTemplate } from "@/models/Exercise";
import { ExerciseResumeDemonstration } from "@/components/ExerciseResumeDemonstration";
import { ExerciseDetailsBottomSheet } from "@/components/ExerciseDetailsBottomSheet";
import { EditDescriptionModal } from "@/components/EditDescriptionModal";
import { EditWorkoutModal } from "@/components/EditWorkoutModal";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { routinesRepository } from "@/services/routines/routinesRepository";
import { DayOfWeek } from "@/models/DayOfWeek";

import { styles } from "./styles";

export const ExercisesScreen = () => {
  const navigation = useAppNavigation();

  const { routineTemplateId, workout } = useAppRouteParams<'Exercises'>();

  const [currentWorkout, setCurrentWorkout] = useState(workout);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseTemplate | null>(
    currentWorkout.exercises[0] ?? null
  );
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  
  const [isEditDescriptionModalVisible, setIsEditDescriptionModalVisible] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseTemplate | null>(null);

  const [isEditWorkoutModalVisible, setIsEditWorkoutModalVisible] = useState(false);

  const onRunWorkoutPressed = () => {
    if (currentWorkout.exercises.length === 0) return;
    navigation.navigate('WorkoutRunner', { routineTemplateId, workout: currentWorkout });
  }

  const onEditWorkoutPressed = () => {
    setIsEditWorkoutModalVisible(true);
  }

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

  const onExercisePressed = (exercise: ExerciseTemplate) => {
    setSelectedExercise(exercise);
    setIsBottomSheetVisible(true);
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
    return (
      <>
        {currentWorkout.exercises.length > 0 ? (
          <Pressable style={styles.fabRunWorkout} onPress={onRunWorkoutPressed}>
            <Text style={styles.fabIcon}>🏋️</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.fab} onPress={onEditWorkoutPressed}>
          <Text style={styles.fabIcon}>✏️</Text>
        </Pressable>
      </>
    )
  }

  return (
    <View style={styles.container}>
      <Header title="Exercícios" showBackButton />
      <ScrollView 
        style={styles.innerContainer} 
        contentContainerStyle={[
          styles.scrollContent,
          currentWorkout.exercises.length === 0 && styles.emptyScrollContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {currentWorkout.exercises.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>＋</Text>
            </View>
            <Text style={styles.emptyTitle}>Nenhum exercício adicionado</Text>
            <Text style={styles.emptyDescription}>
              Este treino foi criado sem exercícios. Você poderá montar a lista de exercícios posteriormente.
            </Text>
          </View>
        ) : (
          currentWorkout.exercises.map((exercise) => (
            <ExerciseResumeDemonstration
              key={exercise.id}
              exercise={exercise}
              onPress={onExercisePressed}
              onEditDescription={onEditDescriptionPressed}
            />
          ))
        )}
      </ScrollView>

      {renderActionButtons()}

      {selectedExercise ? (
        <ExerciseDetailsBottomSheet
          exercise={selectedExercise}
          isVisible={isBottomSheetVisible}
          onClose={() => setIsBottomSheetVisible(false)}
        />
      ) : null}

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
