import { Storage } from "@plasmohq/storage";

type StorageListener = (newValue: unknown) => void;

export function createFirebasePersistance() {
  return class {
    static type = "LOCAL" as const;
    type = "LOCAL" as const;

    STORAGE_KEY = "FIREBASE_PERSISTANCE";

    listeners: Record<string, StorageListener[]> = {};

    storage: Storage;

    constructor() {
      const storage = new Storage({ area: "local" });
      storage.watch({
        [this.STORAGE_KEY]: this.combinedListener.bind(
          this,
        ) as (typeof this)["combinedListener"],
      });
      this.storage = storage;
    }

    _isAvailable(): Promise<boolean> {
      return Promise.resolve(true);
    }

    async _set<T>(key: string, value: T): Promise<null> {
      const storageValue = await this.storage.get<{ [key: string]: T }>(
        this.STORAGE_KEY,
      );
      return this.storage.set(this.STORAGE_KEY, {
        ...storageValue,
        [key]: value,
      });
    }

    async _get<T>(key: string): Promise<T | undefined> {
      const value = await this.storage
        .get<{ [key: string]: T }>(this.STORAGE_KEY)
        .then((value) => value?.[key]);
      return value;
    }

    async _remove<T>(key: string): Promise<null> {
      const storageValue = await this.storage.get<{ [key: string]: T }>(
        this.STORAGE_KEY,
      );
      return this.storage.set(this.STORAGE_KEY, {
        ...storageValue,
        [key]: undefined,
      });
    }

    _addListener(key: string, listener: StorageListener): void {
      this.listeners[key] = [...(this.listeners[key] || []), listener];
    }

    _removeListener(key: string, listener: StorageListener): void {
      if (this.listeners[key]) {
        this.listeners[key] = this.listeners[key].filter((l) => l !== listener);
      }
    }

    combinedListener(change: chrome.storage.StorageChange) {
      type StorageChangeItem = { [key: string]: unknown };

      Object.entries(this.listeners).forEach(([key, listeners]) => {
        if (
          (change.oldValue as StorageChangeItem)?.[key] !==
          (change.newValue as StorageChangeItem)?.[key]
        ) {
          listeners.forEach((listener) =>
            listener((change.newValue as StorageChangeItem)?.[key]),
          );
        }
      });
    }
  };
}
