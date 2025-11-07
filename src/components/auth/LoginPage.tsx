import { useEffect, useRef } from 'react';
import { Utensils, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { useAuth } from '~/contexts/AuthContext';
import { GOOGLE_CLIENT_ID } from '~/lib/googleAuth';

export function LoginPage() {
  const { initialized } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialized && buttonRef.current && window.google?.accounts?.id) {
      // Render Google Sign-In button
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: 320,
      });
    }
  }, [initialized]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-600">Configuration Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-semibold mb-2">Google Client ID not configured</p>
              <p>Please set up your Google OAuth credentials:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Create a project in Google Cloud Console</li>
                <li>Enable Google Sign-In</li>
                <li>Create OAuth 2.0 credentials</li>
                <li>Add your Client ID to .env file</li>
              </ol>
              <p className="mt-3 text-xs">See GOOGLE-AUTH-SETUP.md for detailed instructions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
            <Utensils className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Welcome to Diet Tracker</CardTitle>
            <CardDescription className="mt-2">
              Track your nutrition, plan your meals, and achieve your health goals
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Google Sign-In Button Container */}
            <div className="flex justify-center">
              {!initialized ? (
                <div className="flex items-center justify-center h-[44px]">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <div ref={buttonRef} className="google-signin-button" />
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="text-xs text-muted-foreground space-y-2">
              <p className="font-semibold">Features:</p>
              <ul className="space-y-1 pl-4">
                <li>• Track daily food intake and nutrition</li>
                <li>• Set personalized calorie and protein goals</li>
                <li>• Get AI-powered meal plan suggestions</li>
                <li>• Manage custom food database</li>
                <li>• Choose your preferred foods for meal plans</li>
                <li>• Export and import your data</li>
              </ul>
            </div>
          </div>

          <div className="text-xs text-center text-muted-foreground pt-2">
            <p>By signing in, you agree to use Google Sign-In</p>
            <p>Your data is stored locally in your browser</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
