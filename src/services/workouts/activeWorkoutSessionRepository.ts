import { storage } from '../storage/storage';
import { STORAGE_KEYS } from '../storage/storageKeys';
import { WorkoutSession, WorkoutTemplate } from '@/models/Workout';

export interface ActiveWorkoutSessionData {
  routineTemplateId: string;
  workout: WorkoutTemplate;
  savedWorkoutSession: WorkoutSession;
  currentExerciseIndex: number;
  currentSetIndex: number;
  weight: string;
  reps: string;
  observation: string;
  isResting: boolean;
  timerEndTime: number | null;
}

export const activeWorkoutSessionRepository = {
  async saveActiveSession(data: ActiveWorkoutSessionData): Promise<void> {
    await storage.setJson(STORAGE_KEYS.ACTIVE_WORKOUT_SESSION, data);
  },

  async getActiveSession(): Promise<ActiveWorkoutSessionData | null> {
    const result = await storage.getJson<ActiveWorkoutSessionData>(STORAGE_KEYS.ACTIVE_WORKOUT_SESSION);
    if (!result.ok || !result.data) {
      return null;
    }
    
    // Convert date strings back to Date objects 
    const data = result.data;
    if (data.savedWorkoutSession && typeof data.savedWorkoutSession.date === 'string') {
      data.savedWorkoutSession.date = new Date(data.savedWorkoutSession.date);
    }
    
    return data;
  },

  async clearActiveSession(): Promise<void> {
    await storage.remove(STORAGE_KEYS.ACTIVE_WORKOUT_SESSION);
  }
};
