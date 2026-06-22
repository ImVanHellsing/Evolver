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
  const [selectedExercise, setSelectedExercise] = useState<ExerciseTemplate>(currentWorkout.exercises[0]);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  
  const [isEditDescriptionModalVisible, setIsEditDescriptionModalVisible] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseTemplate | null>(null);

  const [isEditWorkoutModalVisible, setIsEditWorkoutModalVisible] = useState(false);

  const onRunWorkoutPressed = () => {
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
        <Pressable style={styles.fabRunWorkout} onPress={onRunWorkoutPressed}>
          <Text style={styles.fabIcon}>🏋️</Text>
        </Pressable>
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
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {currentWorkout.exercises.length === 0 ? (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#8E8E93', textAlign: 'center' }}>
              Nenhum exercício cadastrado para este treino.
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

      <ExerciseDetailsBottomSheet
        exercise={selectedExercise}
        isVisible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
      />

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