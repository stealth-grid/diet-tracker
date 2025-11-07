import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { loadGoogleScript, decodeJWT, GOOGLE_CLIENT_ID, type GoogleUser } from '~/lib/googleAuth';

interface AuthContextType {
  user: GoogleUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
  initialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'diet-tracker-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Initialize Google Identity Services
  useEffect(() => {
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

  const handleCredentialResponse = (response: { credential: string }) => {
    try {
      const userData = decodeJWT(response.credential);
      setUser(userData);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error processing Google sign-in:', error);
      throw error;
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

  const signOut = () => {
    if (user?.email && window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    initialized,
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
