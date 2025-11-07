import { useState, useEffect } from "react";
import { RefreshCw, Target, Utensils } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { FoodTypeIndicator } from "~/components/ui/food-type-indicator";
import type { FoodItem, DailyGoals, DietPreference, FoodType } from "~/types";
import { filterFoodsByDietPreference } from "~/lib/utils";

interface MealPlannerProps {
  foods: FoodItem[];
  goals: DailyGoals;
  dietPreference: DietPreference;
  preferredFoodIds: string[];
}

interface MealSuggestion {
  foodId: string;
  foodName: string;
  quantity: number;
  protein: number;
  calories: number;
  foodType: FoodType;
}

interface MealPlan {
  breakfast: MealSuggestion[];
  lunch: MealSuggestion[];
  dinner: MealSuggestion[];
  snacks: MealSuggestion[];
  totalCalories: number;
  totalProtein: number;
}

export function MealPlanner({ foods, goals, dietPreference, preferredFoodIds }: MealPlannerProps) {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateMealPlan();
  }, [foods, goals, dietPreference, preferredFoodIds]);

  const generateMealPlan = () => {
    setIsGenerating(true);
    
    // Filter by diet preference first
    let availableFoods = filterFoodsByDietPreference(foods.filter(f => f.id && f.name), dietPreference);
    
    // If user has selected preferred foods, use only those
    if (preferredFoodIds.length > 0) {
      const preferredSet = new Set(preferredFoodIds);
      availableFoods = availableFoods.filter(f => preferredSet.has(f.id));
    }
    
    // Distribute calories and protein across meals
    const calorieDistribution = {
      breakfast: 0.25, // 25% of daily calories
      lunch: 0.35,     // 35% of daily calories
      dinner: 0.30,    // 30% of daily calories
      snacks: 0.10,    // 10% of daily calories
    };

    const proteinDistribution = {
      breakfast: 0.20, // 20% of daily protein
      lunch: 0.35,     // 35% of daily protein
      dinner: 0.35,    // 35% of daily protein
      snacks: 0.10,    // 10% of daily protein
    };

    // Generate meals
    const breakfast = generateMeal(
      availableFoods,
      goals.calorieGoal * calorieDistribution.breakfast,
      goals.proteinGoal * proteinDistribution.breakfast,
      ['grains', 'dairy', 'fruits']
    );

    const lunch = generateMeal(
      availableFoods,
      goals.calorieGoal * calorieDistribution.lunch,
      goals.proteinGoal * proteinDistribution.lunch,
      ['grains', 'protein', 'legumes', 'vegetables']
    );

    const dinner = generateMeal(
      availableFoods,
      goals.calorieGoal * calorieDistribution.dinner,
      goals.proteinGoal * proteinDistribution.dinner,
      ['grains', 'protein', 'vegetables', 'legumes']
    );

    const snacks = generateMeal(
      availableFoods,
      goals.calorieGoal * calorieDistribution.snacks,
      goals.proteinGoal * proteinDistribution.snacks,
      ['fruits', 'nuts', 'dairy']
    );

    const totalCalories = [...breakfast, ...lunch, ...dinner, ...snacks].reduce(
      (sum, item) => sum + item.calories,
      0
    );

    const totalProtein = [...breakfast, ...lunch, ...dinner, ...snacks].reduce(
      (sum, item) => sum + item.protein,
      0
    );

    setMealPlan({
      breakfast,
      lunch,
      dinner,
      snacks,
      totalCalories,
      totalProtein,
    });

    setIsGenerating(false);
  };

  const generateMeal = (
    foods: FoodItem[],
    targetCalories: number,
    targetProtein: number,
    preferredCategories: string[]
  ): MealSuggestion[] => {
    const suggestions: MealSuggestion[] = [];
    let currentCalories = 0;
    let currentProtein = 0;

    // Filter foods by preferred categories
    const categoryFoods = foods.filter(
      f => f.category && preferredCategories.includes(f.category)
    );

    // If no foods in preferred categories, use all foods
    const availableFoods = categoryFoods.length > 0 ? categoryFoods : foods;

    // Sort by protein-to-calorie ratio (higher is better for protein goals)
    const sortedFoods = [...availableFoods].sort((a, b) => {
      const ratioA = a.proteinPer100g / a.caloriesPer100g;
      const ratioB = b.proteinPer100g / b.caloriesPer100g;
      return ratioB - ratioA;
    });

    // Select 2-4 items for variety
    const numItems = Math.min(4, Math.max(2, Math.floor(Math.random() * 3) + 2));
    const caloriesPerItem = targetCalories / numItems;

    for (let i = 0; i < numItems && sortedFoods.length > 0; i++) {
      // Pick a random food from top candidates (add variety)
      const candidateIndex = Math.floor(Math.random() * Math.min(5, sortedFoods.length));
      const food = sortedFoods[candidateIndex];
      
      // Calculate quantity to meet calorie target
      const quantity = Math.round((caloriesPerItem / food.caloriesPer100g) * 100);
      
      // Skip if quantity is too small or too large
      if (quantity < 20 || quantity > 500) continue;

      const calories = (food.caloriesPer100g * quantity) / 100;
      const protein = (food.proteinPer100g * quantity) / 100;

      suggestions.push({
        foodId: food.id,
        foodName: food.name,
        quantity,
        protein: Math.round(protein * 10) / 10,
        calories: Math.round(calories),
        foodType: food.foodType,
      });

      currentCalories += calories;
      currentProtein += protein;

      // Remove used food to avoid duplicates in same meal
      sortedFoods.splice(candidateIndex, 1);

      // Stop if we're close enough to target
      if (currentCalories >= targetCalories * 0.9) break;
    }

    return suggestions;
  };

  const MealSection = ({ 
    title, 
    icon, 
    items, 
    targetCalories, 
    targetProtein 
  }: { 
    title: string; 
    icon: React.ReactNode; 
    items: MealSuggestion[];
    targetCalories: number;
    targetProtein: number;
  }) => {
    const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);
    const totalProtein = items.reduce((sum, item) => sum + item.protein, 0);

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs">
                {Math.round(totalCalories)} / {Math.round(targetCalories)} kcal
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {totalProtein.toFixed(1)} / {targetProtein.toFixed(0)}g protein
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={`${item.foodId}-${index}`}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-medium">
                    <FoodTypeIndicator foodType={item.foodType} size="sm" />
                    {item.foodName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.quantity}g
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {item.calories} kcal
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.protein.toFixed(1)}g protein
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!mealPlan) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Generating meal plan...</p>
        </div>
      </div>
    );
  }

  const calorieProgress = (mealPlan.totalCalories / goals.calorieGoal) * 100;
  const proteinProgress = (mealPlan.totalProtein / goals.proteinGoal) * 100;

  return (
    <div className="space-y-6">
      {/* Info about preferred foods */}
      {preferredFoodIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
          <strong>Note:</strong> Meal plan is using your {preferredFoodIds.length} preferred foods. 
          You can change your food preferences in Settings → Food Preferences.
        </div>
      )}

      {/* Header with Goals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              <CardTitle>Daily Meal Plan Suggestion</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={generateMealPlan}
              disabled={isGenerating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              Generate New Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Calories</span>
                <span className="font-medium">
                  {Math.round(mealPlan.totalCalories)} / {goals.calorieGoal} kcal
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    calorieProgress >= 95 && calorieProgress <= 105
                      ? 'bg-green-500'
                      : calorieProgress > 105
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(calorieProgress, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                {calorieProgress < 95
                  ? 'Slightly under goal'
                  : calorieProgress > 105
                  ? 'Slightly over goal'
                  : 'Perfect match!'}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Protein</span>
                <span className="font-medium">
                  {mealPlan.totalProtein.toFixed(1)} / {goals.proteinGoal}g
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    proteinProgress >= 95 && proteinProgress <= 105
                      ? 'bg-green-500'
                      : proteinProgress > 105
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(proteinProgress, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                {proteinProgress < 95
                  ? 'Slightly under goal'
                  : proteinProgress > 105
                  ? 'Slightly over goal'
                  : 'Perfect match!'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meal Sections */}
      <MealSection
        title="Breakfast"
        icon={<Utensils className="h-5 w-5 text-orange-500" />}
        items={mealPlan.breakfast}
        targetCalories={goals.calorieGoal * 0.25}
        targetProtein={goals.proteinGoal * 0.20}
      />

      <MealSection
        title="Lunch"
        icon={<Utensils className="h-5 w-5 text-blue-500" />}
        items={mealPlan.lunch}
        targetCalories={goals.calorieGoal * 0.35}
        targetProtein={goals.proteinGoal * 0.35}
      />

      <MealSection
        title="Dinner"
        icon={<Utensils className="h-5 w-5 text-purple-500" />}
        items={mealPlan.dinner}
        targetCalories={goals.calorieGoal * 0.30}
        targetProtein={goals.proteinGoal * 0.35}
      />

      <MealSection
        title="Snacks"
        icon={<Utensils className="h-5 w-5 text-green-500" />}
        items={mealPlan.snacks}
        targetCalories={goals.calorieGoal * 0.10}
        targetProtein={goals.proteinGoal * 0.10}
      />

      {/* Info Note */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> This is a suggested meal plan based on your daily goals.
            Feel free to adjust quantities or swap foods based on your preferences and availability.
            Click "Generate New Plan" to see different combinations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
