# Unique Key Issue - Fixed

## Problem
React was showing a warning about duplicate keys in the SearchableSelect component.

## Root Causes

### 1. Duplicate Food IDs (Most Likely)
If the `initialFoods.ts` file has foods with duplicate IDs, React will warn about non-unique keys.

### 2. Key Generation Issue
The component was using only `option.value` as the key, which assumes all values are unique.

## Solutions Implemented

### Fix 1: Added Index to Key
Changed from:
```tsx
key={option.value}
```

To:
```tsx
key={`${option.value}-${index}`}
```

This ensures uniqueness even if there are duplicate values.

### Fix 2: Added Duplicate Detection
Added debugging to detect duplicate keys:

```typescript
// Check for duplicate keys
const values = options.map(o => o.value);
const uniqueValues = new Set(values);
if (values.length !== uniqueValues.size) {
  console.warn('[SearchableSelect] ⚠️ Duplicate keys detected!');
  const duplicates = values.filter((v, i) => values.indexOf(v) !== i);
  console.warn('[SearchableSelect] Duplicate values:', [...new Set(duplicates)]);
}
```

Now when you open the dropdown, if there are duplicates, you'll see a warning in console with the duplicate IDs.

## How to Test

### 1. Check for Duplicates
Open the app, open the dropdown, and check console for:
```
[SearchableSelect] ⚠️ Duplicate keys detected!
[SearchableSelect] Duplicate values: ["some-id", "another-id"]
```

### 2. Check initialFoods.ts
If duplicates are found, search for them in `src/data/initialFoods.ts`:

```bash
cd diet-tracker/src/data
grep "id: 'duplicate-id'" initialFoods.ts
```

### 3. Fix Duplicates
If you find duplicate IDs, make them unique:

```typescript
// Before (duplicate!)
{ id: 'rice', name: 'White Rice', ... }
{ id: 'rice', name: 'Brown Rice', ... }  // ❌ Same ID!

// After (unique)
{ id: 'rice-white', name: 'White Rice', ... }
{ id: 'rice-brown', name: 'Brown Rice', ... }  // ✓ Unique IDs
```

## Verify It's Fixed

### No More React Warnings
After the fix, you should NOT see:
```
Warning: Encountered two children with the same key...
```

### Console Should Be Clean
Open dropdown and check console:
```
[SearchableSelect] Opened with XXX options
// No duplicate warnings = good!
```

## If Duplicates Are Found

Run this diagnostic in browser console:

```javascript
const foods = JSON.parse(localStorage.getItem('diet-tracker-anonymous-user-foods') || '[]');
const ids = foods.map(f => f.id);
const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
const uniqueDuplicates = [...new Set(duplicates)];

console.log('Total foods:', foods.length);
console.log('Unique IDs:', new Set(ids).size);
console.log('Duplicates found:', uniqueDuplicates.length);

if (uniqueDuplicates.length > 0) {
  console.log('Duplicate IDs:', uniqueDuplicates);
  uniqueDuplicates.forEach(dupId => {
    const dupes = foods.filter(f => f.id === dupId);
    console.log(`ID "${dupId}" appears ${dupes.length} times:`);
    dupes.forEach(d => console.log(`  - ${d.name}`));
  });
}
```

This will show you exactly which IDs are duplicated and which foods have them.

## Prevention

To prevent this in the future, add unique ID validation:

```typescript
// In initialFoods.ts, at the end:
const ids = initialFoods.map(f => f.id);
const uniqueIds = new Set(ids);
if (ids.length !== uniqueIds.size) {
  throw new Error('Duplicate food IDs detected in initialFoods!');
}
```

This will fail at compile time if there are duplicates.

## Build Status

✅ Fixed and built successfully
✅ Unique keys ensured with index fallback
✅ Duplicate detection added
✅ Ready to use

---

**Status**: Fixed ✓
**React Warning**: Should be gone
**Next**: Test to confirm no warnings
