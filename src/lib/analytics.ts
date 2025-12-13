import type { IntakeEntry, DailyGoals } from "~/types";

export interface DayStats {
  date: string;
  totalCalories: number;
  totalProtein: number;
  calorieGoal: number;
  proteinGoal: number;
  calorieProgress: number; // percentage
  proteinProgress: number; // percentage
  entryCount: number;
  hasData: boolean;
}

export interface WeekStats {
  days: DayStats[];
  avgCalories: number;
  avgProtein: number;
  bestDay: DayStats | null;
  totalEntries: number;
}

export interface MonthStats {
  days: DayStats[];
  totalDaysLogged: number;
  currentStreak: number;
  longestStreak: number;
  avgCaloriesPerDay: number;
  avgProteinPerDay: number;
}

export interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  icon: string;
}

/**
 * Calculate daily statistics for a specific date
 */
export function calculateDayStats(
  date: string,
  entries: IntakeEntry[],
  goals: DailyGoals
): DayStats {
  const dayEntries = entries.filter(e => e.date === date);
  
  const totalCalories = dayEntries.reduce((sum, e) => sum + e.calories, 0);
  const totalProtein = dayEntries.reduce((sum, e) => sum + e.protein, 0);
  
  return {
    date,
    totalCalories,
    totalProtein,
    calorieGoal: goals.calorieGoal,
    proteinGoal: goals.proteinGoal,
    calorieProgress: goals.calorieGoal > 0 ? (totalCalories / goals.calorieGoal) * 100 : 0,
    proteinProgress: goals.proteinGoal > 0 ? (totalProtein / goals.proteinGoal) * 100 : 0,
    entryCount: dayEntries.length,
    hasData: dayEntries.length > 0,
  };
}

/**
 * Get stats for the last N days
 */
export function getLastNDaysStats(
  entries: IntakeEntry[],
  goals: DailyGoals,
  days: number
): DayStats[] {
  const stats: DayStats[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    stats.push(calculateDayStats(dateStr, entries, goals));
  }
  
  return stats;
}

/**
 * Calculate weekly statistics
 */
export function calculateWeekStats(
  entries: IntakeEntry[],
  goals: DailyGoals
): WeekStats {
  const days = getLastNDaysStats(entries, goals, 7);
  const daysWithData = days.filter(d => d.hasData);
  
  const avgCalories = daysWithData.length > 0
    ? daysWithData.reduce((sum, d) => sum + d.totalCalories, 0) / daysWithData.length
    : 0;
  
  const avgProtein = daysWithData.length > 0
    ? daysWithData.reduce((sum, d) => sum + d.totalProtein, 0) / daysWithData.length
    : 0;
  
  // Find best day (closest to goals without going too far over)
  let bestDay: DayStats | null = null;
  let bestScore = -Infinity;
  
  daysWithData.forEach(day => {
    // Score is higher when close to 100% for both goals
    const calorieScore = 100 - Math.abs(day.calorieProgress - 100);
    const proteinScore = 100 - Math.abs(day.proteinProgress - 100);
    const score = (calorieScore + proteinScore) / 2;
    
    if (score > bestScore) {
      bestScore = score;
      bestDay = day;
    }
  });
  
  return {
    days,
    avgCalories: Math.round(avgCalories),
    avgProtein: Math.round(avgProtein),
    bestDay,
    totalEntries: daysWithData.reduce((sum, d) => sum + d.entryCount, 0),
  };
}

/**
 * Calculate monthly statistics
 */
export function calculateMonthStats(
  entries: IntakeEntry[],
  goals: DailyGoals
): MonthStats {
  const days = getLastNDaysStats(entries, goals, 30);
  const daysWithData = days.filter(d => d.hasData);
  
  const avgCaloriesPerDay = daysWithData.length > 0
    ? daysWithData.reduce((sum, d) => sum + d.totalCalories, 0) / daysWithData.length
    : 0;
  
  const avgProteinPerDay = daysWithData.length > 0
    ? daysWithData.reduce((sum, d) => sum + d.totalProtein, 0) / daysWithData.length
    : 0;
  
  const streakInfo = calculateStreak(entries);
  
  return {
    days,
    totalDaysLogged: daysWithData.length,
    currentStreak: streakInfo.current,
    longestStreak: streakInfo.longest,
    avgCaloriesPerDay: Math.round(avgCaloriesPerDay),
    avgProteinPerDay: Math.round(avgProteinPerDay),
  };
}

/**
 * Calculate current and longest streak
 */
export function calculateStreak(entries: IntakeEntry[]): {
  current: number;
  longest: number;
} {
  if (entries.length === 0) {
    return { current: 0, longest: 0 };
  }
  
  // Get unique dates and sort them
  const uniqueDates = [...new Set(entries.map(e => e.date))].sort();
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  
  // Check if today has entries
  const today = new Date().toISOString().split('T')[0];
  const todayIndex = uniqueDates.indexOf(today);
  
  if (todayIndex === -1) {
    // Today has no entries, check if yesterday does
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (!uniqueDates.includes(yesterdayStr)) {
      currentStreak = 0; // Streak is broken
    }
  }
  
  // Calculate streaks by checking consecutive days
  for (let i = uniqueDates.length - 1; i > 0; i--) {
    const date1 = new Date(uniqueDates[i]);
    const date2 = new Date(uniqueDates[i - 1]);
    const diffDays = Math.round((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      tempStreak++;
      if (i === uniqueDates.length - 1) {
        currentStreak = tempStreak;
      }
    } else {
      if (i === uniqueDates.length - 1 && diffDays <= 1) {
        currentStreak = 1;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak);
  
  // If current streak not set, calculate from most recent date
  if (currentStreak === 0 && uniqueDates.length > 0) {
    const mostRecent = new Date(uniqueDates[uniqueDates.length - 1]);
    const now = new Date();
    const diffDays = Math.round((now.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      currentStreak = tempStreak;
    } else if (diffDays === 1) {
      currentStreak = tempStreak;
    }
  }
  
  return {
    current: Math.max(currentStreak, 0),
    longest: Math.max(longestStreak, 0),
  };
}

/**
 * Generate insights based on data
 */
export function generateInsights(
  weekStats: WeekStats,
  monthStats: MonthStats
): Insight[] {
  const insights: Insight[] = [];
  
  // Streak insights
  if (monthStats.currentStreak >= 7) {
    insights.push({
      id: 'streak-7',
      type: 'success',
      title: '🔥 On Fire!',
      description: `${monthStats.currentStreak} day streak! Keep it going!`,
      icon: '🔥',
    });
  } else if (monthStats.currentStreak >= 3) {
    insights.push({
      id: 'streak-3',
      type: 'success',
      title: '✨ Great Consistency',
      description: `${monthStats.currentStreak} days in a row! You're building a habit!`,
      icon: '✨',
    });
  }
  
  // Best day insight
  if (weekStats.bestDay) {
    const dayName = new Date(weekStats.bestDay.date).toLocaleDateString('en-US', { weekday: 'long' });
    const calorieAchievement = Math.round(weekStats.bestDay.calorieProgress);
    
    insights.push({
      id: 'best-day',
      type: 'success',
      title: `🌟 Best Day: ${dayName}`,
      description: `Hit ${calorieAchievement}% of your calorie goal!`,
      icon: '🌟',
    });
  }
  
  // Average insights
  const daysWithData = weekStats.days.filter(d => d.hasData).length;
  if (daysWithData >= 5) {
    insights.push({
      id: 'consistency',
      type: 'success',
      title: '📊 Excellent Tracking',
      description: `Logged ${daysWithData} out of 7 days this week!`,
      icon: '📊',
    });
  } else if (daysWithData >= 3) {
    insights.push({
      id: 'consistency-good',
      type: 'info',
      title: '📝 Good Progress',
      description: `Logged ${daysWithData} days this week. Try for 5+!`,
      icon: '📝',
    });
  } else if (daysWithData > 0) {
    insights.push({
      id: 'consistency-low',
      type: 'warning',
      title: '💪 Room to Improve',
      description: `Only ${daysWithData} days logged. Consistency is key!`,
      icon: '💪',
    });
  }
  
  // Protein insights
  if (weekStats.avgProtein > 0) {
    const proteinGoal = weekStats.days[0]?.proteinGoal || 50;
    const proteinPercentage = Math.round((weekStats.avgProtein / proteinGoal) * 100);
    
    if (proteinPercentage >= 90 && proteinPercentage <= 110) {
      insights.push({
        id: 'protein-good',
        type: 'success',
        title: '💪 Perfect Protein',
        description: `Averaging ${weekStats.avgProtein}g protein - right on target!`,
        icon: '💪',
      });
    } else if (proteinPercentage < 70) {
      insights.push({
        id: 'protein-low',
        type: 'warning',
        title: '🥩 Protein Alert',
        description: `Averaging ${weekStats.avgProtein}g protein. Consider more protein-rich foods!`,
        icon: '🥩',
      });
    }
  }
  
  // Calorie insights
  if (weekStats.avgCalories > 0) {
    const calorieGoal = weekStats.days[0]?.calorieGoal || 2000;
    const caloriePercentage = Math.round((weekStats.avgCalories / calorieGoal) * 100);
    
    if (caloriePercentage >= 95 && caloriePercentage <= 105) {
      insights.push({
        id: 'calorie-perfect',
        type: 'success',
        title: '🎯 Perfect Balance',
        description: `Averaging ${weekStats.avgCalories} calories - excellent control!`,
        icon: '🎯',
      });
    }
  }
  
  return insights;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return Math.round(num).toLocaleString();
}

/**
 * Get progress status color
 */
export function getProgressColor(percentage: number): string {
  if (percentage < 50) return 'text-red-500';
  if (percentage < 80) return 'text-yellow-500';
  if (percentage > 120) return 'text-orange-500';
  return 'text-green-500';
}

/**
 * Get progress bar color class
 */
export function getProgressBarColor(percentage: number): string {
  if (percentage < 50) return 'bg-red-500';
  if (percentage < 80) return 'bg-yellow-500';
  if (percentage > 120) return 'bg-orange-500';
  return 'bg-green-500';
}
