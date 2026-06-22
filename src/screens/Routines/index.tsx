import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';

import { Header } from '@/components/Header';
import { RoutineTemplate } from '@/models/Routine';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useRoutines } from './useRoutines';
import { CreateRoutineModal } from '@/components/CreateRoutineModal';
import { routinesRepository } from '@/services/routines/routinesRepository';

import { styles } from './styles';

export const RoutinesScreen = () => {
	const navigation = useAppNavigation();

	const { routines, sessions, loading, reload, isRoutineStartedText } = useRoutines();
	const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

	const onAddRoutinePressed = () => {
		setIsCreateModalVisible(true);
	}

	const handleCreateRoutine = async (name: string) => {
		const newRoutine: RoutineTemplate = {
			id: `routine-${Date.now()}`,
			name,
			workouts: [],
		};
		await routinesRepository.save(newRoutine);
		setIsCreateModalVisible(false);
		reload();
	}

	const onRoutinePressed = (routine: RoutineTemplate) => {
		navigation.navigate('Workouts', { routine });
	}

	if (loading) return <Text style={{ padding: 16 }}>Carregando...</Text>;

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

			<CreateRoutineModal
				visible={isCreateModalVisible}
				onSave={handleCreateRoutine}
				onCancel={() => setIsCreateModalVisible(false)}
			/>
		</View>
	);
}