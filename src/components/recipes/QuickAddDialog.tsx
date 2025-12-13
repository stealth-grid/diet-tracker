import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { Recipe } from "~/types";

interface QuickAddDialogProps {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (recipe: Recipe, servings: number) => void;
}

export function QuickAddDialog({ recipe, open, onClose, onConfirm }: QuickAddDialogProps) {
  const [servings, setServings] = useState("1");

  if (!recipe) return null;

  const handleConfirm = () => {
    const servingsNum = parseFloat(servings);
    
    if (isNaN(servingsNum) || servingsNum <= 0) {
      alert("Please enter a valid number of servings");
      return;
    }

    onConfirm(recipe, servingsNum);
    onClose();
    setServings("1"); // Reset for next time
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      onClose();
      setServings("1"); // Reset on close
    }
  };

  const servingsNum = parseFloat(servings) || 0;
  const totalCalories = Math.round(recipe.caloriesPerServing * servingsNum);
  const totalProtein = Math.round(recipe.proteinPerServing * servingsNum * 10) / 10;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Quick Add to Today</DialogTitle>
          <DialogDescription>
            Add "{recipe.name}" to today's food intake
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Recipe Info */}
          <div className="rounded-lg bg-muted p-3">
            <div className="font-medium mb-2">{recipe.name}</div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>Recipe makes: {recipe.servings} servings</div>
              <div>Per serving: {Math.round(recipe.caloriesPerServing)} cal, {Math.round(recipe.proteinPerServing)}g protein</div>
            </div>
          </div>

          {/* Servings Input */}
          <div className="space-y-2">
            <Label htmlFor="servings">How many servings?</Label>
            <Input
              id="servings"
              type="number"
              min="0.1"
              step="0.5"
              placeholder="1"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleConfirm();
                }
              }}
              autoFocus
            />
          </div>

          {/* Nutrition Preview */}
          {servingsNum > 0 && (
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                You'll be adding:
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <strong>{totalCalories} calories</strong> and <strong>{totalProtein}g protein</strong>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={servingsNum <= 0}>
            <Plus className="h-4 w-4 mr-2" />
            Add to Today
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
