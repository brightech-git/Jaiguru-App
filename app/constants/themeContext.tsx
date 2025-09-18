// app/constants/themeContext.tsx
import React, { createContext, useState } from "react";
import { DefaultTheme, DarkTheme } from "@react-navigation/native";

interface ThemeContextType {
  theme: typeof DefaultTheme | typeof DarkTheme;
  setDarkTheme: () => void;
  setLightTheme: () => void;
}

export const themeContext = createContext<ThemeContextType>({
  theme: DefaultTheme,
  setDarkTheme: () => {},
  setLightTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState(DefaultTheme);

  const setDarkTheme = () => setTheme(DarkTheme);
  const setLightTheme = () => setTheme(DefaultTheme);

  return (
    <themeContext.Provider value={{ theme, setDarkTheme, setLightTheme }}>
      {children}
    </themeContext.Provider>
  );
};

export default themeContext;
