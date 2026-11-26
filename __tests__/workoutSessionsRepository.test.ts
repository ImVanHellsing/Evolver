import AsyncStorage from '@react-native-async-storage/async-storage';

import { WorkoutSession } from '../src/models/Workout';
import { workoutSessionsRepository } from '../src/services/workouts/workoutSessionsRepository';
import { STORAGE_KEYS } from '../src/services/storage/storageKeys';

const session = (id: string): WorkoutSession => ({
  id,
  routineTemplateId: 'routine-1',
  workoutTemplateId: 'workout-1',
  exercises: [],
  date: new Date('2026-01-01T10:00:00.000Z'),
});

describe('workoutSessionsRepository', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('appends sessions to the stored history', async () => {
    await workoutSessionsRepository.save(session('a'));
    await workoutSessionsRepository.save(session('b'));

    expect((await workoutSessionsRepository.list()).map(item => item.id)).toEqual(['a', 'b']);
  });

  it('does not overwrite the history when it cannot be read', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, '{corrupted');

    await expect(workoutSessionsRepository.save(session('new'))).rejects.toThrow();
    expect(await AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_SESSIONS)).toBe('{corrupted');
  });
});
