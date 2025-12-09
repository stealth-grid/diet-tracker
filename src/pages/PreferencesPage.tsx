import { useState, useEffect } from "react";
import { Heart, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { FoodPreferences } from "~/components/settings/FoodPreferences";
import { useAuth } from "~/contexts/AuthContext";
import { foodAPI, userAPI } from "~/lib/api";
import {
  getFoods,
  getDietPreference,
  getPreferredFoodIds,
  savePreferredFoodIds,
} from "~/lib/storage";
import type { FoodItem, DietPreference } from "~/types";

export function PreferencesPage() {
  const { user, isAnonymous, hasBackendConfigured, userPreferences, refreshUserPreferences } = useAuth();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [dietPreference, setDietPreference] = useState<DietPreference>("non-vegetarian");
  const [preferredFoodIds, setPreferredFoodIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  // Load data
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        if (isAnonymous || !hasBackendConfigured) {
          // Load from localStorage
          const storedFoods = getFoods(user.id);
          const storedPreference = getDietPreference(user.id);
          const storedPreferredFoods = getPreferredFoodIds(user.id);
          setFoods(storedFoods);
          setDietPreference(storedPreference);
          setPreferredFoodIds(storedPreferredFoods);
        } else {
          // Load from backend
          const backendFoods = await foodAPI.getAll();
          setFoods(backendFoods);
          
          if (userPreferences) {
            setDietPreference(userPreferences.dietPreference);
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

  const handleSavePreferences = async (foodIds: string[]) => {
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
      console.error("Error saving preferences:", error);
      setStatus({
        type: "error",
        message: "Failed to save preferences. Please try again.",
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
          <h1 className="text-3xl font-bold">Food Preferences</h1>
          <p className="text-muted-foreground">
            Choose your preferred foods for meal planning
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
            onSave={handleSavePreferences}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Diet Preference Filtering</h4>
              <p className="text-sm text-muted-foreground">
                Foods are automatically filtered based on your diet preference set in Settings.
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
    </div>
  );
}
