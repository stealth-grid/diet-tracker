import { useState, useEffect } from "react";
import { Utensils, LogOut, User as UserIcon, Loader2, HardDrive } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { IntakeTracker } from "~/components/intake/IntakeTracker";
import { FoodDatabase } from "~/components/database/FoodDatabase";
import { MealPlanner } from "~/components/planner/MealPlanner";
import { SettingsDialog } from "~/components/settings/SettingsDialog";
import { LoginPage } from "~/components/auth/LoginPage";
import { useAuth } from "~/contexts/AuthContext";
import type { FoodItem, DailyGoals, DietPreference } from "~/types";
import { foodAPI, userAPI } from "~/lib/api";
import { initialFoods } from "~/data/initialFoods";
import {
  getFoods,
  saveFoods,
  addFood,
  deleteFood,
  getGoals,
  saveGoals,
  getDietPreference,
  saveDietPreference,
  getPreferredFoodIds,
  savePreferredFoodIds
} from "~/lib/storage";

function App() {
  const { user, loading, signOut, userPreferences, refreshUserPreferences, isAnonymous, hasBackendConfigured } = useAuth();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [goals, setGoals] = useState<DailyGoals>({ calorieGoal: 2000, proteinGoal: 50 });
  const [dietPreference, setDietPreference] = useState<DietPreference>('non-vegetarian');
  const [preferredFoodIds, setPreferredFoodIds] = useState<string[]>([]);
  const [openAddFoodDialog, setOpenAddFoodDialog] = useState(false);
  const [entriesVersion, setEntriesVersion] = useState(0);
  const [activeTab, setActiveTab] = useState("intake");
  const [dataLoading, setDataLoading] = useState(false);

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
        console.error('Error loading data:', error);
        // Fallback to localStorage for any user
        const storedFoods = getFoods(user.id);
        setFoods(storedFoods.length > 0 ? storedFoods : initialFoods);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [user, userPreferences, isAnonymous, hasBackendConfigured]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  // Show loading for data
  if (dataLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your data...</p>
        </div>
      </div>
    );
  }

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
      console.error('Error adding food:', error);
      alert('Failed to add food. Please try again.');
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
        setFoods(foods.filter(f => f.id !== foodId));
      }
    } catch (error) {
      console.error('Error deleting food:', error);
      alert('Failed to delete food. Please try again.');
    }
  };

  const handleSaveGoals = async (newGoals: DailyGoals) => {
    if (!user) return;
    try {
      if (isAnonymous || !hasBackendConfigured) {
        // Anonymous/offline mode - use localStorage
        saveGoals(user.id, newGoals);
        setGoals(newGoals);
      } else {
        // Google user with backend - use backend API
        await userAPI.updatePreferences({
          calorieGoal: newGoals.calorieGoal,
          proteinGoal: newGoals.proteinGoal,
        });
        setGoals(newGoals);
        await refreshUserPreferences();
      }
    } catch (error) {
      console.error('Error saving goals:', error);
      alert('Failed to save goals. Please try again.');
    }
  };

  const handleSaveDietPreference = async (preference: DietPreference) => {
    if (!user) return;
    try {
      if (isAnonymous || !hasBackendConfigured) {
        // Anonymous/offline mode - use localStorage
        saveDietPreference(user.id, preference);
        setDietPreference(preference);
      } else {
        // Google user with backend - use backend API
        await userAPI.updatePreferences({
          dietPreference: preference,
        });
        setDietPreference(preference);
        await refreshUserPreferences();
        
        // Reload foods with new diet preference
        const backendFoods = await foodAPI.getAll(preference);
        setFoods(backendFoods);
      }
    } catch (error) {
      console.error('Error saving diet preference:', error);
      alert('Failed to save diet preference. Please try again.');
    }
  };

  const handleSavePreferredFoods = async (foodIds: string[]) => {
    if (!user) return;
    try {
      if (isAnonymous || !hasBackendConfigured) {
        // Anonymous/offline mode - use localStorage
        savePreferredFoodIds(user.id, foodIds);
        setPreferredFoodIds(foodIds);
      } else {
        // Google user with backend - use backend API
        await userAPI.updatePreferences({
          preferredFoodIds: foodIds,
        });
        setPreferredFoodIds(foodIds);
        await refreshUserPreferences();
      }
    } catch (error) {
      console.error('Error saving preferred foods:', error);
      alert('Failed to save preferred foods. Please try again.');
    }
  };

  const handleOpenAddNewFood = () => {
    // Switch to Food Database tab and open Add Food dialog
    setActiveTab("database");
    setOpenAddFoodDialog(true);
  };

  const handleEntriesChange = () => {
    setEntriesVersion(v => v + 1);
  };

  const handleDataImported = async () => {
    if (!user) return;
    try {
      if (isAnonymous || !hasBackendConfigured) {
        // Anonymous/offline mode - reload from localStorage
        const storedFoods = getFoods(user.id);
        const storedGoals = getGoals(user.id);
        const storedPreference = getDietPreference(user.id);
        const storedPreferredFoods = getPreferredFoodIds(user.id);
        setFoods(storedFoods);
        setGoals(storedGoals);
        setDietPreference(storedPreference);
        setPreferredFoodIds(storedPreferredFoods);
      } else {
        // Google user with backend - reload from backend
        const backendFoods = await foodAPI.getAll();
        setFoods(backendFoods);
        
        await refreshUserPreferences();
        if (userPreferences) {
          setGoals({
            calorieGoal: userPreferences.calorieGoal,
            proteinGoal: userPreferences.proteinGoal,
          });
          setDietPreference(userPreferences.dietPreference);
          setPreferredFoodIds(userPreferences.preferredFoodIds);
        }
      }
      
      setEntriesVersion(v => v + 1);
    } catch (error) {
      console.error('Error reloading data after import:', error);
    }
  };

  return (
    <>
      <header className="border-b bg-background p-4 mb-8 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="h-6 w-6" />
            <h1 className="text-xl font-bold text-foreground">Diet Tracker</h1>
            {(isAnonymous || !hasBackendConfigured) && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1">
                <HardDrive className="h-3 w-3" />
                Offline
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <SettingsDialog 
              userId={user.id}
              foods={foods}
              goals={goals}
              dietPreference={dietPreference}
              preferredFoodIds={preferredFoodIds}
              onSave={handleSaveGoals}
              onSaveDietPreference={handleSaveDietPreference}
              onSavePreferredFoods={handleSavePreferredFoods}
              onDataImported={handleDataImported}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  {user.picture ? (
                    <img 
                      src={user.picture} 
                      alt={user.name || 'User'} 
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <UserIcon className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 max-w-5xl">
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
              userId={user.id}
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
      </main>

      <footer className="mt-8">
        <div className="border-t border-gray-200"></div>
        <div className="container mx-auto flex items-center justify-center gap-4 p-4">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
            &copy; {new Date().getFullYear()} Diet Tracker. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}

export default App;
