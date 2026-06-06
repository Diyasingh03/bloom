import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  FLO_DATA: '@bloom_flo_data',
  FLO_PREDICTIONS: '@bloom_flo_predictions',
  DAILY_AI: '@bloom_daily_ai',
  SYMPTOMS: '@bloom_symptoms',
  GROCERIES: '@bloom_groceries',
  DISCLAIMER_ACCEPTED: '@bloom_disclaimer_accepted',
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export async function storageGet<T>(key: StorageKey): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function storageSet<T>(key: StorageKey, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // fail silently — app still works with in-memory state
  }
}

export async function storageRemove(key: StorageKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // fail silently
  }
}
