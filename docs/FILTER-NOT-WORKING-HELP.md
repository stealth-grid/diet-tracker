# Filter Not Working - Quick Help

## 🔍 What To Check Right Now

### 1. Open the App and Press F12

Open browser console and run this diagnostic:

```javascript
// === QUICK DIAGNOSTIC ===
const foods = JSON.parse(localStorage.getItem('diet-tracker-anonymous-user-foods') || '[]');
console.log('Foods loaded:', foods.length);
console.log('Sample:', foods.slice(0, 3).map(f => f.name));

if (foods.length === 0) {
  console.error('❌ NO FOODS! Run: localStorage.clear(); location.reload();');
} else {
  const oils = foods.filter(f => f.name.toLowerCase().includes('oil'));
  console.log('✓ Oils found:', oils.map(o => o.name));
}
```

### 2. What Do You See?

#### Scenario A: "Foods loaded: 0"
**Problem:** Foods not initialized
**Fix:**
```javascript
localStorage.clear();
location.reload();
// Then log in again
```

#### Scenario B: "Foods loaded: 200+" but "Oils found: []"
**Problem:** Foods exist but oils are missing
**Fix:** The initialFoods data might not have oils
**Check:**
```javascript
const foods = JSON.parse(localStorage.getItem('diet-tracker-anonymous-user-foods'));
console.log('All food names:', foods.map(f => f.name).join(', '));
// Search for "oil" in the output
```

#### Scenario C: Oils found but dropdown shows nothing
**Problem:** UI rendering issue
**See below for UI checks**

## 🐛 Common Problems

### Problem 1: Foods Array is Empty

**Symptoms:**
- Dropdown shows "No options found"
- Console shows: `[SearchableSelect] Opened with 0 options`

**Solution:**
```bash
# In browser console:
localStorage.clear();
location.reload();
# Then login again (even as guest)
# Check console for: [FoodInit] Loaded XXX foods
```

### Problem 2: Search Doesn't Filter

**Symptoms:**
- Type "oil" but see all 200+ foods
- OR type "oil" but see no results

**Debug:**
```javascript
// Check what SearchableSelect sees
// Open dropdown and type "oil"
// Look for console logs:
// [SearchableSelect] Search: oil
// [SearchableSelect] Filtered: X results

// If you don't see these logs, the component isn't running
```

### Problem 3: Dropdown Doesn't Open

**Symptoms:**
- Click button, nothing happens
- No dropdown appears

**Debug:**
1. Check if button is visible
2. Try clicking multiple times
3. Check console for errors
4. Try in incognito mode

### Problem 4: Shows Wrong Results

**Symptoms:**
- Search "oil" but shows other foods
- Search "spice" but shows oils

**This would be very unusual** - the filtering logic is simple string matching.

**Debug:**
```javascript
// Test the filtering manually
const foods = JSON.parse(localStorage.getItem('diet-tracker-anonymous-user-foods'));
const options = foods.map(f => ({
  label: f.name,
  searchTerms: `${f.name} ${f.category || ''} ${f.foodType}`
}));

const search = 'oil';
const filtered = options.filter(opt => {
  const labelMatch = opt.label.toLowerCase().includes(search);
  const termsMatch = opt.searchTerms?.toLowerCase().includes(search);
  return labelMatch || termsMatch;
});

console.log('Manual filter for "oil":', filtered.map(o => o.label));
// Should show the 5 oils
```

## 🎯 Most Likely Issue

**90% chance:** Foods are not loaded or localStorage is corrupted

**Fix:**
```javascript
localStorage.clear();
location.reload();
```

**10% chance:** Some other issue

## 📸 Please Share

To help debug, please share:

1. **Console output from:**
```javascript
const foods = JSON.parse(localStorage.getItem('diet-tracker-anonymous-user-foods') || '[]');
console.log('Foods:', foods.length);
console.log('Oils:', foods.filter(f => f.name.toLowerCase().includes('oil')).map(f => f.name));
```

2. **What you see when you:**
   - Open the dropdown
   - Type "oil"
   - What shows in the list?

3. **Console logs** when opening dropdown:
   - Look for `[SearchableSelect]` logs
   - Share what they say

4. **Screenshot** of:
   - The dropdown when opened
   - The console with logs

## 🔧 Temporary Fix

If nothing works, use the old select temporarily:

```tsx
// In AddIntakeDialog.tsx
// Comment out SearchableSelect
// Uncomment this:

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

<Select value={selectedFoodId} onValueChange={setSelectedFoodId}>
  <SelectTrigger>
    <SelectValue placeholder="Select a food" />
  </SelectTrigger>
  <SelectContent className="max-h-[300px] overflow-y-auto">
    {foods.map((food) => (
      <SelectItem key={food.id} value={food.id}>
        <div className="flex items-center gap-2">
          <FoodTypeIndicator foodType={food.foodType} size="sm" />
          <span>{food.name}</span>
        </div>
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

This gives you the non-searchable but working dropdown.

## ✅ Next Steps

1. Run the diagnostic script above
2. Share the output
3. Tell me **exactly** what you see:
   - "I type 'oil' and see nothing"
   - "I type 'oil' and see 200 foods"
   - "Dropdown doesn't open at all"
   - "I see correct results but they don't render"
   - etc.

With that info, I can pinpoint the exact issue!
