import type { FoodType } from "~/types";
import { cn } from "~/lib/utils";

interface FoodTypeIndicatorProps {
  foodType: FoodType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FoodTypeIndicator({ foodType, size = 'md', className }: FoodTypeIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colorClasses = {
    veg: 'bg-green-600',
    egg: 'bg-amber-600',
    'non-veg': 'bg-red-600',
  };

  const borderColorClasses = {
    veg: 'border-green-600',
    egg: 'border-amber-600',
    'non-veg': 'border-red-600',
  };

  const titles = {
    veg: 'Vegetarian',
    egg: 'Contains Egg',
    'non-veg': 'Non-Vegetarian',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-sm border-2 flex-shrink-0',
        borderColorClasses[foodType],
        sizeClasses[size],
        className
      )}
      title={titles[foodType]}
    >
      <div className={cn('rounded-full', colorClasses[foodType], sizeClasses[size])} />
    </div>
  );
}
