import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper";
import { Provider as ReduxProvider } from "react-redux";
import * as Font from "expo-font";
import { SafeAreaView } from "react-native-safe-area-context";

import store from "./app/redux/store";
import StackNavigator from "./app/Navigations/StackNavigator";
import ToastComponent from "./app/Config/Toast";
import themeContext from "./app/constants/themeContext";
import { LightTheme, CustomDarkTheme } from "./app/constants/CustomTheme";
import NotificationProvider from "./app/Services/NotificationProvider";
import { FONTS } from "./app/constants/theme";

export default function App() {
  const [darkTheme, setDarkTheme] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const toggleTheme = () => setDarkTheme((prev) => !prev);

  // Load fonts on app start
  useEffect(() => {
    async function loadFontsAsync() {
      await Font.loadAsync({
        TrajanProBold: require("./app/assets/fonts/TrajanPro-Bold.otf"),
        TrajanProRegular: require("./app/assets/fonts/TrajanPro-Regular.ttf"),
        DancingScript: require("./app/assets/fonts/DancingScript.ttf"),
        DMSerif: require("./app/assets/fonts/DMSerif.ttf"),
      });
      setFontsLoaded(true);
    }
    loadFontsAsync();
  }, []);

  // Show a simple loading spinner while fonts load
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ReduxProvider store={store}>
      <themeContext.Provider value={{ darkTheme, toggleTheme }}>
        <PaperProvider theme={{ ...LightTheme, fonts: { regular: FONTS.body.fontFamily } }}>
          <SafeAreaView style={{ flex: 1 }}>
            <NavigationContainer theme={darkTheme ? CustomDarkTheme : LightTheme}>
              <NotificationProvider />
              <ToastComponent />
              <StackNavigator />
            </NavigationContainer>
          </SafeAreaView>
        </PaperProvider>
      </themeContext.Provider>
    </ReduxProvider>
  );
}
