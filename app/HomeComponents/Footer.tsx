import React from "react";
import { View, Text, Image, Dimensions, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { COLORS, FONTS, SIZES } from "../constants/theme";

const { width } = Dimensions.get("window");

const CertificationFooter = () => {
  const { colors, dark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: dark ? COLORS.darkBackground : COLORS.background }]}>
      <View style={[styles.card, { backgroundColor: dark ? COLORS.darkCard : COLORS.card }]}>
        <Image
          source={require("../assets/image1/image.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: dark ? COLORS.darkTitle : COLORS.title }]}>
            100% Certified Jewellery
          </Text>
          <Text style={[styles.subtitle, { color: dark ? COLORS.darkText : COLORS.text }]}>
            Fully authenticated and verified by Bureau of Indian Standards (BIS).
          </Text>
        </View>
      </View>

      <Text style={[styles.powered, { color: dark ? COLORS.darkText : COLORS.text }]}>
        Powered by <Text style={[styles.brand, { color: COLORS.info }]}>Brightechsoftware solutions</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    alignItems: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius_lg,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: SIZES.radius,
    elevation: 3,
    width: width - SIZES.padding * 2,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: SIZES.margin,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...FONTS.h3,
    fontSize: SIZES.h4,
    color: COLORS.title,
    marginBottom: SIZES.margin / 2,
  },
  subtitle: {
    ...FONTS.fontRegular,
    fontSize: SIZES.fontSm,
    color: COLORS.text,
  },
  powered: {
    ...FONTS.fontRegular,
    fontSize: SIZES.fontSm,
    color: COLORS.text,
    textAlign: "center",
  },
  brand: {
    ...FONTS.subheading,
    fontSize: SIZES.h6,
    color: COLORS.info,
    // fontWeight: "bold",
  },
});

export default CertificationFooter;