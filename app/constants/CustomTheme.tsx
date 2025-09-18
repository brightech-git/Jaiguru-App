import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { COLORS } from './theme';

export const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    card: COLORS.card,
    background: COLORS.background,
    text: COLORS.text,
    textLight: COLORS.textLight,
    title: COLORS.title,
    border: COLORS.borderColor,
    input: COLORS.input,
    placeholder: COLORS.placeholder,
    // Additional colors from your theme
    primaryLight: COLORS.primaryLight,
    secondary: COLORS.secondary,
    success: COLORS.success,
    danger: COLORS.danger,
    warning: COLORS.warning,
    dark: COLORS.dark,
    light: COLORS.light,
    info: COLORS.info,
    white: COLORS.white,
    label: COLORS.label,
    backgroundColor: COLORS.backgroundColor,
    black: COLORS.black,
  },
};

export const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.primary,
    card: COLORS.darkCard,
    background: COLORS.darkBackground,
    text: COLORS.darkText,
    textLight: COLORS.darkTextLight,
    title: COLORS.darkTitle,
    border: COLORS.darkBorder,
    input: COLORS.darkInput,
    placeholder: COLORS.darkPlaceholder,
    // Additional colors from your theme
    primaryLight: COLORS.primaryLight,
    secondary: COLORS.secondary,
    success: COLORS.success,
    danger: COLORS.danger,
    warning: COLORS.warning,
    dark: COLORS.dark,
    light: COLORS.light,
    info: COLORS.info,
    white: COLORS.white,
    label: COLORS.label,
    backgroundColor: COLORS.darkBackground,
    black: COLORS.black,
    // Dark theme specific colors
    darkBorderColor: COLORS.darkborderColor,
  },
};

// Export individual theme objects for easy access
export const themes = {
  light: LightTheme,
  dark: CustomDarkTheme,
};

// Theme context helper (optional)
export const getTheme = (isDark = false) => {
  return isDark ? CustomDarkTheme : LightTheme;
};