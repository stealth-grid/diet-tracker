# Quick Test: Verify Ingredients Are Working

## Before You Start
1. **Clear your browser cache** (important!)
   - Open browser DevTools (F12)
   - Go to Application → Storage → Local Storage
   - Right-click → Clear
   - **OR** use Incognito/Private mode

2. **Start the app**
   ```bash
   cd diet-tracker
   npm run dev
   ```

## Test Checklist

### ✅ Test 1: Oils Available
1. Open the app
2. Log in (as guest is fine)
3. Go to **Recipes** → **Create Recipe**
4. Click the **ingredient dropdown**
5. Type `"oil"`

**Expected Result**: You should see:
- Vegetable Oil
- Olive Oil
- Mustard Oil
- Coconut Oil
- Sesame Oil

### ✅ Test 2: Spices Available
1. In the same ingredient dropdown
2. Clear the search
3. Type `"spice"` or `"powder"`

**Expected Result**: You should see:
- Turmeric Powder
- Cumin Powder
- Coriander Powder
- Red Chili Powder
- Garam Masala

### ✅ Test 3: Condiments Available
1. Clear the search
2. Type `"sauce"`

**Expected Result**: You should see:
- Soy Sauce
- Tomato Sauce
- BBQ Sauce
- Oyster Sauce
- Hoisin Sauce

### ✅ Test 4: Total Food Count
1. Open browser console (F12)
2. Look for logs like:
   ```
   [FoodInit] Starting initialization...
   [RecipesPage] Foods initialized: XXX from...
   ```
3. The count should be **200+**

### ✅ Test 5: Search Works Smoothly
1. In ingredient dropdown
2. Type `"but"` (partial word)

**Expected Result**: You should see:
- Butter
- Peanut Butter

### ✅ Test 6: Add Food to Intake
1. Go to **Home** tab
2. Click **Add Food**
3. Search for `"oil"`

**Expected Result**: 
- Same 5 oils appear
- Search is instant
- Can select and add

## If Tests Fail

### Problem: No oils/ingredients showing
**Solution**:
```javascript
// In browser console, run:
localStorage.clear();
location.reload();
```

### Problem: Foods array is empty
**Check console for**:
```
[FoodInit] ...
```

If you see errors, check:
1. Are you logged in?
2. Is localStorage cleared?
3. Try incognito mode

### Problem: Only some foods visible
**Check in console**:
```javascript
JSON.parse(localStorage.getItem('diet-tracker-anonymous-user-foods')).length
```

Should return 200+. If less, clear and reload.

## Advanced Testing

### Test with Backend (Optional)

If you have the backend running:

1. **Start backend**:
   ```bash
   cd diet-tracker-api
   npm run start:dev
   ```

2. **Log in with Google** (not as guest)

3. **Check backend logs** for:
   ```
   [FoodInit] Using backend mode
   [FoodInit] Backend empty, seeding initial foods...
   ```

4. **Verify database**:
   - Foods should be in MongoDB
   - Count should be 200+

## Expected Console Output

```
[FoodInit] Starting initialization for user: anonymous-user
[FoodInit] Mode: { isAnonymous: true, hasBackendConfigured: false }
[FoodInit] Using localStorage mode
[FoodInit] No foods in localStorage, seeding with 200+ items
[FoodInit] Loaded 200+ foods from localStorage
[RecipesPage] Foods initialized: 200+ from initialized
```

## Success!

If all tests pass:
- ✅ All 200+ foods are loaded
- ✅ Oils, spices, and condiments are searchable
- ✅ Search is fast and responsive
- ✅ Works in recipe builder
- ✅ Works in intake tracker

## Report Issues

If something doesn't work:

1. **Copy console logs** (entire output)
2. **Copy localStorage value**:
   ```javascript
   localStorage.getItem('diet-tracker-anonymous-user-foods')
   ```
3. **Note which test failed**
4. **Share browser and OS info**

---

**Last Updated**: December 2024
**Version**: 1.0
**Status**: Ready for testing
