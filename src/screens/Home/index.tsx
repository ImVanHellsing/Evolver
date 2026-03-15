import React, { useCallback } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { activeWorkoutSessionRepository } from '../../services/workouts/activeWorkoutSessionRepository';

import { Routes } from '../../app/navigation/routes';
import { useAppNavigation } from '../../hooks/useAppNavigation';

import { styles } from './styles';

export const HomeScreen = () => {
  const navigation = useAppNavigation();

  useFocusEffect(
    useCallback(() => {
      const checkActiveSession = async () => {
        try {
          const sessionData = await activeWorkoutSessionRepository.getActiveSession();
          if (sessionData) {
            Alert.alert(
              'Treino em andamento',
              'Você tem um treino que não foi finalizado. Deseja retomar de onde parou?',
              [
                {
                  text: 'Cancelar',
                  style: 'destructive',
                  onPress: async () => {
                    await activeWorkoutSessionRepository.clearActiveSession();
                  },
                },
                {
                  text: 'Retomar',
                  style: 'default',
                  onPress: () => {
                    navigation.navigate(Routes.WorkoutRunner, {
                      routineTemplateId: sessionData.routineTemplateId,
                      workout: sessionData.workout,
                      resume: true,
                    });
                  },
                },
              ]
            );
          }
        } catch (error) {
          console.error('Error checking active session:', error);
        }
      };

      checkActiveSession();
    }, [navigation])
  );

  const options = [{
    id: '1',
    title: 'Minhas Rotinas',
    description: 'Crie, edite e execute seus treinos e rotinas',
    onPress: () => navigation.navigate(Routes.Routines),
  }, {
    id: '2',
    title: 'Histórico',
    description: 'Acompanhe sua evolução',
    onPress: () => navigation.navigate(Routes.History),
  }]

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Evolver</Text>

      <View style={styles.buttons}>
        {options.map((option) => (
          <Pressable
            key={option.id}
            style={styles.bigButton}
            onPress={option.onPress}
          >
            <Text style={styles.bigButtonTitle}>{option.title}</Text>
            <Text style={styles.bigButtonDesc}>{option.description}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
