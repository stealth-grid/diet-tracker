import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
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
import type { DailyGoals } from "~/types";

interface GoalsDialogProps {
  goals: DailyGoals;
  onSave: (goals: DailyGoals) => void;
}

export function GoalsDialog({ goals, onSave }: GoalsDialogProps) {
  const [open, setOpen] = useState(false);
  const [calorieGoal, setCalorieGoal] = useState(goals.calorieGoal);
  const [proteinGoal, setProteinGoal] = useState(goals.proteinGoal);

  // Sync state with props when dialog opens or goals change
  useEffect(() => {
    setCalorieGoal(goals.calorieGoal);
    setProteinGoal(goals.proteinGoal);
  }, [goals, open]);

  const handleSave = () => {
    onSave({ calorieGoal, proteinGoal });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Daily Goals</DialogTitle>
          <DialogDescription>
            Set your daily calorie and protein intake goals.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="calorie-goal">Daily Calorie Goal (kcal)</Label>
            <Input
              id="calorie-goal"
              type="number"
              value={calorieGoal}
              onChange={(e) => setCalorieGoal(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="protein-goal">Daily Protein Goal (g)</Label>
            <Input
              id="protein-goal"
              type="number"
              value={proteinGoal}
              onChange={(e) => setProteinGoal(Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSave}>
            Save Goals
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
