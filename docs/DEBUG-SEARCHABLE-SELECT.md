# Debug Searchable Select - Not Showing Correct Results

## Issue
The searchable select filter is not showing correct results when searching.

## Debugging Steps

### Step 1: Check if Foods are Loaded

Open browser console (F12) and run:

```javascript
// Check localStorage
const foods = JSON.parse(localStorage.getItem('diet-tracker-anonymous-user-foods') || '[]');
console.log('Total foods:', foods.length);
console.log('Oils:', foods.filter(f => f.name.toLowerCase().includes('oil')).map(f => f.name));
console.log('Spices:', foods.filter(f => f.category === 'spices').map(f => f.name));
```

**Expected Output:**
```
Total foods: 200+
Oils: ["Vegetable Oil", "Mustard Oil", "Olive Oil", "Coconut Oil", "Sesame Oil"]
Spices: [... list of spices ...]
```

**If you see 0 or empty:**
→ Foods are not loaded. Clear cache and reload:
```javascript
localStorage.clear();
location.reload();
```

### Step 2: Check SearchableSelect Debug Logs

With the updated component, you should see console logs when you:
1. Open the dropdown
2. Type in the search

**Example logs:**
```
[SearchableSelect] Opened with 203 options
[SearchableSelect] Search: oil
[SearchableSelect] Filtered: 5 results
[SearchableSelect] Results: ["Vegetable Oil", "Mustard Oil", "Olive Oil", ...]
```

**What to check:**
- Does it say "Opened with 0 options"? → Foods not loaded
- Does it say "Filtered: 0 results" when searching "oil"? → Filtering issue
- Does it show correct results but UI doesn't display? → Rendering issue

### Step 3: Test Filtering Logic

Open http://localhost:5174/test-searchable.html (file I created)

This tests the filtering logic in isolation.

**All tests should pass:**
- ✓ Search for "oil" → 2 results
- ✓ Search for "spice" → 1 result
- ✓ Search for "veg" → 4 results
- ✓ Empty search → 5 results (all)

### Step 4: Check Component Props

Add this temporarily to `AddIntakeDialog.tsx` before the `<SearchableSelect>`:

```typescript
console.log('[AddIntakeDialog] Foods count:', foods.length);
console.log('[AddIntakeDialog] Sample foods:', foods.slice(0, 5).map(f => f.name));
```

This will show if foods are being passed to the component.

### Step 5: Visual Inspection

When you open the dropdown, check:

1. **Trigger button shows:** "Select a food" or actual food name?
2. **Dropdown opens:** Does the dropdown panel appear?
3. **Search input:** Is the search input visible and focusable?
4. **Options list:** Can you see any options listed?
5. **Scrollbar:** Is there a scrollbar (indicating content)?

## Common Issues & Solutions

### Issue 1: "Opened with 0 options"

**Cause:** Foods array is empty
**Solution:**
```javascript
// Clear cache
localStorage.clear();
location.reload();

// Then log in again
```

### Issue 2: "Filtered: 0 results" for valid search

**Cause:** searchTerms not set correctly or filtering logic issue

**Check:**
```javascript
// In console, check what searchTerms look like
const foods = JSON.parse(localStorage.getItem('diet-tracker-anonymous-user-foods') || '[]');
const testFood = foods[0];
const searchTerms = `${testFood.name} ${testFood.category || ''} ${testFood.foodType}`;
console.log('Sample searchTerms:', searchTerms);
// Should be like: "Vegetable Oil oils veg"
```

### Issue 3: Results show in console but not in UI

**Cause:** Rendering issue

**Check:**
1. Is the dropdown visible? (check z-index)
2. Is the options list scrollable?
3. Are options rendered but hidden? (check CSS)

### Issue 4: Dropdown doesn't open at all

**Cause:** Click event not firing

**Check:**
```javascript
// Add temporary logging to button
<Button onClick={() => {
  console.log('Button clicked!');
  setOpen(!open);
}}>
```

### Issue 5: Search input doesn't work

**Cause:** Input not receiving focus or onChange not firing

**Check:**
```javascript
// Add logging to input
<Input
  onChange={(e) => {
    console.log('Search changed:', e.target.value);
    setSearch(e.target.value);
  }}
/>
```

## Quick Diagnostic Script

Run this in browser console:

```javascript
// Comprehensive diagnostic
console.log('=== SearchableSelect Diagnostic ===');

// 1. Check foods in localStorage
const foods = JSON.parse(localStorage.getItem('diet-tracker-anonymous-user-foods') || '[]');
console.log('1. Foods loaded:', foods.length);

// 2. Check oils specifically
const oils = foods.filter(f => f.name.toLowerCase().includes('oil'));
console.log('2. Oils found:', oils.length);
console.log('   Names:', oils.map(o => o.name));

// 3. Test filtering logic
const testOptions = foods.map(f => ({
  value: f.id,
  label: f.name,
  searchTerms: `${f.name} ${f.category || ''} ${f.foodType}`
}));

const searchTerm = 'oil';
const filtered = testOptions.filter(opt => {
  const searchLower = searchTerm.toLowerCase();
  const labelMatch = opt.label.toLowerCase().includes(searchLower);
  const termsMatch = opt.searchTerms?.toLowerCase().includes(searchLower);
  return labelMatch || termsMatch;
});

console.log('3. Filter test for "oil":', filtered.length);
console.log('   Results:', filtered.map(o => o.label));

// 4. Check if dropdown elements exist
setTimeout(() => {
  const dropdown = document.querySelector('[role="combobox"]');
  console.log('4. Dropdown button exists:', !!dropdown);
}, 1000);

console.log('=== End Diagnostic ===');
```

## Expected Behavior

### Correct Flow:
1. Click dropdown button → Dropdown opens
2. Console shows: `[SearchableSelect] Opened with XXX options`
3. Type "oil" → Search input updates
4. Console shows: `[SearchableSelect] Search: oil`
5. Console shows: `[SearchableSelect] Filtered: 5 results`
6. UI shows 5 oils in the list
7. Click one → It selects and closes

### If Any Step Fails:

**Step 1 fails (dropdown doesn't open):**
- Check if button is clickable
- Check console for errors
- Try clicking outside dialog first

**Step 2 fails (shows 0 options):**
- Foods not loaded
- Clear cache: `localStorage.clear(); location.reload();`

**Step 3-4 fail (search doesn't work):**
- Check if input has focus
- Try clicking the input
- Check console for onChange logs

**Step 5 fails (filtered shows 0 but should have results):**
- Filtering logic issue
- Check searchTerms format
- Check if search value is correct

**Step 6 fails (results in console but not UI):**
- Check z-index (dropdown might be behind)
- Check if max-height is hiding results
- Inspect DOM to see if options are rendered

## Advanced Debugging

### Enable React DevTools
1. Install React DevTools browser extension
2. Open DevTools → Components tab
3. Find `SearchableSelect` component
4. Check props:
   - `options` array length
   - `value` current value
   - `open` state

### Check Network Tab
1. Open DevTools → Network tab
2. Reload page
3. Check if API calls are succeeding
4. Look for 404 or 500 errors

### Check for JavaScript Errors
1. Open Console tab
2. Look for red error messages
3. Common errors:
   - `Cannot read property 'map' of undefined` → foods is undefined
   - `Maximum update depth exceeded` → Infinite loop
   - `Hydration error` → SSR mismatch (shouldn't happen with Vite)

## Still Not Working?

### Provide This Information:

1. **Console output from diagnostic script** (full output)
2. **SearchableSelect debug logs** (when opening dropdown)
3. **Browser and version** (e.g., Chrome 120)
4. **Screenshots**:
   - Dropdown when opened
   - Search field with text
   - Browser console with logs
5. **What exactly happens**:
   - "Nothing shows when I search"
   - "Wrong items show up"
   - "All items show, no filtering"
   - etc.

### Temporary Workaround

If nothing works, temporarily revert to plain select:

```tsx
// In AddIntakeDialog.tsx, replace SearchableSelect with regular Select
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

<Select value={selectedFoodId} onValueChange={setSelectedFoodId}>
  <SelectTrigger>
    <SelectValue placeholder="Select a food" />
  </SelectTrigger>
  <SelectContent className="max-h-[300px]">
    {foods.map((food) => (
      <SelectItem key={food.id} value={food.id}>
        {food.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

This gives you back the working dropdown while we debug the searchable version.

---

**Next Steps:**
1. Run the diagnostic script
2. Share the console output
3. Describe exactly what you see vs. what you expect
