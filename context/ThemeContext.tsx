"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext({
  darkMode: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: any) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const saved = await AsyncStorage.getItem("themeMode");
    if (saved === "dark") setDarkMode(true);
  };

  const toggleTheme = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    await AsyncStorage.setItem("themeMode", newMode ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => useContext(ThemeContext);