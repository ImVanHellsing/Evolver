import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { HomeScreen, HistoryScreen, RoutinesScreen, WorkoutScreen, ExercisesScreen, WorkoutRunnerScreen, WorkoutSessionDetailScreen } from '../../screens';
import { RootStackParamList, Routes } from './routes';

const Stack = createStackNavigator<RootStackParamList>();

export function AppNavigator() {
	return (
		<Stack.Navigator
			initialRouteName={Routes.Home}
			screenOptions={{ headerShown: false }}
		>
			<Stack.Screen
				name={Routes.Home}
				component={HomeScreen}
			/>
			<Stack.Screen
				name={Routes.History}
				component={HistoryScreen}
			/>
			<Stack.Screen
				name={Routes.Routines}
				component={RoutinesScreen}
			/>
			<Stack.Screen
				name={Routes.Workouts}
				component={WorkoutScreen}
			/>
			<Stack.Screen
				name={Routes.Exercises}
				component={ExercisesScreen}
			/>
			<Stack.Screen
				name={Routes.WorkoutRunner}
				component={WorkoutRunnerScreen}
			/>
			<Stack.Screen
				name={Routes.WorkoutSessionDetail}
				component={WorkoutSessionDetailScreen}
			/>
		</Stack.Navigator>
	);
}
