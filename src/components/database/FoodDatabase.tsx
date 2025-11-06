import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { FoodList } from "./FoodList";
import { AddFoodDialog } from "./AddFoodDialog";
import type { FoodItem } from "~/types";

interface FoodDatabaseProps {
  foods: FoodItem[];
  onAddFood: (food: FoodItem) => void;
  onDeleteFood: (foodId: string) => void;
  openAddDialog?: boolean;
  onAddDialogChange?: (open: boolean) => void;
}

export function FoodDatabase({ 
  foods, 
  onAddFood, 
  onDeleteFood,
  openAddDialog,
  onAddDialogChange 
}: FoodDatabaseProps) {
  const [searchQuery, setSearchQuery] = useState("");

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
            {foods.length} food items available
          </div>
        </CardContent>
      </Card>

      <FoodList foods={foods} onDelete={onDeleteFood} searchQuery={searchQuery} />
    </div>
  );
}
