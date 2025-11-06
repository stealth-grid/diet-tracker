import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { DailySummary } from "./DailySummary";
import { IntakeList } from "./IntakeList";
import { AddIntakeDialog } from "./AddIntakeDialog";
import type { FoodItem, IntakeEntry, DailyGoals } from "~/types";
import { getEntriesByDate, deleteIntakeEntry, addIntakeEntry, getTodayDate } from "~/lib/storage";

interface IntakeTrackerProps {
  foods: FoodItem[];
  goals: DailyGoals;
  onAddNewFood: () => void;
  onEntriesChange: () => void;
}

export function IntakeTracker({ foods, goals, onAddNewFood, onEntriesChange }: IntakeTrackerProps) {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [entries, setEntries] = useState<IntakeEntry[]>([]);

  useEffect(() => {
    loadEntries();
  }, [selectedDate]);

  const loadEntries = () => {
    const data = getEntriesByDate(selectedDate);
    setEntries(data);
  };

  const handleAddEntry = (entry: IntakeEntry) => {
    // Override the date with selected date
    entry.date = selectedDate;
    addIntakeEntry(entry);
    loadEntries();
    onEntriesChange();
  };

  const handleDeleteEntry = (entryId: string) => {
    deleteIntakeEntry(entryId);
    loadEntries();
    onEntriesChange();
  };

  const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);
  const totalProtein = entries.reduce((sum, entry) => sum + entry.protein, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-xs">
          <Label htmlFor="date-select" className="mb-2 block">
            <Calendar className="inline h-4 w-4 mr-2" />
            Select Date
          </Label>
          <Input
            id="date-select"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={getTodayDate()}
          />
        </div>
        <AddIntakeDialog foods={foods} onAdd={handleAddEntry} onAddNewFood={onAddNewFood} />
      </div>

      <DailySummary totalCalories={totalCalories} totalProtein={totalProtein} goals={goals} />
      <IntakeList entries={entries} onDelete={handleDeleteEntry} />
    </div>
  );
}
