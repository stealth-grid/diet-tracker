import { initialFoods } from '~/data/initialFoods';
import { getFoods, saveFoods } from '~/lib/storage';
import { foodAPI } from '~/lib/api';
import type { FoodItem } from '~/types';

interface InitializeFoodsOptions {
  userId: string;
  isAnonymous: boolean;
  hasBackendConfigured: boolean;
}

interface InitializeFoodsResult {
  foods: FoodItem[];
  source: 'backend' | 'localStorage' | 'initialized';
}

/**
 * Initialize foods for a user
 * - For anonymous users or users without backend: use localStorage
 * - For cloud users: fetch from backend, seed if empty
 */
export async function initializeFoods(options: InitializeFoodsOptions): Promise<InitializeFoodsResult> {
  const { userId, isAnonymous, hasBackendConfigured } = options;

  // Anonymous or offline mode - use localStorage
  if (isAnonymous || !hasBackendConfigured) {
    return initializeLocalStorageFoods(userId);
  }

  // Cloud user - use backend
  return initializeBackendFoods(userId);
}

/**
 * Initialize foods from localStorage
 * If empty, seed with initialFoods
 */
function initializeLocalStorageFoods(userId: string): InitializeFoodsResult {
  const storedFoods = getFoods(userId);
  
  if (storedFoods.length === 0) {
    saveFoods(userId, initialFoods);
    return {
      foods: initialFoods,
      source: 'initialized',
    };
  }

  return {
    foods: storedFoods,
    source: 'localStorage',
  };
}

/**
 * Initialize foods from backend
 * Falls back to localStorage if backend fails
 */
async function initializeBackendFoods(userId: string): Promise<InitializeFoodsResult> {
  try {
    // Try to fetch foods from backend
    let backendFoods = await foodAPI.getAll();

    // If backend is empty, seed it
    if (backendFoods.length === 0) {
      await seedBackendFoods();
      
      // Fetch again after seeding
      backendFoods = await foodAPI.getAll();
    }

    // Also save to localStorage as cache
    saveFoods(userId, backendFoods);

    return {
      foods: backendFoods,
      source: 'backend',
    };
  } catch (error) {
    console.error('[FoodInit] Backend error, falling back to localStorage:', error);
    
    // Fallback to localStorage
    const storedFoods = getFoods(userId);
    
    if (storedFoods.length === 0) {
      saveFoods(userId, initialFoods);
      return {
        foods: initialFoods,
        source: 'initialized',
      };
    }

    return {
      foods: storedFoods,
      source: 'localStorage',
    };
  }
}

/**
 * Seed initial foods to backend
 * Sends all foods from frontend in one bulk operation
 */
async function seedBackendFoods(): Promise<void> {
  try {
    // Prepare foods data for backend
    const foodsToSend = initialFoods.map(food => ({
      id: food.id,
      name: food.name,
      proteinPer100g: food.proteinPer100g,
      caloriesPer100g: food.caloriesPer100g,
      foodType: food.foodType,
      category: food.category,
    }));

    // Send all foods in one request
    await foodAPI.bulkCreate(foodsToSend);
  } catch (error: any) {
    console.error('[FoodInit] Error during bulk create:', error);
    throw error;
  }
}

/**
 * Force refresh foods from backend or localStorage
 */
export async function refreshFoods(options: InitializeFoodsOptions): Promise<FoodItem[]> {
  const result = await initializeFoods(options);
  return result.foods;
}

/**
 * Check if foods need to be initialized
 * Returns true if foods array is empty or outdated
 */
export function needsFoodInitialization(userId: string, currentFoods: FoodItem[]): boolean {
  // If current foods array is empty, definitely needs init
  if (currentFoods.length === 0) {
    return true;
  }

  // Check if localStorage has foods
  const storedFoods = getFoods(userId);
  
  // If localStorage is empty but we have foods in memory, update localStorage
  if (storedFoods.length === 0) {
    saveFoods(userId, currentFoods);
  }

  return false;
}
