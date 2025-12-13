import type { Recipe, RecipeIngredient, FoodType } from "~/types";

// Get user-scoped storage key for recipes
const getRecipeStorageKey = (userId: string): string => {
  return `diet-tracker-${userId}-recipes`;
};

/**
 * Calculate the most restrictive food type from ingredients
 * non-veg > egg > veg
 */
export const calculateRecipeFoodType = (ingredients: RecipeIngredient[]): FoodType => {
  if (ingredients.some(i => i.foodType === 'non-veg')) return 'non-veg';
  if (ingredients.some(i => i.foodType === 'egg')) return 'egg';
  return 'veg';
};

/**
 * Calculate recipe totals and per-serving values
 */
export const calculateRecipeNutrition = (
  ingredients: RecipeIngredient[],
  servings: number
): {
  totalCalories: number;
  totalProtein: number;
  caloriesPerServing: number;
  proteinPerServing: number;
  foodType: FoodType;
} => {
  const totalCalories = ingredients.reduce((sum, ing) => sum + ing.calories, 0);
  const totalProtein = ingredients.reduce((sum, ing) => sum + ing.protein, 0);
  
  return {
    totalCalories,
    totalProtein,
    caloriesPerServing: servings > 0 ? totalCalories / servings : 0,
    proteinPerServing: servings > 0 ? totalProtein / servings : 0,
    foodType: calculateRecipeFoodType(ingredients),
  };
};

/**
 * Get all recipes for a user
 */
export const getRecipes = (userId: string): Recipe[] => {
  const key = getRecipeStorageKey(userId);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

/**
 * Save all recipes for a user
 */
export const saveRecipes = (userId: string, recipes: Recipe[]): void => {
  const key = getRecipeStorageKey(userId);
  localStorage.setItem(key, JSON.stringify(recipes));
};

/**
 * Get a single recipe by ID
 */
export const getRecipeById = (userId: string, recipeId: string): Recipe | undefined => {
  const recipes = getRecipes(userId);
  return recipes.find(r => r.id === recipeId);
};

/**
 * Add a new recipe
 */
export const addRecipe = (userId: string, recipe: Recipe): void => {
  const recipes = getRecipes(userId);
  
  // Calculate nutrition
  const nutrition = calculateRecipeNutrition(recipe.ingredients, recipe.servings);
  
  const newRecipe: Recipe = {
    ...recipe,
    ...nutrition,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  recipes.push(newRecipe);
  saveRecipes(userId, recipes);
};

/**
 * Update an existing recipe
 */
export const updateRecipe = (userId: string, updatedRecipe: Recipe): void => {
  const recipes = getRecipes(userId);
  const index = recipes.findIndex(r => r.id === updatedRecipe.id);
  
  if (index !== -1) {
    // Recalculate nutrition
    const nutrition = calculateRecipeNutrition(updatedRecipe.ingredients, updatedRecipe.servings);
    
    recipes[index] = {
      ...updatedRecipe,
      ...nutrition,
      updatedAt: Date.now(),
    };
    
    saveRecipes(userId, recipes);
  }
};

/**
 * Delete a recipe
 */
export const deleteRecipe = (userId: string, recipeId: string): void => {
  const recipes = getRecipes(userId);
  const filtered = recipes.filter(r => r.id !== recipeId);
  saveRecipes(userId, filtered);
};

/**
 * Search recipes by name or tags
 */
export const searchRecipes = (
  userId: string,
  query: string
): Recipe[] => {
  const recipes = getRecipes(userId);
  const lowerQuery = query.toLowerCase();
  
  return recipes.filter(recipe => {
    const nameMatch = recipe.name.toLowerCase().includes(lowerQuery);
    const descMatch = recipe.description?.toLowerCase().includes(lowerQuery);
    const tagMatch = recipe.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));
    const categoryMatch = recipe.category?.toLowerCase().includes(lowerQuery);
    
    return nameMatch || descMatch || tagMatch || categoryMatch;
  });
};

/**
 * Filter recipes by category
 */
export const getRecipesByCategory = (
  userId: string,
  category: string
): Recipe[] => {
  const recipes = getRecipes(userId);
  return recipes.filter(r => r.category === category);
};

/**
 * Filter recipes by food type
 */
export const getRecipesByFoodType = (
  userId: string,
  foodType: FoodType
): Recipe[] => {
  const recipes = getRecipes(userId);
  
  if (foodType === 'non-veg') {
    return recipes; // Show all
  } else if (foodType === 'egg') {
    return recipes.filter(r => r.foodType === 'egg' || r.foodType === 'veg');
  } else {
    return recipes.filter(r => r.foodType === 'veg');
  }
};

/**
 * Get recipe statistics
 */
export const getRecipeStats = (userId: string): {
  totalRecipes: number;
  byCategory: Record<string, number>;
  byFoodType: Record<FoodType, number>;
  avgCaloriesPerServing: number;
  avgProteinPerServing: number;
} => {
  const recipes = getRecipes(userId);
  
  const byCategory: Record<string, number> = {};
  const byFoodType: Record<FoodType, number> = { veg: 0, egg: 0, 'non-veg': 0 };
  
  let totalCaloriesPerServing = 0;
  let totalProteinPerServing = 0;
  
  recipes.forEach(recipe => {
    // Count by category
    if (recipe.category) {
      byCategory[recipe.category] = (byCategory[recipe.category] || 0) + 1;
    }
    
    // Count by food type
    byFoodType[recipe.foodType]++;
    
    // Sum nutrition
    totalCaloriesPerServing += recipe.caloriesPerServing;
    totalProteinPerServing += recipe.proteinPerServing;
  });
  
  return {
    totalRecipes: recipes.length,
    byCategory,
    byFoodType,
    avgCaloriesPerServing: recipes.length > 0 ? totalCaloriesPerServing / recipes.length : 0,
    avgProteinPerServing: recipes.length > 0 ? totalProteinPerServing / recipes.length : 0,
  };
};

/**
 * Duplicate a recipe with a new name
 */
export const duplicateRecipe = (userId: string, recipeId: string, newName: string): Recipe | null => {
  const recipe = getRecipeById(userId, recipeId);
  
  if (!recipe) return null;
  
  const duplicated: Recipe = {
    ...recipe,
    id: `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: newName,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  addRecipe(userId, duplicated);
  return duplicated;
};
