import { useState } from "react";
import { Plus, Trash2, Save, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { SearchableSelect, type SearchableSelectOption } from "~/components/ui/searchable-select";
import { FoodTypeIndicator } from "~/components/ui/food-type-indicator";
import type { Recipe, RecipeIngredient, FoodItem } from "~/types";
import { calculateRecipeNutrition } from "~/lib/recipeStorage";

interface RecipeBuilderProps {
  recipe?: Recipe; // If provided, we're editing
  foods: FoodItem[];
  onSave: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function RecipeBuilder({ recipe, foods, onSave, onCancel }: RecipeBuilderProps) {
  // Form state
  const [name, setName] = useState(recipe?.name || "");
  const [description, setDescription] = useState(recipe?.description || "");
  const [servings, setServings] = useState(recipe?.servings || 1);
  const [prepTime, setPrepTime] = useState(recipe?.prepTime || 0);
  const [cookTime, setCookTime] = useState(recipe?.cookTime || 0);
  const [instructions, setInstructions] = useState(recipe?.instructions || "");
  const [category, setCategory] = useState(recipe?.category || "");
  const [tags, setTags] = useState(recipe?.tags?.join(", ") || "");
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(recipe?.ingredients || []);

  // Current ingredient being added
  const [selectedFoodId, setSelectedFoodId] = useState("");
  const [quantity, setQuantity] = useState("");

  // Calculate nutrition in real-time
  const nutrition = calculateRecipeNutrition(ingredients, servings);

  const handleAddIngredient = () => {
    if (!selectedFoodId || !quantity) return;

    const food = foods.find(f => f.id === selectedFoodId);
    if (!food) return;

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) return;

    const protein = (food.proteinPer100g * qty) / 100;
    const calories = (food.caloriesPer100g * qty) / 100;

    const newIngredient: RecipeIngredient = {
      foodId: food.id,
      foodName: food.name,
      quantity: qty,
      protein,
      calories,
      foodType: food.foodType,
    };

    setIngredients([...ingredients, newIngredient]);
    setSelectedFoodId("");
    setQuantity("");
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert("Please enter a recipe name");
      return;
    }

    if (ingredients.length === 0) {
      alert("Please add at least one ingredient");
      return;
    }

    if (servings <= 0) {
      alert("Servings must be greater than 0");
      return;
    }

    const recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name.trim(),
      description: description.trim() || undefined,
      ingredients,
      servings,
      prepTime: prepTime > 0 ? prepTime : undefined,
      cookTime: cookTime > 0 ? cookTime : undefined,
      instructions: instructions.trim() || undefined,
      category: category || undefined,
      tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
      totalCalories: nutrition.totalCalories,
      totalProtein: nutrition.totalProtein,
      caloriesPerServing: nutrition.caloriesPerServing,
      proteinPerServing: nutrition.proteinPerServing,
      foodType: nutrition.foodType,
    };

    onSave(recipeData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {recipe ? "Edit Recipe" : "Create New Recipe"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Add ingredients and we'll calculate nutrition automatically
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Recipe
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column - Basic Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Recipe Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Protein Smoothie Bowl"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the recipe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="servings">Servings *</Label>
                  <Input
                    id="servings"
                    type="number"
                    min="1"
                    value={servings}
                    onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                      <SelectItem value="dessert">Dessert</SelectItem>
                      <SelectItem value="drink">Drink</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prepTime">Prep Time (min)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    min="0"
                    value={prepTime}
                    onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="cookTime">Cook Time (min)</Label>
                  <Input
                    id="cookTime"
                    type="number"
                    min="0"
                    value={cookTime}
                    onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., quick, high-protein, meal-prep"
                />
              </div>

              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <textarea
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Step-by-step cooking instructions..."
                  className="w-full min-h-[100px] px-3 py-2 text-sm border rounded-md"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Ingredients & Nutrition */}
        <div className="space-y-6">
          {/* Add Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle>Ingredients *</CardTitle>
              <CardDescription>
                Add ingredients to calculate nutrition
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <SearchableSelect
                    value={selectedFoodId}
                    onValueChange={setSelectedFoodId}
                    placeholder={foods.length > 0 ? "Type to search ingredients..." : "Loading foods..."}
                    emptyMessage={foods.length === 0 ? "No foods available. Please add foods first." : "No ingredients found."}
                    disabled={foods.length === 0}
                    options={foods.map(food => ({
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
                </div>
                <Input
                  type="number"
                  placeholder="Grams"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-24"
                />
                <Button onClick={handleAddIngredient} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Ingredients List */}
              {ingredients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No ingredients added yet
                </div>
              ) : (
                <div className="space-y-2">
                  {ingredients.map((ing, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded border bg-card"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <FoodTypeIndicator foodType={ing.foodType} size="sm" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{ing.foodName}</div>
                          <div className="text-xs text-muted-foreground">
                            {ing.quantity}g • {Math.round(ing.calories)} cal • {Math.round(ing.protein)}g protein
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveIngredient(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nutrition Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Summary</CardTitle>
              <CardDescription>
                Automatically calculated from ingredients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <FoodTypeIndicator foodType={nutrition.foodType} size="md" />
                  <span className="text-sm font-medium">
                    {nutrition.foodType === 'veg' && 'Vegetarian Recipe'}
                    {nutrition.foodType === 'egg' && 'Eggetarian Recipe'}
                    {nutrition.foodType === 'non-veg' && 'Non-Vegetarian Recipe'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Recipe</div>
                    <div className="text-2xl font-bold">{Math.round(nutrition.totalCalories)}</div>
                    <div className="text-xs text-muted-foreground">calories</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Per Serving</div>
                    <div className="text-2xl font-bold">{Math.round(nutrition.caloriesPerServing)}</div>
                    <div className="text-xs text-muted-foreground">calories</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Protein</div>
                    <div className="text-xl font-bold text-blue-600">{Math.round(nutrition.totalProtein)}g</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Per Serving</div>
                    <div className="text-xl font-bold text-blue-600">{Math.round(nutrition.proteinPerServing)}g</div>
                  </div>
                </div>

                {(prepTime > 0 || cookTime > 0) && (
                  <div className="pt-2 border-t text-sm">
                    <span className="text-muted-foreground">Total Time: </span>
                    <span className="font-medium">{prepTime + cookTime} minutes</span>
                    {prepTime > 0 && cookTime > 0 && (
                      <span className="text-muted-foreground">
                        {" "}({prepTime}m prep + {cookTime}m cook)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
