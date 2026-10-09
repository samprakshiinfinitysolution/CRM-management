"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  mounted: boolean;
}

const STORAGE_KEY = "leadflow-theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);

  return () => {
    window.removeEventListener("storage", callback);
    media.removeEventListener("change", callback);
  };
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const val = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (val === "light" || val === "dark" || val === "system") {
      return val;
    }
  } catch {
    // Ignore storage access errors
  }
  return "system";
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const theme = useSyncExternalStore(
    subscribe,
    getStoredTheme,
    () => defaultTheme
  );

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const resolvedTheme: ResolvedTheme =
    theme === "dark" || (theme === "system" && getSystemTheme() === "dark")
      ? "dark"
      : "light";

  // Synchronize DOM with the current resolved theme
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
      root.style.colorScheme = "light";
    }
  }, [resolvedTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
      // Dispatch storage event so all subscribers and tabs update immediately
      window.dispatchEvent(new Event("storage"));
    } catch {
      // Ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const currentStored = getStoredTheme();
    const currentResolved =
      currentStored === "system" ? getSystemTheme() : currentStored;
    const nextTheme: Theme = currentResolved === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  }, [setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        mounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: "system",
      resolvedTheme: "light",
      setTheme: () => {},
      toggleTheme: () => {},
      mounted: false,
    };
  }
  return context;
}
