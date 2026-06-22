import { RoutineTemplate } from '@/models/Routine';
import { STORAGE_KEYS } from '@/services/storage/storageKeys';
import { storage } from '@/services/storage/storage';

export const routinesRepository = {
  async seedIfEmpty(seeds: RoutineTemplate[]): Promise<void> {
    const res = await storage.getJson<RoutineTemplate[]>(STORAGE_KEYS.ROUTINES);
    if (!res.ok) return;

    const current = res.data ?? [];
    if (current.length > 0) return;

    await storage.setJson(STORAGE_KEYS.ROUTINES, seeds);
    console.log('[routinesRepository.seedIfEmpty] seed applied');
  },

  async syncTemplates(seeds: RoutineTemplate[]): Promise<void> {
    const res = await storage.getJson<RoutineTemplate[]>(STORAGE_KEYS.ROUTINES);
    if (!res.ok) return;

    let current = res.data ?? [];

    seeds.forEach(seed => {
      const index = current.findIndex(r => r.id === seed.id);
      if (index !== -1) {
        // Atualiza o template existente com a nova versão do código
        current[index] = seed;
      } else {
        // Adiciona se for um template novo
        current.push(seed);
      }
    });

    await storage.setJson(STORAGE_KEYS.ROUTINES, current);
    console.log('[routinesRepository.syncTemplates] templates synced');
  },


  async list(): Promise<RoutineTemplate[]> {
    const res = await storage.getJson<RoutineTemplate[]>(STORAGE_KEYS.ROUTINES);
    console.log('[routinesRepository.list] res', res);
    if (!res.ok) return [];
    return res.data ?? [];
  },

  async getById(id: string): Promise<RoutineTemplate | null> {
    const all = await this.list();
    return all.find(r => r.id === id) ?? null;
  },

  async save(routine: RoutineTemplate): Promise<void> {
    const all = await this.list();
    const exists = all.some(r => r.id === routine.id);

    const next = exists
      ? all.map(r => (r.id === routine.id ? routine : r))
      : [...all, routine];

    await storage.setJson(STORAGE_KEYS.ROUTINES, next);
  },

  async delete(id: string): Promise<void> {
    const all = await this.list();
    const next = all.filter(r => r.id !== id);
    await storage.setJson(STORAGE_KEYS.ROUTINES, next);
  },

  async replaceAll(routines: RoutineTemplate[]): Promise<void> {
    await storage.setJson(STORAGE_KEYS.ROUTINES, routines);
  },
};