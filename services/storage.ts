import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Agency,
  AppSettings,
  Expense,
  TourEntry,
  UserProfile,
} from '../types';
import { DEFAULT_AGENCIES, DEFAULT_SETTINGS } from '../constants';

const KEYS = {
  USER: 'gt_user',
  TOURS: 'gt_tours',
  EXPENSES: 'gt_expenses',
  AGENCIES: 'gt_agencies',
  SETTINGS: 'gt_settings',
  EXPENSE_CATEGORIES: 'gt_expense_categories',
} as const;

async function getItem<T>(key: string): Promise<T | null> {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch {
    return null;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage set error:', e);
  }
}

// ─── User ─────────────────────────────────────────────────────────────────────

export async function getUser(): Promise<UserProfile | null> {
  return getItem<UserProfile>(KEYS.USER);
}

export async function setUser(user: UserProfile): Promise<void> {
  return setItem(KEYS.USER, user);
}

export async function removeUser(): Promise<void> {
  return AsyncStorage.removeItem(KEYS.USER);
}

// ─── Tours ────────────────────────────────────────────────────────────────────

export async function getTours(): Promise<TourEntry[]> {
  return (await getItem<TourEntry[]>(KEYS.TOURS)) ?? [];
}

export async function setTours(tours: TourEntry[]): Promise<void> {
  return setItem(KEYS.TOURS, tours);
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export async function getExpenses(): Promise<Expense[]> {
  return (await getItem<Expense[]>(KEYS.EXPENSES)) ?? [];
}

export async function setExpenses(expenses: Expense[]): Promise<void> {
  return setItem(KEYS.EXPENSES, expenses);
}

// ─── Agencies ─────────────────────────────────────────────────────────────────

export async function getAgencies(): Promise<Agency[]> {
  const stored = await getItem<Agency[]>(KEYS.AGENCIES);
  if (!stored || stored.length === 0) {
    await setItem(KEYS.AGENCIES, DEFAULT_AGENCIES);
    return DEFAULT_AGENCIES;
  }
  return stored;
}

export async function setAgencies(agencies: Agency[]): Promise<void> {
  return setItem(KEYS.AGENCIES, agencies);
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<AppSettings> {
  return (await getItem<AppSettings>(KEYS.SETTINGS)) ?? DEFAULT_SETTINGS;
}

export async function setSettings(settings: AppSettings): Promise<void> {
  return setItem(KEYS.SETTINGS, settings);
}

// ─── Expense Categories ───────────────────────────────────────────────────────

export async function getExpenseCategories(): Promise<string[]> {
  const stored = await getItem<string[]>(KEYS.EXPENSE_CATEGORIES);
  return stored ?? [];
}

export async function setExpenseCategories(categories: string[]): Promise<void> {
  return setItem(KEYS.EXPENSE_CATEGORIES, categories);
}

// ─── Export All Data ──────────────────────────────────────────────────────────

export async function exportAllData(): Promise<string> {
  const [tours, expenses, agencies, settings, user] = await Promise.all([
    getTours(),
    getExpenses(),
    getAgencies(),
    getSettings(),
    getUser(),
  ]);

  return JSON.stringify(
    { tours, expenses, agencies, settings, user, exportedAt: new Date().toISOString() },
    null,
    2,
  );
}

// ─── Import Data ──────────────────────────────────────────────────────────────

export async function importData(jsonString: string): Promise<void> {
  const data = JSON.parse(jsonString);
  if (data.tours) await setTours(data.tours);
  if (data.expenses) await setExpenses(data.expenses);
  if (data.agencies) await setAgencies(data.agencies);
  if (data.settings) await setSettings(data.settings);
}

// ─── Clear All ────────────────────────────────────────────────────────────────

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}
