import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { workoutSessionsRepository } from '../services/workouts/workoutSessionsRepository';
import { routinesRepository } from '../services/routines/routinesRepository';
import { WorkoutSession } from '../models/Workout';
import { getFirstValidDate } from '../utils/dateUtils';

export interface HistoryItem extends WorkoutSession {
  routineName: string;
  hasKnownDate: boolean;
}

const getOptionalFiniteNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value !== 'string' || value.trim() === '') return undefined;

  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : undefined;
};

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const [sessions, routines] = await Promise.all([
        workoutSessionsRepository.list(),
        routinesRepository.list(),
      ]);

      const routinesMap = new Map<string, string>();
      routines.forEach(r => routinesMap.set(r.id, r.name));

      const historyData: HistoryItem[] = sessions.map(session => {
        const normalizedDate = getFirstValidDate(
          session.completedAt,
          session.startedAt,
          session.date
        );

        return {
          ...session,
          date: normalizedDate ?? new Date(Number.NaN),
          duration: getOptionalFiniteNumber(session.duration),
          caloriesEstimated: getOptionalFiniteNumber(session.caloriesEstimated),
          hasKnownDate: normalizedDate !== null,
          routineName:
            session.routineNameSnapshot ||
            routinesMap.get(session.routineTemplateId) ||
            'Rotina Desconhecida',
        };
      }).sort((a, b) => {
        const aTime = a.hasKnownDate ? a.date.getTime() : Number.NEGATIVE_INFINITY;
        const bTime = b.hasKnownDate ? b.date.getTime() : Number.NEGATIVE_INFINITY;
        return bTime - aTime;
      });

      setHistory(historyData);
    } catch (error) {
      console.error('[useHistory.loadHistory]', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );
  const deleteAllHistory = async () => {
    try {
      await workoutSessionsRepository.deleteAll();
      setHistory([]);
    } catch (error) {
      console.error('[useHistory.deleteAllHistory]', error);
    }
  };

  return {
    history,
    isLoading,
    deleteAllHistory,
  };
}
