import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/app/providers/ThemeProvider";
import { Button } from "@/components/ui/Button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-9 px-0"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? (
        <Moon className="h-[1.2rem] w-[1.2rem] text-foreground transition-all" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem] text-foreground transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
