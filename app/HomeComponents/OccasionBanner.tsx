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
import { getOccasionBanners } from "../Services/OccasionService";
import { FONTS, COLORS, SIZES } from "../constants/theme";

const { width } = Dimensions.get("window");

export default function BannerSlider() {
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigation = useNavigation<any>();
    const { colors, dark } = useTheme();

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const data = await getOccasionBanners();
                setBanners(data || []);
            } catch (error) {
                console.error("Failed to load banners:", error);
                setBanners([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    const handlePress = (item: any) => {
        if (item.occasion && item.gender) {
            const params = {
                occasion: item.occasion,
                gender: item.gender,
            };
            console.log("Navigating to Products with:", params);
            navigation.navigate("Products", params);
        }
    };

    // Handle image loading errors
    const handleImageError = (item: any, index: number) => {
        console.log("Image failed to load:", item.image_path);
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: dark ? COLORS.darkCard : COLORS.card }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={[styles.loadingText, { color: dark ? COLORS.darkText : COLORS.text }]}>
                    Loading occasions...
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
                    No occasions available
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: dark ? COLORS.darkBackground : COLORS.background }]}>
            {/* Section Header */}
            <View style={styles.headerContainer}>
                <Text style={[styles.sectionTitle, { color: dark ? COLORS.darkTitle : COLORS.title }]}>
                    Shop by Occasion
                </Text>
                <Text style={[styles.sectionSubtitle, { color: dark ? COLORS.darkTextLight : COLORS.textLight }]}>
                    Find perfect jewelry for every special moment
                </Text>
            </View>

            {/* Carousel */}
            <Carousel
                width={width - SIZES.padding * 2}
                height={width * 0.55}
                data={banners}
                loop
                autoPlay
                autoPlayInterval={5000}
                scrollAnimationDuration={800}
                onSnapToItem={(index) => setCurrentIndex(index)}
                style={styles.carousel}
                panGestureHandlerProps={{
                    activeOffsetX: [-15, 15],
                }}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => handlePress(item)}
                        style={[
                            styles.slideContainer,
                            {
                                transform: [
                                    { scale: index === currentIndex ? 1 : 0.95 }
                                ],
                                backgroundColor: dark ? COLORS.darkCard : COLORS.card,
                            }
                        ]}
                    >
                        <Image
                            source={{ uri: item.image_path }}
                            style={styles.bannerImage}
                            defaultSource={require("../assets/images/item/pic14.png")}
                            resizeMode="cover"
                            onError={() => handleImageError(item, index)}
                        />
                        <View style={[styles.gradientOverlay, { backgroundColor: dark ? COLORS.darkOverlay : COLORS.overlay }]} />
                        <View style={styles.contentContainer}>
                            <View style={styles.textContainer}>
                                <Text style={[styles.titleText, { color: COLORS.white }]} numberOfLines={2}>
                                    {item.title || "Exquisite Jewelry Collection"}
                                </Text>
                                {item.subtitle && (
                                    <Text style={[styles.subtitleText, { color: COLORS.white }]} numberOfLines={1}>
                                        {item.subtitle}
                                    </Text>
                                )}
                            </View>
                        </View>
                        <View style={[styles.cornerDecoration, { borderColor: COLORS.primary }]} />
                    </TouchableOpacity>
                )}
            />

            {/* Pagination Dots */}
            <View style={styles.paginationContainer}>
                {banners.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.paginationDot,
                            {
                                backgroundColor:
                                    index === currentIndex
                                        ? COLORS.primary
                                        : dark ? COLORS.darkBorderColor : `${COLORS.primary}50`,
                                width: index === currentIndex ? 24 : 8,
                            }
                        ]}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: SIZES.margin,
        backgroundColor: COLORS.background,
    },
    headerContainer: {
        paddingHorizontal: SIZES.padding,
        marginBottom: SIZES.margin,
        alignItems: "center",
    },
    sectionTitle: {
        ...FONTS.h3,
        fontSize: SIZES.h4,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 4,
        color: COLORS.title,
    },
    sectionSubtitle: {
        ...FONTS.fontRegular,
        fontSize: SIZES.fontSm,
        textAlign: "center",
        fontStyle: "italic",
        color: COLORS.textLight,
    },
    carousel: {
        alignSelf: "center",
    },
    loadingContainer: {
        height: width * 0.55,
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
        height: width * 0.55,
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
        color: COLORS.text,
    },
    slideContainer: {
        position: "relative",
        borderRadius: SIZES.radius_lg,
        overflow: "hidden",
        marginHorizontal: 4,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: SIZES.radius,
        elevation: 8,
        backgroundColor: COLORS.card,
    },
    bannerImage: {
        width: "100%",
        height: "100%",
        borderRadius: SIZES.radius_lg,
    },
    contentContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: SIZES.padding,
    },
    textContainer: {
        maxWidth: "75%",
    },
    titleText: {
        ...FONTS.h4,
        fontSize: SIZES.h4,
        lineHeight: SIZES.h4 + 4,
        fontWeight: "600",
        marginBottom: SIZES.margin / 2,
        textShadowColor: "rgba(0,0,0,0.8)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        color: COLORS.white,
    },
    subtitleText: {
        ...FONTS.fontRegular,
        fontSize: SIZES.fontSm,
        lineHeight: SIZES.fontSm + 4,
        marginBottom: SIZES.margin * 3,
        textShadowColor: "rgba(0,0,0,0.6)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        color: COLORS.white,
    },
    cornerDecoration: {
        position: "absolute",
        top: SIZES.padding - 4,
        right: SIZES.padding - 4,
        width: 24,
        height: 24,
        borderTopWidth: 3,
        borderRightWidth: 3,
        borderTopRightRadius: SIZES.radius_sm,
        borderColor: COLORS.primary,
    },
    paginationContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: SIZES.margin,
        paddingHorizontal: SIZES.padding,
    },
    paginationDot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 3,
        backgroundColor: COLORS.primary,
    },
});