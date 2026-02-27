export const DEMO_STORAGE_PREFIX = "qlct_demo_";

const purgeStorageByPrefix = (storage: Storage) => {
  const keysToRemove: string[] = [];

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(DEMO_STORAGE_PREFIX)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => storage.removeItem(key));
};

export const purgeDemoStorage = () => {
  if (typeof window === "undefined") {
    return;
  }

  purgeStorageByPrefix(window.localStorage);
  purgeStorageByPrefix(window.sessionStorage);
};
