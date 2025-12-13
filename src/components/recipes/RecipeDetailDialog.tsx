import { Clock, Users, ChefHat, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { FoodTypeIndicator } from "~/components/ui/food-type-indicator";
import type { Recipe } from "~/types";

interface RecipeDetailDialogProps {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
  onEdit: (recipe: Recipe) => void;
  onQuickAdd: (recipe: Recipe) => void;
}

export function RecipeDetailDialog({ recipe, open, onClose, onEdit, onQuickAdd }: RecipeDetailDialogProps) {
  if (!recipe) return null;

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FoodTypeIndicator foodType={recipe.foodType} size="md" />
                <DialogTitle className="text-2xl">{recipe.name}</DialogTitle>
              </div>
              {recipe.description && (
                <DialogDescription className="text-base">
                  {recipe.description}
                </DialogDescription>
              )}
            </div>
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {recipe.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{recipe.servings}</div>
                <div className="text-xs text-muted-foreground">servings</div>
              </div>
            </div>
            {totalTime > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{totalTime} min</div>
                  <div className="text-xs text-muted-foreground">total time</div>
                </div>
              </div>
            )}
            {recipe.category && (
              <div className="flex items-center gap-2">
                <ChefHat className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium capitalize">{recipe.category}</div>
                  <div className="text-xs text-muted-foreground">category</div>
                </div>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Nutrition Facts */}
          <div className="rounded-lg border p-4 bg-card">
            <h3 className="font-semibold mb-3">Nutrition Facts</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Per Serving</div>
                <div className="space-y-2">
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(recipe.caloriesPerServing)}
                    </div>
                    <div className="text-xs text-muted-foreground">calories</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-blue-600">
                      {Math.round(recipe.proteinPerServing)}g
                    </div>
                    <div className="text-xs text-muted-foreground">protein</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Recipe</div>
                <div className="space-y-2">
                  <div>
                    <div className="text-2xl font-bold">
                      {Math.round(recipe.totalCalories)}
                    </div>
                    <div className="text-xs text-muted-foreground">calories</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold">
                      {Math.round(recipe.totalProtein)}g
                    </div>
                    <div className="text-xs text-muted-foreground">protein</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="font-semibold mb-3">
              Ingredients ({recipe.ingredients.length})
            </h3>
            <div className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded border bg-card"
                >
                  <div className="flex items-center gap-2">
                    <FoodTypeIndicator foodType={ingredient.foodType} size="sm" />
                    <span className="font-medium">{ingredient.foodName}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {ingredient.quantity}g
                    <span className="mx-2">•</span>
                    {Math.round(ingredient.calories)} cal
                    <span className="mx-2">•</span>
                    {Math.round(ingredient.protein)}g protein
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          {recipe.instructions && (
            <div>
              <h3 className="font-semibold mb-3">Instructions</h3>
              <div className="text-sm whitespace-pre-wrap p-4 rounded-lg border bg-muted/50">
                {recipe.instructions}
              </div>
            </div>
          )}

          {/* Time Breakdown */}
          {(recipe.prepTime || recipe.cookTime) && (
            <div className="text-sm text-muted-foreground">
              {recipe.prepTime && recipe.prepTime > 0 && (
                <div>Prep time: {recipe.prepTime} minutes</div>
              )}
              {recipe.cookTime && recipe.cookTime > 0 && (
                <div>Cook time: {recipe.cookTime} minutes</div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t sticky bottom-0 bg-background">
          <Button onClick={() => onEdit(recipe)} variant="outline" className="flex-1">
            Edit Recipe
          </Button>
          <Button onClick={() => onQuickAdd(recipe)} className="flex-1">
            Quick Add to Today
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
