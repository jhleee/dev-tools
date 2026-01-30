"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "default" | "warm" | "grayscale";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = "brutal-theme";
const VALID_THEMES: Theme[] = ["default", "warm", "grayscale"];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("default");
  const [mounted, setMounted] = useState(false);

  // Hydration: Read from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (stored && VALID_THEMES.includes(stored)) {
        setThemeState(stored);
        document.documentElement.setAttribute("data-theme", stored);
      } else {
        document.documentElement.setAttribute("data-theme", "default");
      }
    } catch {
      document.documentElement.setAttribute("data-theme", "default");
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    if (!VALID_THEMES.includes(newTheme)) return;

    setThemeState(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // localStorage unavailable (incognito mode)
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  // However, we render children immediately to avoid content flash
  return (
    <ThemeContext.Provider value={{ theme: mounted ? theme : "default", setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
