import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Layout } from "~/components/layout/Layout";
import { HomePage } from "~/pages/HomePage";
import { AnalyticsPage } from "~/pages/AnalyticsPage";
import { RecipesPage } from "~/pages/RecipesPage";
import { SettingsPage } from "~/pages/SettingsPage";
import { ProfilePage } from "~/pages/ProfilePage";
import { PreferencesPage } from "~/pages/PreferencesPage";
import { LoginPage } from "~/pages/LoginPage";
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

  return (
    <Routes>
      {/* Public route - Login page */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />

      {/* Protected routes - Require authentication */}
      <Route
        path="/"
        element={user ? <Layout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<HomePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="recipes" element={<RecipesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="preferences" element={<PreferencesPage />} />
      </Route>

      {/* Catch all - redirect to login or home based on auth status */}
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
    </Routes>
  );
}

export default App;
