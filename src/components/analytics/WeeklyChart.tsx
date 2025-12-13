import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { TrendingUp, Calendar } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { WeekStats } from "~/lib/analytics";
import { formatNumber } from "~/lib/analytics";

interface WeeklyChartProps {
  stats: WeekStats;
}

export function WeeklyChart({ stats }: WeeklyChartProps) {
  // Prepare data for the chart
  const chartData = stats.days.map(day => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    return {
      name: dayName,
      calories: Math.round(day.totalCalories),
      protein: Math.round(day.totalProtein),
      calorieGoal: day.calorieGoal,
      proteinGoal: day.proteinGoal,
      date: day.date,
    };
  });

  const hasData = stats.days.some(d => d.hasData);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
          <p className="font-medium mb-2">{data.name}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Calories: {formatNumber(data.calories)} kcal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Protein: {formatNumber(data.protein)}g</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Trends
            </CardTitle>
            <CardDescription>Last 7 days of tracking</CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 inline mr-1" />
            {stats.totalEntries} total entries
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No data for the past week</p>
            <p className="text-sm mt-1">Start logging to see your trends!</p>
          </div>
        ) : (
          <>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs"
                    stroke="currentColor"
                  />
                  <YAxis 
                    className="text-xs"
                    stroke="currentColor"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="calories"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ fill: '#f97316', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Calories"
                  />
                  <Line
                    type="monotone"
                    dataKey="protein"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Protein"
                  />
                  {/* Goal lines */}
                  <Line
                    type="monotone"
                    dataKey="calorieGoal"
                    stroke="#f97316"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Calorie Goal"
                    opacity={0.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="proteinGoal"
                    stroke="#3b82f6"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Protein Goal"
                    opacity={0.5}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Week Summary Stats */}
            <div className="mt-6 pt-6 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Avg Calories</div>
                <div className="text-xl font-bold text-orange-600">
                  {formatNumber(stats.avgCalories)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Avg Protein</div>
                <div className="text-xl font-bold text-blue-600">
                  {formatNumber(stats.avgProtein)}g
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Days Logged</div>
                <div className="text-xl font-bold text-green-600">
                  {stats.days.filter(d => d.hasData).length}/7
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Total Entries</div>
                <div className="text-xl font-bold text-purple-600">
                  {stats.totalEntries}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
