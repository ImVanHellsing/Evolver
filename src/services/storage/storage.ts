import AsyncStorage from '@react-native-async-storage/async-storage';

import type { StorageKey } from './storageKeys';

type StorageResult<T> = { ok: true; data: T } | { ok: false; error: unknown };

export const storage = {
  async getJson<T>(key: StorageKey): Promise<StorageResult<T | null>> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return { ok: true, data: null };
      return { ok: true, data: JSON.parse(raw) as T };
    } catch (error) {
      console.error(`[storage.getJson] key=${key}`, error);
      return { ok: false, error };
    }
  },

  async setJson<T>(key: StorageKey, value: T): Promise<StorageResult<void>> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return { ok: true, data: undefined };
    } catch (error) {
      console.error(`[storage.setJson] key=${key}`, error);
      return { ok: false, error };
    }
  },

  async remove(key: StorageKey): Promise<StorageResult<void>> {
    try {
      await AsyncStorage.removeItem(key);
      return { ok: true, data: undefined };
    } catch (error) {
      console.error(`[storage.remove] key=${key}`, error);
      return { ok: false, error };
    }
  },

  async clearAll(): Promise<StorageResult<void>> {
    try {
      await AsyncStorage.clear();
      return { ok: true, data: undefined };
    } catch (error) {
      console.error('[storage.clearAll]', error);
      return { ok: false, error };
    }
  },
};