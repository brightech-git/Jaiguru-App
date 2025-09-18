import React, { memo, useCallback, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Platform,
  Text,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../constants/StyleSheet';
import { IMAGES } from '../constants/Images';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import Scrolling from '../components/Scrolling';
import SvgcurvedText from '../components/SvgcurvedText';
import { FONTS, COLORS } from '../constants/theme';

type CategoryItem = {
  image: any;
  title: string;
  id: string;
};

const SliderData: CategoryItem[] = [
  { id: '1', image: IMAGES.star3, title: 'COUPLE RING' },
  { id: '2', image: IMAGES.star3, title: 'SHORT CHAINS' },
  { id: '3', image: IMAGES.star3, title: 'ANKLETS' },
  { id: '4', image: IMAGES.star3, title: 'EARINGS' },
  { id: '5', image: IMAGES.star3, title: 'BRACELETS' },
  { id: '6', image: IMAGES.star3, title: 'STUDS' },
  { id: '7', image: IMAGES.star3, title: 'BANGLES' },
  { id: '8', image: IMAGES.star3, title: 'PENDANTS' },
  { id: '9', image: IMAGES.star3, title: 'DAILY WEAR' },
];

type BannerWithCategoriesProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

const BannerWithCategories = ({ navigation }: BannerWithCategoriesProps) => {
  const { colors, dark } = useTheme();
  const { width } = useWindowDimensions();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleProductNavigation = useCallback(() => {
    navigation.navigate('Products');
  }, [navigation]);

  const handleCategoryNavigation = useCallback(
    (categoryTitle: string) => {
      navigation.navigate('Products', { subItemName: categoryTitle });
    },
    [navigation]
  );

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    setImageError(true);
  }, []);

  const renderCategoryItem = useCallback(
    ({ item }: { item: CategoryItem }) => (
      <TouchableOpacity
        key={item.id}
        onPress={() => handleCategoryNavigation(item.title)}
        style={[
          styles.categoryItem,
          {
            backgroundColor: dark
              ? COLORS.darkSecondary
              : COLORS.lightBackground, // Theme-based background
          },
        ]}
        activeOpacity={0.7}
      >
        <Text style={[styles.categoryText, { color: colors.text }]}>
          {item.title}
        </Text>
        <Image
          style={[styles.categoryIcon, { tintColor: colors.text }]}
          source={item.image}
        />
      </TouchableOpacity>
    ),
    [colors, dark, handleCategoryNavigation]
  );

  return (
    <View style={styles.container}>
      <View style={[GlobalStyleSheet.container, styles.innerContainer]}>
        <TouchableOpacity
          onPress={handleProductNavigation}
          style={styles.borderTouchable}
          activeOpacity={0.8}
        >
          <Image
            style={[
              styles.borderImage,
              dark && { tintColor: colors.background },
            ]}
            source={IMAGES.border}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleProductNavigation}
          style={styles.mainImageTouchable}
          activeOpacity={0.9}
        >
          {imageLoading && (
            <View style={styles.imagePlaceholder}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          )}
          <Image
            style={[
              styles.mainImage,
              Platform.OS === 'ios' && styles.iosImageAdjustment,
              imageError && styles.hiddenImage,
            ]}
            source={imageError ? IMAGES.placeholder : IMAGES.product5}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </TouchableOpacity>

        <View style={styles.svgContainer}>
          <View
            style={[
              styles.svgBackground,
              {
                backgroundColor: dark
                  ? 'rgba(0,0,0,0.7)'
                  : 'rgba(255,255,255,0.7)',
              },
            ]}
          >
            <TouchableOpacity
              onPress={handleProductNavigation}
              style={styles.svgTouchable}
              activeOpacity={0.8}
            >
              <SvgcurvedText small />
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories List */}
        <View style={[styles.categoriesContainer, { backgroundColor: colors.card }]}>
          <Scrolling
            endPaddingWidth={'50'}
            style={styles.scrollingWrapper}
            showsHorizontalScrollIndicator={false}
          >
            <View style={styles.categoriesList}>
              {SliderData.map((item) => renderCategoryItem({ item }))}
            </View>
          </Scrolling>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    overflow: 'hidden',
    paddingBottom: 40,
  },
  innerContainer: {
    padding: 0,
  },
  borderTouchable: {
    zIndex: 20,
  },
  borderImage: {
    width: '100%',
  },
  mainImageTouchable: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1 / 0.6,
    transform: [{ scale: 1.1 }],
  },
  iosImageAdjustment: {
    aspectRatio: 1 / 0.5,
  },
  imagePlaceholder: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    zIndex: 10,
  },
  hiddenImage: {
    opacity: 0,
  },
  svgContainer: {
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 70,
  },
  svgBackground: {
    height: 85,
    width: 85,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgTouchable: {
    position: 'absolute',
    top: -56,
    left: -41,
  },
  categoriesContainer: {
    position: 'absolute',
    bottom: -40,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'center',
  },
  scrollingWrapper: {
    flex: 1,
  },
  categoriesList: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingRight: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    ...FONTS.fontMedium,
    marginRight: 8,
  },
  categoryIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
});

export default memo(BannerWithCategories);
