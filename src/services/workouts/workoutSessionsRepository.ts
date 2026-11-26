import { STORAGE_KEYS } from '@/services/storage/storageKeys';
import { storage } from '@/services/storage/storage';
import { WorkoutSession } from '@/models/Workout';

/**
 * Reads the stored sessions and throws when the read fails.
 * Writers must use this so a failed read never results in the whole
 * history being overwritten by a list that only holds the new session.
 */
const readAllOrThrow = async (): Promise<WorkoutSession[]> => {
  const res = await storage.getJson<WorkoutSession[]>(STORAGE_KEYS.WORKOUT_SESSIONS);
  if (!res.ok) {
    throw new Error('Não foi possível ler o histórico de treinos salvo.');
  }
  return res.data ?? [];
};

export const workoutSessionsRepository = {
  async list(): Promise<WorkoutSession[]> {
    const res = await storage.getJson<WorkoutSession[]>(STORAGE_KEYS.WORKOUT_SESSIONS);
    if (!res.ok) return [];
    return res.data ?? [];
  },

  async save(session: WorkoutSession): Promise<void> {
    const all = await readAllOrThrow();
    const result = await storage.setJson(STORAGE_KEYS.WORKOUT_SESSIONS, [...all, session]);
    if (!result.ok) {
      throw new Error('Não foi possível salvar a sessão de treino.');
    }
  },

  async listByRoutine(routineTemplateId: string): Promise<WorkoutSession[]> {
    const all = await this.list();
    return all.filter(s => s.routineTemplateId === routineTemplateId);
  },

  async listByRoutineWorkout(
    routineTemplateId: string,
    workoutTemplateId: string
  ): Promise<WorkoutSession[]> {
    const all = await this.list();
    return all.filter(
      s => s.routineTemplateId === routineTemplateId && s.workoutTemplateId === workoutTemplateId
    )
  },

  async deleteAll(): Promise<void> {
    await storage.remove(STORAGE_KEYS.WORKOUT_SESSIONS);
  }

}
