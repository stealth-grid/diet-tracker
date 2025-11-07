// Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleAuthConfig) => void;
          renderButton: (parent: HTMLElement, options: GoogleButtonConfig) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
          revoke: (email: string, callback: () => void) => void;
        };
      };
    };
  }
}

interface GoogleAuthConfig {
  client_id: string;
  callback: (response: GoogleAuthResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface GoogleButtonConfig {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  width?: number;
}

interface GoogleAuthResponse {
  credential: string;
  select_by?: string;
}

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}

// Decode JWT token to get user info
export function decodeJWT(token: string): GoogleUser {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      email_verified: payload.email_verified,
    };
  } catch (error) {
    console.error('Error decoding JWT:', error);
    throw new Error('Invalid token');
  }
}

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Load Google Identity Services script
export function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
}
