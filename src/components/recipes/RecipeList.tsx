import { useState } from "react";
import { Search, Filter, ChefHat } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { RecipeCard } from "./RecipeCard";
import type { Recipe, DietPreference } from "~/types";

interface RecipeListProps {
  recipes: Recipe[];
  onView: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
  onDuplicate: (recipe: Recipe) => void;
  onQuickAdd: (recipe: Recipe) => void;
  dietPreference?: DietPreference;
}

export function RecipeList({ 
  recipes, 
  onView, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onQuickAdd,
  dietPreference 
}: RecipeListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");

  // Filter recipes
  const filteredRecipes = recipes.filter(recipe => {
    // Search filter
    const matchesSearch = 
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    // Category filter
    const matchesCategory = categoryFilter === "all" || recipe.category === categoryFilter;

    // Diet preference filter
    let matchesDiet = true;
    if (dietPreference === 'vegetarian') {
      matchesDiet = recipe.foodType === 'veg';
    } else if (dietPreference === 'eggetarian') {
      matchesDiet = recipe.foodType === 'veg' || recipe.foodType === 'egg';
    }

    return matchesSearch && matchesCategory && matchesDiet;
  });

  // Sort recipes
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return b.updatedAt - a.updatedAt;
      case "name":
        return a.name.localeCompare(b.name);
      case "calories-low":
        return a.caloriesPerServing - b.caloriesPerServing;
      case "calories-high":
        return b.caloriesPerServing - a.caloriesPerServing;
      case "protein-high":
        return b.proteinPerServing - a.proteinPerServing;
      default:
        return 0;
    }
  });

  // Get unique categories from all recipes
  const categories = Array.from(new Set(recipes.map(r => r.category).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category!}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="calories-low">Calories (Low)</SelectItem>
            <SelectItem value="calories-high">Calories (High)</SelectItem>
            <SelectItem value="protein-high">Protein (High)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Recipe Count */}
      <div className="text-sm text-muted-foreground">
        Showing {sortedRecipes.length} of {recipes.length} recipes
        {dietPreference === 'vegetarian' && " (Vegetarian)"}
        {dietPreference === 'eggetarian' && " (Vegetarian + Egg)"}
      </div>

      {/* Recipe Grid */}
      {sortedRecipes.length === 0 ? (
        <div className="text-center py-12">
          <ChefHat className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
          <p className="text-muted-foreground">
            {searchQuery || categoryFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first recipe to get started"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onQuickAdd={onQuickAdd}
            />
          ))}
        </div>
      )}
    </div>
  );
}
