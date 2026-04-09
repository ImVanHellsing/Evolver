import React from 'react';
import { View, Text, Pressable, Alert, ScrollView } from 'react-native';

import { Header } from '@/components/Header';
import { RoutineTemplate } from '@/models/Routine';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useRoutines } from './useRoutines';

import { styles } from './styles';

export const RoutinesScreen = () => {
	const navigation = useAppNavigation();

	const { routines, sessions, loading, isRoutineStartedText } = useRoutines();

	const onAddRoutinePressed = () => {
		Alert.alert('Funcionalidade em desenvolvimento', 'A criação de rotinas ainda não foi implementada.');
	}

	const onRoutinePressed = (routine: RoutineTemplate) => {
		navigation.navigate('Workouts', { routine });
	}

	if (loading) return <Text>Carregando...</Text>;

	return (
		<View style={styles.container}>
			<Header title="Minhas Rotinas" showBackButton />
			<ScrollView 
				style={styles.innerContainer} 
				contentContainerStyle={{ paddingBottom: 80 }}
				showsVerticalScrollIndicator={false}
			>
				{routines.map((routine) => (
					<Pressable key={routine.id} style={styles.bigButton} onPress={() => onRoutinePressed(routine)}>
						<Text style={styles.bigButtonTitle}>{routine.name}</Text>
						<Text style={styles.bigButtonDesc}>{isRoutineStartedText(routine.id, sessions)}</Text>
					</Pressable>
				))}
			</ScrollView>
			<Pressable style={styles.fab} onPress={onAddRoutinePressed}>
				<Text style={styles.fabIcon}>+</Text>
			</Pressable>
		</View>
	);
}