# Debug: Searchable Dropdown Not Showing Oil

## Steps to Debug

### 1. Check Browser Console
Open the app and navigate to Recipes → Create Recipe. Then:

1. Open browser console (F12 or Cmd+Option+I on Mac)
2. Look for these debug messages:
   ```
   RecipeBuilder - Foods available: 200+ (should be around 200)
   RecipeBuilder - Oil foods: [list of oils]
   ```

### 2. Clear Browser Cache & Storage

The issue might be **old data in localStorage**. Clear it:

**Option A: Clear localStorage (Recommended)**
1. Open browser console (F12)
2. Go to "Application" or "Storage" tab
3. Find "Local Storage" → Select your domain
4. Click "Clear All" or delete entries
5. Refresh the page
6. Log in again

**Option B: Use Browser Incognito/Private Mode**
1. Open incognito/private window
2. Navigate to the app
3. Log in (use anonymous mode)
4. Try creating a recipe

**Option C: Hard Refresh**
- Chrome/Edge: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Firefox: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

### 3. Verify Foods Are Loaded

In the browser console, run:
```javascript
// Check localStorage
JSON.parse(localStorage.getItem('foods-anonymous-user') || '[]').length

// Check if oils exist
JSON.parse(localStorage.getItem('foods-anonymous-user') || '[]')
  .filter(f => f.name.includes('Oil'))
  .map(f => f.name)
```

Expected output: Should show 5 oils (Vegetable, Mustard, Olive, Coconut, Sesame)

### 4. Force Reinitialize Foods

If foods are missing, you can force reinitialize by running in console:
```javascript
localStorage.removeItem('foods-anonymous-user');
location.reload();
```

### 5. Check Network Tab

1. Open Network tab in browser console
2. Navigate to Recipes page
3. Check if there are any failed API calls

## Common Issues

### Issue 1: Old LocalStorage Data
**Symptoms**: Foods array is empty or has old data
**Solution**: Clear localStorage and reload

### Issue 2: User Not Logged In
**Symptoms**: Foods aren't loading at all
**Solution**: Make sure you're logged in (even as anonymous user)

### Issue 3: Browser Cache
**Symptoms**: Old version of component is running
**Solution**: Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

## Quick Fix Script

Run this in browser console to fix immediately:
```javascript
// Clear all food data
Object.keys(localStorage)
  .filter(key => key.startsWith('foods-'))
  .forEach(key => localStorage.removeItem(key));

// Reload page
location.reload();
```

After reload, the app will reinitialize with all 200+ foods including oils.
