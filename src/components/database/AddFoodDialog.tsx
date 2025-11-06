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
import type { FoodItem } from "~/types";

interface AddFoodDialogProps {
  onAdd: (food: FoodItem) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddFoodDialog({ onAdd, open: controlledOpen, onOpenChange }: AddFoodDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [name, setName] = useState("");
  const [protein, setProtein] = useState("");
  const [calories, setCalories] = useState("");
  const [category, setCategory] = useState("");

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const handleAdd = () => {
    if (!name || !protein || !calories) return;

    const food: FoodItem = {
      id: `custom-${Date.now()}-${Math.random()}`,
      name: name.trim(),
      proteinPer100g: Number(protein),
      caloriesPer100g: Number(calories),
      category: category.trim() || "custom",
      isCustom: true,
    };

    onAdd(food);
    setName("");
    setProtein("");
    setCalories("");
    setCategory("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Food
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Food Item</DialogTitle>
          <DialogDescription>
            Add a custom food item with its nutritional information per 100g.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="food-name">Food Name *</Label>
            <Input
              id="food-name"
              placeholder="e.g., Grilled Chicken Salad"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="protein">Protein per 100g (grams) *</Label>
            <Input
              id="protein"
              type="number"
              step="0.1"
              placeholder="e.g., 25"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="calories">Calories per 100g (kcal) *</Label>
            <Input
              id="calories"
              type="number"
              step="1"
              placeholder="e.g., 150"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category (optional)</Label>
            <Input
              id="category"
              placeholder="e.g., protein, vegetables"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleAdd} disabled={!name || !protein || !calories}>
            Add Food Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
