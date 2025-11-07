import { useState, useEffect } from "react";
import { Settings, Download, Upload, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
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
import type { DailyGoals, DietPreference, FoodItem } from "~/types";
import { FoodTypeIndicator } from "~/components/ui/food-type-indicator";
import { FoodPreferences } from "./FoodPreferences";
import {
  downloadDataAsJSON,
  readJSONFile,
  validateImportData,
  importData,
  type ExportData,
} from "~/lib/dataManagement";

interface SettingsDialogProps {
  foods: FoodItem[];
  goals: DailyGoals;
  dietPreference: DietPreference;
  preferredFoodIds: string[];
  onSave: (goals: DailyGoals) => void;
  onSaveDietPreference: (preference: DietPreference) => void;
  onSavePreferredFoods: (foodIds: string[]) => void;
  onDataImported: () => void;
}

export function SettingsDialog({ 
  foods,
  goals, 
  dietPreference, 
  preferredFoodIds,
  onSave, 
  onSaveDietPreference,
  onSavePreferredFoods,
  onDataImported 
}: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [calorieGoal, setCalorieGoal] = useState(goals.calorieGoal);
  const [proteinGoal, setProteinGoal] = useState(goals.proteinGoal);
  const [selectedDiet, setSelectedDiet] = useState<DietPreference>(dietPreference);
  
  // Import state
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [importStatus, setImportStatus] = useState<{
    type: "idle" | "success" | "error" | "warning";
    message: string;
  }>({ type: "idle", message: "" });
  const [isImporting, setIsImporting] = useState(false);

  // Sync state with props when dialog opens or goals change
  useEffect(() => {
    setCalorieGoal(goals.calorieGoal);
    setProteinGoal(goals.proteinGoal);
    setSelectedDiet(dietPreference);
  }, [goals, dietPreference, open]);

  // Reset import status when dialog closes
  useEffect(() => {
    if (!open) {
      setImportStatus({ type: "idle", message: "" });
    }
  }, [open]);

  const handleSaveGoals = () => {
    onSave({ calorieGoal, proteinGoal });
    onSaveDietPreference(selectedDiet);
    setImportStatus({ type: "success", message: "Goals and preferences saved successfully!" });
    setTimeout(() => {
      setImportStatus({ type: "idle", message: "" });
      setOpen(false); // Close the modal after showing success message
    }, 1000);
  };

  const handleExportData = () => {
    try {
      downloadDataAsJSON();
      setImportStatus({ 
        type: "success", 
        message: "Data exported successfully! Check your downloads folder." 
      });
      setTimeout(() => {
        setImportStatus({ type: "idle", message: "" });
      }, 3000);
    } catch (error) {
      setImportStatus({ 
        type: "error", 
        message: "Failed to export data. Please try again." 
      });
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      importData(data as ExportData, importMode);
      
      // Notify parent component
      onDataImported();
      
      setImportStatus({
        type: "success",
        message: `Data imported successfully in ${importMode} mode! ${
          importMode === "merge" 
            ? "New items have been added to your existing data." 
            : "All data has been replaced."
        }`,
      });
      
      // Auto-close after successful import
      setTimeout(() => {
        setOpen(false);
      }, 2000);
      
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your goals and data
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="goals" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="foods">Food Preferences</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-4 pt-4">
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
              <Select value={selectedDiet} onValueChange={(value) => setSelectedDiet(value as DietPreference)}>
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
            <Button onClick={handleSaveGoals} className="w-full">
              Save Goals & Preferences
            </Button>
          </TabsContent>

          <TabsContent value="foods" className="space-y-4 pt-4">
            <FoodPreferences
              foods={foods}
              dietPreference={dietPreference}
              selectedFoodIds={preferredFoodIds}
              onSave={(foodIds) => {
                onSavePreferredFoods(foodIds);
                setImportStatus({ type: "success", message: "Food preferences saved successfully!" });
                setTimeout(() => {
                  setImportStatus({ type: "idle", message: "" });
                  setOpen(false);
                }, 1000);
              }}
            />
          </TabsContent>

          <TabsContent value="data" className="space-y-4 pt-4">
            <div className="space-y-4">
              {/* Export Section */}
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Download className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <h3 className="font-medium">Export Data</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Download all your food items, intake records, and goals as a JSON file.
                    </p>
                  </div>
                </div>
                <Button onClick={handleExportData} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Backup
                </Button>
              </div>

              {/* Import Section */}
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Upload className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <h3 className="font-medium">Import Data</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload a previously exported JSON file to restore your data.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="import-mode">Import Mode</Label>
                    <Select value={importMode} onValueChange={(value) => setImportMode(value as "merge" | "replace")}>
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
                </div>
              </div>

              {/* Status Messages */}
              {importStatus.type !== "idle" && (
                <div
                  className={`rounded-lg p-3 flex items-start gap-3 ${
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

              {/* Warning */}
              <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
                <strong>Note:</strong> Only import files that you exported from this app.
                Importing modified or corrupted files may cause data loss.
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
