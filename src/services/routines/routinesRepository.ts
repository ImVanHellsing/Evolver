import { routineTemplates } from '@/data/templates';
import { RoutineTemplate } from '@/models/Routine';
import { storage } from '@/services/storage/storage';
import { STORAGE_KEYS } from '@/services/storage/storageKeys';

const cloneRoutine = (routine: RoutineTemplate): RoutineTemplate =>
  JSON.parse(JSON.stringify(routine)) as RoutineTemplate;

const fixedTemplates = routineTemplates.map(template => cloneRoutine(template));
const fixedTemplateIds = new Set(fixedTemplates.map(template => template.id));

const asTemplate = (routine: RoutineTemplate): RoutineTemplate => ({
  ...cloneRoutine(routine),
  source: 'template',
});

const asCustom = (routine: RoutineTemplate): RoutineTemplate => ({
  ...cloneRoutine(routine),
  source: 'custom',
});

const readArray = async <T>(key: typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]) => {
  const result = await storage.getJson<T[]>(key);
  return result.ok ? result.data : null;
};

const ensureSeparatedStorage = async () => {
  const [storedCustom, storedOverrides] = await Promise.all([
    readArray<RoutineTemplate>(STORAGE_KEYS.CUSTOM_ROUTINES),
    readArray<RoutineTemplate>(STORAGE_KEYS.TEMPLATE_ROUTINE_OVERRIDES),
  ]);

  if (storedCustom !== null && storedOverrides !== null) {
    return {
      custom: storedCustom.map(asCustom),
      overrides: storedOverrides,
    };
  }

  const legacyRoutines = await readArray<RoutineTemplate>(STORAGE_KEYS.ROUTINES) ?? [];
  const migratedCustom = legacyRoutines
    .filter(routine => !fixedTemplateIds.has(routine.id))
    .map(asCustom);
  const migratedOverrides = legacyRoutines
    .filter(routine => fixedTemplateIds.has(routine.id));

  const custom = storedCustom ?? migratedCustom;
  const overrides = storedOverrides ?? migratedOverrides;

  await Promise.all([
    storage.setJson(STORAGE_KEYS.CUSTOM_ROUTINES, custom),
    storage.setJson(STORAGE_KEYS.TEMPLATE_ROUTINE_OVERRIDES, overrides),
  ]);

  return { custom, overrides };
};

const buildTemplates = (overrides: RoutineTemplate[]) => {
  const overridesById = new Map(overrides.map(routine => [routine.id, routine]));
  return fixedTemplates.map(template => asTemplate(overridesById.get(template.id) ?? template));
};

export const routinesRepository = {
  isTemplate(id: string): boolean {
    return fixedTemplateIds.has(id);
  },

  async list(): Promise<RoutineTemplate[]> {
    const { custom, overrides } = await ensureSeparatedStorage();
    return [...buildTemplates(overrides), ...custom.map(asCustom)];
  },

  async getById(id: string): Promise<RoutineTemplate | null> {
    const all = await this.list();
    return all.find(routine => routine.id === id) ?? null;
  },

  async save(routine: RoutineTemplate): Promise<void> {
    const { custom, overrides } = await ensureSeparatedStorage();
    const now = new Date().toISOString();

    if (fixedTemplateIds.has(routine.id)) {
      const templateOverride = {
        ...cloneRoutine(routine),
        source: 'template' as const,
        updatedAt: now,
      };
      const exists = overrides.some(item => item.id === routine.id);
      const nextOverrides = exists
        ? overrides.map(item => item.id === routine.id ? templateOverride : item)
        : [...overrides, templateOverride];

      await storage.setJson(STORAGE_KEYS.TEMPLATE_ROUTINE_OVERRIDES, nextOverrides);
      return;
    }

    const customRoutine = {
      ...cloneRoutine(routine),
      source: 'custom' as const,
      createdAt: routine.createdAt ?? now,
      updatedAt: now,
    };
    const exists = custom.some(item => item.id === routine.id);
    const nextCustom = exists
      ? custom.map(item => item.id === routine.id ? customRoutine : item)
      : [...custom, customRoutine];

    await storage.setJson(STORAGE_KEYS.CUSTOM_ROUTINES, nextCustom);
  },

  async delete(id: string): Promise<boolean> {
    if (fixedTemplateIds.has(id)) return false;

    const { custom } = await ensureSeparatedStorage();
    const nextCustom = custom.filter(routine => routine.id !== id);
    await storage.setJson(STORAGE_KEYS.CUSTOM_ROUTINES, nextCustom);
    return nextCustom.length !== custom.length;
  },

  async replaceAll(routines: RoutineTemplate[]): Promise<void> {
    const custom = routines.filter(routine => !fixedTemplateIds.has(routine.id)).map(asCustom);
    const overrides = routines.filter(routine => fixedTemplateIds.has(routine.id));

    await Promise.all([
      storage.setJson(STORAGE_KEYS.CUSTOM_ROUTINES, custom),
      storage.setJson(STORAGE_KEYS.TEMPLATE_ROUTINE_OVERRIDES, overrides),
    ]);
  },
};
