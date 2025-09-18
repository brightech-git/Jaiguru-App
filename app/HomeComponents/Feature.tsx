import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { GlobalStyleSheet } from "../constants/StyleSheet";
import { COLORS, FONTS, SIZES } from "../constants/theme";
import { IMAGES } from "../constants/Images";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../Navigations/RootStackParamList";
import { fetchFeaturedProducts } from "../Services/FeatureService";

type FeaturedNowSectionProps = StackScreenProps<RootStackParamList, "Home">;

const FeaturedNowSection = ({ navigation }: FeaturedNowSectionProps) => {
  const { colors, dark } = useTheme();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchFeaturedProducts();
        setProducts(data || []);
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
        setError("Failed to load featured products. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <View style={[styles.sectionWrapper, { backgroundColor: dark ? COLORS.darkBackground : COLORS.background }]}>
      {/* Header */}
      <View style={[GlobalStyleSheet.container, styles.headerContainer]}>
        <View style={styles.headerRow}>
          <Text style={[styles.sectionTitle, { color: dark ? COLORS.darkTitle : COLORS.title }]}>
            Featured Now
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("FeaturedProducts")}>
            <Text style={[styles.seeAllText, { color: dark ? COLORS.darkText : COLORS.text }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        {/* Product Scroll */}
        <View style={styles.scrollWrapper}>
          {loading ? (
            <View style={[styles.loaderContainer, { backgroundColor: dark ? COLORS.darkCard : COLORS.card }]}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={[styles.loadingText, { color: dark ? COLORS.darkText : COLORS.text }]}>
                Loading featured products...
              </Text>
            </View>
          ) : error ? (
            <View style={[styles.errorContainer, { backgroundColor: dark ? COLORS.darkCard : COLORS.card }]}>
              <Text style={[styles.errorText, { color: COLORS.danger }]}>{error}</Text>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: COLORS.primary }]}
                onPress={() => {
                  setLoading(true);
                  setError(null);
                  fetchFeaturedProducts().then(setProducts).catch(() => setError("Failed to load featured products."));
                  setLoading(false);
                }}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : products.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: dark ? COLORS.darkCard : COLORS.card }]}>
              <Text style={[styles.emptyText, { color: dark ? COLORS.darkText : COLORS.text }]}>
                No featured products available
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.productRow}>
                {products.map((product, index) => (
                  <View
                    key={index}
                    style={[
                      styles.productCardWrapper,
                      Platform.OS === "ios" && { backgroundColor: dark ? COLORS.darkCard : COLORS.card, borderRadius: 100 },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("ProductDetails", { sno: product.SNO })
                      }
                      style={[styles.productCard, { backgroundColor: dark ? COLORS.darkCard : COLORS.card }]}
                    >
                      {/* Product Image */}
                   <Image
  style={[
    styles.productImage,
    {
      backgroundColor: dark ? COLORS.darkBackground : COLORS.background,
      borderColor: dark ? COLORS.darkBorderColor : COLORS.borderColor,
    },
  ]}
  source={
    typeof product.mainImage === "string" && product.mainImage.trim() !== ""
      ? { uri: product.mainImage }
      : IMAGES.item11
  }
  resizeMode="cover"
/>


                      {/* Product Info */}
                      <View>
                        <Text style={[styles.productName, { color: dark ? COLORS.darkTitle : COLORS.title }]} numberOfLines={1}>
                          {product.SUBITEMNAME || "Product"}
                        </Text>
                        <View style={styles.priceRow}>
                          <Text style={[styles.price, { color: dark ? COLORS.darkTitle : COLORS.title }]}>
                            ₹{parseFloat(product.GrandTotal || '0').toFixed(2)}
                          </Text>
                          {product.MRP && (
                            <Text
                              style={[
                                styles.mrp,
                                { color: dark ? COLORS.darkTextLight : COLORS.textLight },
                              ]}
                            >
                              ₹{parseFloat(product.MRP).toFixed(2)}
                            </Text>
                          )}
                          <Image style={styles.ratingIcon} source={IMAGES.star4} />
                          <Text
                            style={[
                              styles.reviewText,
                              { color: dark ? COLORS.darkTextLight : COLORS.textLight },
                            ]}
                          >
                            (2k Review)
                          </Text>
                        </View>
                        {product.offer && (
                          <Text style={[styles.offerText, { color: COLORS.danger }]}>
                            {product.offer}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionWrapper: {
    width: "100%",
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    paddingTop: 0,
    marginTop: SIZES.margin / 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding,
  },
  sectionTitle: {
    ...FONTS.h3,
    fontSize: SIZES.h4,
    color: COLORS.title,
  },
  seeAllText: {
    ...FONTS.fontRegular,
    fontSize: SIZES.fontSm,
    color: COLORS.text,
  },
  scrollWrapper: {
    marginHorizontal: -SIZES.padding,
  },
  loaderContainer: {
    padding: SIZES.padding,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius_lg,
  },
  loadingText: {
    ...FONTS.fontRegular,
    fontSize: SIZES.font,
    marginTop: SIZES.margin / 2,
    color: COLORS.text,
  },
  errorContainer: {
    padding: SIZES.padding,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius_lg,
    marginHorizontal: SIZES.padding,
  },
  errorText: {
    ...FONTS.fontRegular,
    fontSize: SIZES.font,
    color: COLORS.danger,
    marginBottom: SIZES.margin,
    textAlign: "center",
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius_lg,
    marginHorizontal: SIZES.padding,
  },
  emptyText: {
    ...FONTS.fontRegular,
    fontSize: SIZES.font,
    color: COLORS.text,
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding * 1.2,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.margin,
  },
  productCardWrapper: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: -10, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: SIZES.radius,
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: SIZES.margin,
    padding: SIZES.padding / 1.5,
    paddingRight: SIZES.padding * 1.2,
    borderRadius: SIZES.radius_lg,
    backgroundColor: COLORS.card,
  },
  productImage: {
    width: 75,
    height: 75,
    borderRadius: SIZES.radius_md,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    backgroundColor: COLORS.background,
  },
  productName: {
    ...FONTS.fontMedium,
    fontSize: SIZES.font,
    color: COLORS.title,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 5,
  },
  price: {
    ...FONTS.fontSemiBold,
    fontSize: SIZES.fontLg,
    color: COLORS.title,
  },
  mrp: {
    ...FONTS.fontRegular,
    fontSize: SIZES.fontSm,
    textDecorationLine: "line-through",
    marginRight: 5,
    color: COLORS.textLight,
  },
  ratingIcon: {
    height: 12,
    width: 12,
    resizeMode: "contain",
  },
  reviewText: {
    ...FONTS.fontRegular,
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
  },
  offerText: {
    ...FONTS.fontMedium,
    fontSize: SIZES.fontSm,
    color: COLORS.danger,
  },
});

export default FeaturedNowSection;