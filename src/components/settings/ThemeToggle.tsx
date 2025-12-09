import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "~/contexts/ThemeContext";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-2">
      <Label htmlFor="theme-select">Theme</Label>
      <Select value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}>
        <SelectTrigger id="theme-select">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <span>Light</span>
            </div>
          </SelectItem>
          <SelectItem value="dark">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              <span>Dark</span>
            </div>
          </SelectItem>
          <SelectItem value="system">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <span>System</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {theme === 'system' 
          ? 'Automatically matches your system theme preference'
          : `Using ${theme} theme`
        }
      </p>
    </div>
  );
}
