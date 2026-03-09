import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, useColorScheme } from 'react-native';

import { AppNavigator } from './src/app/navigation/AppNavigator';
import { routinesRepository } from './src/services/routines/routinesRepository';
import { routineTemplates } from './src/data/templates';

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    routinesRepository.seedIfEmpty(routineTemplates);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}