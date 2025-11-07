import type { FoodItem, IntakeEntry, DailyGoals, DietPreference } from "~/types";

// Get user-scoped storage keys
const getUserStorageKey = (userId: string, key: string): string => {
  return `diet-tracker-${userId}-${key}`;
};

const STORAGE_KEY_SUFFIXES = {
  FOODS: 'foods',
  INTAKE: 'intake',
  GOALS: 'goals',
  DIET_PREFERENCE: 'diet-preference',
  PREFERRED_FOODS: 'preferred-foods',
};

// Food Items
export const getFoods = (userId: string): FoodItem[] => {
  const key = getUserStorageKey(userId, STORAGE_KEY_SUFFIXES.FOODS);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const saveFoods = (userId: string, foods: FoodItem[]): void => {
  const key = getUserStorageKey(userId, STORAGE_KEY_SUFFIXES.FOODS);
  localStorage.setItem(key, JSON.stringify(foods));
};

export const addFood = (userId: string, food: FoodItem): void => {
  const foods = getFoods(userId);
  foods.push(food);
  saveFoods(userId, foods);
};

export const updateFood = (userId: string, updatedFood: FoodItem): void => {
  const foods = getFoods(userId);
  const index = foods.findIndex(f => f.id === updatedFood.id);
  if (index !== -1) {
    foods[index] = updatedFood;
    saveFoods(userId, foods);
  }
};

export const deleteFood = (userId: string, foodId: string): void => {
  const foods = getFoods(userId);
  const filtered = foods.filter(f => f.id !== foodId);
  saveFoods(userId, filtered);
};

// Intake Entries
export const getIntakeEntries = (userId: string): IntakeEntry[] => {
  const key = getUserStorageKey(userId, STORAGE_KEY_SUFFIXES.INTAKE);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const saveIntakeEntries = (userId: string, entries: IntakeEntry[]): void => {
  const key = getUserStorageKey(userId, STORAGE_KEY_SUFFIXES.INTAKE);
  localStorage.setItem(key, JSON.stringify(entries));
};

export const addIntakeEntry = (userId: string, entry: IntakeEntry): void => {
  const entries = getIntakeEntries(userId);
  entries.push(entry);
  saveIntakeEntries(userId, entries);
};

export const updateIntakeEntry = (userId: string, updatedEntry: IntakeEntry): void => {
  const entries = getIntakeEntries(userId);
  const index = entries.findIndex(e => e.id === updatedEntry.id);
  if (index !== -1) {
    entries[index] = updatedEntry;
    saveIntakeEntries(userId, entries);
  }
};

export const deleteIntakeEntry = (userId: string, entryId: string): void => {
  const entries = getIntakeEntries(userId);
  const filtered = entries.filter(e => e.id !== entryId);
  saveIntakeEntries(userId, filtered);
};

export const getEntriesByDate = (userId: string, date: string): IntakeEntry[] => {
  const entries = getIntakeEntries(userId);
  return entries.filter(e => e.date === date);
};

// Daily Goals
export const getGoals = (userId: string): DailyGoals => {
  const key = getUserStorageKey(userId, STORAGE_KEY_SUFFIXES.GOALS);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : { calorieGoal: 2000, proteinGoal: 50 };
};

export const saveGoals = (userId: string, goals: DailyGoals): void => {
  const key = getUserStorageKey(userId, STORAGE_KEY_SUFFIXES.GOALS);
  localStorage.setItem(key, JSON.stringify(goals));
};

// Diet Preference
export const getDietPreference = (userId: string): DietPreference => {
  const key = getUserStorageKey(userId, STORAGE_KEY_SUFFIXES.DIET_PREFERENCE);
  const data = localStorage.getItem(key);
  return data ? (JSON.parse(data) as DietPreference) : 'non-vegetarian';
};

export const saveDietPreference = (userId: string, preference: DietPreference): void => {
  const key = getUserStorageKey(userId, STORAGE_KEY_SUFFIXES.DIET_PREFERENCE);
  localStorage.setItem(key, JSON.stringify(preference));
};

// Utility
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getTodayDate = (): string => {
  return formatDate(new Date());
};

// Preferred Foods
export const getPreferredFoodIds = (userId: string): string[] => {
  const key = getUserStorageKey(userId, STORAGE_KEY_SUFFIXES.PREFERRED_FOODS);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const savePreferredFoodIds = (userId: string, foodIds: string[]): void => {
  const key = getUserStorageKey(userId, STORAGE_KEY_SUFFIXES.PREFERRED_FOODS);
  localStorage.setItem(key, JSON.stringify(foodIds));
};

// Clear all user data (for account deletion, NOT for logout)
// Note: This should only be called when user explicitly wants to delete their account
// Regular logout should preserve data so users can access it when they sign back in
export const clearUserData = (userId: string): void => {
  const keys = Object.values(STORAGE_KEY_SUFFIXES);
  keys.forEach(suffix => {
    const key = getUserStorageKey(userId, suffix);
    localStorage.removeItem(key);
  });
};
