import React, { useEffect, useState, useCallback, memo } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  StyleSheet,
  Dimensions,
  RefreshControl
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { GlobalStyleSheet } from '../constants/StyleSheet';
import { FONTS, COLORS, SIZES } from '../constants/theme';
import { getMainCategoryImages } from '../Services/CategoryImageService';
import IMAGES from '../constants/Images';

const { width } = Dimensions.get('screen');

const CARD_WIDTH = 90;
const CARD_MARGIN = SIZES.margin - 5;

const JewelryCollection = () => {
  const theme = useTheme();
  const { colors } = theme;
  const navigation = useNavigation();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async (isRefreshing = false) => {
    try {
      isRefreshing ? setRefreshing(true) : setLoading(true);
      setError(null);
      
      const data = await getMainCategoryImages();
      
      // Filter out categories without names and ensure we have valid image URLs
      const validCategories = data
        .filter(category => category.name && category.name.trim() !== '')
        .map(category => ({
          ...category,
          image: category.image || IMAGES.item13 // Use placeholder if no image
        }));
      
      setCategories(validCategories);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
      console.error('Fetch categories error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const onRefresh = useCallback(() => {
    fetchCategories(true);
  }, [fetchCategories]);

  const handlePress = useCallback((categoryName) => {
    navigation.navigate('Products', { 
      itemName: categoryName,
    });
  }, [navigation]);

  const handleSeeAll = useCallback(() => {
    navigation.navigate('Category', {
      categories: categories,
    });
  }, [navigation, categories]);

  const renderCategoryItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handlePress(item.name)}
      activeOpacity={0.7}
    >
      <View style={[styles.imageContainer, { backgroundColor: theme.dark ? COLORS.darkCard : COLORS.card }]}>
        <Image
          source={typeof item.image === 'string' ? { uri: item.image } : item.image}
          style={styles.image}
          resizeMode="contain"
          onError={() => console.warn(`Failed to load image for ${item.name}`)}
        />
      </View>
      <Text 
        style={[styles.categoryName, { color: theme.dark ? COLORS.darkText : COLORS.text }]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  ), [theme.dark, handlePress]);

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.dark ? COLORS.darkBackground : COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: theme.dark ? COLORS.darkText : COLORS.text }]}>Loading collections...</Text>
      </View>
    );
  }

  if (error && categories.length === 0) {
    return (
      <View style={[styles.container, styles.errorContainer, { backgroundColor: theme.dark ? COLORS.darkBackground : COLORS.background }]}>
        <Text style={styles.errorText}>⚠️</Text>
        <Text style={[styles.errorMessage, { color: theme.dark ? COLORS.darkText : COLORS.text }]}>
          {error}
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: COLORS.primary }]}
          onPress={fetchCategories}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.dark ? COLORS.darkBackground : COLORS.background }]}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: theme.dark ? COLORS.darkText : COLORS.text }]}>
          Our Jewelry{"\n"} Collections
        </Text>
        {categories.length > 0 && (
          <TouchableOpacity onPress={handleSeeAll}>
            <Text style={[styles.seeAllText, { color: COLORS.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {categories.slice(0, 6).map((category) => (
          <View key={category.id}>
            {renderCategoryItem({ item: category })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SIZES.padding,
    minHeight: 180,
    backgroundColor: COLORS.background,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: SIZES.margin,
    marginBottom: SIZES.margin,
  },
  scrollContent: {
    paddingHorizontal: SIZES.margin,
  },
  title: {
    ...FONTS.h3,
    fontSize: SIZES.h4,
    lineHeight: SIZES.h3 + 6,
    flex: 1,
    color: COLORS.text,
  },
  seeAllText: {
    ...FONTS.subheading,
    fontSize: SIZES.h5,
    color: COLORS.primary,
  },
  categoryItem: {
    marginRight: CARD_MARGIN,
    alignItems: 'center',
    width: CARD_WIDTH,
  },
  imageContainer: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: CARD_WIDTH / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.margin / 2,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: SIZES.radius,
    elevation: 3,
    backgroundColor: COLORS.card,
  },
  image: {
    width: CARD_WIDTH - 30,
    height: CARD_WIDTH - 30,
  },
  categoryName: {
    ...FONTS.Marcellus,
    fontSize: SIZES.fontSm,
    textAlign: 'center',
    maxWidth: CARD_WIDTH,
    color: COLORS.text,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.padding * 2,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SIZES.margin / 2,
    ...FONTS.fontRegular,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.padding * 2,
    paddingHorizontal: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: SIZES.h2,
    marginBottom: SIZES.margin / 2,
    color: COLORS.danger,
  },
  errorMessage: {
    ...FONTS.fontRegular,
    fontSize: SIZES.font,
    textAlign: 'center',
    marginBottom: SIZES.margin,
    color: COLORS.text,
  },
  retryButton: {
    paddingHorizontal: SIZES.padding + 4,
    paddingVertical: SIZES.padding - 4,
    borderRadius: SIZES.radius_lg,
    backgroundColor: COLORS.primary,
  },
  retryText: {
    color: COLORS.white,
    ...FONTS.fontMedium,
    fontSize: SIZES.font,
  },
});

export default memo(JewelryCollection);