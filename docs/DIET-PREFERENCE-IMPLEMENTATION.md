# Diet Preference & Food Type Indicators - Implementation Status

## ✅ Completed

### 1. Type Definitions
- Added `FoodType` type: 'veg' | 'egg' | 'non-veg'
- Added `DietPreference` type: 'vegetarian' | 'eggetarian' | 'non-vegetarian'
- Updated `FoodItem` interface with `foodType` field
- Updated `IntakeEntry` interface with optional `foodType` field
- Created `UserPreferences` interface

### 2. Food Type Indicator Component
- Created `FoodTypeIndicator` component
- Green dot with green border for vegetarian
- Amber/brown dot with amber border for egg
- Red dot with red border for non-vegetarian
- Three sizes: sm, md, lg
- Hover tooltips with labels

### 3. Updated Food Database
- All 51 food items now have `foodType` classification
- 44 items marked as 'veg'
- 2 items marked as 'egg' (whole egg, egg white)
- 5 items marked as 'non-veg' (chicken, fish, mutton, prawns)

### 4. Storage Functions
- Added `getDietPreference()` function
- Added `saveDietPreference()` function
- Default preference: 'non-vegetarian'

## 🔄 In Progress / Needed

### 1. Settings Dialog Updates
**File**: `src/components/settings/SettingsDialog.tsx`

Add diet preference selector to Goals tab:

```typescript
const [dietPreference, setDietPreference] = useState<DietPreference>('non-vegetarian');

// In the Goals tab, add:
<div className="space-y-2">
  <Label htmlFor="diet-preference">Diet Preference</Label>
  <Select value={dietPreference} onValueChange={(value) => setDietPreference(value as DietPreference)}>
    <SelectTrigger id="diet-preference">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="vegetarian">
        <div className="flex items-center gap-2">
          <FoodTypeIndicator foodType="veg" size="sm" />
          <span>Vegetarian</span>
        </div>
      </SelectItem>
      <SelectItem value="eggetarian">
        <div className="flex items-center gap-2">
          <FoodTypeIndicator foodType="egg" size="sm" />
          <span>Eggetarian</span>
        </div>
      </SelectItem>
      <SelectItem value="non-vegetarian">
        <div className="flex items-center gap-2">
          <FoodTypeIndicator foodType="non-veg" size="sm" />
          <span>Non-Vegetarian</span>
        </div>
      </SelectItem>
    </SelectContent>
  </Select>
</div>
```

### 2. Add Food Dialog Updates
**File**: `src/components/database/AddFoodDialog.tsx`

Add foodType selector:

```typescript
const [foodType, setFoodType] = useState<FoodType>('veg');

// In the form, add:
<div className="space-y-2">
  <Label htmlFor="food-type">Food Type</Label>
  <Select value={foodType} onValueChange={(value) => setFoodType(value as FoodType)}>
    <SelectTrigger id="food-type">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="veg">
        <div className="flex items-center gap-2">
          <FoodTypeIndicator foodType="veg" size="sm" />
          <span>Vegetarian</span>
        </div>
      </SelectItem>
      <SelectItem value="egg">
        <div className="flex items-center gap-2">
          <FoodTypeIndicator foodType="egg" size="sm" />
          <span>Contains Egg</span>
        </div>
      </SelectItem>
      <SelectItem value="non-veg">
        <div className="flex items-center gap-2">
          <FoodTypeIndicator foodType="non-veg" size="sm" />
          <span>Non-Vegetarian</span>
        </div>
      </SelectItem>
    </SelectContent>
  </Select>
</div>

// Update the food object:
const food: FoodItem = {
  // ... existing fields
  foodType: foodType,
};
```

### 3. Display Indicators Throughout App

#### a) Food List Component
**File**: `src/components/database/FoodList.tsx`

```typescript
import { FoodTypeIndicator } from "~/components/ui/food-type-indicator";

// In the food item display:
<div className="flex items-center gap-2 mb-1">
  <FoodTypeIndicator foodType={food.foodType} size="sm" />
  <span className="font-medium">{food.name}</span>
  {food.isCustom && <Badge variant="secondary" className="text-xs">Custom</Badge>}
</div>
```

#### b) Add Intake Dialog
**File**: `src/components/intake/AddIntakeDialog.tsx`

Show indicator in dropdown and save with entry:

```typescript
// In SelectItem:
<SelectItem key={food.id} value={food.id}>
  <div className="flex items-center gap-2">
    <FoodTypeIndicator foodType={food.foodType} size="sm" />
    <span>{food.name}</span>
  </div>
</SelectItem>

// When creating entry, add:
const entry: IntakeEntry = {
  // ... existing fields
  foodType: food.foodType,
};
```

#### c) Intake List Component
**File**: `src/components/intake/IntakeList.tsx`

```typescript
import { FoodTypeIndicator } from "~/components/ui/food-type-indicator";

// In the entry display:
<div className="flex-1">
  <div className="flex items-center gap-2 font-medium">
    {entry.foodType && <FoodTypeIndicator foodType={entry.foodType} size="sm" />}
    {entry.foodName}
  </div>
  // ... rest of display
</div>
```

#### d) Meal Planner Component
**File**: `src/components/planner/MealPlanner.tsx`

Show indicators and filter by diet preference:

```typescript
import { FoodTypeIndicator } from "~/components/ui/food-type-indicator";
import type { DietPreference } from "~/types";

// Add prop:
interface MealPlannerProps {
  foods: FoodItem[];
  goals: DailyGoals;
  dietPreference: DietPreference;
}

// Filter foods based on preference:
const filterFoodsByDiet = (foods: FoodItem[], preference: DietPreference): FoodItem[] => {
  if (preference === 'vegetarian') {
    return foods.filter(f => f.foodType === 'veg');
  } else if (preference === 'eggetarian') {
    return foods.filter(f => f.foodType === 'veg' || f.foodType === 'egg');
  }
  return foods; // non-vegetarian gets all foods
};

// Use filtered foods:
const availableFoods = filterFoodsByDiet(foods, dietPreference);

// Display indicator in meal items:
<div className="flex items-center gap-2">
  <FoodTypeIndicator foodType={/* get from food */} size="sm" />
  <div className="font-medium">{item.foodName}</div>
</div>
```

### 4. App.tsx Updates
**File**: `src/App.tsx`

```typescript
import { getDietPreference, saveDietPreference } from "~/lib/storage";
import type { DietPreference } from "~/types";

// Add state:
const [dietPreference, setDietPreference] = useState<DietPreference>('non-vegetarian');

// Load in useEffect:
const storedPreference = getDietPreference();
setDietPreference(storedPreference);

// Handler:
const handleSaveDietPreference = (preference: DietPreference) => {
  saveDietPreference(preference);
  setDietPreference(preference);
};

// Pass to components:
<SettingsDialog 
  goals={goals} 
  dietPreference={dietPreference}
  onSave={handleSaveGoals}
  onSaveDietPreference={handleSaveDietPreference}
  onDataImported={handleDataImported}
/>

<MealPlanner 
  foods={foods} 
  goals={goals}
  dietPreference={dietPreference}
/>
```

### 5. Data Management Updates
**File**: `src/lib/dataManagement.ts`

Update export/import to include dietPreference:

```typescript
export interface ExportData {
  version: string;
  exportDate: string;
  foods: FoodItem[];
  intakeEntries: IntakeEntry[];
  goals: DailyGoals;
  dietPreference?: DietPreference; // Optional for backward compatibility
}
```

## 📋 Implementation Checklist

- [x] Create FoodType and DietPreference types
- [x] Add foodType to FoodItem interface
- [x] Create FoodTypeIndicator component
- [x] Update all 51 food items with foodType
- [x] Add storage functions for diet preference
- [ ] Update SettingsDialog with diet preference selector
- [ ] Update AddFoodDialog with foodType selector
- [ ] Add indicators to FoodList component
- [ ] Add indicators to AddIntakeDialog dropdown
- [ ] Add indicators to IntakeList display
- [ ] Add indicators and filtering to MealPlanner
- [ ] Update App.tsx with diet preference state
- [ ] Update data export/import with dietPreference
- [ ] Add migration for existing custom foods (default to 'veg')
- [ ] Test all diet preference filtering
- [ ] Update documentation

## 🎨 Visual Design

### Color Coding (Indian Food Marking Standard)
- **Green (Vegetarian)**: `bg-green-600`, `border-green-600`
- **Amber/Brown (Egg)**: `bg-amber-600`, `border-amber-600`
- **Red (Non-Vegetarian)**: `bg-red-600`, `border-red-600`

### Indicator Sizes
- `sm`: 8px (2rem) - For inline display in lists
- `md`: 12px (3rem) - Default size
- `lg`: 16px (4rem) - For emphasis

### Usage Pattern
```tsx
<FoodTypeIndicator foodType="veg" size="sm" />
<FoodTypeIndicator foodType="egg" size="md" />
<FoodTypeIndicator foodType="non-veg" size="lg" />
```

## 🔍 Filter Logic

### Vegetarian
- Shows only foods with `foodType === 'veg'`
- Excludes all egg and non-veg items

### Eggetarian
- Shows foods with `foodType === 'veg' || foodType === 'egg'`
- Excludes non-veg items

### Non-Vegetarian
- Shows all foods (no filter)
- Includes veg, egg, and non-veg items

## 📝 Migration Strategy

### For Existing Custom Foods
When loading foods without foodType:

```typescript
// In App.tsx useEffect:
const storedFoods = getFoods();
const migratedFoods = storedFoods.map(food => {
  if (!food.foodType) {
    return { ...food, foodType: 'veg' as FoodType }; // Default to veg
  }
  return food;
});
if (storedFoods.some(f => !f.foodType)) {
  saveFoods(migratedFoods);
}
setFoods(migratedFoods);
```

## 🧪 Testing Scenarios

1. **Diet Preference Changes**
   - Set to vegetarian → Meal planner shows only veg
   - Set to eggetarian → Meal planner shows veg + egg
   - Set to non-vegetarian → Meal planner shows all

2. **Food Addition**
   - Add vegetarian food → Green dot appears
   - Add egg food → Amber dot appears
   - Add non-veg food → Red dot appears

3. **Intake Tracking**
   - All logged items show correct color dot
   - Food database search shows dots
   - Meal suggestions respect preference

4. **Data Import/Export**
   - Export includes dietPreference
   - Import restores dietPreference
   - Old exports work (default to non-veg)

## 📚 User Documentation Needed

1. Add to README:
   - Diet preference feature
   - Food type indicators explanation
   - How to change preference

2. Create user guide:
   - What each color means
   - How filtering works
   - Adding custom foods with type

## 🚀 Next Steps

1. Complete the implementation checklist above
2. Test all filtering scenarios
3. Update user documentation
4. Create visual guide with screenshots
5. Consider adding:
   - Jain vegetarian option (no onion/garlic)
   - Vegan option
   - Halal/Kosher markers

---

**Status**: Implementation 40% complete
**Priority**: High - Core feature for Indian users
**Timeline**: 1-2 hours to complete remaining tasks
