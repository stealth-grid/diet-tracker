import { useState, useEffect } from "react";
import { Heart, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { FoodTypeIndicator } from "~/components/ui/food-type-indicator";
import { FoodPreferences } from "~/components/settings/FoodPreferences";
import { useAuth } from "~/contexts/AuthContext";
import { foodAPI, userAPI } from "~/lib/api";
import {
  getGoals,
  saveGoals,
  getDietPreference,
  saveDietPreference,
  getFoods,
  getPreferredFoodIds,
  savePreferredFoodIds,
} from "~/lib/storage";
import type { DailyGoals, DietPreference, FoodItem } from "~/types";

export function PreferencesPage() {
  const { user, isAnonymous, hasBackendConfigured, refreshUserPreferences, userPreferences } = useAuth();
  
  // Goals & Diet state
  const [goals, setGoals] = useState<DailyGoals>({ calorieGoal: 2000, proteinGoal: 50 });
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [proteinGoal, setProteinGoal] = useState(50);
  const [dietPreference, setDietPreference] = useState<DietPreference>("non-vegetarian");
  const [selectedDiet, setSelectedDiet] = useState<DietPreference>("non-vegetarian");
  
  // Food preferences state
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [preferredFoodIds, setPreferredFoodIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  // Load all preferences data
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        if (isAnonymous || !hasBackendConfigured) {
          // Load from localStorage
          const storedGoals = getGoals(user.id);
          const storedPreference = getDietPreference(user.id);
          const storedFoods = getFoods(user.id);
          const storedPreferredFoods = getPreferredFoodIds(user.id);
          
          setGoals(storedGoals);
          setCalorieGoal(storedGoals.calorieGoal);
          setProteinGoal(storedGoals.proteinGoal);
          setDietPreference(storedPreference);
          setSelectedDiet(storedPreference);
          setFoods(storedFoods);
          setPreferredFoodIds(storedPreferredFoods);
        } else {
          // Load from backend
          const backendFoods = await foodAPI.getAll();
          setFoods(backendFoods);
          
          if (userPreferences) {
            const loadedGoals = {
              calorieGoal: userPreferences.calorieGoal,
              proteinGoal: userPreferences.proteinGoal,
            };
            setGoals(loadedGoals);
            setCalorieGoal(loadedGoals.calorieGoal);
            setProteinGoal(loadedGoals.proteinGoal);
            setDietPreference(userPreferences.dietPreference);
            setSelectedDiet(userPreferences.dietPreference);
            setPreferredFoodIds(userPreferences.preferredFoodIds);
          }
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
        setStatus({
          type: "error",
          message: "Failed to load preferences. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, isAnonymous, hasBackendConfigured, userPreferences]);

  const handleSaveGoals = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const newGoals = { calorieGoal, proteinGoal };
      
      if (isAnonymous || !hasBackendConfigured) {
        // Save to localStorage
        saveGoals(user.id, newGoals);
        saveDietPreference(user.id, selectedDiet);
        setGoals(newGoals);
        setDietPreference(selectedDiet);
      } else {
        // Save to backend
        await userAPI.updatePreferences({
          calorieGoal,
          proteinGoal,
          dietPreference: selectedDiet,
        });
        setGoals(newGoals);
        setDietPreference(selectedDiet);
        await refreshUserPreferences();
      }

      setStatus({ type: "success", message: "Goals and diet preference saved successfully!" });
      setTimeout(() => {
        setStatus({ type: "idle", message: "" });
      }, 3000);
    } catch (error) {
      console.error("Error saving goals:", error);
      setStatus({ type: "error", message: "Failed to save goals. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFoodPreferences = async (foodIds: string[]) => {
    if (!user) return;

    try {
      if (isAnonymous || !hasBackendConfigured) {
        // Save to localStorage
        savePreferredFoodIds(user.id, foodIds);
        setPreferredFoodIds(foodIds);
      } else {
        // Save to backend
        await userAPI.updatePreferences({
          preferredFoodIds: foodIds,
        });
        setPreferredFoodIds(foodIds);
        await refreshUserPreferences();
      }

      setStatus({
        type: "success",
        message: "Food preferences saved successfully!",
      });
      setTimeout(() => {
        setStatus({ type: "idle", message: "" });
      }, 3000);
    } catch (error) {
      console.error("Error saving food preferences:", error);
      setStatus({
        type: "error",
        message: "Failed to save food preferences. Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Preferences</h1>
          <p className="text-muted-foreground">
            Customize your nutrition goals and food preferences
          </p>
        </div>
      </div>

      {/* Status Messages */}
      {status.type !== "idle" && (
        <div
          className={`rounded-lg p-4 flex items-start gap-3 ${
            status.type === "success"
              ? "bg-green-50 text-green-900 border border-green-200"
              : "bg-red-50 text-red-900 border border-red-200"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <p className="text-sm">{status.message}</p>
        </div>
      )}

      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="goals">Goals & Diet</TabsTrigger>
          <TabsTrigger value="foods">Food Preferences</TabsTrigger>
        </TabsList>

        {/* Goals & Diet Tab */}
        <TabsContent value="goals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Goals & Diet Preference</CardTitle>
              <CardDescription>
                Set your daily nutrition goals and dietary preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="calorie-goal">Daily Calorie Goal (kcal)</Label>
                <Input
                  id="calorie-goal"
                  type="number"
                  value={calorieGoal}
                  onChange={(e) => setCalorieGoal(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="protein-goal">Daily Protein Goal (g)</Label>
                <Input
                  id="protein-goal"
                  type="number"
                  value={proteinGoal}
                  onChange={(e) => setProteinGoal(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diet-preference">Diet Preference</Label>
                <Select
                  value={selectedDiet}
                  onValueChange={(value) => setSelectedDiet(value as DietPreference)}
                >
                  <SelectTrigger id="diet-preference">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vegetarian">
                      <div className="flex items-center gap-2">
                        <FoodTypeIndicator foodType="veg" size="sm" />
                        <span>Vegetarian</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="eggetarian">
                      <div className="flex items-center gap-2">
                        <FoodTypeIndicator foodType="egg" size="sm" />
                        <span>Eggetarian (Veg + Egg)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="non-vegetarian">
                      <div className="flex items-center gap-2">
                        <FoodTypeIndicator foodType="non-veg" size="sm" />
                        <span>Non-Vegetarian (All Foods)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This will filter meal suggestions and food items throughout the app
                </p>
              </div>

              <Button onClick={handleSaveGoals} className="w-full" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Goals & Diet Preference"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Food Preferences Tab */}
        <TabsContent value="foods" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferred Foods</CardTitle>
              <CardDescription>
                Select the foods you prefer to eat. The meal planner will prioritize these foods
                when generating meal suggestions based on your diet preference.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FoodPreferences
                foods={foods}
                dietPreference={dietPreference}
                selectedFoodIds={preferredFoodIds}
                onSave={handleSaveFoodPreferences}
              />
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Diet Preference Filtering</h4>
                  <p className="text-sm text-muted-foreground">
                    Foods are automatically filtered based on your diet preference.
                    Vegetarian users will only see vegetarian foods, eggetarians will see vegetarian
                    and egg-based foods, etc.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Meal Planner Integration</h4>
                  <p className="text-sm text-muted-foreground">
                    When you select preferred foods, the meal planner will only use those foods
                    when generating meal suggestions. This helps you get personalized recommendations.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Flexible Selection</h4>
                  <p className="text-sm text-muted-foreground">
                    You can select as many or as few foods as you like. If you don't select any,
                    the meal planner will use all available foods based on your diet preference.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Easy to Update</h4>
                  <p className="text-sm text-muted-foreground">
                    Your preferences are saved automatically. You can come back and update them
                    anytime as your tastes change or you discover new foods.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
