import { useState, useEffect } from "react";
import { Search, Check } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { FoodTypeIndicator } from "~/components/ui/food-type-indicator";
import type { FoodItem, DietPreference } from "~/types";
import { filterFoodsByDietPreference } from "~/lib/utils";

interface FoodPreferencesProps {
  foods: FoodItem[];
  dietPreference: DietPreference;
  selectedFoodIds: string[];
  onSave: (foodIds: string[]) => void;
}

export function FoodPreferences({ 
  foods, 
  dietPreference,
  selectedFoodIds, 
  onSave 
}: FoodPreferencesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSelectedIds, setTempSelectedIds] = useState<Set<string>>(new Set(selectedFoodIds));
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setTempSelectedIds(new Set(selectedFoodIds));
    setHasChanges(false);
  }, [selectedFoodIds]);

  // Filter foods by diet preference
  const availableFoods = filterFoodsByDietPreference(foods, dietPreference);

  // Filter by search query
  const filteredFoods = availableFoods.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort: selected first, then alphabetically
  const sortedFoods = [...filteredFoods].sort((a, b) => {
    const aSelected = tempSelectedIds.has(a.id);
    const bSelected = tempSelectedIds.has(b.id);
    if (aSelected !== bSelected) {
      return aSelected ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  const toggleFood = (foodId: string) => {
    const newSet = new Set(tempSelectedIds);
    if (newSet.has(foodId)) {
      newSet.delete(foodId);
    } else {
      newSet.add(foodId);
    }
    setTempSelectedIds(newSet);
    setHasChanges(true);
  };

  const handleSelectAll = () => {
    const newSet = new Set(availableFoods.map(f => f.id));
    setTempSelectedIds(newSet);
    setHasChanges(true);
  };

  const handleClearAll = () => {
    setTempSelectedIds(new Set());
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(Array.from(tempSelectedIds));
    setHasChanges(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Select foods you prefer to eat. The meal planner will only use these foods when generating suggestions.
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {tempSelectedIds.size} of {availableFoods.length} foods selected
          </span>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSelectAll}
              disabled={tempSelectedIds.size === availableFoods.length}
            >
              Select All
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearAll}
              disabled={tempSelectedIds.size === 0}
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="food-search">Search Foods</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="food-search"
            placeholder="Search foods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="border rounded-lg max-h-[400px] overflow-y-auto">
        {sortedFoods.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? "No foods found matching your search." : "No foods available."}
          </div>
        ) : (
          <div className="divide-y">
            {sortedFoods.map((food) => {
              const isSelected = tempSelectedIds.has(food.id);
              return (
                <button
                  key={food.id}
                  onClick={() => toggleFood(food.id)}
                  className={`w-full flex items-center justify-between p-3 text-left transition-colors hover:bg-accent/50 ${
                    isSelected ? 'bg-accent/20' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FoodTypeIndicator foodType={food.foodType} size="sm" />
                      <span className="font-medium">{food.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {food.proteinPer100g}g protein • {food.caloriesPer100g} kcal per 100g
                      {food.category && ` • ${food.category}`}
                    </div>
                  </div>
                  <div className={`ml-3 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    isSelected 
                      ? 'bg-primary border-primary' 
                      : 'border-muted-foreground/30'
                  }`}>
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges}
          className="flex-1"
        >
          Save Food Preferences
        </Button>
      </div>

      {tempSelectedIds.size === 0 && (
        <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <strong>Note:</strong> If no foods are selected, the meal planner will use all available foods based on your diet preference.
        </div>
      )}
    </div>
  );
}
