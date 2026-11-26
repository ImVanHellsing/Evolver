import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { RoutineTemplate } from '@/models/Routine';
import { routinesRepository } from '@/services/routines/routinesRepository';
import { WorkoutSession } from '@/models/Workout';
import { workoutSessionsRepository } from '@/services/workouts/workoutSessionsRepository';

export function useRoutines() {
  const [routines, setRoutines] = useState<RoutineTemplate[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [nextRoutines, nextSessions] = await Promise.all([
        routinesRepository.list(),
        workoutSessionsRepository.list(),
      ]);
      setRoutines(nextRoutines);
      setSessions(nextSessions);
    } catch (error) {
      console.error('[useRoutines.load]', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload whenever the screen regains focus (e.g. after finishing a workout
  // or editing a routine), not only on the first mount.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const isRoutineStartedText = (routineId: string, sessionList: WorkoutSession[]) =>
    sessionList.some(s => s.routineTemplateId === routineId) ? 'Em Andamento' : 'Não Iniciado';

  return {
    routines,
    sessions,
    loading,
    reload: load,
    isRoutineStartedText
  };
}
