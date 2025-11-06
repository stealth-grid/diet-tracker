import { Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import type { FoodItem } from "~/types";

interface FoodListProps {
  foods: FoodItem[];
  onDelete: (foodId: string) => void;
  searchQuery: string;
}

export function FoodList({ foods, onDelete, searchQuery }: FoodListProps) {
  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedFoods = [...filteredFoods].sort((a, b) => {
    // Custom foods first
    if (a.isCustom !== b.isCustom) {
      return a.isCustom ? -1 : 1;
    }
    // Then alphabetically
    return a.name.localeCompare(b.name);
  });

  if (sortedFoods.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {searchQuery ? "No foods found matching your search." : "No food items yet. Add your first one!"}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {sortedFoods.map((food) => (
        <div
          key={food.id}
          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{food.name}</span>
              {food.isCustom && (
                <Badge variant="secondary" className="text-xs">
                  Custom
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Per 100g: {food.proteinPer100g}g protein • {food.caloriesPer100g} kcal
            </div>
            {food.category && (
              <div className="text-xs text-muted-foreground mt-1 capitalize">
                {food.category}
              </div>
            )}
          </div>
          {food.isCustom && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(food.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
