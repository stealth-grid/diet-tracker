import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { IntakeTracker } from "~/components/intake/IntakeTracker";
import { FoodDatabase } from "~/components/database/FoodDatabase";
import { MealPlanner } from "~/components/planner/MealPlanner";
import { useAuth } from "~/contexts/AuthContext";
import type { FoodItem, DailyGoals, DietPreference } from "~/types";
import { foodAPI } from "~/lib/api";
import { initialFoods } from "~/data/initialFoods";
import {
  getFoods,
  saveFoods,
  addFood,
  deleteFood,
  getGoals,
  getDietPreference,
  getPreferredFoodIds,
} from "~/lib/storage";

export function HomePage() {
  const { user, userPreferences, isAnonymous, hasBackendConfigured } = useAuth();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [goals, setGoals] = useState<DailyGoals>({ calorieGoal: 2000, proteinGoal: 50 });
  const [dietPreference, setDietPreference] = useState<DietPreference>("non-vegetarian");
  const [preferredFoodIds, setPreferredFoodIds] = useState<string[]>([]);
  const [openAddFoodDialog, setOpenAddFoodDialog] = useState(false);
  const [entriesVersion, setEntriesVersion] = useState(0);
  const [activeTab, setActiveTab] = useState("intake");
  const [dataLoading, setDataLoading] = useState(true);

  // Load user data from backend or localStorage
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setDataLoading(true);
      try {
        if (isAnonymous || !hasBackendConfigured) {
          // Anonymous mode or no backend - use localStorage only
          const storedFoods = getFoods(user.id);
          if (storedFoods.length === 0) {
            saveFoods(user.id, initialFoods);
            setFoods(initialFoods);
          } else {
            setFoods(storedFoods);
          }

          const storedGoals = getGoals(user.id);
          setGoals(storedGoals);

          const storedPreference = getDietPreference(user.id);
          setDietPreference(storedPreference);

          const storedPreferredFoods = getPreferredFoodIds(user.id);
          setPreferredFoodIds(storedPreferredFoods);
        } else {
          // Google user with backend - use backend API
          if (userPreferences) {
            setGoals({
              calorieGoal: userPreferences.calorieGoal,
              proteinGoal: userPreferences.proteinGoal,
            });
            setDietPreference(userPreferences.dietPreference);
            setPreferredFoodIds(userPreferences.preferredFoodIds);
          }

          const backendFoods = await foodAPI.getAll();
          setFoods(backendFoods);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        // Fallback to localStorage for any user
        const storedFoods = getFoods(user.id);
        setFoods(storedFoods.length > 0 ? storedFoods : initialFoods);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [user, userPreferences, isAnonymous, hasBackendConfigured]);

  const handleAddFood = async (food: FoodItem) => {
    if (!user) return;
    try {
      if (isAnonymous || !hasBackendConfigured) {
        // Anonymous/offline mode - use localStorage
        addFood(user.id, food);
        setFoods(getFoods(user.id));
      } else {
        // Google user with backend - use backend API
        const newFood = await foodAPI.create({
          name: food.name,
          proteinPer100g: food.proteinPer100g,
          caloriesPer100g: food.caloriesPer100g,
          foodType: food.foodType,
          category: food.category,
        });
        setFoods([...foods, newFood]);
      }
    } catch (error) {
      console.error("Error adding food:", error);
      alert("Failed to add food. Please try again.");
    }
  };

  const handleDeleteFood = async (foodId: string) => {
    if (!user) return;
    try {
      if (isAnonymous || !hasBackendConfigured) {
        // Anonymous/offline mode - use localStorage
        deleteFood(user.id, foodId);
        setFoods(getFoods(user.id));
      } else {
        // Google user with backend - use backend API
        await foodAPI.delete(foodId);
        setFoods(foods.filter((f) => f.id !== foodId));
      }
    } catch (error) {
      console.error("Error deleting food:", error);
      alert("Failed to delete food. Please try again.");
    }
  };

  const handleOpenAddNewFood = () => {
    // Switch to Food Database tab and open Add Food dialog
    setActiveTab("database");
    setOpenAddFoodDialog(true);
  };

  const handleEntriesChange = () => {
    setEntriesVersion((v) => v + 1);
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8">
        <TabsTrigger value="intake">Track Intake</TabsTrigger>
        <TabsTrigger value="planner">Meal Planner</TabsTrigger>
        <TabsTrigger value="database">Food Database</TabsTrigger>
      </TabsList>

      <TabsContent value="intake" className="mt-0">
        <IntakeTracker
          foods={foods}
          goals={goals}
          dietPreference={dietPreference}
          userId={user!.id}
          onAddNewFood={handleOpenAddNewFood}
          onEntriesChange={handleEntriesChange}
        />
      </TabsContent>

      <TabsContent value="planner" className="mt-0">
        <MealPlanner
          foods={foods}
          goals={goals}
          dietPreference={dietPreference}
          preferredFoodIds={preferredFoodIds}
        />
      </TabsContent>

      <TabsContent value="database" className="mt-0">
        <FoodDatabase
          foods={foods}
          onAddFood={handleAddFood}
          onDeleteFood={handleDeleteFood}
          dietPreference={dietPreference}
          openAddDialog={openAddFoodDialog}
          onAddDialogChange={setOpenAddFoodDialog}
        />
      </TabsContent>
    </Tabs>
  );
}
