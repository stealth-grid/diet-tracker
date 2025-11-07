# Hybrid Mode Implementation Guide

## 🎯 Overview

This guide explains how to implement the hybrid architecture allowing users to choose between:
- **Anonymous Mode**: localStorage only (existing functionality)
- **Authenticated Mode**: Cloud sync with MongoDB (new functionality)

---

## 📋 Implementation Phases

### Phase 1: Backend Setup ✅
- [x] NestJS project created (`diet-tracker-api`)
- [x] Mongoose integrated with MongoDB
- [x] Schemas created (User, Food, Intake)
- [x] CORS and validation configured
- [ ] Auth module implementation
- [ ] CRUD modules implementation

### Phase 2: Frontend - Storage Abstraction
- [ ] Create storage adapter interface
- [ ] Refactor existing localStorage code to adapter
- [ ] Create API adapter for backend calls
- [ ] Implement storage context

### Phase 3: Frontend - Mode Selection
- [ ] Create mode selection screen
- [ ] Implement mode persistence
- [ ] Add mode switcher in settings
- [ ] Migration utilities

### Phase 4: Testing & Polish
- [ ] Test both modes independently
- [ ] Test mode switching
- [ ] Test data migration
- [ ] UI/UX improvements

---

## 🔨 Step-by-Step Implementation

### Step 1: Create Storage Adapter Interface

```typescript
// frontend/src/lib/storage/storage-adapter.interface.ts
export interface StorageAdapter {
  // Foods
  getFoods(userId?: string): Promise<FoodItem[]>;
  addFood(userId: string, food: FoodItem): Promise<FoodItem>;
  updateFood(userId: string, foodId: string, updates: Partial<FoodItem>): Promise<FoodItem>;
  deleteFood(userId: string, foodId: string): Promise<void>;

  // Intake
  getIntakeByDate(userId: string, date: string): Promise<IntakeEntry[]>;
  addIntake(userId: string, intake: IntakeEntry): Promise<IntakeEntry>;
  updateIntake(userId: string, intakeId: string, updates: Partial<IntakeEntry>): Promise<IntakeEntry>;
  deleteIntake(userId: string, intakeId: string): Promise<void>;
  getDailyStats(userId: string, date: string): Promise<DailyStats>;

  // Preferences
  getPreferences(userId: string): Promise<UserPreferences>;
  updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences>;
}

export interface UserPreferences {
  calorieGoal: number;
  proteinGoal: number;
  dietPreference: DietPreference;
  preferredFoodIds: string[];
}

export interface DailyStats {
  date: string;
  totalCalories: number;
  totalProtein: number;
  entries: IntakeEntry[];
}
```

### Step 2: Refactor localStorage to Adapter

```typescript
// frontend/src/lib/storage/localStorage-adapter.ts
import { StorageAdapter } from './storage-adapter.interface';

export class LocalStorageAdapter implements StorageAdapter {
  private getUserKey(userId: string, suffix: string): string {
    return `diet-tracker-${userId}-${suffix}`;
  }

  async getFoods(userId: string): Promise<FoodItem[]> {
    const key = this.getUserKey(userId, 'foods');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  async addFood(userId: string, food: FoodItem): Promise<FoodItem> {
    const foods = await this.getFoods(userId);
    foods.push(food);
    const key = this.getUserKey(userId, 'foods');
    localStorage.setItem(key, JSON.stringify(foods));
    return food;
  }

  async updateFood(userId: string, foodId: string, updates: Partial<FoodItem>): Promise<FoodItem> {
    const foods = await this.getFoods(userId);
    const index = foods.findIndex(f => f.id === foodId);
    if (index === -1) throw new Error('Food not found');
    
    foods[index] = { ...foods[index], ...updates };
    const key = this.getUserKey(userId, 'foods');
    localStorage.setItem(key, JSON.stringify(foods));
    return foods[index];
  }

  async deleteFood(userId: string, foodId: string): Promise<void> {
    const foods = await this.getFoods(userId);
    const filtered = foods.filter(f => f.id !== foodId);
    const key = this.getUserKey(userId, 'foods');
    localStorage.setItem(key, JSON.stringify(filtered));
  }

  async getIntakeByDate(userId: string, date: string): Promise<IntakeEntry[]> {
    const key = this.getUserKey(userId, 'intake');
    const data = localStorage.getItem(key);
    const allEntries: IntakeEntry[] = data ? JSON.parse(data) : [];
    return allEntries.filter(e => e.date === date);
  }

  async addIntake(userId: string, intake: IntakeEntry): Promise<IntakeEntry> {
    const key = this.getUserKey(userId, 'intake');
    const data = localStorage.getItem(key);
    const entries: IntakeEntry[] = data ? JSON.parse(data) : [];
    entries.push(intake);
    localStorage.setItem(key, JSON.stringify(entries));
    return intake;
  }

  async updateIntake(userId: string, intakeId: string, updates: Partial<IntakeEntry>): Promise<IntakeEntry> {
    const key = this.getUserKey(userId, 'intake');
    const data = localStorage.getItem(key);
    const entries: IntakeEntry[] = data ? JSON.parse(data) : [];
    const index = entries.findIndex(e => e.id === intakeId);
    if (index === -1) throw new Error('Intake not found');
    
    entries[index] = { ...entries[index], ...updates };
    localStorage.setItem(key, JSON.stringify(entries));
    return entries[index];
  }

  async deleteIntake(userId: string, intakeId: string): Promise<void> {
    const key = this.getUserKey(userId, 'intake');
    const data = localStorage.getItem(key);
    const entries: IntakeEntry[] = data ? JSON.parse(data) : [];
    const filtered = entries.filter(e => e.id !== intakeId);
    localStorage.setItem(key, JSON.stringify(filtered));
  }

  async getDailyStats(userId: string, date: string): Promise<DailyStats> {
    const entries = await this.getIntakeByDate(userId, date);
    const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);
    const totalProtein = entries.reduce((sum, e) => sum + e.protein, 0);
    
    return {
      date,
      totalCalories,
      totalProtein,
      entries,
    };
  }

  async getPreferences(userId: string): Promise<UserPreferences> {
    const goalsKey = this.getUserKey(userId, 'goals');
    const prefKey = this.getUserKey(userId, 'diet-preference');
    const foodsKey = this.getUserKey(userId, 'preferred-foods');

    const goalsData = localStorage.getItem(goalsKey);
    const prefData = localStorage.getItem(prefKey);
    const foodsData = localStorage.getItem(foodsKey);

    const goals = goalsData ? JSON.parse(goalsData) : { calorieGoal: 2000, proteinGoal: 50 };
    const dietPreference = prefData ? JSON.parse(prefData) : 'non-vegetarian';
    const preferredFoodIds = foodsData ? JSON.parse(foodsData) : [];

    return {
      calorieGoal: goals.calorieGoal,
      proteinGoal: goals.proteinGoal,
      dietPreference,
      preferredFoodIds,
    };
  }

  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const current = await this.getPreferences(userId);
    const updated = { ...current, ...preferences };

    const goalsKey = this.getUserKey(userId, 'goals');
    const prefKey = this.getUserKey(userId, 'diet-preference');
    const foodsKey = this.getUserKey(userId, 'preferred-foods');

    localStorage.setItem(goalsKey, JSON.stringify({
      calorieGoal: updated.calorieGoal,
      proteinGoal: updated.proteinGoal,
    }));
    localStorage.setItem(prefKey, JSON.stringify(updated.dietPreference));
    localStorage.setItem(foodsKey, JSON.stringify(updated.preferredFoodIds));

    return updated;
  }
}
```

### Step 3: Create API Adapter

```typescript
// frontend/src/lib/storage/api-adapter.ts
import { StorageAdapter } from './storage-adapter.interface';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  }

  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }
}

export class ApiAdapter implements StorageAdapter {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient();
  }

  async getFoods(userId?: string): Promise<FoodItem[]> {
    return this.client.request('/foods');
  }

  async addFood(userId: string, food: FoodItem): Promise<FoodItem> {
    return this.client.request('/foods', {
      method: 'POST',
      body: JSON.stringify(food),
    });
  }

  async updateFood(userId: string, foodId: string, updates: Partial<FoodItem>): Promise<FoodItem> {
    return this.client.request(`/foods/${foodId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteFood(userId: string, foodId: string): Promise<void> {
    await this.client.request(`/foods/${foodId}`, {
      method: 'DELETE',
    });
  }

  async getIntakeByDate(userId: string, date: string): Promise<IntakeEntry[]> {
    return this.client.request(`/intake?date=${date}`);
  }

  async addIntake(userId: string, intake: IntakeEntry): Promise<IntakeEntry> {
    return this.client.request('/intake', {
      method: 'POST',
      body: JSON.stringify(intake),
    });
  }

  async updateIntake(userId: string, intakeId: string, updates: Partial<IntakeEntry>): Promise<IntakeEntry> {
    return this.client.request(`/intake/${intakeId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteIntake(userId: string, intakeId: string): Promise<void> {
    await this.client.request(`/intake/${intakeId}`, {
      method: 'DELETE',
    });
  }

  async getDailyStats(userId: string, date: string): Promise<DailyStats> {
    return this.client.request(`/intake/stats/daily?date=${date}`);
  }

  async getPreferences(userId: string): Promise<UserPreferences> {
    const user = await this.client.request<any>('/auth/me');
    return user.preferences;
  }

  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const user = await this.client.request<any>('/users/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
    return user.preferences;
  }
}
```

### Step 4: Create Storage Context

```typescript
// frontend/src/contexts/StorageContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { StorageAdapter } from '~/lib/storage/storage-adapter.interface';
import { LocalStorageAdapter } from '~/lib/storage/localStorage-adapter';
import { ApiAdapter } from '~/lib/storage/api-adapter';

interface StorageContextType {
  storage: StorageAdapter | null;
  mode: 'anonymous' | 'authenticated' | null;
}

const StorageContext = createContext<StorageContextType>({
  storage: null,
  mode: null,
});

export function StorageProvider({ children }: { children: ReactNode }) {
  const [storage, setStorage] = useState<StorageAdapter | null>(null);
  const [mode, setMode] = useState<'anonymous' | 'authenticated' | null>(null);

  useEffect(() => {
    const savedMode = localStorage.getItem('app-mode') as 'anonymous' | 'authenticated' | null;
    
    if (savedMode === 'anonymous') {
      setStorage(new LocalStorageAdapter());
      setMode('anonymous');
    } else if (savedMode === 'authenticated') {
      setStorage(new ApiAdapter());
      setMode('authenticated');
    }
  }, []);

  return (
    <StorageContext.Provider value={{ storage, mode }}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context.storage) {
    throw new Error('useStorage must be used within StorageProvider and mode must be set');
  }
  return context.storage;
}

export function useAppMode() {
  const context = useContext(StorageContext);
  return context.mode;
}
```

### Step 5: Create Mode Selection Screen

```typescript
// frontend/src/components/auth/ModeSelectionPage.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Utensils, Cloud, HardDrive } from 'lucide-react';

interface ModeSelectionPageProps {
  onModeSelected: (mode: 'anonymous' | 'authenticated') => void;
}

export function ModeSelectionPage({ onModeSelected }: ModeSelectionPageProps) {
  const selectMode = (mode: 'anonymous' | 'authenticated') => {
    localStorage.setItem('app-mode', mode);
    onModeSelected(mode);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-4">
            <Utensils className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Diet Tracker</h1>
          <p className="text-muted-foreground">
            Choose how you want to use the app
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Anonymous Mode */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => selectMode('anonymous')}>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <HardDrive className="h-8 w-8 text-blue-600" />
                <CardTitle>Use Anonymously</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Quick start without login
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-sm">No login required</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-sm">Data stays on your device</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-sm">Complete privacy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-sm">Works offline</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">
                Start Without Login
              </Button>
            </CardContent>
          </Card>

          {/* Authenticated Mode */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-primary" onClick={() => selectMode('authenticated')}>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Cloud className="h-8 w-8 text-primary" />
                <CardTitle>Sign In with Google</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Cloud sync & multi-device access
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-sm">Access from any device</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-sm">Automatic cloud backup</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-sm">Never lose your data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-sm">Sync across devices</span>
                </li>
              </ul>
              <Button className="w-full">
                Sign In with Google
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          You can change this later in settings
        </p>
      </div>
    </div>
  );
}
```

### Step 6: Update Main App Component

```typescript
// frontend/src/App.tsx
import { useState, useEffect } from 'react';
import { ModeSelectionPage } from '~/components/auth/ModeSelectionPage';
import { LoginPage } from '~/components/auth/LoginPage';
import { useAuth } from '~/contexts/AuthContext';
import { StorageProvider } from '~/contexts/StorageContext';
import { MainApp } from '~/components/MainApp';

function App() {
  const [appMode, setAppMode] = useState<'anonymous' | 'authenticated' | null>(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    const savedMode = localStorage.getItem('app-mode') as 'anonymous' | 'authenticated' | null;
    setAppMode(savedMode);
  }, []);

  // Show mode selection if not chosen yet
  if (!appMode) {
    return <ModeSelectionPage onModeSelected={setAppMode} />;
  }

  // Anonymous mode - no login required
  if (appMode === 'anonymous') {
    return (
      <StorageProvider>
        <MainApp userId="anonymous-user" />
      </StorageProvider>
    );
  }

  // Authenticated mode - require login
  if (appMode === 'authenticated') {
    if (loading) {
      return <LoadingScreen />;
    }

    if (!user) {
      return <LoginPage />;
    }

    return (
      <StorageProvider>
        <MainApp userId={user.id} />
      </StorageProvider>
    );
  }

  return null;
}

export default App;
```

---

## 📝 Testing Checklist

### Anonymous Mode Testing
- [ ] Can start app without login
- [ ] Data saves to localStorage
- [ ] Add/edit/delete foods works
- [ ] Add/edit/delete intake works
- [ ] Preferences save correctly
- [ ] Works offline
- [ ] Data persists after refresh

### Authenticated Mode Testing
- [ ] Google login works
- [ ] JWT token saved
- [ ] API calls authenticated
- [ ] CRUD operations work
- [ ] Data syncs to MongoDB
- [ ] Multi-device access works
- [ ] Logout clears session

### Mode Switching Testing
- [ ] Can switch from anonymous to authenticated
- [ ] Data migrates correctly
- [ ] Can switch from authenticated to anonymous
- [ ] Data downloads correctly
- [ ] No data loss during switch

---

## 🚀 Deployment Checklist

### Backend
- [ ] Deploy to Railway/Heroku
- [ ] Configure MongoDB Atlas
- [ ] Set environment variables
- [ ] Test API endpoints
- [ ] Enable CORS for production frontend URL

### Frontend
- [ ] Add `VITE_API_URL` env variable
- [ ] Build with both modes enabled
- [ ] Test mode selection UI
- [ ] Test both modes in production
- [ ] Deploy to Vercel/Netlify

---

## 📊 Success Metrics

- **User Choice**: Mode selection screen works
- **Anonymous Mode**: Works without backend
- **Authenticated Mode**: Full API integration
- **Data Safety**: Migration works without data loss
- **Performance**: No degradation in either mode

---

**Status:** Implementation Guide Ready ✅  
**Next:** Start implementing Phase 2 (Frontend adapters)
