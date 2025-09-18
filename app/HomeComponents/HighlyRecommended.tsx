import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  StyleSheet
} from 'react-native';
import { GlobalStyleSheet } from '../constants/StyleSheet';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import CardStyle1 from '../components/Card/CardStyle1';
import { useTheme } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigations/RootStackParamList';
import { useDispatch, useSelector } from 'react-redux';
import { addProductToWishList, removeProductFromWishList, fetchWishList } from '../redux/reducer/wishListReducer';
import { addItemToCart, removeItemFromCart, fetchCartItems } from '../redux/reducer/cartReducer';
import { getNewArrivalProducts } from '../Services/NewArrivalService';
import { IMAGES } from '../constants/Images';
import { RootState } from '../redux/store';
import { Feather } from '@expo/vector-icons';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
  title?: string;
  showSeeAll?: boolean;
};

const HighlyRecommendedSection = ({
  navigation,
  title = 'New Arrivals',
  showSeeAll = true,
}: Props) => {
  const theme = useTheme();
  const { colors } = theme;
  const dispatch = useDispatch();

  const { cart } = useSelector((state: RootState) => state.cart);
  const { wishList, loading: wishlistLoading } = useSelector((state: RootState) => state.wishList);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Image processing function
  const getImageUrl = useCallback((product: any): string => {
    try {
      // If the service already processed the image, use it directly
      if (product.image && product.image !== IMAGES.item11) {
        return product.image;
      }

      // If no ImagePath or it's too short, return default image
      if (!product.ImagePath || product.ImagePath.length < 5) {
        return IMAGES.item12;
      }

      let parsedImages: any[] = [];

      // Parse ImagePath (handles JSON string arrays)
      if (typeof product.ImagePath === 'string') {
        // Check if it's a JSON array string
        if (product.ImagePath.startsWith('[') && product.ImagePath.endsWith(']')) {
          try {
            parsedImages = JSON.parse(product.ImagePath);
          } catch {
            // If JSON parsing fails, try to extract paths manually
            const pathMatch = product.ImagePath.match(/"([^"]+)"/g);
            parsedImages = pathMatch ? pathMatch.map((path: string) => path.replace(/"/g, '')) : [product.ImagePath];
          }
        } else {
          parsedImages = [product.ImagePath];
        }
      } else if (Array.isArray(product.ImagePath)) {
        parsedImages = product.ImagePath;
      }

      // Get first image
      let image = parsedImages.length > 0 ? parsedImages[0] : '';

      if (!image || typeof image !== 'string') return IMAGES.item12;

      // Clean the image path
      image = image.trim().replace(/["'[\]]/g, '');

      // Ensure full URL
      if (image.startsWith('http')) {
        return image;
      } else if (image.startsWith('/')) {
        return `https://app.bmgjewellers.com${image}`;
      } else {
        return `https://app.bmgjewellers.com/${image}`;
      }
    } catch (err) {
      console.error('Image URL parsing error:', err);
      return IMAGES.item12;
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([
          dispatch(fetchCartItems()),
          dispatch(fetchWishList()),
          fetchNewArrivals()
        ]);
      } catch (err) {
        setError('Failed to load products. Please try again.');
        console.error('Initial data loading error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [dispatch]);

  const fetchNewArrivals = useCallback(async () => {
    try {
      const data = await getNewArrivalProducts();
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
      throw new Error("Failed to load products");
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      await Promise.all([
        fetchNewArrivals(),
        dispatch(fetchWishList()),
        dispatch(fetchCartItems())
      ]);
    } catch (err) {
      console.error('Refresh error:', err);
      setError('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [fetchNewArrivals, dispatch]);

  const toggleWishList = useCallback(async (product: any) => {
    try {
      const exists = wishList.some((item) => item.SNO === product.SNO);
      
      if (exists) {
        await dispatch(removeProductFromWishList(product.SNO));
      } else {
        await dispatch(addProductToWishList(product));
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  }, [dispatch, wishList]);

  const handleCartAction = useCallback(async (product: any) => {
    try {
      const existingItem = cart.find((item) => item.itemTagSno === product.SNO);
      
      if (existingItem) {
        await dispatch(removeItemFromCart(existingItem.sno));
      } else {
        const imageUrl = getImageUrl(product);
        
        const cartPayload = {
          itemTagSno: product.SNO,
          imagePath: imageUrl,
          quantity: 1,
          price: parseFloat(product.GrandTotal || product.GrossAmount || '0'),
          productData: product
        };

        await dispatch(addItemToCart(cartPayload));
      }
    } catch (err) {
      console.error('Cart action error:', err);
    }
  }, [dispatch, cart, getImageUrl]);

  const navigateToProductDetails = useCallback((product: any) => {
    navigation.navigate('ProductDetails', { 
      sno: product.SNO,
      productData: product 
    });
  }, [navigation]);

  const memoizedProducts = useMemo(() => products, [products]);

  // Render loading state
  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.dark ? COLORS.darkBackground : COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: theme.dark ? COLORS.darkText : COLORS.text }]}>
          Loading products...
        </Text>
      </View>
    );
  }

  // Render error state
  if (error && products.length === 0) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.dark ? COLORS.darkBackground : COLORS.background }]}>
        <Feather name="alert-circle" size={SIZES.h2} color={COLORS.danger} />
        <Text style={[styles.errorText, { color: theme.dark ? COLORS.darkTitle : COLORS.title }]}>
          {error}
        </Text>
        <TouchableOpacity 
          style={[styles.refreshButton, { borderColor: theme.dark ? COLORS.darkBorderColor : COLORS.borderColor }]}
          onPress={handleRefresh}
        >
          <Feather name="refresh-cw" size={SIZES.fontLg} color={COLORS.primary} />
          <Text style={[styles.refreshText, { color: COLORS.primary }]}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render empty state
  if (!loading && products.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.dark ? COLORS.darkBackground : COLORS.background }]}>
        <Feather name="package" size={SIZES.h2} color={theme.dark ? COLORS.darkText : COLORS.text} />
        <Text style={[styles.emptyTitle, { color: theme.dark ? COLORS.darkTitle : COLORS.title }]}>
          No products found
        </Text>
        <Text style={[styles.emptyText, { color: theme.dark ? COLORS.darkText : COLORS.text }]}>
          Check back later for new arrivals
        </Text>
        <TouchableOpacity 
          style={[styles.refreshButton, { borderColor: theme.dark ? COLORS.darkBorderColor : COLORS.borderColor }]}
          onPress={handleRefresh}
        >
          <Feather name="refresh-cw" size={SIZES.fontLg} color={COLORS.primary} />
          <Text style={[styles.refreshText, { color: COLORS.primary }]}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[GlobalStyleSheet.container, styles.container, { backgroundColor: theme.dark ? COLORS.darkBackground : COLORS.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.dark ? COLORS.darkTitle : COLORS.title }]}>
          {title}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productsContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {memoizedProducts.map((product) => {
          const inWishList = wishList.some((item) => item.SNO === product.SNO);
          const cartItem = cart.find((item) => item.itemTagSno === product.SNO);
          const imageUrl = getImageUrl(product);

          return (
            <View
              key={`product-${product.SNO}`}
              style={styles.productWrapper}
            >
              <CardStyle1
                id={product.SNO}
                image={imageUrl}
                title={product.ITEMNAME || 'Product'}
                price={`₹${product.GrandTotal || product.GrossAmount || 0}`}
                onPress={() => navigateToProductDetails(product)}
                onPress1={() => toggleWishList(product)}
                onPress2={() => handleCartAction(product)}
                closebtn
                wishlistActive={inWishList}
                cartActive={!!cartItem}
                product={product}
                cartItemId={cartItem?.sno}
              />
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.decorativeBorder}>
        <Image 
          source={IMAGES.border2} 
          style={styles.borderImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: SIZES.padding + 5,
    position: 'relative',
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    padding: SIZES.padding,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SIZES.margin / 2,
    ...FONTS.fontRegular,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  errorContainer: {
    padding: SIZES.padding,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    backgroundColor: COLORS.background,
  },
  errorText: {
    marginTop: SIZES.margin / 2,
    ...FONTS.h5,
    fontSize: SIZES.h5,
    textAlign: 'center',
    color: COLORS.title,
  },
  emptyContainer: {
    padding: SIZES.padding,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    backgroundColor: COLORS.background,
  },
  emptyTitle: {
    marginTop: SIZES.margin / 2,
    ...FONTS.h5,
    fontSize: SIZES.h5,
    color: COLORS.title,
  },
  emptyText: {
    marginTop: 5,
    ...FONTS.fontRegular,
    fontSize: SIZES.font,
    textAlign: 'center',
    color: COLORS.text,
  },
  refreshButton: {
    marginTop: SIZES.margin,
    padding: SIZES.padding - 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: SIZES.radius_lg,
    paddingHorizontal: SIZES.padding + 4,
    borderColor: COLORS.borderColor,
  },
  refreshText: {
    marginLeft: 5,
    ...FONTS.fontRegular,
    fontSize: SIZES.font,
    color: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.margin,
    paddingHorizontal: SIZES.padding,
  },
  title: {
    ...FONTS.h3,
    fontSize: SIZES.h4,
    lineHeight: SIZES.h3 + 6,
    flex: 1,
    color: COLORS.title,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    ...FONTS.fontRegular,
    fontSize: SIZES.fontSm,
    marginRight: 2,
    color: COLORS.primary,
  },
  productsContainer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
  },
  productWrapper: {
    width: SIZES.width / 2.3,
    marginRight: SIZES.margin,
  },
  decorativeBorder: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: -1,
  },
  borderImage: {
    width: '100%',
    height: '100%',
  }
});

export default HighlyRecommendedSection;