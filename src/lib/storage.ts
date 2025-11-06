import type { FoodItem, IntakeEntry, DailyGoals } from "~/types";

const STORAGE_KEYS = {
  FOODS: 'diet-tracker-foods',
  INTAKE: 'diet-tracker-intake',
  GOALS: 'diet-tracker-goals',
};

// Food Items
export const getFoods = (): FoodItem[] => {
  const data = localStorage.getItem(STORAGE_KEYS.FOODS);
  return data ? JSON.parse(data) : [];
};

export const saveFoods = (foods: FoodItem[]): void => {
  localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(foods));
};

export const addFood = (food: FoodItem): void => {
  const foods = getFoods();
  foods.push(food);
  saveFoods(foods);
};

export const updateFood = (updatedFood: FoodItem): void => {
  const foods = getFoods();
  const index = foods.findIndex(f => f.id === updatedFood.id);
  if (index !== -1) {
    foods[index] = updatedFood;
    saveFoods(foods);
  }
};

export const deleteFood = (foodId: string): void => {
  const foods = getFoods();
  const filtered = foods.filter(f => f.id !== foodId);
  saveFoods(filtered);
};

// Intake Entries
export const getIntakeEntries = (): IntakeEntry[] => {
  const data = localStorage.getItem(STORAGE_KEYS.INTAKE);
  return data ? JSON.parse(data) : [];
};

export const saveIntakeEntries = (entries: IntakeEntry[]): void => {
  localStorage.setItem(STORAGE_KEYS.INTAKE, JSON.stringify(entries));
};

export const addIntakeEntry = (entry: IntakeEntry): void => {
  const entries = getIntakeEntries();
  entries.push(entry);
  saveIntakeEntries(entries);
};

export const updateIntakeEntry = (updatedEntry: IntakeEntry): void => {
  const entries = getIntakeEntries();
  const index = entries.findIndex(e => e.id === updatedEntry.id);
  if (index !== -1) {
    entries[index] = updatedEntry;
    saveIntakeEntries(entries);
  }
};

export const deleteIntakeEntry = (entryId: string): void => {
  const entries = getIntakeEntries();
  const filtered = entries.filter(e => e.id !== entryId);
  saveIntakeEntries(filtered);
};

export const getEntriesByDate = (date: string): IntakeEntry[] => {
  const entries = getIntakeEntries();
  return entries.filter(e => e.date === date);
};

// Daily Goals
export const getGoals = (): DailyGoals => {
  const data = localStorage.getItem(STORAGE_KEYS.GOALS);
  return data ? JSON.parse(data) : { calorieGoal: 2000, proteinGoal: 50 };
};

export const saveGoals = (goals: DailyGoals): void => {
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
};

// Utility
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getTodayDate = (): string => {
  return formatDate(new Date());
};
