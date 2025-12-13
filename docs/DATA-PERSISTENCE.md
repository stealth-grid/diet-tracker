# Data Persistence & User Logout Behavior

## 📌 Key Principle

**User data is ALWAYS preserved, even after logout.**

---

## ✅ What Happens on Logout

When a user clicks "Sign out":

1. **User session is cleared**
   - React context state: `user = null`
   - App returns to login screen

2. **Authentication token removed**
   - localStorage: `diet-tracker-user` is deleted

3. **Google auto-select disabled**
   - Prevents automatic re-login

### **What is NOT Deleted**

✅ **All user data remains in localStorage:**

```
diet-tracker-{userId}-foods            ← PRESERVED
diet-tracker-{userId}-intake           ← PRESERVED  
diet-tracker-{userId}-goals            ← PRESERVED
diet-tracker-{userId}-diet-preference  ← PRESERVED
diet-tracker-{userId}-preferred-foods  ← PRESERVED
```

---

## 🔄 Sign In Again Behavior

When a user signs back in with the same Google account:

1. **User ID is the same** (from Google's JWT token)
2. **App loads their data** from localStorage
3. **Everything is restored:**
   - ✅ Custom food items
   - ✅ Intake history (all days)
   - ✅ Goals and preferences
   - ✅ Diet preference (veg/non-veg)
   - ✅ Preferred foods for meal planner

**Result:** User sees all their data exactly as they left it! 🎉

---

## 🗑️ When Data IS Deleted

### **clearUserData() Function**

This function exists but is **NOT called on logout**:

```typescript
// src/lib/storage.ts
export const clearUserData = (userId: string): void => {
  // Removes ALL data for a specific user
}
```

### **Future Use Cases:**

1. **Delete Account Feature** (not yet implemented)
   ```typescript
   const handleDeleteAccount = () => {
     if (confirm("Delete all your data permanently?")) {
       clearUserData(user.id);
       signOut();
     }
   };
   ```

2. **Clear Data in Settings** (could be added)
   ```typescript
   const handleClearMyData = () => {
     if (confirm("This will delete all your intake and food data!")) {
       clearUserData(user.id);
       // Reinitialize with default data
     }
   };
   ```

---

## 🧪 Testing Data Persistence

### **Test Case 1: Single User**

```
1. Sign in as user@example.com
2. Add custom food: "My Special Meal"
3. Add intake entry for today
4. Set calorie goal to 2500
5. Sign out
6. Close browser
7. Reopen browser
8. Sign in as user@example.com again
9. ✅ Should see "My Special Meal"
10. ✅ Should see intake entry
11. ✅ Goal should be 2500
```

### **Test Case 2: Multiple Users**

```
User A Session:
1. Sign in as userA@example.com
2. Add food: "A's Meal"
3. Sign out

User B Session:
4. Sign in as userB@example.com
5. Add food: "B's Meal"
6. Sign out

User A Returns:
7. Sign in as userA@example.com
8. ✅ Should see "A's Meal"
9. ✅ Should NOT see "B's Meal"
10. Data is isolated and preserved!
```

---

## 💾 localStorage Inspection

Open browser DevTools → Application → localStorage:

### **After User A Signs In:**
```
diet-tracker-user                         → {"id":"123","email":"userA@..."}
diet-tracker-123-foods                    → [{"id":"1","name":"A's Meal",...}]
diet-tracker-123-intake                   → [...]
diet-tracker-123-goals                    → {"calorieGoal":2500,...}
```

### **After User A Signs Out:**
```
// DELETED:
diet-tracker-user                         → (removed)

// PRESERVED:
diet-tracker-123-foods                    → [{"id":"1","name":"A's Meal",...}]
diet-tracker-123-intake                   → [...]
diet-tracker-123-goals                    → {"calorieGoal":2500,...}
```

### **After User A Signs Back In:**
```
// RESTORED:
diet-tracker-user                         → {"id":"123","email":"userA@..."}

// STILL THERE:
diet-tracker-123-foods                    → [{"id":"1","name":"A's Meal",...}]
diet-tracker-123-intake                   → [...]
diet-tracker-123-goals                    → {"calorieGoal":2500,...}
```

---

## 🔒 Data Isolation

Each user's data is isolated by their Google User ID:

```typescript
// User A's ID from Google JWT
userId: "103849372019384729384"  
Keys: diet-tracker-103849372019384729384-*

// User B's ID from Google JWT  
userId: "298374982374982739847"
Keys: diet-tracker-298374982374982739847-*
```

**Even if both users use the same browser:**
- User A cannot see User B's data
- Each has their own isolated storage
- Data persists independently

---

## 📊 Storage Lifecycle

```
┌─────────────────────────────────────────────┐
│ User Signs In (First Time)                  │
│ - Creates new storage keys                  │
│ - Initializes with default data             │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ User Uses App                                │
│ - Adds foods, logs intake, sets goals       │
│ - Data continuously saved to localStorage   │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ User Signs Out                               │
│ - Auth token removed                         │
│ - Data REMAINS in localStorage              │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ User Signs Back In                           │
│ - Same User ID from Google                  │
│ - App loads existing data                   │
│ - User sees all their previous data         │
└─────────────────────────────────────────────┘
```

---

## ⚠️ Important Considerations

### **Browser Clearing**

User data WILL be lost if:
- User clears browser data/cookies
- User uses incognito mode (data not persisted)
- Browser storage is corrupted
- User reaches localStorage quota (5-10MB)

**Recommendation:** 
- Encourage users to export their data regularly
- Consider adding auto-backup feature
- Add warning before clearing browser data

### **Switching Browsers**

Data is **per-browser**, not cloud-synced:
- Chrome on Desktop: Has its own localStorage
- Safari on iPhone: Has its own localStorage
- Firefox: Has its own localStorage

**Each browser is independent!**

To transfer data between browsers:
1. Export from Browser A (Settings → Data → Export)
2. Sign in on Browser B
3. Import the file (Settings → Data → Import)

---

## 🔐 Security Notes

### **What's Secure:**
- ✅ Data isolated per Google account
- ✅ Same-origin policy (other sites can't access)
- ✅ User must authenticate to see their data

### **What's NOT Secure:**
- ❌ Data stored unencrypted in localStorage
- ❌ Anyone with device access can view localStorage
- ❌ No server-side backup
- ❌ No data recovery if localStorage is cleared

**For Production:**
- Consider encrypting sensitive data
- Add server-side storage option
- Implement automatic backups
- Add data recovery mechanism

---

## 📝 Developer Notes

### **Code Reference:**

**Logout implementation:**
```typescript
// src/contexts/AuthContext.tsx
const signOut = () => {
  if (user) {
    // Disable auto-select for Google Sign-In
    if (user.email && window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  }
  
  // Only clear the auth state, keep user data
  setUser(null);
  localStorage.removeItem(USER_STORAGE_KEY);
  
  // NOTE: We do NOT call clearUserData(user.id) here!
};
```

**Data loading on login:**
```typescript
// src/App.tsx
useEffect(() => {
  if (!user) return;
  
  // Load user's preserved data
  const storedFoods = getFoods(user.id);
  const storedGoals = getGoals(user.id);
  // ... etc
}, [user]);
```

---

## ✅ Summary

### **Current Behavior:**
- ✅ User data persists after logout
- ✅ Users can access their data on return
- ✅ Data isolated per Google account
- ✅ No accidental data loss

### **Benefits:**
- 🎯 Better user experience
- 💾 Data safety by default
- 🔄 Easy to sign out and back in
- 📱 Works offline (localStorage)

### **Future Enhancements:**
- [ ] Add "Delete Account" feature (uses clearUserData)
- [ ] Add "Clear My Data" in settings
- [ ] Add data export reminder before logout
- [ ] Add cloud sync option
- [ ] Add encrypted backup

---

**Version:** 2.0.1 (Data Persistence Fix)  
**Updated:** 2025-11-07  
**Build Status:** ✅ PASSING  
**Behavior:** Data preserved on logout ✨
