import { Trash2, Clock } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { IntakeEntry } from "~/types";

interface IntakeListProps {
  entries: IntakeEntry[];
  onDelete: (entryId: string) => void;
}

export function IntakeList({ entries, onDelete }: IntakeListProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No food entries for this day. Add your first meal!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Intake</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex-1">
                <div className="font-medium">{entry.foodName}</div>
                <div className="text-sm text-muted-foreground">
                  {entry.quantity}g • {entry.calories.toFixed(0)} kcal • {entry.protein.toFixed(1)}g protein
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(entry.timestamp)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(entry.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
