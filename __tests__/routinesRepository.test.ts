import AsyncStorage from '@react-native-async-storage/async-storage';

import { routineTemplates } from '../src/data/templates';
import { DayOfWeek } from '../src/models/DayOfWeek';
import { RoutineTemplate } from '../src/models/Routine';
import { routinesRepository } from '../src/services/routines/routinesRepository';
import { STORAGE_KEYS } from '../src/services/storage/storageKeys';

describe('routinesRepository', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('always exposes bundled templates without storing them as custom routines', async () => {
    const routines = await routinesRepository.list();

    expect(routines.filter(routine => routine.source === 'template')).toHaveLength(
      routineTemplates.length
    );
    expect(await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_ROUTINES)).toBe('[]');
  });

  it('persists and deletes only custom routines', async () => {
    const customRoutine: RoutineTemplate = {
      id: 'routine_01HF7YAT000000000000000000',
      name: 'Rotina personalizada',
      source: 'custom',
      workouts: [],
    };

    await routinesRepository.save(customRoutine);
    expect((await routinesRepository.list()).some(routine => routine.id === customRoutine.id)).toBe(true);

    expect(await routinesRepository.delete(customRoutine.id)).toBe(true);
    expect((await routinesRepository.list()).some(routine => routine.id === customRoutine.id)).toBe(false);
  });

  it('does not delete bundled templates', async () => {
    const templateId = routineTemplates[0].id;

    expect(await routinesRepository.delete(templateId)).toBe(false);
    expect((await routinesRepository.list()).some(routine => routine.id === templateId)).toBe(true);
  });

  it('persists template workouts as a separate local override', async () => {
    const template = await routinesRepository.getById(routineTemplates[0].id);
    expect(template).not.toBeNull();

    const workoutId = 'workout_01HF7YAT000000000000000000';
    await routinesRepository.save({
      ...template!,
      workouts: [
        ...template!.workouts,
        {
          id: workoutId,
          dayOfWeek: DayOfWeek.WEDNESDAY,
          description: 'Treino criado',
          exercises: [],
        },
      ],
    });

    const restored = await routinesRepository.getById(template!.id);
    expect(restored?.workouts.some(workout => workout.id === workoutId)).toBe(true);
    expect(await AsyncStorage.getItem(STORAGE_KEYS.TEMPLATE_ROUTINE_OVERRIDES)).toContain(workoutId);
    expect(await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_ROUTINES)).not.toContain(workoutId);
  });

  it('migrates non-template routines from legacy storage', async () => {
    const legacyRoutine: RoutineTemplate = {
      id: 'routine-legacy-1',
      name: 'Rotina antiga',
      workouts: [],
    };
    await AsyncStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify([legacyRoutine]));

    const routines = await routinesRepository.list();
    const migrated = routines.find(routine => routine.id === legacyRoutine.id);

    expect(migrated?.source).toBe('custom');
    expect(await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_ROUTINES)).toContain(legacyRoutine.id);
  });
});
