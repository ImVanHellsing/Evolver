import React, { useState } from "react";
import { Pressable, ScrollView, Text, View, Alert } from "react-native";

import { useAppRouteParams } from "@/hooks/useAppRouteParams";
import { Header } from "@/components/Header";
import { ExerciseTemplate } from "@/models/Exercise";
import { ExerciseResumeDemonstration } from "@/components/ExerciseResumeDemonstration";
import { ExerciseDetailsBottomSheet } from "@/components/ExerciseDetailsBottomSheet";
import { EditDescriptionModal } from "@/components/EditDescriptionModal";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { routinesRepository } from "@/services/routines/routinesRepository";

import { styles } from "./styles";

export const ExercisesScreen = () => {
  const navigation = useAppNavigation();

  const { routineTemplateId, workout } = useAppRouteParams<'Exercises'>();

  const [currentWorkout, setCurrentWorkout] = useState(workout);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseTemplate>(currentWorkout.exercises[0]);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseTemplate | null>(null);

  const onRunWorkoutPressed = () => {
    navigation.navigate('WorkoutRunner', { routineTemplateId, workout: currentWorkout });
  }

  const onEditWorkoutPressed = () => {
    Alert.alert('Funcionalidade em desenvolvimento', 'A edição de treinos ainda não foi implementada.');
  }

  const onExercisePressed = (exercise: ExerciseTemplate) => {
    setSelectedExercise(exercise);
    setIsBottomSheetVisible(true);
  }

  const onEditDescriptionPressed = (exercise: ExerciseTemplate) => {
    setEditingExercise(exercise);
    setIsEditModalVisible(true);
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

      setIsEditModalVisible(false);
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
      <ScrollView style={styles.innerContainer} showsVerticalScrollIndicator={false}>
        {currentWorkout.exercises.map((exercise) => (
          <ExerciseResumeDemonstration
            key={exercise.name}
            exercise={exercise}
            onPress={onExercisePressed}
            onEditDescription={onEditDescriptionPressed}
          />
        ))}
      </ScrollView>

      {renderActionButtons()}

      <ExerciseDetailsBottomSheet
        exercise={selectedExercise}
        isVisible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
      />

      {editingExercise && (
        <EditDescriptionModal
          visible={isEditModalVisible}
          initialDescription={editingExercise.description || ''}
          onSave={handleSaveDescription}
          onCancel={() => {
            setIsEditModalVisible(false);
            setEditingExercise(null);
          }}
        />
      )}
    </View>
  );
}