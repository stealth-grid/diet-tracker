import { Progress } from "~/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Calendar, Target, Flame } from "lucide-react";
import type { DayStats } from "~/lib/analytics";
import { formatNumber, getProgressColor, getProgressBarColor } from "~/lib/analytics";

interface DailyProgressProps {
  stats: DayStats;
}

export function DailyProgress({ stats }: DailyProgressProps) {
  const calorieColor = getProgressColor(stats.calorieProgress);
  const proteinColor = getProgressColor(stats.proteinProgress);
  
  const calorieBarColor = getProgressBarColor(stats.calorieProgress);
  const proteinBarColor = getProgressBarColor(stats.proteinProgress);
  
  const todayDate = new Date(stats.date).toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Progress
            </CardTitle>
            <CardDescription>{todayDate}</CardDescription>
          </div>
          {stats.entryCount > 0 && (
            <div className="text-sm text-muted-foreground">
              {stats.entryCount} {stats.entryCount === 1 ? 'entry' : 'entries'}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!stats.hasData ? (
          <div className="text-center py-8 text-muted-foreground">
            <Flame className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No entries logged today</p>
            <p className="text-sm mt-1">Start tracking to see your progress!</p>
          </div>
        ) : (
          <>
            {/* Calories Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Calories</span>
                </div>
                <div className="text-sm">
                  <span className={`font-bold ${calorieColor}`}>
                    {formatNumber(stats.totalCalories)}
                  </span>
                  <span className="text-muted-foreground">
                    {' / '}{formatNumber(stats.calorieGoal)} kcal
                  </span>
                </div>
              </div>
              <div className="relative">
                <Progress 
                  value={Math.min(stats.calorieProgress, 100)} 
                  className="h-3"
                />
                <div 
                  className={`absolute top-0 left-0 h-3 rounded-full transition-all ${calorieBarColor}`}
                  style={{ width: `${Math.min(stats.calorieProgress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round(stats.calorieProgress)}% of goal</span>
                {stats.calorieProgress > 100 && (
                  <span className="text-orange-600 font-medium">
                    +{formatNumber(stats.totalCalories - stats.calorieGoal)} over
                  </span>
                )}
                {stats.calorieProgress < 100 && (
                  <span>
                    {formatNumber(stats.calorieGoal - stats.totalCalories)} remaining
                  </span>
                )}
              </div>
            </div>

            {/* Protein Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Protein</span>
                </div>
                <div className="text-sm">
                  <span className={`font-bold ${proteinColor}`}>
                    {formatNumber(stats.totalProtein)}g
                  </span>
                  <span className="text-muted-foreground">
                    {' / '}{formatNumber(stats.proteinGoal)}g
                  </span>
                </div>
              </div>
              <div className="relative">
                <Progress 
                  value={Math.min(stats.proteinProgress, 100)} 
                  className="h-3"
                />
                <div 
                  className={`absolute top-0 left-0 h-3 rounded-full transition-all ${proteinBarColor}`}
                  style={{ width: `${Math.min(stats.proteinProgress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round(stats.proteinProgress)}% of goal</span>
                {stats.proteinProgress > 100 && (
                  <span className="text-orange-600 font-medium">
                    +{formatNumber(stats.totalProtein - stats.proteinGoal)}g over
                  </span>
                )}
                {stats.proteinProgress < 100 && (
                  <span>
                    {formatNumber(stats.proteinGoal - stats.totalProtein)}g remaining
                  </span>
                )}
              </div>
            </div>

            {/* Quick Summary */}
            <div className="pt-4 border-t grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {Math.round((stats.calorieProgress + stats.proteinProgress) / 2)}%
                </div>
                <div className="text-xs text-muted-foreground">Overall Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {stats.entryCount}
                </div>
                <div className="text-xs text-muted-foreground">Meals Logged</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
