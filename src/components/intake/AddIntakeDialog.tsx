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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { FoodItem, IntakeEntry } from "~/types";
import { getTodayDate } from "~/lib/storage";

interface AddIntakeDialogProps {
  foods: FoodItem[];
  onAdd: (entry: IntakeEntry) => void;
  onAddNewFood: () => void;
}

export function AddIntakeDialog({ foods, onAdd, onAddNewFood }: AddIntakeDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleAdd = () => {
    const food = foods.find((f) => f.id === selectedFoodId);
    if (!food || !quantity) return;

    const quantityNum = Number(quantity);
    const entry: IntakeEntry = {
      id: `${Date.now()}-${Math.random()}`,
      foodId: food.id,
      foodName: food.name,
      quantity: quantityNum,
      protein: (food.proteinPer100g * quantityNum) / 100,
      calories: (food.caloriesPer100g * quantityNum) / 100,
      date: getTodayDate(),
      timestamp: Date.now(),
    };

    onAdd(entry);
    setSelectedFoodId("");
    setQuantity("");
    setOpen(false);
  };

  const handleOpenAddFood = () => {
    setOpen(false);
    onAddNewFood();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Food
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Food Intake</DialogTitle>
          <DialogDescription>
            Select a food item and enter the quantity consumed.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="food-select">Food Item</Label>
            <Select value={selectedFoodId} onValueChange={setSelectedFoodId}>
              <SelectTrigger id="food-select">
                <SelectValue placeholder="Select a food" />
              </SelectTrigger>
              <SelectContent>
                {foods.map((food) => (
                  <SelectItem key={food.id} value={food.id}>
                    {food.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            />
          </div>
          {selectedFoodId && quantity && (
            <div className="rounded-lg bg-muted p-3 text-sm">
              <div className="font-medium mb-1">Nutritional Info:</div>
              <div className="text-muted-foreground">
                {(() => {
                  const food = foods.find((f) => f.id === selectedFoodId);
                  const qty = Number(quantity);
                  return (
                    <>
                      Calories: {((food!.caloriesPer100g * qty) / 100).toFixed(0)} kcal
                      <br />
                      Protein: {((food!.proteinPer100g * qty) / 100).toFixed(1)} g
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleAdd} disabled={!selectedFoodId || !quantity}>
            Add to Intake
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
