import { useState, useEffect } from "react";
import { useAuth } from "~/contexts/AuthContext";
import { DailyProgress } from "~/components/analytics/DailyProgress";
import { WeeklyChart } from "~/components/analytics/WeeklyChart";
import { MonthlyCalendar } from "~/components/analytics/MonthlyCalendar";
import { StreakCounter } from "~/components/analytics/StreakCounter";
import { InsightsPanel } from "~/components/analytics/InsightsPanel";
import {
  calculateDayStats,
  calculateWeekStats,
  calculateMonthStats,
  generateInsights,
  type DayStats,
  type WeekStats,
  type MonthStats,
  type Insight,
} from "~/lib/analytics";
import { getIntakeEntries, getGoals } from "~/lib/storage";
import { intakeAPI } from "~/lib/api";
import type { IntakeEntry, DailyGoals } from "~/types";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";

export function AnalyticsPage() {
  const { user, userPreferences, isAnonymous, hasBackendConfigured } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayStats, setTodayStats] = useState<DayStats | null>(null);
  const [weekStats, setWeekStats] = useState<WeekStats | null>(null);
  const [monthStats, setMonthStats] = useState<MonthStats | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      const isInitialLoad = loading;
      if (!isInitialLoad) setRefreshing(true);

      let entries: IntakeEntry[] = [];
      let goals: DailyGoals = { calorieGoal: 2000, proteinGoal: 50 };

      if (isAnonymous || !hasBackendConfigured) {
        // Anonymous/offline mode - use localStorage
        entries = getIntakeEntries(user.id);
        goals = getGoals(user.id);
      } else {
        // Google user with backend - fetch from API
        try {
          entries = await intakeAPI.getAll();
          if (userPreferences) {
            goals = {
              calorieGoal: userPreferences.calorieGoal,
              proteinGoal: userPreferences.proteinGoal,
            };
          }
        } catch (error) {
          console.error('Error fetching from backend, falling back to localStorage:', error);
          // Fallback to localStorage if backend fails
          entries = getIntakeEntries(user.id);
          goals = getGoals(user.id);
        }
      }

      // Calculate today's stats
      const today = new Date().toISOString().split('T')[0];
      const todayData = calculateDayStats(today, entries, goals);
      setTodayStats(todayData);

      // Calculate week stats
      const weekData = calculateWeekStats(entries, goals);
      setWeekStats(weekData);

      // Calculate month stats
      const monthData = calculateMonthStats(entries, goals);
      setMonthStats(monthData);

      // Generate insights
      const insightsData = generateInsights(weekData, monthData);
      setInsights(insightsData);

      setLastUpdate(new Date());
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load analytics on mount and when user changes
  useEffect(() => {
    loadAnalytics();
  }, [user, isAnonymous, hasBackendConfigured, userPreferences]);

  // Refresh analytics when page becomes visible (user navigates to it)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        loadAnalytics();
      }
    };

    // Refresh when page becomes visible
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also refresh on window focus
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [user, isAnonymous, hasBackendConfigured, userPreferences]);

  const handleRefresh = () => {
    loadAnalytics();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (!todayStats || !weekStats || !monthStats) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Unable to load analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your progress and discover insights about your nutrition journey
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-muted-foreground">
            Updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Today's Progress - Full Width */}
      <DailyProgress stats={todayStats} />

      {/* Two Column Layout for Desktop */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <StreakCounter stats={monthStats} />
          <MonthlyCalendar stats={monthStats} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <InsightsPanel insights={insights} />
        </div>
      </div>

      {/* Weekly Chart - Full Width */}
      <WeeklyChart stats={weekStats} />

      {/* Stats Summary - Full Width */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground mb-1">Current Streak</div>
          <div className="text-2xl font-bold">{monthStats.currentStreak} days</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground mb-1">Days Logged</div>
          <div className="text-2xl font-bold">{monthStats.totalDaysLogged}/30</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground mb-1">Avg Calories</div>
          <div className="text-2xl font-bold">{weekStats.avgCalories}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground mb-1">Avg Protein</div>
          <div className="text-2xl font-bold">{weekStats.avgProtein}g</div>
        </div>
      </div>
    </div>
  );
}
