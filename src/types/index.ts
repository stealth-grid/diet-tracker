export type FoodType = 'veg' | 'egg' | 'non-veg';
export type DietPreference = 'vegetarian' | 'eggetarian' | 'non-vegetarian';

export interface FoodItem {
  id: string;
  name: string;
  proteinPer100g: number;  // in grams
  caloriesPer100g: number; // in kcal
  category?: string;       // e.g., "grains", "protein", "vegetables"
  isCustom: boolean;       // user-added vs pre-populated
  foodType: FoodType;      // veg, egg, or non-veg
}

export interface IntakeEntry {
  id: string;
  foodId: string;
  foodName: string;       // denormalized for easy display
  quantity: number;       // in grams
  protein: number;        // calculated
  calories: number;       // calculated
  date: string;          // YYYY-MM-DD format
  timestamp: number;     // Unix timestamp
  foodType?: FoodType;   // for displaying indicator
}

export interface DailyGoals {
  calorieGoal: number;
  proteinGoal: number;
}

export interface UserPreferences {
  goals: DailyGoals;
  dietPreference: DietPreference;
  preferredFoodIds: string[]; // IDs of foods user prefers for meal planning
}

export interface DailySummary {
  totalCalories: number;
  totalProtein: number;
  entries: IntakeEntry[];
}
