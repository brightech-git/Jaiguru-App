import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Text,
  StyleSheet,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useNavigation, useTheme } from "@react-navigation/native";
import { getFestivalBanners } from "../Services/FestivalService";
import { processImageUrl } from "../Services/RecentService";
import { COLORS, FONTS, SIZES } from "../constants/theme";
import { IMAGES } from "../constants/Images";

const { width } = Dimensions.get("window");

const FestivalSlider = () => {
  const navigation = useNavigation<any>();
  const { colors, dark } = useTheme();

  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFestivalBanners();
      // Process image URLs for each banner
      const processedBanners = data.map((banner: any) => ({
        ...banner,
        image_path: processImageUrl(banner.image_path),
      }));
      setBanners(processedBanners || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
      setError("Failed to load festival banners. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (imageUrl: string) => {
    setFailedImages((prev) => new Set(prev).add(imageUrl));
  };

  const getWorkingImage = (banner: any): any => {
    if (failedImages.has(banner.image_path)) {
      return IMAGES.item11;
    }
    return { uri: banner.image_path } || IMAGES.item11;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: dark ? COLORS.darkBackground : COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: dark ? COLORS.darkText : COLORS.text }]}>
          Loading festival banners...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: dark ? COLORS.darkCard : COLORS.card }]}>
        <Text style={[styles.errorText, { color: COLORS.danger }]}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: COLORS.primary }]} 
          onPress={fetchBanners}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!banners.length) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: dark ? COLORS.darkCard : COLORS.card }]}>
        <Text style={[styles.emptyText, { color: dark ? COLORS.darkText : COLORS.text }]}>
          No festival banners available
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: dark ? COLORS.darkBackground : COLORS.background }]}>
      <Text style={[styles.title, { color: dark ? COLORS.darkTitle : COLORS.title }]}>
        Festival Collection
      </Text>

      <Carousel
        width={width}
        height={250}
        data={banners}
        autoPlay
        loop
        autoPlayInterval={3000}
        scrollAnimationDuration={1000}
        onSnapToItem={(index) => setActiveIndex(index)}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate("Products", {
                itemName: item.item_name,
                subItemName: item.sub_item_name,
              })
            }
            style={styles.slide}
          >
            <View style={styles.imageContainer}>
              <Image
                source={getWorkingImage(item)}
                style={styles.image}
                onError={() => handleImageError(item.image_path)}
                defaultSource={IMAGES.item11}
                resizeMode="cover"
              />
              {item.sub_item_name && (
                <View style={[styles.textContainer, { backgroundColor: dark ? COLORS.darkOverlay : COLORS.overlay }]}>
                  <Text style={[styles.slideTitle, { color: COLORS.white }]} numberOfLines={2}>
                    {item.sub_item_name}
                  </Text>
                  {item.subtitle && (
                    <Text style={[styles.slideSubtitle, { color: COLORS.white }]} numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Pagination */}
      <View style={styles.pagination}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === activeIndex 
                ? [styles.activeDot, { backgroundColor: COLORS.primary }]
                : [styles.inactiveDot, { backgroundColor: dark ? COLORS.darkBorderColor : COLORS.gray }],
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SIZES.margin,
    position: "relative",
    backgroundColor: COLORS.background,
  },
  title: {
    ...FONTS.h3,
    fontSize: SIZES.h4,
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.margin / 2,
    // fontWeight: "bold",
    color: COLORS.title,
  },
  loadingContainer: {
    padding: SIZES.padding,
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    ...FONTS.fontRegular,
    fontSize: SIZES.font,
    marginTop: SIZES.margin / 2,
    color: COLORS.text,
  },
  errorContainer: {
    padding: SIZES.padding,
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius_lg,
  },
  errorText: {
    marginBottom: SIZES.margin,
    textAlign: "center",
    ...FONTS.fontRegular,
    fontSize: SIZES.font,
    color: COLORS.danger,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius_lg,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: "bold",
    ...FONTS.fontMedium,
    fontSize: SIZES.font,
  },
  emptyContainer: {
    padding: SIZES.padding,
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius_lg,
  },
  emptyText: {
    ...FONTS.fontRegular,
    fontSize: SIZES.font,
    textAlign: "center",
    color: COLORS.text,
  },
  slide: {
    borderRadius: SIZES.radius_lg,
    overflow: "hidden",
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: SIZES.radius,
  },
  imageContainer: {
    width: "100%",
    height: 250,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: SIZES.radius_lg,
    resizeMode: "cover",
  },
  textContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SIZES.padding,
    backgroundColor: COLORS.overlay,
    borderBottomLeftRadius: SIZES.radius_lg,
    borderBottomRightRadius: SIZES.radius_lg,
  },
  slideTitle: {
    color: COLORS.white,
    fontSize: SIZES.fontLg,
    fontWeight: "bold",
    ...FONTS.h4,
  },
  slideSubtitle: {
    color: COLORS.white,
    fontSize: SIZES.fontSm,
    ...FONTS.fontRegular,
    marginTop: 4,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SIZES.margin,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 12,
  },
  inactiveDot: {
    backgroundColor: COLORS.gray,
  },
});

export default FestivalSlider;