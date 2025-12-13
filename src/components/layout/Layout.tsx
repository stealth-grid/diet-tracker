import { Outlet, NavLink } from "react-router-dom";
import { Utensils, LogOut, User as UserIcon, Settings, Heart, HardDrive, BarChart3, Home, BookOpen } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ThemeToggleButton } from "~/components/ui/theme-toggle-button";
import { useAuth } from "~/contexts/AuthContext";
import { cn } from "~/lib/utils";

export function Layout() {
  const { user, signOut, isAnonymous, hasBackendConfigured } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Utensils className="h-6 w-6" />
                <h1 className="text-xl font-bold text-foreground">Diet Tracker</h1>
              </div>
              {(isAnonymous || !hasBackendConfigured) && (
                <span className="text-xs bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  Offline
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggleButton />
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name || "User"}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <UserIcon className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <NavLink to="/profile" className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/preferences" className="cursor-pointer">
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Preferences</span>
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="border-t">
          <div className="container mx-auto px-4">
            <nav className="flex gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:text-primary border-b-2",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground"
                  )
                }
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Track</span>
              </NavLink>
              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:text-primary border-b-2",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground"
                  )
                }
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </NavLink>
              <NavLink
                to="/recipes"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:text-primary border-b-2",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground"
                  )
                }
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Recipes</span>
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 max-w-5xl">
        <Outlet />
      </main>

      <footer className="mt-8">
        <div className="border-t border-border"></div>
        <div className="container mx-auto flex items-center justify-center gap-4 p-4">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
            &copy; {new Date().getFullYear()} Diet Tracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
