import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Flame, Award, TrendingUp } from "lucide-react";
import type { MonthStats } from "~/lib/analytics";

interface StreakCounterProps {
  stats: MonthStats;
}

export function StreakCounter({ stats }: StreakCounterProps) {
  const hasStreak = stats.currentStreak > 0;
  const isOnFire = stats.currentStreak >= 7;
  
  return (
    <Card className={isOnFire ? "border-orange-500 border-2" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className={cn("h-5 w-5", isOnFire && "text-orange-500 animate-pulse")} />
          Tracking Streak
        </CardTitle>
        <CardDescription>
          {hasStreak 
            ? "Keep the momentum going!" 
            : "Start a streak by logging daily"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Streak */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <div className={cn(
                "text-6xl font-bold",
                isOnFire ? "text-orange-500" : "text-primary"
              )}>
                {stats.currentStreak}
              </div>
              {isOnFire && (
                <Flame className="absolute -top-2 -right-8 h-8 w-8 text-orange-500 animate-bounce" />
              )}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {stats.currentStreak === 1 ? 'day' : 'days'} in a row
            </div>
          </div>

          {/* Streak Messages */}
          <div className="text-center">
            {stats.currentStreak === 0 && (
              <div className="text-sm text-muted-foreground">
                Log your meals today to start a streak! 🚀
              </div>
            )}
            {stats.currentStreak >= 1 && stats.currentStreak < 3 && (
              <div className="text-sm text-green-600 dark:text-green-400">
                Great start! Keep going! 💪
              </div>
            )}
            {stats.currentStreak >= 3 && stats.currentStreak < 7 && (
              <div className="text-sm text-blue-600 dark:text-blue-400">
                You're building a habit! ⭐
              </div>
            )}
            {stats.currentStreak >= 7 && stats.currentStreak < 14 && (
              <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                You're on fire! 🔥 Keep this amazing streak alive!
              </div>
            )}
            {stats.currentStreak >= 14 && stats.currentStreak < 30 && (
              <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                Incredible dedication! 🌟 You're unstoppable!
              </div>
            )}
            {stats.currentStreak >= 30 && (
              <div className="text-sm text-pink-600 dark:text-pink-400 font-bold">
                LEGENDARY! 👑 You're a tracking master!
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="pt-4 border-t grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-4 w-4 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-primary">
                {stats.longestStreak}
              </div>
              <div className="text-xs text-muted-foreground">Longest Streak</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-primary">
                {stats.totalDaysLogged}
              </div>
              <div className="text-xs text-muted-foreground">Total Days Logged</div>
            </div>
          </div>

          {/* Milestone Progress */}
          {stats.currentStreak > 0 && stats.currentStreak < 30 && (
            <div className="pt-4 border-t">
              <div className="text-xs text-muted-foreground mb-2">Next Milestone</div>
              <div className="space-y-1">
                {stats.currentStreak < 7 && (
                  <div className="flex items-center justify-between text-sm">
                    <span>7-day streak</span>
                    <span className="text-muted-foreground">
                      {7 - stats.currentStreak} days to go
                    </span>
                  </div>
                )}
                {stats.currentStreak >= 7 && stats.currentStreak < 14 && (
                  <div className="flex items-center justify-between text-sm">
                    <span>14-day streak</span>
                    <span className="text-muted-foreground">
                      {14 - stats.currentStreak} days to go
                    </span>
                  </div>
                )}
                {stats.currentStreak >= 14 && stats.currentStreak < 30 && (
                  <div className="flex items-center justify-between text-sm">
                    <span>30-day streak</span>
                    <span className="text-muted-foreground">
                      {30 - stats.currentStreak} days to go
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function for cn (should be imported from utils but adding here for completeness)
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
