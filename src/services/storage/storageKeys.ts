export const STORAGE_KEYS = {
  ROUTINES: 'ROUTINES_V1',
  WORKOUT_SESSIONS: 'WORKOUT_SESSIONS_V1',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];