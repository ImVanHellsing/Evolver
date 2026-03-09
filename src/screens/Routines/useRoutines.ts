import { useEffect, useState } from 'react';

import { RoutineTemplate } from '@/models/Routine';
import { routinesRepository } from '@/services/routines/routinesRepository';
import { WorkoutSession } from '@/models/Workout';
import { workoutSessionsRepository } from '@/services/workouts/workoutSessionsRepository';

export function useRoutines() {
  const [routines, setRoutines] = useState<RoutineTemplate[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    const routines = await routinesRepository.list();
    const sessions = await workoutSessionsRepository.list();
    setRoutines(routines);
    setSessions(sessions);

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const isRoutineStartedText = (routineId: string, sessions: WorkoutSession[]) =>
    sessions.some(s => s.routineTemplateId === routineId) ? 'Em Andamento' : 'Não Iniciado';

  return {
    routines,
    sessions,
    loading,
    reload: load,
    isRoutineStartedText
  };
}