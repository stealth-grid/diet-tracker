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

// Recipe Types
export interface RecipeIngredient {
  foodId: string;
  foodName: string;
  quantity: number;        // in grams
  protein: number;         // calculated protein for this quantity
  calories: number;        // calculated calories for this quantity
  foodType: FoodType;      // for displaying indicator
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  ingredients: RecipeIngredient[];
  servings: number;        // number of servings this recipe makes
  prepTime?: number;       // in minutes
  cookTime?: number;       // in minutes
  instructions?: string;   // cooking instructions
  category?: string;       // e.g., "breakfast", "lunch", "dinner", "snack"
  tags?: string[];         // e.g., ["quick", "high-protein", "meal-prep"]
  imageUrl?: string;       // optional recipe photo
  createdAt: number;       // Unix timestamp
  updatedAt: number;       // Unix timestamp
  // Calculated totals for entire recipe
  totalCalories: number;
  totalProtein: number;
  // Per serving values
  caloriesPerServing: number;
  proteinPerServing: number;
  // Derived food type (most restrictive ingredient)
  foodType: FoodType;
}
