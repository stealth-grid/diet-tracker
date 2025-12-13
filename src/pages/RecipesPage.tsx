import { useState, useEffect } from "react";
import { Plus, BookOpen, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { RecipeBuilder } from "~/components/recipes/RecipeBuilder";
import { RecipeList } from "~/components/recipes/RecipeList";
import { RecipeDetailDialog } from "~/components/recipes/RecipeDetailDialog";
import { QuickAddDialog } from "~/components/recipes/QuickAddDialog";
import { useAuth } from "~/contexts/AuthContext";
import { getDietPreference } from "~/lib/storage";
import { initializeFoods } from "~/lib/foodInitialization";
import {
  getRecipes,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  duplicateRecipe,
  getRecipeStats,
} from "~/lib/recipeStorage";
import { addIntakeEntry } from "~/lib/storage";
import { intakeAPI, recipeAPI } from "~/lib/api";
import type { CreateRecipeDTO, UpdateRecipeDTO } from "~/lib/api";
import type { Recipe, FoodItem, IntakeEntry } from "~/types";

type ViewMode = 'list' | 'create' | 'edit';

export function RecipesPage() {
  const { user, isAnonymous, hasBackendConfigured } = useAuth();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>();
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [quickAddRecipe, setQuickAddRecipe] = useState<Recipe | null>(null);
  const [stats, setStats] = useState<ReturnType<typeof getRecipeStats> | null>(null);
  const dietPreference = user ? getDietPreference(user.id) : 'non-vegetarian';

  // Load data
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Load recipes based on authentication
        if (isAnonymous || !hasBackendConfigured) {
          // Anonymous/offline mode - use localStorage
          const recipesData = getRecipes(user.id);
          setRecipes(recipesData);
          setStats(getRecipeStats(user.id));
        } else {
          // Authenticated mode - use API
          const recipesData = await recipeAPI.getAll();
          setRecipes(recipesData);
          const statsData = await recipeAPI.getStats();
          setStats(statsData);
        }

        // Initialize foods using centralized initialization
        const result = await initializeFoods({
          userId: user.id,
          isAnonymous,
          hasBackendConfigured,
        });
        
        setFoods(result.foods);
      } catch (error) {
        console.error('[RecipesPage] Error loading recipe data:', error);
        // Fallback to localStorage on error
        const recipesData = getRecipes(user.id);
        setRecipes(recipesData);
        setStats(getRecipeStats(user.id));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, isAnonymous, hasBackendConfigured]);

  const handleSaveRecipe = async (recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      if (isAnonymous || !hasBackendConfigured) {
        // Anonymous/offline mode - use localStorage
        if (editingRecipe) {
          const updated: Recipe = {
            ...recipeData,
            id: editingRecipe.id,
            createdAt: editingRecipe.createdAt,
            updatedAt: Date.now(),
          };
          updateRecipe(user.id, updated);
        } else {
          const newRecipe: Recipe = {
            ...recipeData,
            id: `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          addRecipe(user.id, newRecipe);
        }
        
        // Refresh from localStorage
        const updatedRecipes = getRecipes(user.id);
        setRecipes(updatedRecipes);
        setStats(getRecipeStats(user.id));
      } else {
        // Authenticated mode - use API
        if (editingRecipe) {
          // Update existing recipe
          const updateDTO: UpdateRecipeDTO = {
            name: recipeData.name,
            description: recipeData.description,
            ingredients: recipeData.ingredients,
            servings: recipeData.servings,
            prepTime: recipeData.prepTime,
            cookTime: recipeData.cookTime,
            instructions: recipeData.instructions,
            category: recipeData.category,
            tags: recipeData.tags,
            imageUrl: recipeData.imageUrl,
            totalCalories: recipeData.totalCalories,
            totalProtein: recipeData.totalProtein,
            caloriesPerServing: recipeData.caloriesPerServing,
            proteinPerServing: recipeData.proteinPerServing,
            foodType: recipeData.foodType,
          };
          
          await recipeAPI.update(editingRecipe.id, updateDTO);
        } else {
          // Create new recipe
          const createDTO: CreateRecipeDTO = {
            id: `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: recipeData.name,
            description: recipeData.description,
            ingredients: recipeData.ingredients,
            servings: recipeData.servings,
            prepTime: recipeData.prepTime,
            cookTime: recipeData.cookTime,
            instructions: recipeData.instructions,
            category: recipeData.category,
            tags: recipeData.tags,
            imageUrl: recipeData.imageUrl,
            totalCalories: recipeData.totalCalories,
            totalProtein: recipeData.totalProtein,
            caloriesPerServing: recipeData.caloriesPerServing,
            proteinPerServing: recipeData.proteinPerServing,
            foodType: recipeData.foodType,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          await recipeAPI.create(createDTO);
        }
        
        // Refresh from API
        const updatedRecipes = await recipeAPI.getAll();
        setRecipes(updatedRecipes);
        const statsData = await recipeAPI.getStats();
        setStats(statsData);
      }
      
      setViewMode('list');
      setEditingRecipe(undefined);
    } catch (error) {
      console.error('[RecipesPage] Error saving recipe:', error);
      alert('Failed to save recipe. Please try again.');
    }
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setViewMode('edit');
    setViewingRecipe(null);
  };

  const handleDeleteRecipe = async (recipe: Recipe) => {
    if (!user) return;
    
    if (confirm(`Delete "${recipe.name}"? This cannot be undone.`)) {
      try {
        if (isAnonymous || !hasBackendConfigured) {
          // Anonymous/offline mode - use localStorage
          deleteRecipe(user.id, recipe.id);
          const updatedRecipes = getRecipes(user.id);
          setRecipes(updatedRecipes);
          setStats(getRecipeStats(user.id));
        } else {
          // Authenticated mode - use API
          await recipeAPI.delete(recipe.id);
          
          // Refresh from API
          const updatedRecipes = await recipeAPI.getAll();
          setRecipes(updatedRecipes);
          const statsData = await recipeAPI.getStats();
          setStats(statsData);
        }
        
        setViewingRecipe(null);
      } catch (error) {
        console.error('[RecipesPage] Error deleting recipe:', error);
        alert('Failed to delete recipe. Please try again.');
      }
    }
  };

  const handleDuplicateRecipe = async (recipe: Recipe) => {
    if (!user) return;
    
    const newName = prompt(`Duplicate "${recipe.name}" as:`, `${recipe.name} (Copy)`);
    if (!newName) return;
    
    try {
      if (isAnonymous || !hasBackendConfigured) {
        // Anonymous/offline mode - use localStorage
        duplicateRecipe(user.id, recipe.id, newName);
        const updatedRecipes = getRecipes(user.id);
        setRecipes(updatedRecipes);
        setStats(getRecipeStats(user.id));
      } else {
        // Authenticated mode - use API
        await recipeAPI.duplicate(recipe.id, newName);
        
        // Refresh from API
        const updatedRecipes = await recipeAPI.getAll();
        setRecipes(updatedRecipes);
        const statsData = await recipeAPI.getStats();
        setStats(statsData);
      }
    } catch (error) {
      console.error('[RecipesPage] Error duplicating recipe:', error);
      alert('Failed to duplicate recipe. Please try again.');
    }
  };

  const handleQuickAdd = (recipe: Recipe) => {
    setQuickAddRecipe(recipe);
    setViewingRecipe(null);
  };

  const handleConfirmQuickAdd = async (recipe: Recipe, servings: number) => {
    if (!user) {
      console.error('[QuickAdd] No user found!');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Calculate nutrition for the specified servings
      const calories = recipe.caloriesPerServing * servings;
      const protein = recipe.proteinPerServing * servings;
      const foodName = `${recipe.name} (${servings} serving${servings !== 1 ? 's' : ''})`;

      if (isAnonymous || !hasBackendConfigured) {
        // ========== ANONYMOUS MODE: Save to localStorage ==========
        // Create intake entry for localStorage
        const entry: IntakeEntry = {
          id: `intake-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          foodId: recipe.id,
          foodName,
          quantity: 0, // Not applicable for recipes
          protein: Math.round(protein * 10) / 10,
          calories: Math.round(calories * 10) / 10,
          date: today,
          timestamp: Date.now(),
          foodType: recipe.foodType,
        };
        
        // Add the entry
        addIntakeEntry(user.id, entry);
      } else {
        // ========== AUTHENTICATED MODE: Save to Cloud API ==========
        // Create intake via API
        const createDTO = {
          foodId: recipe.id,
          foodName,
          foodType: recipe.foodType,
          quantity: 0, // Not applicable for recipes
          protein: Math.round(protein * 10) / 10,
          calories: Math.round(calories * 10) / 10,
          date: today,
        };
        
        await intakeAPI.create(createDTO);
      }
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('intakeUpdated'));
      
      // Also try storage event for cross-tab communication
      window.dispatchEvent(new Event('storage'));
      
      // Close the dialog
      setQuickAddRecipe(null);
      
      // Show success message
      const saveLocation = (isAnonymous || !hasBackendConfigured) ? '💾 localStorage' : '☁️ cloud';
      alert(`✅ Added ${servings} serving${servings !== 1 ? 's' : ''} of "${recipe.name}" to today's intake!\n\nSaved to: ${saveLocation}\n\nGo to Home tab to see it.`);
    } catch (error) {
      console.error('[QuickAdd] Error adding entry:', error);
      alert(`❌ Failed to add recipe. Please try again.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingRecipe(undefined);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-20 space-y-6">
      {viewMode === 'list' ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <BookOpen className="h-8 w-8" />
                My Recipes
              </h1>
              <p className="text-muted-foreground mt-1">
                Create, manage, and use your favorite recipes
              </p>
            </div>
            <Button onClick={() => setViewMode('create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Recipe
            </Button>
          </div>

          {/* Stats */}
          {stats && stats.totalRecipes > 0 && (
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm text-muted-foreground mb-1">Total Recipes</div>
                <div className="text-2xl font-bold">{stats.totalRecipes}</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm text-muted-foreground mb-1">Avg Calories</div>
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(stats.avgCaloriesPerServing)}
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm text-muted-foreground mb-1">Avg Protein</div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(stats.avgProteinPerServing)}g
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm text-muted-foreground mb-1">Categories</div>
                <div className="text-2xl font-bold">
                  {Object.keys(stats.byCategory).length}
                </div>
              </div>
            </div>
          )}

          {/* Recipe List */}
          <RecipeList
            recipes={recipes}
            onView={setViewingRecipe}
            onEdit={handleEditRecipe}
            onDelete={handleDeleteRecipe}
            onDuplicate={handleDuplicateRecipe}
            onQuickAdd={handleQuickAdd}
            dietPreference={dietPreference}
          />
        </>
      ) : (
        <>
          {/* Recipe Builder */}
          <RecipeBuilder
            recipe={editingRecipe}
            foods={foods}
            onSave={handleSaveRecipe}
            onCancel={handleCancel}
          />
        </>
      )}

      {/* Recipe Detail Dialog */}
      <RecipeDetailDialog
        recipe={viewingRecipe}
        open={viewingRecipe !== null}
        onClose={() => setViewingRecipe(null)}
        onEdit={handleEditRecipe}
        onQuickAdd={handleQuickAdd}
      />

      {/* Quick Add Dialog */}
      <QuickAddDialog
        recipe={quickAddRecipe}
        open={quickAddRecipe !== null}
        onClose={() => setQuickAddRecipe(null)}
        onConfirm={handleConfirmQuickAdd}
      />
    </div>
  );
}
