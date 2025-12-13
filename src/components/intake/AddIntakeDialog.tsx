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
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { SearchableSelect, type SearchableSelectOption } from "~/components/ui/searchable-select";
import { FoodTypeIndicator } from "~/components/ui/food-type-indicator";
import type { FoodItem, IntakeEntry, Recipe } from "~/types";
import { getTodayDate } from "~/lib/storage";

interface AddIntakeDialogProps {
  foods: FoodItem[];
  recipes: Recipe[];
  onAdd: (entry: IntakeEntry) => void;
  onAddNewFood: () => void;
}

export function AddIntakeDialog({ foods, recipes, onAdd, onAddNewFood }: AddIntakeDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"foods" | "recipes">("foods");
  
  // Food state
  const [selectedFoodId, setSelectedFoodId] = useState("");
  const [quantity, setQuantity] = useState("");
  
  // Recipe state
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [servings, setServings] = useState("");

  const handleAddFood = () => {
    const food = foods.find((f) => f.id === selectedFoodId);
    if (!food || !quantity) return;

    const quantityNum = Number(quantity);
    const entry: IntakeEntry = {
      id: `intake-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      foodId: food.id,
      foodName: food.name,
      quantity: quantityNum,
      protein: (food.proteinPer100g * quantityNum) / 100,
      calories: (food.caloriesPer100g * quantityNum) / 100,
      date: getTodayDate(),
      timestamp: Date.now(),
      foodType: food.foodType,
    };

    onAdd(entry);
    setSelectedFoodId("");
    setQuantity("");
    setOpen(false);
  };

  const handleAddRecipe = () => {
    const recipe = recipes.find((r) => r.id === selectedRecipeId);
    if (!recipe || !servings) return;

    const servingsNum = Number(servings);
    const entry: IntakeEntry = {
      id: `intake-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      foodId: recipe.id,
      foodName: `${recipe.name} (${servingsNum} serving${servingsNum !== 1 ? 's' : ''})`,
      quantity: 0, // Not applicable for recipes
      protein: Math.round(recipe.proteinPerServing * servingsNum * 10) / 10,
      calories: Math.round(recipe.caloriesPerServing * servingsNum * 10) / 10,
      date: getTodayDate(),
      timestamp: Date.now(),
      foodType: recipe.foodType,
    };

    onAdd(entry);
    setSelectedRecipeId("");
    setServings("");
    setOpen(false);
  };

  const handleOpenAddFood = () => {
    setOpen(false);
    onAddNewFood();
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when closing
      setSelectedFoodId("");
      setQuantity("");
      setSelectedRecipeId("");
      setServings("");
      setActiveTab("foods");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Intake
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add to Today's Intake</DialogTitle>
          <DialogDescription>
            Choose a food item or recipe to add to your intake.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "foods" | "recipes")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="foods">Foods</TabsTrigger>
            <TabsTrigger value="recipes">Recipes</TabsTrigger>
          </TabsList>

          {/* FOODS TAB */}
          <TabsContent value="foods" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="food-select">Food Item</Label>
              <SearchableSelect
                value={selectedFoodId}
                onValueChange={setSelectedFoodId}
                placeholder="Type to search foods..."
                emptyMessage="No foods found. Try a different search term."
                options={foods.map((food) => ({
                  value: food.id,
                  label: food.name,
                  searchTerms: `${food.name} ${food.category || ''} ${food.foodType}`,
                  renderLabel: (
                    <div className="flex items-center gap-2">
                      <FoodTypeIndicator foodType={food.foodType} size="sm" />
                      <span>{food.name}</span>
                    </div>
                  ),
                }))}
              />
              <Button
                variant="link"
                size="sm"
                onClick={handleOpenAddFood}
                className="px-0 text-xs"
              >
                Can't find your food? Add new food item
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (grams)</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="100"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                step="1"
              />
            </div>
            {selectedFoodId && quantity && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <div className="font-medium mb-1">Nutritional Info:</div>
                <div className="text-muted-foreground">
                  {(() => {
                    const food = foods.find((f) => f.id === selectedFoodId);
                    const qty = Number(quantity);
                    if (!food) return null;
                    return (
                      <>
                        Calories: {((food.caloriesPer100g * qty) / 100).toFixed(0)} kcal
                        <br />
                        Protein: {((food.proteinPer100g * qty) / 100).toFixed(1)} g
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" onClick={handleAddFood} disabled={!selectedFoodId || !quantity}>
                Add to Intake
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* RECIPES TAB */}
          <TabsContent value="recipes" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="recipe-select">Recipe</Label>
              <SearchableSelect
                value={selectedRecipeId}
                onValueChange={setSelectedRecipeId}
                placeholder="Type to search recipes..."
                emptyMessage="No recipes found. Create recipes in the Recipes tab."
                options={recipes.map((recipe) => ({
                  value: recipe.id,
                  label: recipe.name,
                  searchTerms: `${recipe.name} ${recipe.category || ''} ${recipe.tags?.join(' ') || ''} ${recipe.foodType}`,
                  renderLabel: (
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <FoodTypeIndicator foodType={recipe.foodType} size="sm" />
                        <span className="font-medium">{recipe.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {recipe.caloriesPerServing.toFixed(0)} cal, {recipe.proteinPerServing.toFixed(1)}g protein per serving
                      </span>
                    </div>
                  ),
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                placeholder="1"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                min="0.1"
                step="0.5"
              />
            </div>
            {selectedRecipeId && servings && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <div className="font-medium mb-1">Nutritional Info:</div>
                <div className="text-muted-foreground">
                  {(() => {
                    const recipe = recipes.find((r) => r.id === selectedRecipeId);
                    const srv = Number(servings);
                    if (!recipe) return null;
                    return (
                      <>
                        <div className="mb-2">
                          <span className="font-medium">{recipe.name}</span>
                          <span className="text-xs ml-2">({srv} serving{srv !== 1 ? 's' : ''})</span>
                        </div>
                        Calories: {(recipe.caloriesPerServing * srv).toFixed(0)} kcal
                        <br />
                        Protein: {(recipe.proteinPerServing * srv).toFixed(1)} g
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" onClick={handleAddRecipe} disabled={!selectedRecipeId || !servings}>
                Add to Intake
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
