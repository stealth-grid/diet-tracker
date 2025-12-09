import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Layout } from "~/components/layout/Layout";
import { HomePage } from "~/pages/HomePage";
import { SettingsPage } from "~/pages/SettingsPage";
import { ProfilePage } from "~/pages/ProfilePage";
import { PreferencesPage } from "~/pages/PreferencesPage";
import { LoginPage } from "~/components/auth/LoginPage";
import { useAuth } from "~/contexts/AuthContext";

function App() {
  const { user, loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  // Authenticated users see the app with routing
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="preferences" element={<PreferencesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
