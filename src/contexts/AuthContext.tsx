import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { loadGoogleScript, GOOGLE_CLIENT_ID, type GoogleUser } from '~/lib/googleAuth';
import { authAPI, removeAuthToken, setAuthToken, type User } from '~/lib/api';

interface AuthContextType {
  user: GoogleUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAnonymously: () => void;
  signOut: () => void;
  initialized: boolean;
  userPreferences: User['preferences'] | null;
  refreshUserPreferences: () => Promise<void>;
  isAnonymous: boolean;
  hasBackendConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'diet-tracker-user';
const ANONYMOUS_FLAG_KEY = 'diet-tracker-anonymous';

// Check if backend is configured
const API_URL = import.meta.env.VITE_API_URL;
const HAS_BACKEND = !!API_URL && API_URL.trim() !== '';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [userPreferences, setUserPreferences] = useState<User['preferences'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    // Check for stored user (Google or Anonymous)
    const checkAuth = async () => {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      const isAnon = localStorage.getItem(ANONYMOUS_FLAG_KEY) === 'true';
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          if (isAnon) {
            // Anonymous user - use localStorage only
            setUser(parsedUser);
            setIsAnonymous(true);
            setUserPreferences({
              calorieGoal: 2000,
              proteinGoal: 50,
              dietPreference: 'non-vegetarian',
              preferredFoodIds: [],
            });
          } else {
            // Google user - validate token with backend
            try {
              const backendUser = await authAPI.getCurrentUser();
              setUser({
                id: backendUser.id,
                email: backendUser.email,
                name: backendUser.name,
                picture: backendUser.picture,
                email_verified: true,
              });
              setUserPreferences(backendUser.preferences);
              setIsAnonymous(false);
            } catch (error) {
              // Token invalid or expired, clear storage
              console.error('Failed to validate user with backend:', error);
              localStorage.removeItem(USER_STORAGE_KEY);
              removeAuthToken();
            }
          }
        } catch (error) {
          console.error('Error checking auth:', error);
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Initialize Google Identity Services (only if backend is configured)
  useEffect(() => {
    if (!HAS_BACKEND) {
      // No backend configured - skip Google sign-in setup
      setInitialized(true);
      return;
    }

    if (!GOOGLE_CLIENT_ID) {
      console.error('Google Client ID not found in environment variables');
      setLoading(false);
      return;
    }

    loadGoogleScript()
      .then(() => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          setInitialized(true);
        }
      })
      .catch((error) => {
        console.error('Failed to load Google Identity Services:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleCredentialResponse = async (response: { credential: string }) => {
    try {
      setLoading(true);
      
      // Store Google ID token - backend will verify it on each request
      setAuthToken(response.credential);
      
      // Small delay to ensure token is set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get user data from backend (backend validates Google token and creates/updates user)
      const backendUser = await authAPI.getCurrentUser();
      
      // Set user data
      const userData: GoogleUser = {
        id: backendUser.id,
        email: backendUser.email,
        name: backendUser.name,
        picture: backendUser.picture,
        email_verified: true,
      };
      
      setUser(userData);
      setUserPreferences(backendUser.preferences);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } catch (error: any) {
      console.error('Error processing Google sign-in:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error('Backend error:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('Network error - backend may not be running');
      } else {
        console.error('Error details:', error.message);
      }
      
      removeAuthToken();
      
      // Show user-friendly error
      alert('Failed to sign in. Please check:\n1. Backend is running on port 3000\n2. Ad blockers are disabled\n3. Network connection is working');
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!window.google?.accounts?.id) {
      throw new Error('Google Identity Services not loaded');
    }
    
    // This will be called from a button click, so we don't need to do anything here
    // The button will handle the sign-in flow
    return Promise.resolve();
  };

  const signInAnonymously = () => {
    // Generate a random anonymous user ID
    const anonymousId = 'anon_' + Math.random().toString(36).substring(2, 15);
    
    const anonymousUser: GoogleUser = {
      id: anonymousId,
      email: 'anonymous@local',
      name: 'Anonymous User',
      picture: '',
      email_verified: false,
    };
    
    setUser(anonymousUser);
    setIsAnonymous(true);
    setUserPreferences({
      calorieGoal: 2000,
      proteinGoal: 50,
      dietPreference: 'non-vegetarian',
      preferredFoodIds: [],
    });
    
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(anonymousUser));
    localStorage.setItem(ANONYMOUS_FLAG_KEY, 'true');
  };

  const signOut = () => {
    if (user && !isAnonymous) {
      // Disable auto-select for Google Sign-In
      if (user.email && window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }
    }
    
    // Clear all auth state
    setUser(null);
    setUserPreferences(null);
    setIsAnonymous(false);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(ANONYMOUS_FLAG_KEY);
    removeAuthToken();
  };

  const refreshUserPreferences = async () => {
    if (isAnonymous) {
      // For anonymous users, preferences are loaded from localStorage
      // This is handled in App.tsx
      return;
    }
    
    try {
      const backendUser = await authAPI.getCurrentUser();
      setUserPreferences(backendUser.preferences);
    } catch (error) {
      console.error('Failed to refresh user preferences:', error);
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInAnonymously,
    signOut,
    initialized,
    userPreferences,
    refreshUserPreferences,
    isAnonymous,
    hasBackendConfigured: HAS_BACKEND,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
