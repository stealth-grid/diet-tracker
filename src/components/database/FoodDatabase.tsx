import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { FoodList } from "./FoodList";
import { AddFoodDialog } from "./AddFoodDialog";
import type { FoodItem, DietPreference } from "~/types";
import { filterFoodsByDietPreference } from "~/lib/utils";

interface FoodDatabaseProps {
  foods: FoodItem[];
  onAddFood: (food: FoodItem) => void;
  onDeleteFood: (foodId: string) => void;
  dietPreference: DietPreference;
  openAddDialog?: boolean;
  onAddDialogChange?: (open: boolean) => void;
}

export function FoodDatabase({ 
  foods, 
  onAddFood, 
  onDeleteFood,
  dietPreference,
  openAddDialog,
  onAddDialogChange 
}: FoodDatabaseProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter foods based on diet preference
  const filteredFoods = filterFoodsByDietPreference(foods, dietPreference);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Food Database</CardTitle>
            <AddFoodDialog 
              onAdd={onAddFood} 
              open={openAddDialog}
              onOpenChange={onAddDialogChange}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search foods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredFoods.length} food items available
          </div>
        </CardContent>
      </Card>

      <FoodList foods={filteredFoods} onDelete={onDeleteFood} searchQuery={searchQuery} />
    </div>
  );
}
