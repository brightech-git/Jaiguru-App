import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
  Text,
  StyleSheet,
} from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";
import Carousel from "react-native-reanimated-carousel";
import { getBanners } from "../Services/BannerService";
import { COLORS, FONTS, SIZES } from "../constants/theme";

const { width } = Dimensions.get("window");
const IMAGE_BASE_URL = "https://app.bmgjewellers.com";

export default function BannerSlider() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const { colors, dark } = useTheme();

  useEffect(() => {
    (async () => {
      try {
        const data = await getBanners();
        setBanners(data || []);
      } catch (error) {
        console.error("Failed to load banners:", error);
        setBanners([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handlePress = (item: any) => {
    if (item.itemname && item.gender) {
      navigation.navigate("Products", {
        itemName: item.itemname,
        gender: item.gender,
      });
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: dark ? COLORS.darkCard : COLORS.card }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: dark ? COLORS.darkText : COLORS.text }]}>
          Loading banners...
        </Text>
      </View>
    );
  }

  if (!loading && banners.length === 0) {
    return (
      <View
        style={[
          styles.placeholderContainer,
          { backgroundColor: dark ? COLORS.darkCard : COLORS.card, borderColor: dark ? COLORS.darkBorderColor : COLORS.borderColor },
        ]}
      >
        <Text style={[styles.placeholderText, { color: dark ? COLORS.darkText : COLORS.text }]}>
          No banners available
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: dark ? COLORS.darkBackground : COLORS.background }]}>
      <Carousel
        width={width}
        height={width * 0.5}
        data={banners}
        loop
        autoPlay
        autoPlayInterval={4000}
        scrollAnimationDuration={1000}
        panGestureHandlerProps={{
          activeOffsetX: [-10, 10],
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handlePress(item)}
            style={styles.slideContainer}
          >
            <Image
              source={{ uri: IMAGE_BASE_URL + item.image_path }}
              style={styles.bannerImage}
              defaultSource={require("../assets/images/item/pic14.png")}
              resizeMode="cover"
            />
            <View style={styles.titleContainer}>
              <Text style={[styles.titleText, { color: COLORS.title }]} numberOfLines={2}>
                {item.title || "BMG Jewellers"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SIZES.margin,
    backgroundColor: COLORS.background,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: SIZES.radius,
    elevation: 5,
  },
  loadingContainer: {
    height: width * 0.5,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: SIZES.padding,
    borderRadius: SIZES.radius_lg,
    backgroundColor: COLORS.card,
  },
  loadingText: {
    ...FONTS.fontRegular,
    fontSize: SIZES.font,
    marginTop: SIZES.margin / 2,
    color: COLORS.text,
  },
  placeholderContainer: {
    height: width * 0.5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: SIZES.radius_lg,
    marginHorizontal: SIZES.padding,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.borderColor,
    backgroundColor: COLORS.card,
  },
  placeholderText: {
    ...FONTS.fontRegular,
    fontSize: SIZES.font,
    color: COLORS.textLight,
  },
  slideContainer: {
    position: "relative",
    borderRadius: SIZES.radius_lg,
    overflow: "hidden",
    marginHorizontal: SIZES.padding / 2,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    borderRadius: SIZES.radius_lg,
  },
  titleContainer: {
    position: "absolute",
    left: SIZES.padding,
    bottom: 60,
    right: SIZES.padding,
    padding: SIZES.padding / 2,
    borderRadius: SIZES.radius,
    // backgroundColor: COLORS.overlay,
    maxWidth: "60%",
  },
  titleText: {
    ...FONTS.body,
    fontSize: SIZES.h1,
    lineHeight: SIZES.h3 + 10,
    color: COLORS.title,
  },
});