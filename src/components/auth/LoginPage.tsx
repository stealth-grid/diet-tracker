import { useEffect, useRef } from "react";
import { Utensils, User, Cloud, HardDrive } from "lucide-react";
import { useAuth } from "~/contexts/AuthContext";
import { Button } from "~/components/ui/button";

export function LoginPage() {
  const { initialized, signInAnonymously, hasBackendConfigured } = useAuth();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasBackendConfigured && initialized && window.google && googleButtonRef.current) {
      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width: 280,
        }
      );
    }
  }, [initialized, hasBackendConfigured]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Logo and Title */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-primary/10 p-4 rounded-full">
                <Utensils className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Diet Tracker</h1>
              <p className="text-gray-600 mt-2">
                Track your daily nutrition with ease
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
              <p>Track calories and protein intake</p>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
              <p>50+ pre-loaded food items</p>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
              <p>Create custom food database</p>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
              <p>Set and monitor daily goals</p>
            </div>
          </div>

          {/* Sign In Options */}
          <div className="space-y-4">
            {hasBackendConfigured ? (
              <>
                {/* Google Sign In */}
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <div ref={googleButtonRef} />
                  </div>
                  {!initialized && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Loading Google Sign In...</p>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>

                {/* Anonymous Sign In */}
                <Button
                  onClick={signInAnonymously}
                  variant="outline"
                  className="w-full h-11"
                  size="lg"
                >
                  <HardDrive className="mr-2 h-5 w-5" />
                  Continue in Offline Mode
                </Button>
              </>
            ) : (
              <>
                {/* Offline-Only Mode */}
                <div className="text-center space-y-3">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <HardDrive className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Offline Mode</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      App configured to work completely offline
                    </p>
                  </div>
                </div>

                <Button
                  onClick={signInAnonymously}
                  className="w-full h-12"
                  size="lg"
                >
                  <HardDrive className="mr-2 h-5 w-5" />
                  Start Using Diet Tracker
                </Button>
              </>
            )}
          </div>

          {/* Info Notes */}
          {hasBackendConfigured ? (
            <div className="space-y-2 text-xs text-gray-500">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="font-medium text-blue-900 mb-1 flex items-center gap-1">
                  <HardDrive className="h-3 w-3" /> Offline Mode
                </p>
                <p className="text-blue-700">
                  Data stored locally. Works without internet. Not synced.
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="font-medium text-green-900 mb-1 flex items-center gap-1">
                  <Cloud className="h-3 w-3" /> Google Sign In
                </p>
                <p className="text-green-700">
                  Data synced to cloud. Access from any device.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs">
              <p className="font-medium text-amber-900 mb-1">📱 Offline-Only Mode</p>
              <p className="text-amber-700">
                All data is stored locally in your browser. No backend connection required.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
