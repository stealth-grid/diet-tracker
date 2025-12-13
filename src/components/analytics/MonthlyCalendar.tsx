import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { CalendarDays } from "lucide-react";
import type { MonthStats } from "~/lib/analytics";
import { cn } from "~/lib/utils";

interface MonthlyCalendarProps {
  stats: MonthStats;
}

export function MonthlyCalendar({ stats }: MonthlyCalendarProps) {
  // Get intensity color based on how well goals were met
  const getIntensityColor = (calorieProgress: number, proteinProgress: number): string => {
    if (calorieProgress === 0 && proteinProgress === 0) {
      return 'bg-muted'; // No data
    }
    
    const avgProgress = (calorieProgress + proteinProgress) / 2;
    
    if (avgProgress < 50) return 'bg-red-200 dark:bg-red-900';
    if (avgProgress < 80) return 'bg-yellow-200 dark:bg-yellow-900';
    if (avgProgress >= 80 && avgProgress <= 120) return 'bg-green-400 dark:bg-green-700';
    if (avgProgress > 120) return 'bg-orange-300 dark:bg-orange-800';
    
    return 'bg-muted';
  };

  // Group days by week - create array of 5 weeks (30 days / 7 = ~4.3 weeks, round up to 5)
  const weeks: Array<Array<typeof stats.days[0]>> = [];
  for (let i = 0; i < stats.days.length; i += 7) {
    weeks.push(stats.days.slice(i, i + 7));
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              30-Day Activity
            </CardTitle>
            <CardDescription>Your tracking consistency</CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            {stats.totalDaysLogged}/30 days logged
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Calendar Heatmap */}
          <div className="space-y-2">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex gap-2">
                {week.map((day) => {
                  const date = new Date(day.date);
                  const dayNum = date.getDate();
                  const isToday = day.date === new Date().toISOString().split('T')[0];
                  
                  return (
                    <div
                      key={day.date}
                      className={cn(
                        "flex-1 aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all hover:scale-110 cursor-pointer",
                        getIntensityColor(day.calorieProgress, day.proteinProgress),
                        isToday && "ring-2 ring-primary ring-offset-2"
                      )}
                      title={`${date.toLocaleDateString()}: ${
                        day.hasData
                          ? `${Math.round(day.totalCalories)} kcal, ${Math.round(day.totalProtein)}g protein`
                          : 'No data'
                      }`}
                    >
                      {dayNum}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between pt-4 border-t text-xs">
            <span className="text-muted-foreground">Less</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-muted" title="No data" />
              <div className="w-4 h-4 rounded bg-red-200 dark:bg-red-900" title="< 50%" />
              <div className="w-4 h-4 rounded bg-yellow-200 dark:bg-yellow-900" title="50-80%" />
              <div className="w-4 h-4 rounded bg-green-400 dark:bg-green-700" title="80-120%" />
              <div className="w-4 h-4 rounded bg-orange-300 dark:bg-orange-800" title="> 120%" />
            </div>
            <span className="text-muted-foreground">More</span>
          </div>

          {/* Monthly Stats */}
          <div className="pt-4 border-t grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-primary">
                {Math.round((stats.totalDaysLogged / 30) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Consistency Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {stats.avgCaloriesPerDay > 0 ? Math.round(stats.avgCaloriesPerDay) : 0}
              </div>
              <div className="text-xs text-muted-foreground">Avg Daily Calories</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
