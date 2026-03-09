import React from 'react';
import { View, Text, Pressable } from 'react-native';

import { Routes } from '../../app/navigation/routes';
import { useAppNavigation } from '../../hooks/useAppNavigation';

import { styles } from './styles';

export const HomeScreen = () => {
  const navigation = useAppNavigation();

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
