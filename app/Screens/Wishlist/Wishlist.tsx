import React, { 
  useCallback, 
  useState, 
  useMemo, 
  useRef, 
  useReducer,
  useEffect 
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  InteractionManager,
  Animated,
  BackHandler,
} from 'react-native';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';

import Header from '../../layout/Header';
import CardStyle3 from '../../components/Card/CardStyle3';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import {
  fetchWishList,
  removeProductFromWishList,
} from '../../redux/reducer/wishListReducer';
import {
  addItemToCart,
  fetchCartItems,
} from '../../redux/reducer/cartReducer';
import { cartService } from '../../Services/CartService';

// Constants
const BASE_IMAGE_URL = 'https://app.bmgjewellers.com';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ANIMATION_DURATION = 300;

// Types
interface WishlistItem {
  SNO: string;
  ITEMNAME?: string;
  GrandTotal?: string;
  GrossAmount?: string;
  ImagePath?: string;
  GRSWT?: string;
  PURITY?: string;
}

interface WishlistState {
  processing: Set<string>;
  errors: Map<string, string>;
  showFloatingCart: boolean;
  cartItemsCount: number;
  lastAction: 'add' | 'remove' | null;
  cartItemsMap: Map<string, boolean>; // Track which items are in cart
}

type WishlistAction = 
  | { type: 'SET_PROCESSING'; payload: { sno: string; processing: boolean } }
  | { type: 'SET_ERROR'; payload: { sno: string; error: string | null } }
  | { type: 'SET_FLOATING_CART'; payload: boolean }
  | { type: 'SET_CART_COUNT'; payload: number }
  | { type: 'SET_LAST_ACTION'; payload: 'add' | 'remove' | null }
  | { type: 'SET_CART_ITEMS_MAP'; payload: Map<string, boolean> }
  | { type: 'CLEAR_ALL_ERRORS' };

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'SET_PROCESSING':
      const newProcessing = new Set(state.processing);
      if (action.payload.processing) {
        newProcessing.add(action.payload.sno);
      } else {
        newProcessing.delete(action.payload.sno);
      }
      return { ...state, processing: newProcessing };
    
    case 'SET_ERROR':
      const newErrors = new Map(state.errors);
      if (action.payload.error) {
        newErrors.set(action.payload.sno, action.payload.error);
      } else {
        newErrors.delete(action.payload.sno);
      }
      return { ...state, errors: newErrors };
    
    case 'SET_FLOATING_CART':
      return { ...state, showFloatingCart: action.payload };
    
    case 'SET_CART_COUNT':
      return { ...state, cartItemsCount: action.payload };
    
    case 'SET_LAST_ACTION':
      return { ...state, lastAction: action.payload };
    
    case 'SET_CART_ITEMS_MAP':
      return { ...state, cartItemsMap: action.payload };
    
    case 'CLEAR_ALL_ERRORS':
      return { ...state, errors: new Map() };
    
    default:
      return state;
  }
};

const initialState: WishlistState = {
  processing: new Set(),
  errors: new Map(),
  showFloatingCart: false,
  cartItemsCount: 0,
  lastAction: null,
  cartItemsMap: new Map(),
};

type WishlistScreenProps = StackScreenProps<RootStackParamList, 'Wishlist'>;

// Enhanced Loading Component
const LoadingOverlay: React.FC<{ visible: boolean; message?: string }> = ({ 
  visible, 
  message = 'Processing...' 
}) => {
  if (!visible) return null;

  return (
    <View style={enhancedStyles.loadingOverlay}>
      <View style={enhancedStyles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={enhancedStyles.loadingText}>{message}</Text>
      </View>
    </View>
  );
};

// Enhanced Empty State Component
const EmptyWishlist: React.FC<{ 
  colors: any; 
  onShopNow: () => void;
}> = React.memo(({ colors, onShopNow }) => (
  <View style={enhancedStyles.emptyContainer}>
    <Animated.View style={enhancedStyles.emptyIcon}>
      <Feather color={COLORS.primary} size={28} name="heart" />
    </Animated.View>
    <Text style={[enhancedStyles.emptyTitle, { color: colors.title }]}>
      Your Wishlist is Empty!
    </Text>
    <Text style={[enhancedStyles.emptyText, { color: colors.text }]}>
      Discover amazing jewelry pieces and add them to your favorites.
    </Text>
    <TouchableOpacity 
      style={enhancedStyles.shopNowButton}
      onPress={onShopNow}
      accessibilityRole="button"
      accessibilityLabel="Shop now"
    >
      <Text style={enhancedStyles.shopNowText}>Shop Now</Text>
    </TouchableOpacity>
  </View>
));

// Cart Status Badge Component
const CartStatusBadge: React.FC<{
  isInCart: boolean;
  isProcessing: boolean;
}> = ({ isInCart, isProcessing }) => {
  if (isProcessing) return null;
  
  if (!isInCart) return null;

  return (
    <View style={enhancedStyles.cartStatusBadge}>
      <Feather name="check" size={12} color="white" />
      <Text style={enhancedStyles.cartStatusText}>In Cart</Text>
    </View>
  );
};

// Enhanced Add to Cart Button Component
const AddToCartButton: React.FC<{
  item: WishlistItem;
  isInCart: boolean;
  isProcessing: boolean;
  onAddToCart: () => void;
  onViewCart: () => void;
}> = ({ item, isInCart, isProcessing, onAddToCart, onViewCart }) => {
  if (isProcessing) {
    return (
      <View style={enhancedStyles.processingButton}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={enhancedStyles.processingText}>Adding...</Text>
      </View>
    );
  }

  if (isInCart) {
    return (
      <TouchableOpacity
        style={enhancedStyles.inCartButton}
        onPress={onViewCart}
        accessibilityRole="button"
        accessibilityLabel="View cart"
      >
        <Feather name="shopping-cart" size={16} color="white" />
        <Text style={enhancedStyles.inCartButtonText}>View Cart</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={enhancedStyles.addToCartButton}
      onPress={onAddToCart}
      accessibilityRole="button"
      accessibilityLabel={`Add ${item.ITEMNAME || 'item'} to cart`}
    >
      <Feather name="plus" size={16} color="white" />
      <Text style={enhancedStyles.addToCartButtonText}>Add to Cart</Text>
    </TouchableOpacity>
  );
};

// Floating Cart Button Component
const FloatingCartButton: React.FC<{
  visible: boolean;
  count: number;
  onPress: () => void;
}> = ({ visible, count, onPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        enhancedStyles.floatingCartButton, 
        { 
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <TouchableOpacity
        style={enhancedStyles.floatingCartTouchable}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`View cart with ${count} items`}
      >
        <Feather name="shopping-cart" size={20} color="white" />
        {count > 0 && (
          <View style={enhancedStyles.cartBadge}>
            <Text style={enhancedStyles.cartBadgeText}>
              {count > 99 ? '99+' : count.toString()}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Success Toast Component
const SuccessToast: React.FC<{
  visible: boolean;
  message: string;
  onHide: () => void;
}> = ({ visible, message, onHide }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }
  }, [visible, slideAnim, onHide]);

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        enhancedStyles.successToast,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <Feather name="check-circle" size={16} color="white" />
      <Text style={enhancedStyles.successToastText}>{message}</Text>
    </Animated.View>
  );
};

const Wishlist = ({ navigation }: WishlistScreenProps) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Redux selectors
  const { wishList, loading } = useSelector((state: any) => state.wishList || {});
  const { cart: cartItems, loading: cartLoading } = useSelector((state: any) => state.cart || {});
  
  // Local state management
  const [state, stateDispatch] = useReducer(wishlistReducer, initialState);
  const [refreshing, setRefreshing] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Check if item is in cart
  const checkCartStatus = useCallback(async () => {
    if (!wishList || wishList.length === 0) return;

    try {
      const cartItemsMap = new Map<string, boolean>();
      
      // Check each wishlist item against cart
      for (const wishlistItem of wishList) {
        if (wishlistItem?.SNO) {
          const isInCart = await cartService.isItemInCart(wishlistItem.SNO);
          cartItemsMap.set(wishlistItem.SNO, isInCart);
        }
      }
      
      stateDispatch({ type: 'SET_CART_ITEMS_MAP', payload: cartItemsMap });
    } catch (error) {
      console.error('Error checking cart status:', error);
    }
  }, [wishList]);

  // Utility functions
  const getImageUrl = useCallback((imagePath?: string): string => {
    if (!imagePath) return '';

    try {
      const parsed = typeof imagePath === 'string' ? JSON.parse(imagePath) : imagePath;
      if (Array.isArray(parsed) && parsed.length > 0) {
        const imageUrl = parsed[0];
        if (imageUrl && !imageUrl.startsWith('http')) {
          return `${BASE_IMAGE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        }
        return imageUrl || '';
      }
    } catch (err) {
      console.warn('ImagePath parse error:', err);
    }
    return '';
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setShowSuccessToast(true);
  }, []);

  const hideToast = useCallback(() => {
    setShowSuccessToast(false);
  }, []);

  // Enhanced handlers
  const handleRemove = useCallback(async (sno: string) => {
    stateDispatch({ type: 'SET_PROCESSING', payload: { sno, processing: true } });
    stateDispatch({ type: 'SET_ERROR', payload: { sno, error: null } });

    try {
      await dispatch(removeProductFromWishList(sno)).unwrap();
      stateDispatch({ type: 'SET_LAST_ACTION', payload: 'remove' });
      showToast('Item removed from wishlist');
      
      // Update cart status after removal
      setTimeout(() => {
        checkCartStatus();
      }, 500);
      
    } catch (err: any) {
      console.error('Remove from wishlist error:', err);
      const errorMessage = err?.message || 'Failed to remove item from wishlist';
      stateDispatch({ type: 'SET_ERROR', payload: { sno, error: errorMessage } });
      Alert.alert('Error', errorMessage);
    } finally {
      stateDispatch({ type: 'SET_PROCESSING', payload: { sno, processing: false } });
    }
  }, [dispatch, showToast, checkCartStatus]);

  const handleAddToCart = useCallback(async (item: WishlistItem) => {
    if (!item?.SNO) {
      Alert.alert('Error', 'Invalid item data');
      return;
    }

    // Check if already in cart
    const isAlreadyInCart = state.cartItemsMap.get(item.SNO);
    if (isAlreadyInCart) {
      Alert.alert(
        'Already in Cart', 
        'This item is already in your cart. Would you like to view your cart?',
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => navigation.navigate('MyCart') }
        ]
      );
      return;
    }

    stateDispatch({ type: 'SET_PROCESSING', payload: { sno: item.SNO, processing: true } });
    stateDispatch({ type: 'SET_ERROR', payload: { sno: item.SNO, error: null } });

    try {
      const imageUrl = getImageUrl(item.ImagePath);
      
      const cartPayload = {
        itemTagSno: item.SNO,
        imagePath: imageUrl,
        quantity: 1,
        price: item.GrandTotal || item.GrossAmount || '0',
        title: item.ITEMNAME || 'Product',
        userId: 1, // You might want to get this from user state
      };

      // Add to cart using your existing thunk
      await dispatch(addItemToCart(cartPayload)).unwrap();
      
      // Update cart status
      const newCartItemsMap = new Map(state.cartItemsMap);
      newCartItemsMap.set(item.SNO, true);
      stateDispatch({ type: 'SET_CART_ITEMS_MAP', payload: newCartItemsMap });
      
      stateDispatch({ type: 'SET_LAST_ACTION', payload: 'add' });
      stateDispatch({ type: 'SET_FLOATING_CART', payload: true });
      
      showToast('Item added to cart successfully!');
      
      // Optional: Ask user if they want to go to cart immediately
      // setTimeout(() => {
      //   Alert.alert(
      //     'Added to Cart',
      //     `${item.ITEMNAME || 'Item'} has been added to your cart successfully!`,
      //     [
      //       { text: 'Continue Shopping', style: 'cancel' },
      //       { 
      //         text: 'View Cart', 
      //         onPress: () => navigation.navigate('MyCart'),
      //         style: 'default'
      //       },
      //     ]
      //   );
      // }, 1000);

    } catch (error: any) {
      console.error('Add to cart error:', error);
      const errorMessage = error?.message || 'Failed to add item to cart';
      stateDispatch({ type: 'SET_ERROR', payload: { sno: item.SNO, error: errorMessage } });
      Alert.alert('Error', errorMessage);
    } finally {
      stateDispatch({ type: 'SET_PROCESSING', payload: { sno: item.SNO, processing: false } });
    }
  }, [dispatch, navigation, showToast, getImageUrl, state.cartItemsMap]);

  const handleShopNow = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  const handleViewCart = useCallback(() => {
    navigation.navigate('MyCart');
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    stateDispatch({ type: 'CLEAR_ALL_ERRORS' });
    
    try {
      await Promise.all([
        dispatch(fetchWishList()),
        dispatch(fetchCartItems()),
      ]);
    } catch (error) {
      console.error('Refresh error:', error);
      Alert.alert('Error', 'Failed to refresh content');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  // const scrollToTop = useCallback(() => {
  //   scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  // }, []);

  // Enhanced render functions
  const renderItem = useCallback((data: WishlistItem, index: number) => {
    if (!data?.SNO) {
      console.warn('Skipping item with no SNO:', data);
      return null;
    }

    const imageUrl = getImageUrl(data.ImagePath);
    const isProcessing = state.processing.has(data.SNO);
    const error = state.errors.get(data.SNO);
    const isInCart = state.cartItemsMap.get(data.SNO) || false;

    return (
      <View key={`${data.SNO}-${index}`} style={enhancedStyles.cardContainer}>
        {/* Cart Status Badge */}
        <CartStatusBadge isInCart={isInCart} isProcessing={isProcessing} />
        
        <CardStyle3
          id={data.SNO}
          title={data.ITEMNAME || 'Product'}
          price={`₹${data.GrandTotal || data.GrossAmount || 0}`}
          image={imageUrl}
          onPress1={() => handleRemove(data.SNO)}
          onPress2={() => {
            if (isInCart) {
              handleViewCart();
            } else {
              handleAddToCart(data);
            }
          }}
          onPress={() => navigation.navigate('ProductDetails', { sno: data.SNO })}
          review={`(${data.GRSWT || 0}g • ${data.PURITY || 0}% Pure)`}
          CardStyle4
          disabled={isProcessing}
          // Override button text and icon based on cart status
          customButton2={
            <AddToCartButton
              item={data}
              isInCart={isInCart}
              isProcessing={isProcessing}
              onAddToCart={() => handleAddToCart(data)}
              onViewCart={handleViewCart}
            />
          }
        />
        
        {/* Processing Overlay */}
        {isProcessing && (
          <View style={enhancedStyles.cardOverlay}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={enhancedStyles.overlayText}>
              {isInCart ? 'Processing...' : 'Adding to cart...'}
            </Text>
          </View>
        )}
        
        {/* Error Message */}
        {error && (
          <View style={enhancedStyles.errorMessage}>
            <Text style={enhancedStyles.errorText}>{error}</Text>
            <TouchableOpacity 
              onPress={() => stateDispatch({ 
                type: 'SET_ERROR', 
                payload: { sno: data.SNO, error: null } 
              })}
            >
              <Feather name="x" size={16} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }, [
    getImageUrl, 
    handleAddToCart, 
    handleRemove, 
    handleViewCart,
    navigation, 
    state.processing, 
    state.errors, 
    state.cartItemsMap
  ]);

  // Effects
  useFocusEffect(
    useCallback(() => {
      InteractionManager.runAfterInteractions(() => {
        dispatch(fetchWishList());
        dispatch(fetchCartItems());
      });

      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        navigation.goBack();
        return true;
      });

      return () => backHandler.remove();
    }, [dispatch, navigation])
  );

  // Check cart status when wishlist or cart items change
  useEffect(() => {
    if (wishList && wishList.length > 0) {
      checkCartStatus();
    }
  }, [wishList, cartItems, checkCartStatus]);

  useEffect(() => {
    if (cartItems?.length > 0) {
      stateDispatch({ type: 'SET_CART_COUNT', payload: cartItems.length });
      stateDispatch({ type: 'SET_FLOATING_CART', payload: true });
    } else {
      stateDispatch({ type: 'SET_FLOATING_CART', payload: false });
    }
  }, [cartItems]);

  // Memoized values
  const isEmpty = useMemo(() => !loading && (!wishList || wishList.length === 0), [loading, wishList]);
  const hasItems = useMemo(() => !loading && wishList && wishList.length > 0, [loading, wishList]);
  const itemsInCartCount = useMemo(() => 
    Array.from(state.cartItemsMap.values()).filter(Boolean).length, 
    [state.cartItemsMap]
  );

return (
  <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <StatusBar 
      barStyle={colors.background === '#FFFFFF' ? 'dark-content' : 'light-content'}
      backgroundColor={colors.background}
    />
    
    <Header 
      title="My Wishlist" 
      rightIcon2="search" 
      leftIcon="back"
      onRightPress2={() => navigation.navigate('Search', { query: '' })}
    />

    <View style={[GlobalStyleSheet.container, { flex: 1 }]}>
      <View style={enhancedStyles.scrollContainer}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={enhancedStyles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
              title="Pull to refresh"
              titleColor={colors.text}
            />
          }
          accessible={true}
          accessibilityLabel="Wishlist items"
        >
          <View style={enhancedStyles.listContainer}>
            {loading && !refreshing ? (
              <LoadingOverlay visible={true} message="Loading wishlist..." />
            ) : hasItems ? (
              <>
                {wishList.map(renderItem)}
              </>
            ) : isEmpty ? (
              <EmptyWishlist colors={colors} onShopNow={handleShopNow} />
            ) : null}
          </View>
        </ScrollView>
      </View>
    </View>

    <SuccessToast
      visible={showSuccessToast}
      message={toastMessage}
      onHide={hideToast}
    />

    {/* {hasItems && (
      <TouchableOpacity
        style={[enhancedStyles.scrollToTopButton, { backgroundColor: colors.primary }]}
        onPress={scrollToTop}
        accessibilityRole="button"
        accessibilityLabel="Scroll to top"
      >
        <Feather name="arrow-up" size={20} color="white" />
      </TouchableOpacity>
    )} */}
  </SafeAreaView>
);

};

// Enhanced styles
const enhancedStyles = {
  scrollContainer: {
    marginHorizontal: -15,
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 120,
    flexGrow: 1,
  },
  listContainer: {
    marginTop: 10,
  },
  headerStats: {
    marginBottom: 15,
    alignItems: 'center',
  },
  itemCount: {
    ...FONTS.fontSm,
    textAlign: 'center',
    opacity: 0.7,
  },
  cartStatus: {
    ...FONTS.fontXs,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
  cardContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  cartStatusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.success || '#28A745',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  cartStatusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  addToCartButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 100,
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  inCartButton: {
    backgroundColor: COLORS.success || '#28A745',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 100,
  },
  inCartButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  processingButton: {
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 100,
  },
  processingText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    zIndex: 5,
  },
  overlayText: {
    marginTop: 8,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFE6E6',
    padding: 8,
    borderRadius: 6,
    marginTop: 5,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    alignSelf: 'center',
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignSelf: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.primary,
    ...FONTS.fontMedium,
    alignSelf: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SCREEN_HEIGHT * 0.15,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    height: 80,
    width: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    marginBottom: 24,
  },
  emptyTitle: {
    ...FONTS.h4,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    ...FONTS.fontRegular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    opacity: 0.7,
  },
  shopNowButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  shopNowText: {
    color: 'white',
    ...FONTS.fontSemiBold,
    fontSize: 16,
  },
  floatingCartButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 1000,
  },
  floatingCartTouchable: {
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  successToast: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: COLORS.success || '#28A745',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    zIndex: 2000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  successToastText: {
    color: 'white',
    marginLeft: 8,
    ...FONTS.fontMedium,
    flex: 1,
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
};

export default React.memo(Wishlist);