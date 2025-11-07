import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { DailySummary } from "./DailySummary";
import { IntakeList } from "./IntakeList";
import { AddIntakeDialog } from "./AddIntakeDialog";
import type { FoodItem, IntakeEntry, DailyGoals, DietPreference } from "~/types";
import { getTodayDate, getEntriesByDate, addIntakeEntry, deleteIntakeEntry } from "~/lib/storage";
import { filterFoodsByDietPreference } from "~/lib/utils";
import { intakeAPI } from "~/lib/api";
import { useAuth } from "~/contexts/AuthContext";

interface IntakeTrackerProps {
  foods: FoodItem[];
  goals: DailyGoals;
  dietPreference: DietPreference;
  userId: string;
  onAddNewFood: () => void;
  onEntriesChange: () => void;
}

export function IntakeTracker({ foods, goals, dietPreference, userId, onAddNewFood, onEntriesChange }: IntakeTrackerProps) {
  const { isAnonymous, hasBackendConfigured } = useAuth();
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [entries, setEntries] = useState<IntakeEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEntries();
  }, [selectedDate, isAnonymous, hasBackendConfigured]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      if (isAnonymous || !hasBackendConfigured) {
        // Anonymous/offline mode - use localStorage
        const data = getEntriesByDate(userId, selectedDate);
        setEntries(data);
      } else {
        // Google user with backend - use backend API
        const data = await intakeAPI.getAll({ date: selectedDate });
        setEntries(data);
      }
    } catch (error) {
      console.error('Error loading entries:', error);
      // Fallback to localStorage
      const data = getEntriesByDate(userId, selectedDate);
      setEntries(data);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (entry: IntakeEntry) => {
    try {
      entry.date = selectedDate; // Ensure date is set
      
      if (isAnonymous || !hasBackendConfigured) {
        // Anonymous/offline mode - use localStorage
        addIntakeEntry(userId, entry);
        await loadEntries();
      } else {
        // Google user with backend - use backend API
        await intakeAPI.create({
          foodId: entry.foodId,
          foodName: entry.foodName,
          foodType: entry.foodType || 'veg',
          quantity: entry.quantity,
          protein: entry.protein,
          calories: entry.calories,
          date: selectedDate,
        });
        await loadEntries();
      }
      onEntriesChange();
    } catch (error) {
      console.error('Error adding entry:', error);
      alert('Failed to add intake entry. Please try again.');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      if (isAnonymous || !hasBackendConfigured) {
        // Anonymous/offline mode - use localStorage
        deleteIntakeEntry(userId, entryId);
        await loadEntries();
      } else {
        // Google user with backend - use backend API
        await intakeAPI.delete(entryId);
        await loadEntries();
      }
      onEntriesChange();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete intake entry. Please try again.');
    }
  };

  const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);
  const totalProtein = entries.reduce((sum, entry) => sum + entry.protein, 0);

  // Filter foods based on diet preference
  const filteredFoods = filterFoodsByDietPreference(foods, dietPreference);

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
        <AddIntakeDialog foods={filteredFoods} onAdd={handleAddEntry} onAddNewFood={onAddNewFood} />
      </div>

      <DailySummary totalCalories={totalCalories} totalProtein={totalProtein} goals={goals} />
      <IntakeList entries={entries} onDelete={handleDeleteEntry} />
    </div>
  );
}
