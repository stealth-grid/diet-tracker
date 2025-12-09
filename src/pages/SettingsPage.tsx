import { useState } from "react";
import { Download, Upload, AlertCircle, CheckCircle, Settings as SettingsIcon, Palette } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ThemeToggle } from "~/components/settings/ThemeToggle";
import { useAuth } from "~/contexts/AuthContext";
import { getGoals, getDietPreference } from "~/lib/storage";
import {
  downloadDataAsJSON,
  readJSONFile,
  validateImportData,
  importData,
  type ExportData,
} from "~/lib/dataManagement";

export function SettingsPage() {
  const { user } = useAuth();

  // Import state
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [importStatus, setImportStatus] = useState<{
    type: "idle" | "success" | "error" | "warning";
    message: string;
  }>({ type: "idle", message: "" });
  const [isImporting, setIsImporting] = useState(false);

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
          <p className="text-muted-foreground">Manage your app preferences and data</p>
        </div>
      </div>

      {/* Appearance Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the app looks on your device
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

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
  );
}
