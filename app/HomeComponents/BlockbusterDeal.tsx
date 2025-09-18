import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet, ImageSourcePropType } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../constants/StyleSheet';
import { FONTS, COLORS, SIZES } from '../constants/theme';
import ImageSwper2 from '../components/ImageSwper2';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { fetchFeaturedProducts } from '../Services/FeatureService';
import { useDispatch, useSelector } from 'react-redux';
import {
  addProductToWishList,
  removeProductFromWishList,
  fetchWishList,
} from '../redux/reducer/wishListReducer';
import { Feather } from '@expo/vector-icons';
import { IMAGES } from '../constants/Images';

type FeaturedProduct = {
  SNO: string;
  SUBITEMNAME: string;
  ITEMNAME?: string;
  GrandTotal: number | string;
  images: ImageSourcePropType[];
  Discount?: string;
  Offer?: string;
  DeliveryOption?: string;
  ImagePath?: string;
  mainImage: ImageSourcePropType;
};

type BlockbusterDealsProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

const BlockbusterDeals = ({ navigation }: BlockbusterDealsProps) => {
  const { colors, dark } = useTheme();
  const dispatch = useDispatch();
  const { wishList } = useSelector((state: any) => state.wishList);

  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadFeaturedProducts = async () => {
    try {
      setLoadingFeatured(true);
      setError(null);
      const products = await fetchFeaturedProducts();
      setFeaturedProducts(products);
    } catch (err) {
      console.error('Failed to load featured products:', err);
      setError('Failed to load featured products. Please try again later.');
      setFeaturedProducts([]);
    } finally {
      setLoadingFeatured(false);
    }
  };

  useEffect(() => {
    loadFeaturedProducts();
    dispatch(fetchWishList());
  }, [dispatch]);

  const toggleWishlist = async (product: FeaturedProduct) => {
    try {
      const isInWishlist = wishList.some((item: any) => item.SNO === product.SNO);

      if (isInWishlist) {
        await dispatch(removeProductFromWishList(product.SNO));
      } else {
        await dispatch(
          addProductToWishList({
            SNO: product.SNO,
            SUBITEMNAME: product.SUBITEMNAME || product.ITEMNAME || 'Unknown Product',
            GrandTotal: typeof product.GrandTotal === 'string' 
              ? parseFloat(product.GrandTotal) || 0 
              : product.GrandTotal,
            ImagePath: product.ImagePath,
            mainImage: product.mainImage,
          })
        );
      }
      dispatch(fetchWishList());
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  const isInWishlist = (productId: string) =>
    wishList.some((item: any) => item.SNO === productId);

  // Handle image loading errors
  const handleImageError = (productId: string) => {
    setFeaturedProducts(prev => 
      prev.map(product => 
        product.SNO === productId 
          ? { ...product, mainImage: IMAGES.item14, images: [IMAGES.item14] }
          : product
      )
    );
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: dark ? COLORS.darkBackground : COLORS.background }]}>
      {/* Header */}
      <View style={[GlobalStyleSheet.container, styles.header]}>
        <View style={styles.headerRow}>
          <Text style={[FONTS.h3, styles.headerTitle, { color: dark ? COLORS.darkTitle : COLORS.title }]}>
            Blockbuster Deals
          </Text>
        </View>
      </View>

      {/* Content */}
      {loadingFeatured ? (
        <View style={[styles.loaderContainer, { backgroundColor: dark ? COLORS.darkBackground : COLORS.background }]}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={[FONTS.fontRegular, { color: dark ? COLORS.darkText : COLORS.text, marginTop: SIZES.margin / 2 }]}>
            Loading featured products...
          </Text>
        </View>
      ) : error ? (
        <View style={[styles.messageContainer, { backgroundColor: dark ? COLORS.darkBackground : COLORS.background }]}>
          <Text style={[FONTS.fontRegular, { color: dark ? COLORS.darkText : COLORS.text, marginBottom: SIZES.margin / 2, textAlign: 'center' }]}>
            {error}
          </Text>
          <TouchableOpacity onPress={loadFeaturedProducts} style={[styles.retryButton, { borderColor: dark ? COLORS.darkBorderColor : COLORS.borderColor }]}>
            <Text style={[FONTS.fontRegular, { color: COLORS.primary }]}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      ) : featuredProducts.length > 0 ? (
        <View style={[GlobalStyleSheet.container, styles.sliderContainer]}>
          <ImageSwper2
            data={featuredProducts.map((product) => ({
              id: product.SNO,
              SNO: product.SNO,
              image: product.mainImage,
              title: product.ITEMNAME || product.SUBITEMNAME || 'Jewelry Item',
              price: `₹${typeof product.GrandTotal === 'number' 
                ? product.GrandTotal.toFixed(2) 
                : parseFloat(product.GrandTotal as string || '0').toFixed(2)}`,
              discount: product.Discount || '',
              offer: product.Offer || 'Special Offer',
              delivery: product.DeliveryOption || 'Free delivery',
              isFavorite: isInWishlist(product.SNO),
              onFavoritePress: () => toggleWishlist(product),
              onImageError: () => handleImageError(product.SNO),
            }))}
            onProductPress={(id) => navigation.navigate('ProductDetails', { sno: id })}
            favoriteIcon={
              <Feather name="heart" size={SIZES.fontLg} color={COLORS.danger} fill={COLORS.danger} />
            }
          />
        </View>
      ) : (
        <View style={[styles.messageContainer, { backgroundColor: dark ? COLORS.darkBackground : COLORS.background }]}>
          <Text style={[FONTS.fontRegular, { color: dark ? COLORS.darkText : COLORS.text, textAlign: 'center' }]}>
            No featured products available at the moment.
          </Text>
          <TouchableOpacity onPress={loadFeaturedProducts} style={[styles.retryButton, { borderColor: dark ? COLORS.darkBorderColor : COLORS.borderColor }]}>
            <Text style={[FONTS.fontRegular, { color: COLORS.primary }]}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingVertical: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  header: {
    marginBottom: SIZES.margin,
    paddingBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: SIZES.h3,
    color: COLORS.title,
  },
  loaderContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  messageContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  retryButton: {
    marginTop: SIZES.margin / 2,
    padding: SIZES.padding - 4,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    borderColor: COLORS.borderColor,
  },
  sliderContainer: {
    padding: 0,
  },
});

export default BlockbusterDeals;