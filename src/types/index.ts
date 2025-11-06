export interface FoodItem {
  id: string;
  name: string;
  proteinPer100g: number;  // in grams
  caloriesPer100g: number; // in kcal
  category?: string;       // e.g., "grains", "protein", "vegetables"
  isCustom: boolean;       // user-added vs pre-populated
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
}

export interface DailyGoals {
  calorieGoal: number;
  proteinGoal: number;
}

export interface DailySummary {
  totalCalories: number;
  totalProtein: number;
  entries: IntakeEntry[];
}
