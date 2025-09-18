// app/components/ThemeBtn.tsx
import React from "react";
import { useTheme } from "@react-navigation/native";
import { Image, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { COLORS } from "../constants/theme";
import themeContext from "../constants/themeContext";
import { IMAGES } from "../constants/Images";

const ThemeBtn = () => {
  const theme = useTheme();
  const { colors }: { colors: any } = theme;
  const { toggleTheme } = React.useContext(themeContext);

  const offset = useSharedValue(theme.dark ? 34 : 0);
  const opacityDark = useSharedValue(theme.dark ? 1 : 0);
  const opacityLight = useSharedValue(theme.dark ? 0 : 1);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  React.useEffect(() => {
    if (theme.dark) {
      offset.value = withSpring(34);
      opacityDark.value = withTiming(1);
      opacityLight.value = withTiming(0);
    } else {
      offset.value = withSpring(0);
      opacityLight.value = withTiming(1);
      opacityDark.value = withTiming(0);
    }
  }, [theme.dark]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={toggleTheme}
      style={{
        height: 34,
        width: 68,
        borderRadius: 17,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.dark ? colors.card : "#EAEAEA",
      }}
    >
      <Animated.View
        style={[
          animatedStyles,
          {
            height: 28,
            width: 28,
            borderRadius: 14,
            backgroundColor: COLORS.primary,
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            top: 3,
            left: 3,
          },
        ]}
      />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Image
          source={IMAGES.sun}
          style={{
            height: 18,
            width: 18,
            tintColor: COLORS.white,
          }}
        />
      </View>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Image
          source={IMAGES.moon}
          style={{
            height: 18,
            width: 18,
            tintColor: theme.dark ? COLORS.white : COLORS.title,
          }}
        />
      </View>
    </TouchableOpacity>
  );
};

export default ThemeBtn;
