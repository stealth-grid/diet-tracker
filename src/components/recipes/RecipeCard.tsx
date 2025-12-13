import { Clock, Users, Eye, Edit, Trash2, Copy, Plus } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { FoodTypeIndicator } from "~/components/ui/food-type-indicator";
import type { Recipe } from "~/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface RecipeCardProps {
  recipe: Recipe;
  onView: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
  onDuplicate: (recipe: Recipe) => void;
  onQuickAdd: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onView, onEdit, onDelete, onDuplicate, onQuickAdd }: RecipeCardProps) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader className="pb-3" onClick={() => onView(recipe)}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FoodTypeIndicator foodType={recipe.foodType} size="sm" />
              <h3 className="font-semibold text-lg truncate">{recipe.name}</h3>
            </div>
            {recipe.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {recipe.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(recipe); }}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(recipe); }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Recipe
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(recipe); }}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete(recipe); }}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {recipe.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="pb-3" onClick={() => onView(recipe)}>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground text-xs mb-1">Per Serving</div>
            <div className="font-semibold text-orange-600">
              {Math.round(recipe.caloriesPerServing)} cal
            </div>
            <div className="font-semibold text-blue-600">
              {Math.round(recipe.proteinPerServing)}g protein
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs mb-1">Total Recipe</div>
            <div className="text-sm">
              {Math.round(recipe.totalCalories)} cal
            </div>
            <div className="text-sm">
              {Math.round(recipe.totalProtein)}g protein
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground">
          {recipe.servings && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}</span>
            </div>
          )}
          {totalTime > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{totalTime} min</span>
            </div>
          )}
          {recipe.category && (
            <Badge variant="outline" className="text-xs">
              {recipe.category}
            </Badge>
          )}
        </div>

        <div className="mt-2 text-xs text-muted-foreground">
          {recipe.ingredients.length} ingredient{recipe.ingredients.length !== 1 ? 's' : ''}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button 
          onClick={(e) => { e.stopPropagation(); onQuickAdd(recipe); }}
          className="w-full" 
          variant="outline"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Quick Add to Today
        </Button>
      </CardFooter>
    </Card>
  );
}
