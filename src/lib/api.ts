import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { FoodItem, IntakeEntry, DailyGoals, DietPreference } from '~/types';

// Use proxy in development, direct URL in production
const API_URL = import.meta.env.DEV 
  ? '/api' // Use Vite proxy in development
  : (import.meta.env.VITE_API_URL || 'http://localhost:3000/api');

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management - Store Google ID token
const TOKEN_KEY = 'diet-tracker-google-token';

export const setAuthToken = (googleIdToken: string) => {
  localStorage.setItem(TOKEN_KEY, googleIdToken);
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${googleIdToken}`;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  delete apiClient.defaults.headers.common['Authorization'];
};

// Initialize token from localStorage
const token = getAuthToken();
if (token) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      removeAuthToken();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  preferences: {
    calorieGoal: number;
    proteinGoal: number;
    dietPreference: DietPreference;
    preferredFoodIds: string[];
  };
}

export const authAPI = {
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
};

// ==================== USER API ====================

export interface UserPreferences {
  calorieGoal?: number;
  proteinGoal?: number;
  dietPreference?: DietPreference;
  preferredFoodIds?: string[];
}

export const userAPI = {
  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/users/profile');
    return response.data;
  },

  async updatePreferences(preferences: UserPreferences): Promise<User> {
    const response = await apiClient.patch<User>('/users/preferences', preferences);
    return response.data;
  },

  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete('/users/account');
    return response.data;
  },
};

// ==================== FOOD API ====================

export interface CreateFoodDTO {
  id?: string;
  name: string;
  proteinPer100g: number;
  caloriesPer100g: number;
  foodType: 'veg' | 'egg' | 'non-veg';
  category?: string;
}

export interface UpdateFoodDTO {
  name?: string;
  proteinPer100g?: number;
  caloriesPer100g?: number;
  foodType?: 'veg' | 'egg' | 'non-veg';
}

export const foodAPI = {
  async getAll(dietPreference?: DietPreference): Promise<FoodItem[]> {
    const params = dietPreference ? { dietPreference } : {};
    const response = await apiClient.get<FoodItem[]>('/foods', { params });
    return response.data;
  },

  async getById(id: string): Promise<FoodItem> {
    const response = await apiClient.get<FoodItem>(`/foods/${id}`);
    return response.data;
  },

  async create(food: CreateFoodDTO): Promise<FoodItem> {
    const response = await apiClient.post<FoodItem>('/foods', food);
    return response.data;
  },

  async update(id: string, food: UpdateFoodDTO): Promise<FoodItem> {
    const response = await apiClient.patch<FoodItem>(`/foods/${id}`, food);
    return response.data;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/foods/${id}`);
    return response.data;
  },

  async bulkCreate(foods: CreateFoodDTO[]): Promise<{ message: string; count: number; created: number }> {
    const response = await apiClient.post<{ message: string; count: number; created: number }>('/foods/bulk-create', foods);
    return response.data;
  },
};

// ==================== INTAKE API ====================

export interface CreateIntakeDTO {
  foodId: string;
  foodName: string;
  foodType: string;
  quantity: number;
  protein: number;
  calories: number;
  date: string; // YYYY-MM-DD
}

export interface UpdateIntakeDTO {
  quantity?: number;
  protein?: number;
  calories?: number;
  date?: string;
}

export interface DailyStats {
  date: string;
  totalCalories: number;
  totalProtein: number;
  entries: IntakeEntry[];
}

export interface HistoryStats {
  date: string;
  totalCalories: number;
  totalProtein: number;
  entryCount: number;
}

export const intakeAPI = {
  async getAll(params?: { date?: string; startDate?: string; endDate?: string }): Promise<IntakeEntry[]> {
    const response = await apiClient.get<IntakeEntry[]>('/intake', { params });
    return response.data;
  },

  async getById(id: string): Promise<IntakeEntry> {
    const response = await apiClient.get<IntakeEntry>(`/intake/${id}`);
    return response.data;
  },

  async create(intake: CreateIntakeDTO): Promise<IntakeEntry> {
    const response = await apiClient.post<IntakeEntry>('/intake', intake);
    return response.data;
  },

  async update(id: string, intake: UpdateIntakeDTO): Promise<IntakeEntry> {
    const response = await apiClient.patch<IntakeEntry>(`/intake/${id}`, intake);
    return response.data;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/intake/${id}`);
    return response.data;
  },

  async getDailyStats(date?: string): Promise<DailyStats> {
    const params = date ? { date } : {};
    const response = await apiClient.get<DailyStats>('/intake/stats/daily', { params });
    return response.data;
  },

  async getHistory(days: number = 30): Promise<HistoryStats[]> {
    const response = await apiClient.get<HistoryStats[]>('/intake/stats/history', { params: { days } });
    return response.data;
  },
};

// ==================== RECIPE API ====================

export interface RecipeIngredientDTO {
  foodId: string;
  foodName: string;
  quantity: number;
  protein: number;
  calories: number;
  foodType: string;
}

export interface CreateRecipeDTO {
  id?: string; // Optional for frontend-generated IDs
  name: string;
  description?: string;
  ingredients: RecipeIngredientDTO[];
  servings: number;
  prepTime?: number;
  cookTime?: number;
  instructions?: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
  totalCalories: number;
  totalProtein: number;
  caloriesPerServing: number;
  proteinPerServing: number;
  foodType: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface UpdateRecipeDTO {
  name?: string;
  description?: string;
  ingredients?: RecipeIngredientDTO[];
  servings?: number;
  prepTime?: number;
  cookTime?: number;
  instructions?: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
  totalCalories?: number;
  totalProtein?: number;
  caloriesPerServing?: number;
  proteinPerServing?: number;
  foodType?: string;
}

export interface RecipeStats {
  totalRecipes: number;
  byCategory: Record<string, number>;
  byFoodType: Record<string, number>;
  avgCaloriesPerServing: number;
  avgProteinPerServing: number;
}

export const recipeAPI = {
  async getAll(params?: { category?: string; foodType?: string; search?: string }): Promise<any[]> {
    const response = await apiClient.get('/recipes', { params });
    return response.data;
  },

  async getById(id: string): Promise<any> {
    const response = await apiClient.get(`/recipes/${id}`);
    return response.data;
  },

  async create(recipe: CreateRecipeDTO): Promise<any> {
    const response = await apiClient.post('/recipes', recipe);
    return response.data;
  },

  async update(id: string, recipe: UpdateRecipeDTO): Promise<any> {
    const response = await apiClient.patch(`/recipes/${id}`, recipe);
    return response.data;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/recipes/${id}`);
    return response.data;
  },

  async getStats(): Promise<RecipeStats> {
    const response = await apiClient.get<RecipeStats>('/recipes/stats');
    return response.data;
  },

  async duplicate(id: string, newName: string): Promise<any> {
    const response = await apiClient.post(`/recipes/${id}/duplicate`, { newName });
    return response.data;
  },
};

// ==================== HEALTH CHECK ====================

export const healthAPI = {
  async check(): Promise<{ status: string; database: string }> {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default apiClient;
