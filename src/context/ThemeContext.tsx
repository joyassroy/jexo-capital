"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      // Admin dashboard is always dark
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
        setThemeState("dark");
        applyTheme("dark");
        return;
      }
      const saved = localStorage.getItem("zexo_theme") as Theme | null;
      // Initial default theme is White / Light mode unless explicitly switched to dark by the user
      const initialTheme: Theme = saved === "dark" ? "dark" : "light";
      setThemeState(initialTheme);
      applyTheme(initialTheme);
    } catch {
      applyTheme("light");
    }
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    const body = document.body;

    // Never apply light mode inside admin panel
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      root.classList.remove("light");
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      body.classList.remove("light");
      body.classList.add("dark");
      return;
    }

    if (t === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
      root.setAttribute("data-theme", "light");
      body.classList.remove("dark");
      body.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      body.classList.remove("light");
      body.classList.add("dark");
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("zexo_theme", newTheme);
    } catch {}
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
