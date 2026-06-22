import React, { useMemo } from 'react';
import { View, Text, SectionList, Pressable, Alert } from 'react-native';

import { Header } from '../../components/Header';
import { useHistory, HistoryItem } from '../../hooks/useHistory';
import { formatDate } from '../../utils/dateUtils';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { Routes } from '@/app/navigation/routes';
import { DayOfWeek, DAY_OF_WEEK_ORDER, getDayOfWeekMessage } from '../../models/DayOfWeek';

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

  const groupedHistory = useMemo(() => {
    const days = [
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ];

    const groups: Record<DayOfWeek, HistoryItem[]> = {
      [DayOfWeek.MONDAY]: [],
      [DayOfWeek.TUESDAY]: [],
      [DayOfWeek.WEDNESDAY]: [],
      [DayOfWeek.THURSDAY]: [],
      [DayOfWeek.FRIDAY]: [],
      [DayOfWeek.SATURDAY]: [],
      [DayOfWeek.SUNDAY]: [],
    };

    history.forEach(item => {
      const dayOfWeek = days[item.date.getDay()];
      groups[dayOfWeek].push(item);
    });

    return Object.entries(groups)
      .map(([key, sessions]) => ({
        dayOfWeek: key as DayOfWeek,
        title: getDayOfWeekMessage(key as DayOfWeek),
        data: sessions,
      }))
      .filter(group => group.data.length > 0)
      .sort((a, b) => DAY_OF_WEEK_ORDER[a.dayOfWeek] - DAY_OF_WEEK_ORDER[b.dayOfWeek]);
  }, [history]);

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const date = item.date;
    const formattedDate = formatDate(date);

    const formatDuration = (min?: number) => {
      if (!min) return null;
      const hours = Math.floor(min / 60);
      const remainingMinutes = min % 60;
      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}h ${remainingMinutes.toString().padStart(2, '0')}m`;
      }
      return `${remainingMinutes} min`;
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

        {(durationText || item.caloriesEstimated) && (
          <View style={styles.sessionInfoContainer}>
            {durationText && (
              <Text style={styles.sessionInfoText}>
                Duração: <Text style={styles.sessionInfoValue}>{durationText}</Text>
              </Text>
            )}
            {item.caloriesEstimated && (
              <Text style={styles.sessionInfoText}>
                Calorias: <Text style={styles.sessionInfoValue}>{Math.round(item.caloriesEstimated)} kcal</Text>
              </Text>
            )}
          </View>
        )}
      </Pressable>
    );
  };

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Histórico" showBackButton />

      {isLoading ? (
        <View style={styles.centered}>
          <Text>Carregando...</Text>
        </View>
      ) : (
        <SectionList
          sections={groupedHistory}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
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