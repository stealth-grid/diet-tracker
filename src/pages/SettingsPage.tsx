import { useState, useEffect } from "react";
import { Download, Upload, AlertCircle, CheckCircle, Settings as SettingsIcon } from "lucide-react";
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
import { useAuth } from "~/contexts/AuthContext";
import { userAPI } from "~/lib/api";
import {
  getGoals,
  saveGoals,
  getDietPreference,
  saveDietPreference,
} from "~/lib/storage";
import {
  downloadDataAsJSON,
  readJSONFile,
  validateImportData,
  importData,
  type ExportData,
} from "~/lib/dataManagement";
import type { DailyGoals, DietPreference } from "~/types";

export function SettingsPage() {
  const { user, isAnonymous, hasBackendConfigured, refreshUserPreferences, userPreferences } = useAuth();
  const [goals, setGoals] = useState<DailyGoals>({ calorieGoal: 2000, proteinGoal: 50 });
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [proteinGoal, setProteinGoal] = useState(50);
  const [dietPreference, setDietPreference] = useState<DietPreference>("non-vegetarian");
  const [selectedDiet, setSelectedDiet] = useState<DietPreference>("non-vegetarian");

  // Import state
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [importStatus, setImportStatus] = useState<{
    type: "idle" | "success" | "error" | "warning";
    message: string;
  }>({ type: "idle", message: "" });
  const [isImporting, setIsImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load user goals and preferences
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        if (isAnonymous || !hasBackendConfigured) {
          // Load from localStorage
          const storedGoals = getGoals(user.id);
          const storedPreference = getDietPreference(user.id);
          setGoals(storedGoals);
          setCalorieGoal(storedGoals.calorieGoal);
          setProteinGoal(storedGoals.proteinGoal);
          setDietPreference(storedPreference);
          setSelectedDiet(storedPreference);
        } else {
          // Load from backend
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
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
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

      setImportStatus({ type: "success", message: "Goals and preferences saved successfully!" });
      setTimeout(() => {
        setImportStatus({ type: "idle", message: "" });
      }, 3000);
    } catch (error) {
      console.error("Error saving goals:", error);
      setImportStatus({ type: "error", message: "Failed to save goals. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    if (!user) return;
    try {
      downloadDataAsJSON(user.id);
      setImportStatus({
        type: "success",
        message: "Data exported successfully! Check your downloads folder.",
      });
      setTimeout(() => {
        setImportStatus({ type: "idle", message: "" });
      }, 3000);
    } catch (error) {
      setImportStatus({
        type: "error",
        message: "Failed to export data. Please try again.",
      });
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus({ type: "idle", message: "" });

    try {
      // Read file
      const data = await readJSONFile(file);

      // Validate data
      const validation = validateImportData(data);

      if (!validation.isValid) {
        setImportStatus({
          type: "error",
          message: `Validation failed: ${validation.errors.join(", ")}`,
        });
        setIsImporting(false);
        return;
      }

      // Show warnings if any
      if (validation.warnings.length > 0) {
        setImportStatus({
          type: "warning",
          message: `Import will proceed with warnings: ${validation.warnings.join(", ")}`,
        });
      }

      // Import data
      importData(user.id, data as ExportData, importMode);

      setImportStatus({
        type: "success",
        message: `Data imported successfully in ${importMode} mode! ${
          importMode === "merge"
            ? "New items have been added to your existing data."
            : "All data has been replaced."
        }`,
      });

      // Reload data
      const storedGoals = getGoals(user.id);
      const storedPreference = getDietPreference(user.id);
      setGoals(storedGoals);
      setCalorieGoal(storedGoals.calorieGoal);
      setProteinGoal(storedGoals.proteinGoal);
      setDietPreference(storedPreference);
      setSelectedDiet(storedPreference);
    } catch (error) {
      setImportStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to import data.",
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your goals and data</p>
        </div>
      </div>

      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="goals">Goals & Diet</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

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
                  This will filter meal suggestions and mark food items throughout the app
                </p>
              </div>

              <Button onClick={handleSaveGoals} className="w-full" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Goals & Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-6">
          <div className="space-y-6">
            {/* Export Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle>Export Data</CardTitle>
                    <CardDescription>
                      Download all your food items, intake records, and goals as a JSON file
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button onClick={handleExportData} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Backup
                </Button>
              </CardContent>
            </Card>

            {/* Import Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle>Import Data</CardTitle>
                    <CardDescription>
                      Upload a previously exported JSON file to restore your data
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="import-mode">Import Mode</Label>
                  <Select
                    value={importMode}
                    onValueChange={(value) => setImportMode(value as "merge" | "replace")}
                  >
                    <SelectTrigger id="import-mode">
                      <SelectValue placeholder="Select import mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="merge">Merge (Keep existing + Add new)</SelectItem>
                      <SelectItem value="replace">Replace (Delete existing + Import new)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {importMode === "merge"
                      ? "New items will be added to your existing data. Duplicates are skipped."
                      : "⚠️ All existing data will be deleted and replaced with imported data."}
                  </p>
                </div>

                <div className="relative">
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileSelect}
                    disabled={isImporting}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={isImporting}
                      asChild
                    >
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {isImporting ? "Importing..." : "Choose File to Import"}
                      </span>
                    </Button>
                  </Label>
                </div>

                <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
                  <strong>Note:</strong> Only import files that you exported from this app.
                  Importing modified or corrupted files may cause data loss.
                </div>
              </CardContent>
            </Card>

            {/* Status Messages */}
            {importStatus.type !== "idle" && (
              <div
                className={`rounded-lg p-4 flex items-start gap-3 ${
                  importStatus.type === "success"
                    ? "bg-green-50 text-green-900 border border-green-200"
                    : importStatus.type === "error"
                    ? "bg-red-50 text-red-900 border border-red-200"
                    : "bg-yellow-50 text-yellow-900 border border-yellow-200"
                }`}
              >
                {importStatus.type === "success" ? (
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                )}
                <p className="text-sm">{importStatus.message}</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
