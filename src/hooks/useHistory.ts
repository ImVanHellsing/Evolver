import { useEffect, useState } from 'react';

import { workoutSessionsRepository } from '../services/workouts/workoutSessionsRepository';
import { routinesRepository } from '../services/routines/routinesRepository';
import { WorkoutSession } from '../models/Workout';

export interface HistoryItem extends WorkoutSession {
  routineName: string;
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const [sessions, routines] = await Promise.all([
          workoutSessionsRepository.list(),
          routinesRepository.list(),
        ]);

        const routinesMap = new Map<string, string>();
        routines.forEach(r => routinesMap.set(r.id, r.name));

        const historyData: HistoryItem[] = sessions.map(session => ({
          ...session,
          date: new Date(session.date),
          routineName: routinesMap.get(session.routineTemplateId) || 'Rotina Desconhecida',
        })).sort((a, b) => b.date.getTime() - a.date.getTime());

        setHistory(historyData);
      } catch (error) {
        console.error('[useHistory.loadHistory]', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadHistory();
  }, []);
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
