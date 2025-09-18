import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("screen");

export const COLORS = {
  primary: "#C5A572", // Elegant muted gold
  primaryLight: "rgba(197, 165, 114, 0.25)", // Soft gold tint
  secondary: "#8C6C3F", // Rich bronze
  success: "#2E7D32", // Emerald green (success actions)
  danger: "#C62828", // Ruby red (alerts)
  warning: "#E6A93D", // Amber gold
  dark: "#1E1E1E", // Charcoal black
  light: "#FAFAFA", // Light ivory background
  info: "#2E6F95", // Sapphire blue
  white: "#FFFFFF",
  label: "#6E6E6E", // Neutral gray for labels
  backgroundColor: "#FFFFFF",
  black: "#000000",
  notification: "#D4AF37", // Classic gold highlight

  // light theme
  card: "#F9F6F1", // Off-white with a warm tone
  background: "#FFFFFF",
  text: "#2C2C2C", // Deep neutral text
  textLight: "#7C7C7C", // Subtle gray for secondary text
  title: "#1B1B1B", // Rich dark text
  borderColor: "#E0D9CF", // Soft warm border
  input: "#FAF5ED", // Warm ivory for input backgrounds
  placeholder: "rgba(0, 0, 0, 0.5)",
  darkLight: "#4E4E4E", // Muted dark gray

  // dark theme
  darkCard: "#2A2A2A", // Dark elegant background
  darkBackground: "#121212", 
  darkText: "#F5F5F5",
  darkTextLight: "#C5C5C5",
  darkTitle: "#FFFFFF",
  darkBorder: "rgba(255, 255, 255, 0.15)",
  darkInput: "#1E1E1E",
  darkBorderColor: "rgba(255, 255, 255, 0.15)",
  darkPlaceholder: "rgba(255, 255, 255, 0.5)",

  // semantic
  surface: "#FFFFFF",
  surfaceVariant: "#F5EFE6", // Slight warm beige
  outline: "#D6C7B5",
  shadow: "rgba(0, 0, 0, 0.12)",
  overlay: "rgba(0, 0, 0, 0.5)",
};

export const SIZES = {
  fontLg: 16,
  font: 14,
  fontSm: 13,
  fontXs: 12,

  // radius
  radius_sm: 8,
  radius: 12,
  radius_lg: 16,

  // space
  padding: 16,
  margin: 16,

  // Font Sizes
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,

  // App dimensions
  width,
  height,

  container: 800,
};

export const FONTS = {
  fontLg: {
    fontSize: SIZES.fontLg,
    color: COLORS.text,
    lineHeight: 24,
    fontFamily: "DMSerif",
  },
  font: {
    fontSize: SIZES.font,
    color: COLORS.text,
    lineHeight: 20,
    fontFamily: "DMSerif",
  },
  fontSm: {
    fontSize: SIZES.fontSm,
    color: COLORS.text,
    lineHeight: 18,
    fontFamily: "DMSerif",
  },
  fontXs: {
    fontSize: SIZES.fontXs,
    color: COLORS.text,
    lineHeight: 16,
    fontFamily: "DMSerif",
  },
  h1: {
    fontSize: SIZES.h1,
    color: COLORS.title,
    fontFamily: "DMSerif",
    lineHeight: 40,
  },
  h2: {
    fontSize: SIZES.h2,
    color: COLORS.title,
    fontFamily: "DMSerif",
    lineHeight: 36,
  },
  h3: {
    fontSize: SIZES.h3,
    color: COLORS.title,
    fontFamily: "TrajanProBold",
    lineHeight: 32,
  },
  h4: {
    fontSize: SIZES.h4,
    color: COLORS.title,
    fontFamily: "DMSerif",
    lineHeight: 28,
  },
  h5: {
    fontSize: SIZES.h5,
    color: COLORS.title,
    fontFamily: "DMSerif",
    lineHeight: 26,
  },
  h6: {
    fontSize: SIZES.h6,
    color: COLORS.title,
    fontFamily: "DMSerif",
    lineHeight: 24,
  },


  heading: {
    fontFamily: 'TrajanProBold',
    fontWeight: '700',
  },
  subheading: {
    fontFamily: 'DMSerif',
    fontWeight: '500',
  },
  body: {
    fontFamily: 'DancingScript', 
    fontWeight: '400',
  },
  fontBold: { fontFamily: "JostBold" },
  fontMedium: { fontFamily: "JostMedium" },
  fontTitle: { fontFamily: "JostMedium" },
  fontRegular: { fontFamily: "JostRegular" },
  fontSemiBold: { fontFamily: "JostSemiBold" },
  fontLight: { fontFamily: "JostLight" },
  marcellus: { fontFamily: "MarcellusRegular" }
};

export const ICONS = {
	user: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#757575" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#757575" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
	lock: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5 12C4.44772 12 4 12.4477 4 13V20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20V13C20 12.4477 19.5523 12 19 12H5ZM2 13C2 11.3431 3.34315 10 5 10H19C20.6569 10 22 11.3431 22 13V20C22 21.6569 20.6569 23 19 23H5C3.34315 23 2 21.6569 2 20V13Z" fill="#757575"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3C10.9391 3 9.92172 3.42143 9.17157 4.17157C8.42143 4.92172 8 5.93913 8 7V11C8 11.5523 7.55228 12 7 12C6.44772 12 6 11.5523 6 11V7C6 5.4087 6.63214 3.88258 7.75736 2.75736C8.88258 1.63214 10.4087 1 12 1C13.5913 1 15.1174 1.63214 16.2426 2.75736C17.3679 3.88258 18 5.4087 18 7V11C18 11.5523 17.5523 12 17 12C16.4477 12 16 11.5523 16 11V7C16 5.93913 15.5786 4.92172 14.8284 4.17157C14.0783 3.42143 13.0609 3 12 3Z" fill="#757575"/></svg>`,
	eyeOpen: `<svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M23.8475 7.43335C23.6331 7.1411 18.5245 0.277466 11.9999 0.277466C5.47529 0.277466 0.366469 7.1411 0.152297 7.43307C-0.0507657 7.71032 -0.0507657 8.08637 0.152297 8.36362C0.366469 8.65587 5.47529 15.5195 11.9999 15.5195C18.5245 15.5195 23.6331 8.65582 23.8475 8.36386C24.0508 8.08665 24.0508 7.71032 23.8475 7.43335ZM11.9999 13.9427C7.19382 13.9427 3.03127 9.38722 1.79907 7.89795C3.02968 6.40737 7.18351 1.85422 11.9999 1.85422C16.8057 1.85422 20.968 6.40896 22.2007 7.89902C20.9701 9.38955 16.8162 13.9427 11.9999 13.9427Z" fill="#757575"/><path d="M11.9998 3.16821C9.38224 3.16821 7.25256 5.29005 7.25256 7.89801C7.25256 10.506 9.38224 12.6278 11.9998 12.6278C14.6174 12.6278 16.7471 10.506 16.7471 7.89801C16.7471 5.29005 14.6174 3.16821 11.9998 3.16821ZM11.9998 11.0512C10.2547 11.0512 8.83502 9.6367 8.83502 7.89801C8.83502 6.15932 10.2547 4.74484 11.9998 4.74484C13.7449 4.74484 15.1646 6.15932 15.1646 7.89801C15.1646 9.6367 13.745 11.0512 11.9998 11.0512Z" fill="#757575"/></svg>`,
	eyeClose: `<svg width="24" height="21" viewBox="0 0 24 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M23.8475 10.4333C23.6331 10.1411 18.5245 3.27747 11.9999 3.27747C5.47529 3.27747 0.366469 10.1411 0.152297 10.4331C-0.0507657 10.7103 -0.0507657 11.0864 0.152297 11.3636C0.366469 11.6559 5.47529 18.5195 11.9999 18.5195C18.5245 18.5195 23.6331 11.6558 23.8475 11.3639C24.0508 11.0866 24.0508 10.7103 23.8475 10.4333ZM11.9999 16.9427C7.19382 16.9427 3.03127 12.3872 1.79907 10.8979C3.02968 9.40737 7.18351 4.85422 11.9999 4.85422C16.8057 4.85422 20.968 9.40896 22.2007 10.899C20.9701 12.3896 16.8162 16.9427 11.9999 16.9427Z" fill="#757575"/><path d="M11.9998 6.16821C9.38224 6.16821 7.25256 8.29005 7.25256 10.898C7.25256 13.506 9.38224 15.6278 11.9998 15.6278C14.6174 15.6278 16.7471 13.506 16.7471 10.898C16.7471 8.29005 14.6174 6.16821 11.9998 6.16821ZM11.9998 14.0512C10.2547 14.0512 8.83502 12.6367 8.83502 10.898C8.83502 9.15932 10.2547 7.74484 11.9998 7.74484C13.7449 7.74484 15.1646 9.15932 15.1646 10.898C15.1646 12.6367 13.745 14.0512 11.9998 14.0512Z" fill="#757575"/><path d="M5 1L18.5 20" stroke="#757575" stroke-width="2"/></svg>`,
	email: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#757575" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 6L12 13L2 6" stroke="#757575" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
}

const appTheme = { COLORS, SIZES, FONTS, ICONS }

export default appTheme;