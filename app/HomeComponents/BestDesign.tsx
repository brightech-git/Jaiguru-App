import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ImageSourcePropType,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { GlobalStyleSheet } from "../constants/StyleSheet";
import { COLORS, FONTS, SIZES, ICONS } from "../constants/theme";
import CardStyle1 from "../components/Card/CardStyle1";
import Button from "../components/Button/Button";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../Navigations/RootStackParamList";
import { fetchBestDesignProducts } from "../Services/BestDesignService";
import { IMAGES } from "../constants/Images";
import SvgUri from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type BestDesignsPageProps = StackScreenProps<
  RootStackParamList,
  "BestDesignsPage"
>;

const BestDesignsPage = ({ navigation }: BestDesignsPageProps) => {
  const { colors, dark } = useTheme();
  const [bestDesignProducts, setBestDesignProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBestDesignProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const products = await fetchBestDesignProducts();
      const validProducts = products.filter((p) => p.mainImage && p.GrossAmount);
      setBestDesignProducts(validProducts);

      console.log(`✅ Best Designs fetched: ${validProducts.length} items`);
    } catch (err) {
      console.error("❌ Error loading best design products:", err);
      setError("Failed to load best design products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBestDesignProducts();
  }, [loadBestDesignProducts]);

  const fallbackImage: ImageSourcePropType = IMAGES.item11;

  // Memoized styles for performance
  const styles = useMemo(
    () =>
      StyleSheet.create({
        header: {
          marginBottom: SIZES.margin,
          paddingHorizontal: SIZES.padding,
        },
        loadingContainer: {
          height: SIZES.height * 0.4,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: dark ? COLORS.darkBackground : COLORS.background,
        },
        loadingText: {
          ...FONTS.fontMedium,
          fontSize: SIZES.font,
          color: dark ? COLORS.darkText : COLORS.text,
          marginTop: SIZES.margin - 3,
        },
        errorContainer: {
          padding: SIZES.padding,
          alignItems: "center",
          backgroundColor: dark ? COLORS.darkCard : COLORS.card,
          borderRadius: SIZES.radius_lg,
          borderWidth: 1,
          borderColor: dark ? COLORS.darkBorderColor : COLORS.borderColor,
          minHeight: SIZES.height * 0.2,
          margin: SIZES.margin,
        },
        errorText: {
          ...FONTS.fontMedium,
          fontSize: SIZES.font,
          color: COLORS.danger,
          textAlign: "center",
          marginBottom: SIZES.margin,
        },
        emptyContainer: {
          padding: SIZES.padding,
          alignItems: "center",
          backgroundColor: dark ? COLORS.darkCard : COLORS.card,
          borderRadius: SIZES.radius_lg,
          margin: SIZES.margin,
        },
        emptyText: {
          ...FONTS.fontRegular,
          fontSize: SIZES.font,
          color: dark ? COLORS.darkTextLight : COLORS.textLight,
          textAlign: "center",
        },
        gridContainer: {
          flexDirection: "column",
          paddingHorizontal: SIZES.padding - 5,
        },
        row: {
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          marginBottom: SIZES.margin,
        },
        cardWrapper: {
          width: (SIZES.width - SIZES.padding * 2 - 10) / 2,
          marginBottom: SIZES.margin,
        },
      }),
    [dark, colors.card, colors.border]
  );

  // Enhanced Loading Component
  const LoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text
        style={styles.loadingText}
        accessibilityLiveRegion="polite"
      >
        Loading best designs...
      </Text>
    </View>
  );

  // Enhanced Error Component
  const ErrorComponent = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <View style={styles.errorContainer}>
      <Text style={{ fontSize: SIZES.h2, marginBottom: SIZES.margin - 5, color: COLORS.danger }}>
        ⚠️
      </Text>
      <Text
        style={styles.errorText}
        accessibilityRole="alert"
      >
        {message}
      </Text>
      <Button
        title="Try Again"
        onPress={onRetry}
        color={COLORS.primary}
        btnRounded
        style={{
          marginTop: SIZES.margin,
          width: SIZES.width * 0.4,
          borderRadius: SIZES.radius_lg,
        }}
        textStyle={{ ...FONTS.fontSemiBold, fontSize: SIZES.font }}
        accessibilityLabel="Retry loading best designs"
      />
    </View>
  );

  // Empty Component
  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text
        style={styles.emptyText}
        accessibilityRole="alert"
      >
        No best design products available
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: dark ? COLORS.darkBackground : COLORS.background }}>
      <View
        style={[
          GlobalStyleSheet.container,
          { paddingVertical: SIZES.padding },
        ]}
      >
        <View style={styles.header}>
          <Text
            style={{ ...FONTS.h3, fontSize: SIZES.h3, color: dark ? COLORS.darkTitle : COLORS.title, fontFamily: "TrajanProBold" }}
            accessibilityRole="header"
          >
            Best Design
          </Text>
        </View>

        {loading ? (
          <LoadingIndicator />
        ) : error ? (
          <ErrorComponent message={error} onRetry={loadBestDesignProducts} />
        ) : bestDesignProducts.length > 0 ? (
          <View style={styles.gridContainer}>
            {Array.from({ length: Math.ceil(bestDesignProducts.length / 4) }).map(
              (_, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.row}>
                  {bestDesignProducts
                    .slice(rowIndex * 4, rowIndex * 4 + 4)
                    .map((product, index) => {
                      const price = Number(product?.GrandTotal) || 0;
                      const discountPrice = price ? price * 1.1 : 0;

                      return (
                        <View
                          key={`${product.SNO}-${index}`}
                          style={styles.cardWrapper}
                        >
                          <CardStyle1
                            id={product.SNO}
                            image={
                              product.mainImage
                                ? { uri: product.mainImage }
                                : fallbackImage
                            }
                            title={product.SUBITEMNAME || "Jewelry Item"}
                            price={`₹ ${price.toFixed(2)}`}
                            discount={`₹ ${discountPrice.toFixed(2)}`}
                            onPress={() =>
                              navigation.navigate("ProductDetails", {
                                sno: product.SNO,
                              })
                            }
                            onPress1={() => {}} // Wishlist action placeholder
                            onPress2={() => {}} // Cart action placeholder
                            closebtn={
                              <SvgUri
                                width={SIZES.fontLg + 4}
                                height={SIZES.fontLg + 4}
                                source={{ uri: ICONS.closeOpen }}
                                fill={COLORS.danger}
                              />
                            }
                          />
                        </View>
                      );
                    })}
                </View>
              )
            )}
          </View>
        ) : (
          <EmptyComponent />
        )}
      </View>
    </View>
  );
};

// Performance optimization with React.memo
const arePropsEqual = (prevProps: BestDesignsPageProps, nextProps: BestDesignsPageProps) => {
  return prevProps.route.key === nextProps.route.key;
};

export default React.memo(BestDesignsPage, arePropsEqual);