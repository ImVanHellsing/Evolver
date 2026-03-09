import React, { useState } from "react";
import { Pressable, ScrollView, Text, View, Alert } from "react-native";

import { useAppRouteParams } from "@/hooks/useAppRouteParams";
import { Header } from "@/components/Header";
import { ExerciseTemplate } from "@/models/Exercise";
import { ExerciseResumeDemonstration } from "@/components/ExerciseResumeDemonstration";
import { ExerciseDetailsBottomSheet } from "@/components/ExerciseDetailsBottomSheet";
import { useAppNavigation } from "@/hooks/useAppNavigation";

import { styles } from "./styles";

export const ExercisesScreen = () => {
  const navigation = useAppNavigation();

  const { routineTemplateId, workout } = useAppRouteParams<'Exercises'>();

  const [selectedExercise, setSelectedExercise] = useState<ExerciseTemplate>(workout.exercises[0]);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const onRunWorkoutPressed = () => {
    navigation.navigate('WorkoutRunner', { routineTemplateId, workout });
  }

  const onEditWorkoutPressed = () => {
    Alert.alert('Funcionalidade em desenvolvimento', 'A edição de treinos ainda não foi implementada.');
  }

  const onExercisePressed = (exercise: ExerciseTemplate) => {
    setSelectedExercise(exercise);
    setIsBottomSheetVisible(true);
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
        {workout.exercises.map((exercise) => (
          <ExerciseResumeDemonstration
            key={exercise.name}
            exercise={exercise}
            onPress={onExercisePressed}
          />
        ))}
      </ScrollView>

      {renderActionButtons()}

      <ExerciseDetailsBottomSheet
        exercise={selectedExercise}
        isVisible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
      />
    </View>
  );
}