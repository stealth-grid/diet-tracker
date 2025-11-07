import { useState, useEffect } from "react";
import { Utensils, LogOut, User as UserIcon, Loader2 } from "lucide-react";
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
import type { FoodItem, DailyGoals, DietPreference, FoodType } from "~/types";
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
import { initialFoods } from "~/data/initialFoods";

function App() {
  const { user, loading, signOut } = useAuth();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [goals, setGoals] = useState<DailyGoals>({ calorieGoal: 2000, proteinGoal: 50 });
  const [dietPreference, setDietPreference] = useState<DietPreference>('non-vegetarian');
  const [preferredFoodIds, setPreferredFoodIds] = useState<string[]>([]);
  const [openAddFoodDialog, setOpenAddFoodDialog] = useState(false);
  const [entriesVersion, setEntriesVersion] = useState(0);
  const [activeTab, setActiveTab] = useState("intake");

  // All hooks must be called before any conditional returns!
  useEffect(() => {
    // Initialize foods from localStorage or use initial data
    let storedFoods = getFoods();
    if (storedFoods.length === 0) {
      // First time - use all initial foods
      saveFoods(initialFoods);
      storedFoods = initialFoods;
    } else {
      // Create a map of initial foods by id
      const initialFoodsMap = new Map(initialFoods.map(f => [f.id, f]));
      
      // Update existing pre-populated foods with latest values from initialFoods
      // Keep custom foods as-is
      storedFoods = storedFoods.map(food => {
        if (!food.isCustom && initialFoodsMap.has(food.id)) {
          // Update pre-populated food with latest values
          return initialFoodsMap.get(food.id)!;
        }
        return food;
      });
      
      // Add any new pre-populated foods that don't exist yet
      const storedIds = new Set(storedFoods.map(f => f.id));
      const newFoods = initialFoods.filter(f => !storedIds.has(f.id));
      if (newFoods.length > 0) {
        storedFoods = [...storedFoods, ...newFoods];
      }
      
      // Save the updated foods
      saveFoods(storedFoods);
    }
    setFoods(storedFoods);

    // Load goals
    const storedGoals = getGoals();
    setGoals(storedGoals);
    
    // Load diet preference
    const storedPreference = getDietPreference();
    setDietPreference(storedPreference);
    
    // Load preferred foods
    const storedPreferredFoods = getPreferredFoodIds();
    setPreferredFoodIds(storedPreferredFoods);
  }, [user]); // Re-run when user changes (logs in/out)

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  const handleAddFood = (food: FoodItem) => {
    addFood(food);
    setFoods(getFoods());
  };

  const handleDeleteFood = (foodId: string) => {
    deleteFood(foodId);
    setFoods(getFoods());
  };

  const handleSaveGoals = (newGoals: DailyGoals) => {
    saveGoals(newGoals);
    setGoals(newGoals);
  };

  const handleSaveDietPreference = (preference: DietPreference) => {
    saveDietPreference(preference);
    setDietPreference(preference);
  };

  const handleSavePreferredFoods = (foodIds: string[]) => {
    savePreferredFoodIds(foodIds);
    setPreferredFoodIds(foodIds);
  };

  const handleOpenAddNewFood = () => {
    // Switch to Food Database tab and open Add Food dialog
    setActiveTab("database");
    setOpenAddFoodDialog(true);
  };

  const handleEntriesChange = () => {
    setEntriesVersion(v => v + 1);
  };

  const handleDataImported = () => {
    // Reload all data after import
    const storedFoods = getFoods();
    const storedGoals = getGoals();
    const storedPreference = getDietPreference();
    const storedPreferredFoods = getPreferredFoodIds();
    setFoods(storedFoods);
    setGoals(storedGoals);
    setDietPreference(storedPreference);
    setPreferredFoodIds(storedPreferredFoods);
    setEntriesVersion(v => v + 1); // Trigger intake tracker refresh
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background p-4 mb-8">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="h-6 w-6" />
            <h1 className="text-xl font-bold text-foreground">Diet Tracker</h1>
          </div>
          <div className="flex items-center gap-3">
            <SettingsDialog 
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
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
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
                      {user.displayName || 'User'}
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
    </div>
  );
}

export default App;
