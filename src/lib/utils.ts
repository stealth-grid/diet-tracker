import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { FoodItem, DietPreference } from "~/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Filter foods based on diet preference
 * - vegetarian: only 'veg' foods
 * - eggetarian: 'veg' and 'egg' foods
 * - non-vegetarian: all foods ('veg', 'egg', 'non-veg')
 */
export function filterFoodsByDietPreference(foods: FoodItem[], dietPreference: DietPreference): FoodItem[] {
  if (dietPreference === 'vegetarian') {
    return foods.filter(f => f.foodType === 'veg');
  } else if (dietPreference === 'eggetarian') {
    return foods.filter(f => f.foodType === 'veg' || f.foodType === 'egg');
  }
  return foods; // non-vegetarian gets all foods
}
