import type { FoodItem, IntakeEntry, DailyGoals, DietPreference } from "~/types";
import { getFoods, getIntakeEntries, getGoals, saveFoods, saveIntakeEntries, saveGoals, getDietPreference, saveDietPreference, getPreferredFoodIds, savePreferredFoodIds } from "./storage";

export interface ExportData {
  version: string;
  exportDate: string;
  foods: FoodItem[];
  intakeEntries: IntakeEntry[];
  goals: DailyGoals;
  dietPreference?: DietPreference; // Optional for backward compatibility
  preferredFoodIds?: string[]; // Optional for backward compatibility
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Export all user data as JSON
 */
export const exportData = (userId: string): ExportData => {
  return {
    version: "1.2",
    exportDate: new Date().toISOString(),
    foods: getFoods(userId),
    intakeEntries: getIntakeEntries(userId),
    goals: getGoals(userId),
    dietPreference: getDietPreference(userId),
    preferredFoodIds: getPreferredFoodIds(userId),
  };
};

/**
 * Download data as JSON file
 */
export const downloadDataAsJSON = (userId: string): void => {
  const data = exportData(userId);
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `diet-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Validate imported data structure
 */
export const validateImportData = (data: unknown): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if data is an object
  if (!data || typeof data !== "object") {
    errors.push("Invalid file format. Expected JSON object.");
    return { isValid: false, errors, warnings };
  }

  const importData = data as Record<string, unknown>;

  // Check version
  if (!importData.version || typeof importData.version !== "string") {
    warnings.push("No version information found. Import may not be fully compatible.");
  }

  // Validate foods array
  if (!Array.isArray(importData.foods)) {
    errors.push("Missing or invalid 'foods' array.");
  } else {
    importData.foods.forEach((food: unknown, index: number) => {
      if (!isValidFoodItem(food)) {
        errors.push(`Invalid food item at index ${index}.`);
      }
    });
  }

  // Validate intake entries array
  if (!Array.isArray(importData.intakeEntries)) {
    errors.push("Missing or invalid 'intakeEntries' array.");
  } else {
    importData.intakeEntries.forEach((entry: unknown, index: number) => {
      if (!isValidIntakeEntry(entry)) {
        errors.push(`Invalid intake entry at index ${index}.`);
      }
    });
  }

  // Validate goals
  if (!importData.goals || !isValidGoals(importData.goals)) {
    errors.push("Missing or invalid 'goals' object.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate FoodItem structure
 */
const isValidFoodItem = (item: unknown): item is FoodItem => {
  if (!item || typeof item !== "object") return false;
  
  const food = item as Record<string, unknown>;
  
  return (
    typeof food.id === "string" &&
    typeof food.name === "string" &&
    typeof food.proteinPer100g === "number" &&
    typeof food.caloriesPer100g === "number" &&
    typeof food.isCustom === "boolean" &&
    (food.category === undefined || typeof food.category === "string")
  );
};

/**
 * Validate IntakeEntry structure
 */
const isValidIntakeEntry = (item: unknown): item is IntakeEntry => {
  if (!item || typeof item !== "object") return false;
  
  const entry = item as Record<string, unknown>;
  
  return (
    typeof entry.id === "string" &&
    typeof entry.foodId === "string" &&
    typeof entry.foodName === "string" &&
    typeof entry.quantity === "number" &&
    typeof entry.protein === "number" &&
    typeof entry.calories === "number" &&
    typeof entry.date === "string" &&
    typeof entry.timestamp === "number"
  );
};

/**
 * Validate DailyGoals structure
 */
const isValidGoals = (item: unknown): item is DailyGoals => {
  if (!item || typeof item !== "object") return false;
  
  const goals = item as Record<string, unknown>;
  
  return (
    typeof goals.calorieGoal === "number" &&
    typeof goals.proteinGoal === "number"
  );
};

/**
 * Import data with merge or replace option
 */
export const importData = (
  userId: string,
  data: ExportData,
  mode: "merge" | "replace"
): void => {
  if (mode === "replace") {
    // Replace all data
    saveFoods(userId, data.foods);
    saveIntakeEntries(userId, data.intakeEntries);
    saveGoals(userId, data.goals);
    if (data.dietPreference) {
      saveDietPreference(userId, data.dietPreference);
    }
    if (data.preferredFoodIds) {
      savePreferredFoodIds(userId, data.preferredFoodIds);
    }
  } else {
    // Merge data
    const existingFoods = getFoods(userId);
    const existingEntries = getIntakeEntries(userId);
    
    // Merge foods (avoid duplicates by id)
    const existingFoodIds = new Set(existingFoods.map(f => f.id));
    const newFoods = data.foods.filter(f => !existingFoodIds.has(f.id));
    saveFoods(userId, [...existingFoods, ...newFoods]);
    
    // Merge intake entries (avoid duplicates by id)
    const existingEntryIds = new Set(existingEntries.map(e => e.id));
    const newEntries = data.intakeEntries.filter(e => !existingEntryIds.has(e.id));
    saveIntakeEntries(userId, [...existingEntries, ...newEntries]);
    
    // Goals, diet preference, and preferred foods are replaced (not merged)
    saveGoals(userId, data.goals);
    if (data.dietPreference) {
      saveDietPreference(userId, data.dietPreference);
    }
    if (data.preferredFoodIds) {
      savePreferredFoodIds(userId, data.preferredFoodIds);
    }
  }
};

/**
 * Read and parse JSON file
 */
export const readJSONFile = (file: File): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        resolve(json);
      } catch (error) {
        reject(new Error("Failed to parse JSON file. Please ensure it's a valid JSON format."));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file."));
    };
    
    reader.readAsText(file);
  });
};
