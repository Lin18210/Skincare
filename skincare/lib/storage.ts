/**
 * Robust cross-platform storage.
 * - Web: uses localStorage
 * - Native: tries AsyncStorage, falls back silently to an in-memory Map
 *   (handles "Native module is null" errors in Expo Go gracefully)
 */
import { Platform } from 'react-native';

// In-memory fallback (no persistence, but no crash)
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string): Promise<string | null> {
    return Promise.resolve(this.store.get(key) ?? null);
  }
  setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
    return Promise.resolve();
  }
  removeItem(key: string): Promise<void> {
    this.store.delete(key);
    return Promise.resolve();
  }
}

const memoryFallback = new MemoryStorage();

// Web storage using localStorage
const webStorage = {
  getItem: (key: string): Promise<string | null> =>
    Promise.resolve(typeof window !== 'undefined' ? window.localStorage.getItem(key) : null),
  setItem: (key: string, value: string): Promise<void> => {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string): Promise<void> => {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};

// Native storage that wraps AsyncStorage with catch-all fallback
class RobustNativeStorage {
  private nativeStorage: any = null;
  private useMemory = false;

  constructor() {
    try {
      this.nativeStorage = require('@react-native-async-storage/async-storage').default;
    } catch {
      this.useMemory = true;
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (this.useMemory || !this.nativeStorage) return memoryFallback.getItem(key);
    try {
      return await this.nativeStorage.getItem(key);
    } catch {
      this.useMemory = true;
      return memoryFallback.getItem(key);
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    memoryFallback.setItem(key, value); // always mirror to memory
    if (this.useMemory || !this.nativeStorage) return;
    try {
      await this.nativeStorage.setItem(key, value);
    } catch {
      this.useMemory = true;
    }
  }

  async removeItem(key: string): Promise<void> {
    memoryFallback.removeItem(key);
    if (this.useMemory || !this.nativeStorage) return;
    try {
      await this.nativeStorage.removeItem(key);
    } catch {
      this.useMemory = true;
    }
  }
}

const storage = Platform.OS === 'web' ? webStorage : new RobustNativeStorage();
export default storage;
