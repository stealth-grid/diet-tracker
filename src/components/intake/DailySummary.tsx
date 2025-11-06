import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import type { DailyGoals } from "~/types";

interface DailySummaryProps {
  totalCalories: number;
  totalProtein: number;
  goals: DailyGoals;
}

export function DailySummary({ totalCalories, totalProtein, goals }: DailySummaryProps) {
  const calorieProgress = Math.min((totalCalories / goals.calorieGoal) * 100, 100);
  const proteinProgress = Math.min((totalProtein / goals.proteinGoal) * 100, 100);

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Calories</span>
            <span className="font-medium">
              {totalCalories.toFixed(0)} / {goals.calorieGoal} kcal
            </span>
          </div>
          <Progress value={calorieProgress} className={getProgressColor(calorieProgress)} />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Protein</span>
            <span className="font-medium">
              {totalProtein.toFixed(1)} / {goals.proteinGoal} g
            </span>
          </div>
          <Progress value={proteinProgress} className={getProgressColor(proteinProgress)} />
        </div>
      </CardContent>
    </Card>
  );
}
