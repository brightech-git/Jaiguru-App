import React, { useRef, useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  SafeAreaView,
  Dimensions,
  Platform,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS, FONTS, SIZES } from "../../constants/theme";

const { width, height } = Dimensions.get("window");

const GetStartedScreen = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(translateX, {
        toValue: -width,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        setStep(2);
      });
    });
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleLogin = () => {
    navigation.replace("SignIn");
  };

  const handleSignup = () => {
    navigation.replace("SignUp");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Animated.View
        style={{
          flexDirection: "row",
          width: width * 2,
          height: height,
          transform: [{ translateX }],
        }}
      >
        {/* First Screen */}
        <ImageBackground
          source={require("../../assets/image1/onboard.png")}
          style={[styles.container, { width, height }]}
          resizeMode="cover"
        >
          <View style={styles.headingContainer}>
            <Text style={[styles.heading, { color: COLORS.title }]}>
              Welcome to Jaiguru Jewellers
            </Text>
            <Text style={[styles.subheading, { color: COLORS.title }]}>
              The Beauty begins here
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableWithoutFeedback
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Animated.View
                style={[
                  styles.button, 
                  { 
                    backgroundColor: COLORS.primary,
                    transform: [{ scale: scaleAnim }] 
                  }
                ]}
              >
                <Animated.Text
                  style={[
                    styles.buttonText, 
                    { 
                      color: COLORS.black,
                      transform: [{ rotate: rotateInterpolate }] 
                    },
                  ]}
                >
                  Get Started ➜
                </Animated.Text>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </ImageBackground>

        {/* Second Screen */}
        <ImageBackground
          source={require("../../assets/image1/onboard1.jpg")}
          style={styles.secondScreenWrapper}
          resizeMode="cover"
        >
          <View style={styles.secondOverlay} />

          <View style={styles.secondContentBox}>
            <Text style={[styles.secondTitle, { color: COLORS.white }]}>
              Jaiguru Jewellers
            </Text>
            <Text style={[styles.secondTagline, { color: COLORS.warning }]}>
              Shine with Trust & Tradition
            </Text>

            <View style={styles.secondBtnContainer}>
              <TouchableOpacity 
                onPress={handleLogin} 
                style={[styles.secondLoginBtn, { backgroundColor: COLORS.primary }]}
              >
                <Text style={[styles.secondLoginText, { color: COLORS.black }]}>
                  Log in
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleSignup} 
                style={[styles.secondSignupBtn, { borderColor: COLORS.white }]}
              >
                <Text style={[styles.secondSignupText, { color: COLORS.white }]}>
                  Sign up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  headingContainer: {
    paddingHorizontal: SIZES.padding,
    alignSelf: "center",
    alignItems: "center",
    marginBottom: SIZES.margin * 37,
  },
  heading: {
    ...FONTS.h1,
    textAlign: "center",
    lineHeight: 40,
    marginBottom: SIZES.margin / 1,
  },
  subheading: {
    ...FONTS.h3,
    textAlign: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 60 : 40,
    width: "100%",
    paddingHorizontal: SIZES.padding * 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.margin * 4,
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: SIZES.radius_lg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    ...FONTS.button,
    fontWeight: "600",
  },
  secondScreenWrapper: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  secondOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  secondContentBox: {
    width: width * 0.85,
    paddingVertical: SIZES.padding * 2,
    paddingHorizontal: SIZES.padding,
    alignItems: "center",
    justifyContent: "center",
  },
  secondTitle: {
    ...FONTS.h1,
    textAlign: "center",
    // fontWeight: "bold",
    marginTop: height * 0.01,
  },
  secondTagline: {
    ...FONTS.h2,
    textAlign: "center",
    marginBottom: height * 0.3,
    marginTop: SIZES.margin,
    // fontWeight: "700",
  },
  secondBtnContainer: {
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
  },
  secondLoginBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: SIZES.radius_lg,
    marginBottom: SIZES.margin,
    alignItems: "center",
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  secondLoginText: {
    ...FONTS.button,
    // fontWeight: "600",
  },
  secondSignupBtn: {
    borderWidth: 1.2,
    width: "100%",
    paddingVertical: 14,
    borderRadius: SIZES.radius_lg,
    alignItems: "center",
  },
  secondSignupText: {
    ...FONTS.button,
    // fontWeight: "600",
  },
});

export default GetStartedScreen;