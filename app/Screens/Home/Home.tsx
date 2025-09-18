import React, { 
  useEffect, 
  useState, 
  useCallback, 
  useMemo,
  useContext,
  useRef,
  useReducer
} from 'react';
import { useTheme } from '@react-navigation/native';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ActivityIndicator, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  TextInput, 
  Alert,
  Dimensions,
  RefreshControl,
  StatusBar,
  InteractionManager
} from 'react-native';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS, SIZES, ICONS } from '../../constants/theme';
import { ScrollView } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons';
import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { useDispatch, useSelector } from 'react-redux';
import { addTowishList } from '../../redux/reducer/wishListReducer';
import { addToCart } from '../../redux/reducer/cartReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../../Context/ProfileContext';
import { useFocusEffect } from '@react-navigation/native';
import { cartService } from '../../Services/CartService';
import { fetchCartItems } from '../../redux/reducer/cartReducer';
import { fetchFeaturedProducts } from '../../Services/FeatureService';
import { fetchBestDesignProducts } from '../../Services/BestDesignService';

// Enhanced lazy loading with error boundaries
const createLazyComponent = (importFn: () => Promise<any>, displayName: string) => {
  const LazyComponent = React.lazy(importFn);
  LazyComponent.displayName = displayName;
  return LazyComponent;
};

// HomeComponents - Lazy loaded for better performance
const JewelryCollection = createLazyComponent(() => import('../../HomeComponents/JewelryCollection'), 'JewelryCollection');
const NaturalBeautySection = createLazyComponent(() => import('../../HomeComponents/NaturalBeauty'), 'NaturalBeautySection');
const HighlyRecommendedSection = createLazyComponent(() => import('../../HomeComponents/HighlyRecommended'), 'HighlyRecommendedSection');
const RecentlyShortlistedSection = createLazyComponent(() => import('../../HomeComponents/RecentlyShortlisted'), 'RecentlyShortlistedSection');
const BannerSlider = createLazyComponent(() => import('../../HomeComponents/Slider'), 'BannerSlider');
const FestivalSlider = createLazyComponent(() => import('../../HomeComponents/FestivalSlider'), 'FestivalSlider');
const VideoSection = createLazyComponent(() => import('../../HomeComponents/VideoSection'), 'VideoSection');
const FeaturedNowSection = createLazyComponent(() => import('../../HomeComponents/Feature'), 'FeaturedNowSection');
const GreatSavingsSection = createLazyComponent(() => import('../../HomeComponents/GreatSaving'), 'GreatSavingsSection');
const PopularNearbySection = createLazyComponent(() => import('../../HomeComponents/PopularNearby'), 'PopularNearbySection');
const ProductBannerSection = createLazyComponent(() => import('../../HomeComponents/ProductBanner'), 'ProductBannerSection');
const SponsoredProducts = createLazyComponent(() => import('../../HomeComponents/SponseredProduct'), 'SponsoredProducts');
const PeopleAlsoViewed = createLazyComponent(() => import('../../HomeComponents/PeopleViewed'), 'PeopleAlsoViewed');
const CartItemsPreview = createLazyComponent(() => import('../../HomeComponents/CartPreview'), 'CartItemsPreview');
const BlockbusterDeals = createLazyComponent(() => import('../../HomeComponents/BlockbusterDeal'), 'BlockbusterDeals');
const BestDesigns = createLazyComponent(() => import('../../HomeComponents/BestDesign'), 'BestDesigns');
const BudgetCategories = createLazyComponent(() => import('../../HomeComponents/BudgetCategory'), 'BudgetCategories');
const OccasionBanner = createLazyComponent(() => import('../../HomeComponents/OccasionBanner'), 'OccasionBanner');
const OfferBanner = createLazyComponent(() => import('../../HomeComponents/OfferBanner'), 'OfferBanner');
const RingCollection = createLazyComponent(() => import('../../HomeComponents/RingCollection'), 'RingCollection');
const Footer = createLazyComponent(() => import('../../HomeComponents/Footer'), 'Footer');

// Constants
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SEARCH_DEBOUNCE_DELAY = 500;
const DEFAULT_IMAGE_URL = 'https://app.bmgjewellers.com/uploads/1144/8a953e21-4a4e-4600-bfdb-f614d3a08bc3_img-2.jpg';
const BASE_API_URL = 'https://app.bmgjewellers.com';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Enhanced Types
interface CartItemWithDetails { 
  sno: string;
  itemTagSno: string;
  fullDetails: {
    SNO: string;
    Title: string;
    GrandTotal: string;
    ImagePath: string;
  };
}

interface FeaturedProduct {
  SNO: string;
  ITEMNAME: string;
  SUBITEMNAME: string;
  GrandTotal: string;
  images: string[];
  Description?: string;
  Offer?: string;
  DeliveryOption?: string;
}

interface UserData {
  username: string;
  email: string;
  lastLogin?: string;
}

interface LoadingState {
  main: boolean;
  featured: boolean;
  bestDesign: boolean;
  cart: boolean;
  refresh: boolean;
}

interface ErrorState {
  featured: string | null;
  bestDesign: string | null;
  cart: string | null;
  network: string | null;
}

// State management with useReducer for better control
interface HomeState {
  userData: UserData;
  cartProducts: CartItemWithDetails[];
  featuredProducts: FeaturedProduct[];
  bestDesignProducts: any[];
  loading: LoadingState;
  errors: ErrorState;
  refreshing: boolean;
  searchQuery: string;
  lastRefresh: number;
  networkStatus: 'online' | 'offline' | 'unknown';
}

type HomeAction = 
  | { type: 'SET_USER_DATA'; payload: UserData }
  | { type: 'SET_CART_PRODUCTS'; payload: CartItemWithDetails[] }
  | { type: 'SET_FEATURED_PRODUCTS'; payload: FeaturedProduct[] }
  | { type: 'SET_BEST_DESIGN_PRODUCTS'; payload: any[] }
  | { type: 'SET_LOADING'; payload: Partial<LoadingState> }
  | { type: 'SET_ERROR'; payload: Partial<ErrorState> }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_NETWORK_STATUS'; payload: 'online' | 'offline' | 'unknown' }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'UPDATE_LAST_REFRESH' };

const initialState: HomeState = {
  userData: { username: 'Guest', email: '' },
  cartProducts: [],
  featuredProducts: [],
  bestDesignProducts: [],
  loading: {
    main: true,
    featured: false,
    bestDesign: false,
    cart: false,
    refresh: false,
  },
  errors: {
    featured: null,
    bestDesign: null,
    cart: null,
    network: null,
  },
  refreshing: false,
  searchQuery: '',
  lastRefresh: 0,
  networkStatus: 'unknown',
};

const homeReducer = (state: HomeState, action: HomeAction): HomeState => {
  switch (action.type) {
    case 'SET_USER_DATA':
      return { ...state, userData: action.payload };
    case 'SET_CART_PRODUCTS':
      return { ...state, cartProducts: action.payload };
    case 'SET_FEATURED_PRODUCTS':
      return { ...state, featuredProducts: action.payload };
    case 'SET_BEST_DESIGN_PRODUCTS':
      return { ...state, bestDesignProducts: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: { ...state.loading, ...action.payload } };
    case 'SET_ERROR':
      return { ...state, errors: { ...state.errors, ...action.payload } };
    case 'SET_REFRESHING':
      return { ...state, refreshing: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_NETWORK_STATUS':
      return { ...state, networkStatus: action.payload };
    case 'CLEAR_ERRORS':
      return { ...state, errors: initialState.errors };
    case 'UPDATE_LAST_REFRESH':
      return { ...state, lastRefresh: Date.now() };
    default:
      return state;
  }
};

type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>;

// Enhanced Custom hooks
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const useAsyncStorage = () => {
  const cache = useRef<Map<string, { data: any; timestamp: number }>>(new Map());

  const getUserData = useCallback(async (): Promise<UserData> => {
    const cacheKey = 'userData';
    const cached = cache.current.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const [username, email, lastLogin] = await Promise.all([
        AsyncStorage.getItem('user_name'),
        AsyncStorage.getItem('user_email'),
        AsyncStorage.getItem('last_login'),
      ]);
      
      const userData = {
        username: username || 'Guest',
        email: email || '',
        lastLogin: lastLogin || undefined,
      };

      cache.current.set(cacheKey, { data: userData, timestamp: Date.now() });
      return userData;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return { username: 'Guest', email: '' };
    }
  }, []);

  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  return { getUserData, clearCache };
};

// Enhanced Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <View style={styles.errorBoundaryContainer}>
          <Text style={styles.errorBoundaryText}>Something went wrong</Text>
          <TouchableOpacity 
            style={styles.errorBoundaryButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.errorBoundaryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Enhanced Loading Component with skeleton
const LoadingIndicator: React.FC<{ 
  message?: string; 
  showSkeleton?: boolean;
  size?: 'small' | 'large';
}> = ({ 
  message = 'Loading...', 
  showSkeleton = false,
  size = 'large' 
}) => {
  if (showSkeleton) {
    return (
      <View style={styles.skeletonContainer}>
        <View style={[styles.skeletonHeader, styles.skeletonShimmer]} />
        <View style={[styles.skeletonContent, styles.skeletonShimmer]} />
        <View style={[styles.skeletonFooter, styles.skeletonShimmer]} />
      </View>
    );
  }

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size={size} color={COLORS.primary} />
      <Text style={styles.loadingText} accessibilityLiveRegion="polite">
        {message}
      </Text>
    </View>
  );
};

// Enhanced Error Component
const ErrorComponent: React.FC<{ 
  message: string; 
  onRetry?: () => void;
  testID?: string;
  type?: 'network' | 'data' | 'generic';
}> = ({ message, onRetry, testID, type = 'generic' }) => {
  const getErrorIcon = () => {
    switch (type) {
      case 'network':
        return '📡';
      case 'data':
        return '📊';
      default:
        return '⚠️';
    }
  };

  return (
    <View style={styles.errorContainer} testID={testID}>
      <Text style={styles.errorIcon}>{getErrorIcon()}</Text>
      <Text style={styles.errorText} accessibilityRole="alert">
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry loading"
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Enhanced Lazy Component Wrapper with Error Boundary
const LazyWrapper: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  name?: string;
}> = ({ children, fallback, name }) => (
  <ErrorBoundary
    fallback={
      <ErrorComponent 
        message={`Failed to load ${name || 'component'}`}
        type="generic"
      />
    }
  >
    <React.Suspense fallback={fallback || <LoadingIndicator showSkeleton />}>
      {children}
    </React.Suspense>
  </ErrorBoundary>
);

// Enhanced Search Bar Component
const SearchBar: React.FC<{
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  style: any;
  theme: any;
}> = React.memo(({ value, onChangeText, onSubmit, style, theme }) => (
  <View style={styles.searchContainer}>
    <TextInput
      style={style}
      placeholder="Search products, collections..."
      placeholderTextColor={theme.dark ? COLORS.darkPlaceholder : COLORS.placeholder}
      value={value}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmit}
      returnKeyType="search"
      accessible={true}
      accessibilityLabel="Search input field"
      accessibilityHint="Enter text to search for products"
      autoCapitalize="none"
      autoCorrect={false}
      clearButtonMode="while-editing"
    />
    <TouchableOpacity 
      style={styles.searchIcon}
      onPress={onSubmit}
      accessible={true}
      accessibilityLabel="Search button"
      accessibilityRole="button"
    >
      <Image
        style={styles.searchImage}
        source={IMAGES.search}
      />
    </TouchableOpacity>
  </View>
));

const Home: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { profileImage } = useContext(UserContext);
  const theme = useTheme();
  const { colors }: { colors: any } = theme;
  const dispatch = useDispatch();
  const { getUserData, clearCache } = useAsyncStorage();
  const scrollViewRef = useRef<ScrollView>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced state management with useReducer
  const [state, stateDispatch] = useReducer(homeReducer, initialState);

  // Redux selectors with error handling
  const cartItems = useSelector((state: any) => {
    try {
      return state.cart?.items || [];
    } catch (error) {
      console.error('Error accessing cart items from Redux:', error);
      return [];
    }
  });

  const debouncedSearchQuery = useDebounce(state.searchQuery, SEARCH_DEBOUNCE_DELAY);

  // Enhanced memoized values
  const headerStyle = useMemo(() => ({
    backgroundColor: theme.dark ? COLORS.darkBackground : COLORS.background,
    paddingHorizontal: SIZES.padding,
    shadowColor: Platform.OS === 'ios' ? COLORS.shadow : COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }), [theme.dark]);

  const searchBarStyle = useMemo(() => ({
    ...FONTS.fontRegular,
    fontSize: SIZES.fontLg,
    height: 52,
    backgroundColor: theme.dark ? COLORS.darkInput : COLORS.input,
    borderRadius: SIZES.radius_lg,
    paddingLeft: SIZES.padding + 5,
    paddingRight: 50, // Space for search icon
    color: theme.dark ? COLORS.darkText : COLORS.text,
    shadowColor: Platform.OS === 'ios' ? COLORS.primaryLight : COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.dark ? COLORS.darkBorderColor : COLORS.borderColor,
  }), [theme.dark]);

  // Enhanced utility functions
  const getImageUrl = useCallback((imagePath?: string): string => {
    if (!imagePath || imagePath.length < 5) return DEFAULT_IMAGE_URL;
    
    try {
      const parsed = JSON.parse(imagePath);
      let image = parsed?.[0] || '';
      
      if (!image || typeof image !== 'string') return DEFAULT_IMAGE_URL;
      
      return image.startsWith('http') ? image : `${BASE_API_URL}${image}`;
    } catch (error) {
      console.warn('Image parse error:', error);
      return DEFAULT_IMAGE_URL;
    }
  }, []);

  const validateProduct = useCallback((product: any): boolean => {
    return !!(product?.SNO && 
             product?.images?.length > 0 && 
             (product?.GrandTotal || product?.grossAmount));
  }, []);

  // Enhanced API functions with better error handling
  const loadUserData = useCallback(async () => {
    try {
      const userData = await getUserData();
      stateDispatch({ type: 'SET_USER_DATA', payload: userData });
    } catch (error) {
      console.error('Error loading user data:', error);
      stateDispatch({ 
        type: 'SET_ERROR', 
        payload: { network: 'Failed to load user data' } 
      });
    }
  }, [getUserData]);

  const loadBestDesignProducts = useCallback(async () => {
    try {
      stateDispatch({ 
        type: 'SET_LOADING', 
        payload: { bestDesign: true } 
      });
      stateDispatch({ 
        type: 'SET_ERROR', 
        payload: { bestDesign: null } 
      });

      const products = await fetchBestDesignProducts();
      const validProducts = products.filter(validateProduct);

      stateDispatch({ 
        type: 'SET_BEST_DESIGN_PRODUCTS', 
        payload: validProducts 
      });
    } catch (error) {
      console.error('Error loading best design products:', error);
      stateDispatch({ 
        type: 'SET_ERROR', 
        payload: { bestDesign: 'Failed to load best design products' } 
      });
    } finally {
      stateDispatch({ 
        type: 'SET_LOADING', 
        payload: { bestDesign: false } 
      });
    }
  }, [validateProduct]);

  const fetchCartProducts = useCallback(async () => {
    try {
      stateDispatch({ 
        type: 'SET_LOADING', 
        payload: { cart: true } 
      });
      stateDispatch({ 
        type: 'SET_ERROR', 
        payload: { cart: null } 
      });

      const [detailedProducts, cartItems] = await Promise.all([
        cartService.getDetailedCartProducts(),
        cartService.getItemsByPhone(),
      ]);

      const merged: CartItemWithDetails[] = cartItems
        .map((item) => {
          const product = detailedProducts.find((p) => p.SNO === item.itemTagSno);
          return product ? { ...item, fullDetails: product } : null;
        })
        .filter((item): item is CartItemWithDetails => item !== null);

      stateDispatch({ 
        type: 'SET_CART_PRODUCTS', 
        payload: merged 
      });
      
      dispatch(fetchCartItems());
    } catch (error) {
      console.error('Error loading cart data:', error);
      stateDispatch({ 
        type: 'SET_ERROR', 
        payload: { cart: 'Failed to load cart items' } 
      });
    } finally {
      stateDispatch({ 
        type: 'SET_LOADING', 
        payload: { cart: false } 
      });
    }
  }, [dispatch]);

  // Enhanced event handlers
  const handleRefresh = useCallback(async () => {
    const now = Date.now();
    if (now - state.lastRefresh < 2000) return; // Prevent rapid refresh

    stateDispatch({ type: 'SET_REFRESHING', payload: true });
    stateDispatch({ type: 'CLEAR_ERRORS' });
    
    try {
      await Promise.all([
        loadUserData(),
        loadBestDesignProducts(),
        fetchCartProducts(),
      ]);
      stateDispatch({ type: 'UPDATE_LAST_REFRESH' });
    } catch (error) {
      console.error('Error during refresh:', error);
      Alert.alert(
        'Refresh Failed', 
        'Unable to refresh content. Please check your connection.',
        [{ text: 'OK' }]
      );
    } finally {
      stateDispatch({ type: 'SET_REFRESHING', payload: false });
    }
  }, [loadUserData, loadBestDesignProducts, fetchCartProducts, state.lastRefresh]);

  const handleRemove = useCallback(async (item: CartItemWithDetails) => {
    try {
      await cartService.removeItem(item.sno);
      await fetchCartProducts();
      Alert.alert('Success', 'Item removed from cart');
    } catch (error) {
      console.error('Error removing cart item:', error);
      Alert.alert('Error', 'Failed to remove item from cart.');
    }
  }, [fetchCartProducts]);

  const handleAddToWishList = useCallback((data: any) => {
    try {
      dispatch(addTowishList(data));
      Alert.alert('Success', 'Item added to wishlist');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      Alert.alert('Error', 'Failed to add item to wishlist.');
    }
  }, [dispatch]);

  const handleAddToCart = useCallback((data: any) => {
    try {
      dispatch(addToCart(data));
      navigation.navigate('MyCart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart.');
    }
  }, [dispatch, navigation]);

  const handleSearch = useCallback((query: string) => {
    stateDispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const handleSearchSubmit = useCallback(() => {
    const query = state.searchQuery.trim();
    if (query.length < 2) {
      Alert.alert('Search', 'Please enter at least 2 characters to search');
      return;
    }
    navigation.navigate('Search', { query });
  }, [state.searchQuery, navigation]);

  const scrollToTop = useCallback(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  // Enhanced effects
  useEffect(() => {
    const initializeData = async () => {
      InteractionManager.runAfterInteractions(async () => {
        stateDispatch({ 
          type: 'SET_LOADING', 
          payload: { main: true } 
        });
        
        try {
          await Promise.all([
            loadUserData(),
            loadBestDesignProducts(),
          ]);
        } catch (error) {
          console.error('Error during initialization:', error);
        } finally {
          stateDispatch({ 
            type: 'SET_LOADING', 
            payload: { main: false } 
          });
        }
      });
    };

    initializeData();
  }, [loadUserData, loadBestDesignProducts]);

  useFocusEffect(
    useCallback(() => {
      fetchCartProducts();
      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    }, [fetchCartProducts])
  );

  // Enhanced render functions
  const renderHeader = () => (
    <View style={[styles.header, headerStyle]}>
      <TouchableOpacity 
        onPress={() => navigation.openDrawer()}
        style={styles.userSection}
        accessible={true}
        accessibilityLabel={`Open navigation drawer. Welcome ${state.userData.username}`}
        accessibilityRole="button"
        accessibilityHint="Opens the navigation menu"
      >
        <Image
          style={styles.profileImage}
          source={profileImage ? { uri: profileImage } : IMAGES.user2}
          defaultSource={IMAGES.user2}
        />
        <View style={styles.greetingContainer}>
          <Text style={[styles.greetingText, { color: theme.dark ? COLORS.darkText : COLORS.text }]}>
            Hello
          </Text>
          <Text style={[styles.usernameText, { color: theme.dark ? COLORS.darkText : COLORS.text }]}>
            {state.userData.username}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('Notification')}
        style={[styles.notificationButton, { backgroundColor: theme.dark ? COLORS.darkCard : COLORS.card }]}
        accessible={true}
        accessibilityLabel="Open notifications"
        accessibilityRole="button"
        accessibilityHint="View your notifications"
      >
        <Image
          style={[styles.bellIcon, { tintColor: theme.dark ? COLORS.darkText : COLORS.text }]}
          source={IMAGES.bell}
        />
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <SearchBar
      value={state.searchQuery}
      onChangeText={handleSearch}
      onSubmit={handleSearchSubmit}
      style={searchBarStyle}
      theme={theme}
    />
  );

  const renderOfflineIndicator = () => {
    if (state.networkStatus === 'offline') {
      return (
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineText}>
            You're offline. Some content may not be up to date.
          </Text>
        </View>
      );
    }
    return null;
  };

  // Enhanced loading state
  if (state.loading.main) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.dark ? COLORS.darkBackground : COLORS.background }]}>
        <StatusBar 
          barStyle={theme.dark ? 'light-content' : 'dark-content'} 
          backgroundColor={theme.dark ? COLORS.darkBackground : COLORS.background} 
        />
        <LoadingIndicator message="Loading home content..." showSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.dark ? COLORS.darkBackground : COLORS.background }]}>
      <StatusBar 
        barStyle={theme.dark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.dark ? COLORS.darkBackground : COLORS.background} 
      />
      
      {renderOfflineIndicator()}
      
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={state.refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            title="Pull to refresh"
            titleColor={theme.dark ? COLORS.darkText : COLORS.text}
          />
        }
        accessible={true}
        accessibilityLabel="Home screen content"
      >
        <View style={[styles.mainContainer, { backgroundColor: theme.dark ? COLORS.darkBackground : COLORS.background }]}>
          {renderHeader()}
          {renderSearchBar()}
          
          <View style={[styles.shadowBox, { backgroundColor: theme.dark ? COLORS.darkCard : COLORS.card }]} />

          <LazyWrapper name="Popular Nearby">
            <PopularNearbySection />
          </LazyWrapper>

          <LazyWrapper name="Natural Beauty">
            <NaturalBeautySection navigation={navigation} />
          </LazyWrapper>
        </View>

        <LazyWrapper name="Jewelry Collection">
          <JewelryCollection />
        </LazyWrapper>

        <LazyWrapper name="Product Banner">
          <ProductBannerSection navigation={navigation} />
        </LazyWrapper>

        <LazyWrapper name="Highly Recommended">
          <HighlyRecommendedSection navigation={navigation} />
        </LazyWrapper>

        <LazyWrapper name="Offer Banner">
          <OfferBanner />
        </LazyWrapper>

        <LazyWrapper name="Blockbuster Deals">
          <BlockbusterDeals navigation={navigation} />
        </LazyWrapper>

        <LazyWrapper name="Occasion Banner">
          <OccasionBanner />
        </LazyWrapper>

        <LazyWrapper name="Recently Shortlisted">
          <RecentlyShortlistedSection navigation={navigation} />
        </LazyWrapper>

        <LazyWrapper name="Banner Slider">
          <BannerSlider />
        </LazyWrapper>

        <LazyWrapper name="Sponsored Products">
          <SponsoredProducts />
        </LazyWrapper>

        <LazyWrapper name="Budget Categories">
          <BudgetCategories />
        </LazyWrapper>

        {state.errors.cart ? (
          <ErrorComponent 
            message={state.errors.cart}
            onRetry={fetchCartProducts}
            testID="cart-error"
            type="data"
          />
        ) : (
          <LazyWrapper name="Cart Preview">
            <CartItemsPreview 
              navigation={navigation}
              loading={state.loading.cart}
              cartProducts={state.cartProducts}
              handleRemove={handleRemove}
              getImageUrl={getImageUrl}
            />
          </LazyWrapper>
        )}

        <LazyWrapper name="Festival Slider">
          <FestivalSlider />
        </LazyWrapper>

        <LazyWrapper name="Featured Now">
          <FeaturedNowSection navigation={navigation} />
        </LazyWrapper>

        {state.errors.bestDesign ? (
          <ErrorComponent 
            message={state.errors.bestDesign}
            onRetry={loadBestDesignProducts}
            testID="best-design-error"
            type="data"
          />
        ) : state.bestDesignProducts.length > 0 ? (
          <LazyWrapper name="Best Designs">
            <BestDesigns 
              navigation={navigation}
              loadingBestDesign={state.loading.bestDesign}
              bestDesignError={state.errors.bestDesign}
              bestDesignProducts={state.bestDesignProducts}
              addItemToWishList={handleAddToWishList}
              addItemToCart={handleAddToCart}
              loadBestDesignProducts={loadBestDesignProducts}
            />
          </LazyWrapper>
        ) : null}

        <LazyWrapper name="Ring Collection">
          <RingCollection navigation={navigation}  />
        </LazyWrapper> 

        <Footer />    
      </ScrollView>
    </SafeAreaView>
  );
};

// Enhanced styles with theme integration
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Default to light theme background
  },
  scrollContent: {
    paddingBottom: SIZES.padding * 7,
  },
  mainContainer: {
    marginHorizontal: SIZES.margin / 3,
    marginVertical: SIZES.margin / 3,
    marginBottom: 0,
    paddingBottom: 0,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 70,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding - 5,
  },
  userSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SIZES.fontSm - 1,
    paddingRight: SIZES.padding,
    flex: 1,
  },
  profileImage: {
    height: SIZES.h3 * 2,
    width: SIZES.h3 * 2,
    borderRadius: SIZES.radius_lg + 1,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  greetingContainer: {
    flex: 1,
  },
  greetingText: {
    ...FONTS.subheading,
    fontSize: SIZES.font,
    lineHeight: SIZES.font + 4,
    color: COLORS.text,
  },
  usernameText: {
    ...FONTS.subheading,
    fontSize: SIZES.h5,
    lineHeight: SIZES.h5 + 4,
    color: COLORS.text,
  },
  notificationButton: {
    height: SIZES.h3 * 2,
    width: SIZES.h3 * 2,
    borderRadius: SIZES.radius_lg + 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: SIZES.radius_lg - 7,
    elevation: 5,
    backgroundColor: COLORS.card,
  },
  bellIcon: {
    width: SIZES.h6 + 6,
    height: SIZES.h6 + 6,
    tintColor: COLORS.text,
  },
  searchContainer: {
    marginTop: SIZES.margin + 5,
    position: 'relative',
    marginHorizontal: SIZES.margin / 3,
  },
  searchIcon: {
    position: 'absolute',
    right: SIZES.padding,
    top: SIZES.fontLg,
    padding: 5,
  },
  searchImage: {
    height: SIZES.h6 + 4,
    width: SIZES.h6 + 4,
    tintColor: COLORS.primary,
  },
  shadowBox: {
    height: SIZES.h3 * 2 + 2,
    opacity: 0.6,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.margin + 5,
    marginTop: -40,
    zIndex: -1,
    backgroundColor: COLORS.card,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding + 5,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SIZES.margin - 3,
    ...FONTS.fontMedium,
    fontSize: SIZES.fontLg,
    color: COLORS.primary,
  },
  skeletonContainer: {
    padding: SIZES.padding + 5,
    gap: SIZES.margin,
    backgroundColor: COLORS.background,
  },
  skeletonHeader: {
    height: SIZES.h2 * 2 + 4,
    borderRadius: SIZES.radius_lg - 5,
  },
  skeletonContent: {
    height: SIZES.height * 0.25,
    borderRadius: SIZES.radius_lg - 5,
  },
  skeletonFooter: {
    height: SIZES.h1,
    borderRadius: SIZES.radius_lg - 5,
  },
  skeletonShimmer: {
    backgroundColor: COLORS.light,
    opacity: 0.7,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding + 5,
    margin: SIZES.margin,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius_sm + 4,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    minHeight: SIZES.height * 0.15,
  },
  errorIcon: {
    fontSize: SIZES.h2 + 4,
    marginBottom: SIZES.margin - 5,
    color: COLORS.danger,
  },
  errorText: {
    ...FONTS.fontMedium,
    fontSize: SIZES.fontLg,
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: SIZES.margin,
    lineHeight: SIZES.fontLg + 6,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding + 9,
    paddingVertical: SIZES.padding - 3,
    borderRadius: SIZES.radius_sm,
    minWidth: SIZES.width * 0.25,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    ...FONTS.fontSemiBold,
    textAlign: 'center',
  },
  errorBoundaryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding + 5,
    backgroundColor: COLORS.background,
  },
  errorBoundaryText: {
    ...FONTS.fontSemiBold,
    fontSize: SIZES.h5,
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: SIZES.margin + 5,
  },
  errorBoundaryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius_lg - 5,
  },
  errorBoundaryButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontLg,
    ...FONTS.fontSemiBold,
  },
  offlineIndicator: {
    backgroundColor: COLORS.danger,
    paddingVertical: SIZES.padding - 7,
    paddingHorizontal: SIZES.padding,
    alignItems: 'center',
  },
  offlineText: {
    color: COLORS.white,
    fontSize: SIZES.fontSm - 1,
    ...FONTS.fontMedium,
  },
  ...Platform.select({
    ios: {
      headerIOS: {
        paddingTop: SIZES.padding - 5,
      },
    },
    android: {
      headerAndroid: {
        paddingTop: SIZES.padding - 10,
      },
    },
  }),
});

// Enhanced performance optimizations
const arePropsEqual = (prevProps: HomeScreenProps, nextProps: HomeScreenProps) => {
  return prevProps.route.key === nextProps.route.key;
};

export default React.memo(Home, arePropsEqual);