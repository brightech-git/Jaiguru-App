import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { IconButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { IMAGES } from '../../constants/Images';
import Cardstyle2 from '../../components/Card/Cardstyle2';
import { useDispatch } from 'react-redux';
import { addTowishList } from '../../redux/reducer/wishListReducer';
import { addToCart } from '../../redux/reducer/cartReducer';
import BottomSheet2 from '../Shortcode/BottomSheet2';
import { productService, ProductItem } from '../../Services/ProductService';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import debounce from 'lodash.debounce';

type ProductsScreenProps = StackScreenProps<RootStackParamList, 'Products'>;

const Products = ({ navigation, route }: ProductsScreenProps) => {
  const theme = useTheme();
  const { colors }: { colors: any } = theme;

  const dispatch = useDispatch();
  const sheetRef = useRef<any>();
  const scrollViewRef = useRef<any>();

  // State management
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [appliedFilters, setAppliedFilters] = useState({});

  // Default filter values
  const defaultFilters = {
    gender: '',
    occasion: '',
    colorAccent: '',
    materialFinish: '',
    sizeName: '',
    category: '',
    brand: '',
    minGrandTotal: 0,
    maxGrandTotal: 10000000000,
  };

  // Enhanced filter state with default values
  const [activeFilters, setActiveFilters] = useState(defaultFilters);

  // Track if this is the initial mount
  const isInitialMount = useRef(true);
  // Track navigation state to detect when we're coming back
  const navigationState = useRef<any>();

  // Reset filters and navigation data when navigating via bottom tab or no filters provided
  useEffect(() => {
    // Detect if coming from bottom tab or no params provided
    const isComingFromBottomTab = route.params?.source === 'bottomTab' || !route.params;
    // Check if no filters or navigation data are provided
    const hasNoFiltersOrNavData =
      !route.params?.itemName &&
      !route.params?.subItemName &&
      !route.params?.initialFilters &&
      !route.params?.gender &&
      !route.params?.occasion &&
      !route.params?.colorAccent &&
      !route.params?.materialFinish &&
      !route.params?.sizeName &&
      !route.params?.category &&
      !route.params?.brand &&
      !route.params?.minGrandTotal &&
      !route.params?.maxGrandTotal &&
      !route.params?.priceRange;

    if (isInitialMount.current || isComingFromBottomTab || hasNoFiltersOrNavData) {
      console.log('Resetting filters and navigation data for fresh start (bottom tab or no data)');
      // Reset all filters and navigation-related state
      setSearchQuery('');
      setAppliedFilters({});
      setActiveFilters(defaultFilters);
      setCategoryError(null);
      setProducts([]);
      productService.resetPagination();
      fetchProducts(true, '', {}); // Fetch products with no filters or navigation data
    } else {
      // Apply filters and navigation data from route params
      console.log('Applying filters and navigation data from route params');
      const {
        itemName,
        subItemName,
        initialFilters,
        gender,
        occasion,
        colorAccent,
        materialFinish,
        sizeName,
        minGrandTotal,
        maxGrandTotal,
        category,
        brand,
        priceRange,
      } = route.params || {};

      // Set category error message if itemName is provided
      if (itemName) {
        setCategoryError(`No products found for "${itemName}" category`);
      } else {
        setCategoryError(null);
      }

      const allFilters = {
        ...defaultFilters,
        ...initialFilters,
        ...(gender && { gender }),
        ...(occasion && { occasion }),
        ...(colorAccent && { colorAccent }),
        ...(materialFinish && { materialFinish }),
        ...(sizeName && { sizeName }),
        ...(category && { category }),
        ...(brand && { brand }),
        ...(minGrandTotal !== undefined && { minGrandTotal }),
        ...(maxGrandTotal !== undefined && { maxGrandTotal }),
        ...(priceRange && {
          minGrandTotal: priceRange.min,
          maxGrandTotal: priceRange.max,
        }),
      };

      console.log('All merged filters from route:', allFilters);
      setActiveFilters(allFilters);
      setAppliedFilters(allFilters);
      fetchProducts(true, searchQuery, { itemName, subItemName, ...allFilters });
    }

    // Store current navigation state for future comparison
    navigationState.current = navigation.getState();
    isInitialMount.current = false;

    return () => {
      console.log('Products component unmounting');
    };
  }, [route.params]);

  // Handle focus event to reset when coming back via bottom tab
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Products screen focused');
      const currentState = navigation.getState();
      const isComingFromBottomTab = route.params?.source === 'bottomTab' || !route.params;

      if (isComingFromBottomTab) {
        console.log('Coming from bottom tab, resetting filters and navigation data');
        setSearchQuery('');
        setAppliedFilters({});
        setActiveFilters(defaultFilters);
        setCategoryError(null);
        setProducts([]);
        productService.resetPagination();
        fetchProducts(true, '', {});
      }

      navigationState.current = currentState;
    });

    return unsubscribe;
  }, [navigation, route.params]);

  // Log active filters
  useEffect(() => {
    console.log('Active filters:', activeFilters);
  }, [activeFilters]);

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        console.log('Executing debounced search for:', query);
        productService.resetPagination();
        setProducts([]);
        setCategoryError(null);
        fetchProducts(true, query, appliedFilters);
      }, 500),
    [appliedFilters]
  );

  // Cleanup debounced search to prevent memory leaks
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearch = useCallback(
    (query: string) => {
      console.log('Search query changed to:', query);
      setSearchQuery(query);
      setCategoryError(null);

      if (query.trim() === '') {
        productService.resetPagination();
        setProducts([]);
        // Only set category error if itemName exists and no search query
        if (route.params?.itemName && !isComingFromBottomTab()) {
          setCategoryError(`No products found for "${route.params.itemName}" category`);
        }
        fetchProducts(true, '', appliedFilters);
      } else {
        debouncedSearch(query);
      }
    },
    [debouncedSearch, route.params, appliedFilters]
  );

  // Modified fetchProducts to accept filters explicitly
  const fetchProducts = useCallback(
    async (reset: boolean = false, search: string = searchQuery, filters: any = appliedFilters) => {
      if (isFetching) return;
      setIsFetching(true);

      try {
        if (reset) {
          console.log('Fetching products with reset');
          setLoading(true);
          productService.resetPagination();
        } else {
          if (!productService.hasMoreData()) {
            console.log('No more data to fetch');
            setIsFetching(false);
            return;
          }
          console.log('Fetching more products');
          setLoadingMore(true);
        }

        const fetchFilters = {
          ...filters,
          searchQuery: search.trim(),
        };

        console.log('Fetching products with filters:', fetchFilters);
        const data = await productService.getFilteredProducts(fetchFilters);

        if (reset) {
          setProducts(data);
          if (data.length === 0 && filters.itemName && !search.trim()) {
            setCategoryError(`No products found for "${filters.itemName}" category`);
          } else if (data.length === 0 && search.trim()) {
            setCategoryError(`No products found for search "${search}"`);
          } else {
            setCategoryError(null);
          }
        } else {
          setProducts((prev) => [...prev, ...data]);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        let errorMessage = 'Failed to load products. Please check your connection and try again.';

        if (err instanceof Error) {
          if (err.message.includes('Network connection error')) {
            errorMessage = 'Network connection error. Please check your internet connection.';
          } else if (err.message.includes('Invalid request')) {
            if (filters.itemName) {
              errorMessage = `Invalid category "${filters.itemName}". Please try a different category.`;
              setCategoryError(errorMessage);
            } else {
              errorMessage = 'Invalid search criteria. Please adjust your filters.';
            }
          } else if (err.message.includes('Server error')) {
            errorMessage = 'Server temporarily unavailable. Please try again later.';
          }
        }

        setError(errorMessage);
        if (reset) {
          setProducts([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        setIsFetching(false);
      }
    },
    [isFetching, searchQuery, appliedFilters]
  );

  const onRefresh = useCallback(() => {
    console.log('Refreshing products list');
    setRefreshing(true);
    setError(null);
    setCategoryError(null);
    fetchProducts(true, '', appliedFilters);
  }, [fetchProducts, appliedFilters]);

  const handleFiltersChange = useCallback(
    (filters: any) => {
      console.log('Filters changed:', filters);
      setCategoryError(null);

      setActiveFilters((prev) => {
        const newFilters = { ...prev, ...filters };

        const filtersChanged = Object.keys(filters).some(
          (key) => prev[key as keyof typeof prev] !== filters[key]
        );

        if (filtersChanged) {
          setAppliedFilters(newFilters);
          setTimeout(() => {
            productService.resetPagination();
            setProducts([]);
            fetchProducts(true, searchQuery, { ...newFilters, itemName: route.params?.itemName, subItemName: route.params?.subItemName });
          }, 100);
        }

        return newFilters;
      });
    },
    [fetchProducts, searchQuery, route.params]
  );

  const debouncedHandleScroll = useMemo(
    () =>
      debounce(({ layoutMeasurement, contentOffset, contentSize }) => {
        const threshold = 200;
        const isCloseToBottom =
          layoutMeasurement.height + contentOffset.y >= contentSize.height - threshold;

        if (isCloseToBottom && productService.hasMoreData() && !loadingMore && !loading && !isFetching) {
          console.log('Scrolled near bottom, loading more products');
          fetchProducts(false, searchQuery, appliedFilters);
        }
      }, 100),
    [loadingMore, loading, isFetching, fetchProducts, searchQuery, appliedFilters]
  );

  const handleScroll = useCallback(
    (event: any) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent || {};
      if (layoutMeasurement && contentOffset && contentSize) {
        debouncedHandleScroll({ layoutMeasurement, contentOffset, contentSize });
      }
    },
    [debouncedHandleScroll]
  );

  useEffect(() => {
    return () => {
      debouncedHandleScroll.cancel();
    };
  }, [debouncedHandleScroll]);

  const addItemToWishList = useCallback(
    (data: ProductItem) => {
      console.log('Adding to wishlist:', data);
      dispatch(addTowishList(data));
    },
    [dispatch]
  );

  const addItemToCart = useCallback(
    (data: ProductItem) => {
      console.log('Adding to cart:', data);
      dispatch(addToCart(data));
      setCartItemCount((prev) => prev + 1);
    },
    [dispatch]
  );

  const hasActiveFilters = useCallback(() => {
    return (
      searchQuery.trim() !== '' ||
      Object.entries(appliedFilters).some(([key, value]) => {
        if (key === 'minGrandTotal') return value > 0;
        if (key === 'maxGrandTotal') return value < 10000000000;
        return value && value !== '';
      })
    );
  }, [searchQuery, appliedFilters]);

  const clearAllFilters = useCallback(() => {
    console.log('Clearing all filters and navigation data');
    setSearchQuery('');
    setCategoryError(null);
    setActiveFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    productService.resetPagination();
    fetchProducts(true, '', {});
  }, [fetchProducts]);

  const navigateToCategory = useCallback(() => {
    navigation.navigate('Search');
  }, [navigation]);

  const isComingFromBottomTab = () => route.params?.source === 'bottomTab' || !route.params;

  const renderProducts = useCallback(() => {
    if (loading && products.length === 0) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: 16, ...FONTS.fontRegular, fontSize: 16 }}>
            Loading products...
          </Text>
        </View>
      );
    }

    if (categoryError && products.length === 0 && !loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
          <MaterialIcons name="category" size={48} color={colors.text} />
          <Text
            style={{
              color: colors.text,
              textAlign: 'center',
              marginTop: 16,
              marginHorizontal: 20,
              ...FONTS.fontMedium,
              fontSize: 18,
              lineHeight: 24,
            }}
          >
            {categoryError}
          </Text>
          <Text
            style={{
              color: colors.text,
              textAlign: 'center',
              marginTop: 8,
              marginHorizontal: 20,
              ...FONTS.fontRegular,
              fontSize: 14,
              opacity: 0.7,
              lineHeight: 20,
            }}
          >
            This category might be empty or unavailable.{'\n'}
            Try searching for products or browse other categories.
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 20 }}>
            <TouchableOpacity
              onPress={navigateToCategory}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 8,
                marginRight: 12,
              }}
            >
              <Text style={{ color: COLORS.white, ...FONTS.fontMedium }}>Browse Categories</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (error && products.length === 0 && !categoryError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
          <MaterialIcons name="error-outline" size={48} color={colors.text} />
          <Text
            style={{
              color: colors.text,
              textAlign: 'center',
              marginTop: 16,
              marginHorizontal: 20,
              ...FONTS.fontRegular,
              fontSize: 16,
              lineHeight: 24,
            }}
          >
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => fetchProducts(true, '', appliedFilters)}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
              marginTop: 16,
            }}
          >
            <Text style={{ color: COLORS.white, ...FONTS.fontMedium }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (products.length === 0 && !categoryError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
          <MaterialIcons name="search-off" size={48} color={colors.text} />
          <Text
            style={{
              color: colors.text,
              textAlign: 'center',
              marginTop: 16,
              marginHorizontal: 20,
              ...FONTS.fontRegular,
              fontSize: 16,
              lineHeight: 24,
            }}
          >
            No products found matching your criteria.{'\n'}
            Try adjusting your search or filters.
          </Text>
          <TouchableOpacity
            onPress={clearAllFilters}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
              marginTop: 16,
            }}
          >
            <Text style={{ color: COLORS.white, ...FONTS.fontMedium }}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={[GlobalStyleSheet.row, { marginTop: 5 }]}>
        {products.map((data, index) => (
          <View
            key={`${data.ITEMID}-${data.SNO}-${index}`}
            style={[GlobalStyleSheet.col50, { marginBottom: 20 }]}
          >
            <Cardstyle2
              id={data.ITEMID}
              title={data.SUBITEMNAME}
              price={`₹${data.GrandTotal !== '0.00' ? data.GrandTotal : data.RATE}`}
              image={data.ImagePaths?.[0]}
              onPress={() => {
                console.log('Navigating to product details:', data.SNO);
                navigation.navigate('ProductDetails', { sno: data.SNO });
              }}
              onAddToWishlist={() => addItemToWishList(data)}
              onAddToCart={() => addItemToCart(data)}
            />
          </View>
        ))}
      </View>
    );
  }, [
    loading,
    error,
    categoryError,
    products,
    colors,
    clearAllFilters,
    fetchProducts,
    addItemToWishList,
    addItemToCart,
    navigation,
    navigateToCategory,
    appliedFilters,
  ]);

  return (
    <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
      <View
        style={[
          Platform.OS === 'ios' && {
            shadowColor: 'rgba(195, 123, 95, 0.20)',
            shadowOffset: { width: 2, height: 4 },
            shadowOpacity: 0.6,
            shadowRadius: 5,
          },
          Platform.OS === 'android' && {
            elevation: 8,
          },
        ]}
      >
        <View
          style={{
            height: 60,
            backgroundColor: theme.dark ? 'rgba(0,0,0,.4)' : 'rgba(255,255,255,.4)',
            borderBottomLeftRadius: 25,
            borderBottomRightRadius: 25,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              height: 40,
              width: 40,
              borderRadius: 15,
              backgroundColor: colors.card,
              justifyContent: 'center',
              marginLeft: 10,
            }}
          >
            <IconButton
              onPress={() => {
                console.log('Navigating back');
                navigation.goBack();
              }}
              icon={(props) => <MaterialIcons name="arrow-back-ios" {...props} />}
              iconColor={colors.title}
              size={20}
            />
          </View>

          <View
            style={{
              height: 40,
              backgroundColor: colors.card,
              borderRadius: 10,
              marginLeft: 10,
              flex: 1,
              position: 'relative',
            }}
          >
            <TextInput
              placeholder="Search products..."
              placeholderTextColor={theme.dark ? 'rgba(255, 255, 255, .6)' : 'rgba(0, 0, 0, 0.6)'}
              style={{
                ...FONTS.fontRegular,
                fontSize: 16,
                color: colors.title,
                paddingLeft: 40,
                paddingRight: searchQuery ? 40 : 16,
                flex: 1,
                borderRadius: 10,
              }}
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            <View style={{ position: 'absolute', top: 9, left: 10 }}>
              <Image
                style={{ height: 20, width: 20, tintColor: colors.title }}
                source={IMAGES.search}
              />
            </View>
            {searchQuery && (
              <TouchableOpacity
                onPress={() => handleSearch('')}
                style={{ position: 'absolute', top: 9, right: 10 }}
              >
                <MaterialIcons name="clear" size={20} color={colors.title} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => {
              console.log('Opening filter sheet');
              sheetRef.current?.openSheet('filter');
            }}
            style={{
              height: 40,
              width: 40,
              borderRadius: 15,
              backgroundColor: hasActiveFilters() ? colors.primary : colors.card,
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 10,
              position: 'relative',
            }}
          >
            <Image
              source={IMAGES.filter}
              style={{
                height: 20,
                width: 20,
                tintColor: hasActiveFilters() ? COLORS.white : colors.title,
              }}
            />
            {hasActiveFilters() && (
              <View
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  height: 12,
                  width: 12,
                  borderRadius: 6,
                  backgroundColor: COLORS.secondary || '#FF6B6B',
                  borderWidth: 2,
                  borderColor: colors.background,
                }}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              console.log('Navigating to cart');
              navigation.navigate('MyCart');
            }}
            style={{ padding: 10, marginRight: 10, marginLeft: 10, position: 'relative' }}
          >
            <Image
              style={{ height: 22, width: 22, tintColor: colors.title }}
              source={IMAGES.shopping2}
            />
            {cartItemCount > 0 && (
              <View style={[GlobalStyleSheet.notification, { position: 'absolute', right: 3, top: 3 }]}>
                <Text
                  style={{
                    ...FONTS.fontRegular,
                    fontSize: 10,
                    color: COLORS.white,
                  }}
                >
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={[GlobalStyleSheet.container, { paddingTop: 20, flex: 1 }]}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 15, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
              title="Pull to refresh"
              titleColor={colors.text}
            />
          }
        >
          {hasActiveFilters() && !categoryError && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
                paddingHorizontal: 4,
                paddingVertical: 8,
                backgroundColor: colors.card,
                borderRadius: 8,
              }}
            >
              <MaterialIcons name="filter-list" size={16} color={colors.primary} />
              <Text
                style={{
                  marginLeft: 8,
                  color: colors.text,
                  ...FONTS.fontRegular,
                  fontSize: 14,
                  flex: 1,
                }}
              >
                {Object.entries(appliedFilters)
                  .filter(([key, value]) => {
                    if (key === 'minGrandTotal') return value > 0;
                    if (key === 'maxGrandTotal') return value < 10000000000;
                    return value && value !== '';
                  })
                  .length}{' '}
                filters applied
                {searchQuery && ` • Search: "${searchQuery}"`}
              </Text>
              <TouchableOpacity
                onPress={clearAllFilters}
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  backgroundColor: colors.primary,
                  borderRadius: 4,
                }}
              >
                <Text
                  style={{
                    color: COLORS.white,
                    ...FONTS.fontMedium,
                    fontSize: 12,
                  }}
                >
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {renderProducts()}

          {loadingMore && (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text
                style={{
                  marginTop: 8,
                  color: colors.text,
                  ...FONTS.fontRegular,
                  fontSize: 14,
                }}
              >
                Loading more products...
              </Text>
            </View>
          )}

          {!productService.hasMoreData() && products.length > 0 && !loading && (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.text,
                  ...FONTS.fontRegular,
                  fontSize: 14,
                  opacity: 0.7,
                }}
              >
                You've reached the end of the list
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <BottomSheet2
        ref={sheetRef}
        onFiltersChange={handleFiltersChange}
        initialFilters={activeFilters}
        currentFilters={activeFilters}
      />
    </SafeAreaView>
  );
};

export default Products;