import React, { useCallback } from 'react';
import { Alert, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Routes } from '@/app/navigation/routes';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { activeWorkoutSessionRepository } from '@/services/workouts/activeWorkoutSessionRepository';
import { HistoryScreen } from '@/screens/History';
import { RoutinesScreen } from '@/screens/Routines';

import { styles } from './styles';

type HomeTabParamList = {
  WorkoutsTab: undefined;
  HistoryTab: undefined;
};

const Tab = createBottomTabNavigator<HomeTabParamList>();

const tabScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: '#111111',
  tabBarInactiveTintColor: '#8A8A8A',
  tabBarHideOnKeyboard: true,
  tabBarStyle: styles.tabBar,
  tabBarLabelStyle: styles.tabLabel,
};

const WorkoutsTabIcon = ({ focused }: { focused: boolean }) => (
  <View style={styles.workoutIcon}>
    <View style={[styles.workoutIconBar, focused && styles.iconPartActive]} />
    <View
      style={[
        styles.workoutIconPlate,
        styles.workoutIconPlateLeft,
        focused && styles.iconPartActive,
      ]}
    />
    <View
      style={[
        styles.workoutIconPlate,
        styles.workoutIconPlateRight,
        focused && styles.iconPartActive,
      ]}
    />
  </View>
);

const HistoryTabIcon = ({ focused }: { focused: boolean }) => (
  <View style={[styles.historyIcon, focused && styles.historyIconActive]}>
    <View style={[styles.historyHourHand, focused && styles.iconPartActive]} />
    <View style={[styles.historyMinuteHand, focused && styles.iconPartActive]} />
  </View>
);

const WorkoutsTab = () => <RoutinesScreen showBackButton={false} />;
const HistoryTab = () => <HistoryScreen showBackButton={false} />;

export const HomeScreen = () => {
  const navigation = useAppNavigation();

  useFocusEffect(
    useCallback(() => {
      const checkActiveSession = async () => {
        try {
          const sessionData = await activeWorkoutSessionRepository.getActiveSession();
          if (!sessionData) return;

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
        } catch (error) {
          console.error('Error checking active session:', error);
        }
      };

      checkActiveSession();
    }, [navigation])
  );

  return (
    <Tab.Navigator initialRouteName="WorkoutsTab" screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="WorkoutsTab"
        component={WorkoutsTab}
        options={{
          title: 'Treinos',
          tabBarAccessibilityLabel: 'Aba Treinos',
          tabBarIcon: WorkoutsTabIcon,
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryTab}
        options={{
          title: 'Histórico',
          tabBarAccessibilityLabel: 'Aba Histórico',
          tabBarIcon: HistoryTabIcon,
        }}
      />
    </Tab.Navigator>
  );
};
