import React from 'react';
import { View, Text, FlatList, Pressable, Alert } from 'react-native';

import { Header } from '../../components/Header';
import { useHistory, HistoryItem } from '../../hooks/useHistory';
import { getDayOfWeekFromDate, formatDate } from '../../utils/dateUtils';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { Routes } from '@/app/navigation/routes';

import { styles } from './styles';

export function HistoryScreen() {
  const navigation = useAppNavigation();

  const { history, isLoading, deleteAllHistory } = useHistory();

  const handleDeleteAll = () => {
    Alert.alert(
      'Excluir histórico',
      'Tem certeza que deseja apagar todas as sessões registradas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir tudo',
          style: 'destructive',
          onPress: deleteAllHistory,
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const date = item.date;
    const dayName = getDayOfWeekFromDate(date);
    const formattedDate = formatDate(date);

    const formatDuration = (min?: number) => {
      if (!min) return null;
      const hours = Math.floor(min / 60);
      const remainingMinutes = min % 60;
      return `${hours.toString().padStart(2, '0')}h ${remainingMinutes.toString().padStart(2, '0')}m`;
    };

    const durationText = formatDuration(item.duration);

    return (
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate(Routes.WorkoutSessionDetail, { session: item })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.routineName}>{item.routineName}</Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
        <Text style={styles.dayOfWeek}>{dayName}</Text>

        {(durationText || item.caloriesEstimated) && (
          <View style={styles.sessionInfoContainer}>
            {durationText && (
              <Text style={styles.sessionInfoText}>
                Duração: <Text style={styles.sessionInfoValue}>{durationText}</Text>
              </Text>
            )}
            {item.caloriesEstimated && (
              <Text style={styles.sessionInfoText}>
                Calorias: <Text style={styles.sessionInfoValue}>{item.caloriesEstimated} kcal</Text>
              </Text>
            )}
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Histórico" showBackButton />

      {isLoading ? (
        <View style={styles.centered}>
          <Text>Carregando...</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>Nenhuma sessão encontrada.</Text>
            </View>
          }
        />
      )}

      <Pressable style={styles.fab} onPress={handleDeleteAll}>
        <Text style={styles.fabIcon}>🗑️</Text>
      </Pressable>
    </View>
  );
}