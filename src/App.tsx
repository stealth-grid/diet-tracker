import { useState, useEffect } from "react";
import { Utensils } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { IntakeTracker } from "~/components/intake/IntakeTracker";
import { FoodDatabase } from "~/components/database/FoodDatabase";
import { GoalsDialog } from "~/components/goals/GoalsDialog";
import type { FoodItem, DailyGoals } from "~/types";
import { 
  getFoods, 
  saveFoods, 
  addFood, 
  deleteFood,
  getGoals,
  saveGoals 
} from "~/lib/storage";
import { initialFoods } from "~/data/initialFoods";

function App() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [goals, setGoals] = useState<DailyGoals>({ calorieGoal: 2000, proteinGoal: 50 });
  const [openAddFoodDialog, setOpenAddFoodDialog] = useState(false);
  const [entriesVersion, setEntriesVersion] = useState(0);
  const [activeTab, setActiveTab] = useState("intake");

  useEffect(() => {
    // Initialize foods from localStorage or use initial data
    let storedFoods = getFoods();
    if (storedFoods.length === 0) {
      // First time - use all initial foods
      saveFoods(initialFoods);
      storedFoods = initialFoods;
    } else {
      // Merge: Add any new pre-populated foods that don't exist yet
      const storedIds = new Set(storedFoods.map(f => f.id));
      const newFoods = initialFoods.filter(f => !storedIds.has(f.id));
      if (newFoods.length > 0) {
        storedFoods = [...storedFoods, ...newFoods];
        saveFoods(storedFoods);
      }
    }
    setFoods(storedFoods);

    // Load goals
    const storedGoals = getGoals();
    setGoals(storedGoals);
  }, []);

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

  const handleOpenAddNewFood = () => {
    // Switch to Food Database tab and open Add Food dialog
    setActiveTab("database");
    setOpenAddFoodDialog(true);
  };

  const handleEntriesChange = () => {
    setEntriesVersion(v => v + 1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background p-4 mb-8">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="h-6 w-6" />
            <h1 className="text-xl font-bold text-foreground">Diet Tracker</h1>
          </div>
          <GoalsDialog goals={goals} onSave={handleSaveGoals} />
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 max-w-5xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="intake">Track Intake</TabsTrigger>
            <TabsTrigger value="database">Food Database</TabsTrigger>
          </TabsList>

          <TabsContent value="intake" className="mt-0">
            <IntakeTracker 
              foods={foods} 
              goals={goals} 
              onAddNewFood={handleOpenAddNewFood}
              onEntriesChange={handleEntriesChange}
            />
          </TabsContent>

          <TabsContent value="database" className="mt-0">
            <FoodDatabase 
              foods={foods} 
              onAddFood={handleAddFood} 
              onDeleteFood={handleDeleteFood}
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
