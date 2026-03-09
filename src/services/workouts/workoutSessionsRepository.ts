import { STORAGE_KEYS } from '@/services/storage/storageKeys';
import { storage } from '@/services/storage/storage';
import { WorkoutSession } from '@/models/Workout';

export const workoutSessionsRepository = {
  async list(): Promise<WorkoutSession[]> {
    const res = await storage.getJson<WorkoutSession[]>(STORAGE_KEYS.WORKOUT_SESSIONS);
    if (!res.ok) return [];
    return res.data ?? [];
  },

  async save(session: WorkoutSession): Promise<void> {
    const all = await this.list();
    await storage.setJson(STORAGE_KEYS.WORKOUT_SESSIONS, [...all, session]);
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