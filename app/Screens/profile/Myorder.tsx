import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useTheme } from '@react-navigation/native';
import {
  View,
  Text,
  SafeAreaView,
  Animated,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import Header from '../../layout/Header';
import { LinearGradient } from 'expo-linear-gradient';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { fetchOrderHistory } from '../../Services/OrderDetailService';
import { IMAGES } from '../../constants/Images';

const { width } = Dimensions.get('window');

type MyorderScreenProps = StackScreenProps<RootStackParamList, 'Myorder'>;

interface OrderItem {
  itemid: number;
  sno: string;
  tagno: string;
  productName: string;
  quantity: number;
  price: number;
  imagePath: string;
  imageUrls?: string[];
  priceFormatted?: string;
}

interface Order {
  orderId: string;
  customerName: string;
  contact: string;
  email: string;
  address: string;
  totalAmount: number;
  status: string;
  orderTime: string;
  paymentMode: string | null;
  paymentStatus: string | null;
  courierTrackingId: string | null;
  orderItems: OrderItem[];
  statusInfo?: any;
  formattedDate?: string;
  totalFormatted?: string;
}

const Myorder = ({ navigation }: MyorderScreenProps) => {
  const scrollRef = useRef<any>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ongoingOrders, setOngoingOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();
  const { colors }: { colors: any } = theme;

  const FALLBACK_IMAGE = IMAGES.item14;

  /** Load Orders API */
  const loadOrders = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(!forceRefresh);
      setRefreshing(forceRefresh);
      setError(null);

      const orders = await fetchOrderHistory();

      const ongoing = orders.filter(
        (order: Order) =>
          order.status &&
          !['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(
            order.status.toUpperCase()
          )
      );

      const completed = orders.filter(
        (order: Order) =>
          order.status &&
          ['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(
            order.status.toUpperCase()
          )
      );

      setOngoingOrders(ongoing);
      setCompletedOrders(completed);
    } catch (err: any) {
      console.error('Order load error:', err);
      setError(err?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onRefresh = useCallback(() => {
    loadOrders(true);
  }, [loadOrders]);

  const onPressTouch = (val: number) => {
    setCurrentIndex(val);
    scrollRef.current?.scrollTo({
      x: SIZES.width * val,
      animated: true,
    });
  };

  /** Enhanced Image source helper */
/** Enhanced Image source helper */
const renderImageSource = (
  imageUrls?: string[] | string
): { uri?: string } | number => {
  if (!imageUrls) return FALLBACK_IMAGE;

  let imageArray: string[] = [];

  // Parse the imagePath field which is a JSON string array
  try {
    if (typeof imageUrls === 'string') {
      // Check if it's a JSON array string
      if (imageUrls.trim().startsWith('[') && imageUrls.trim().endsWith(']')) {
        const parsed = JSON.parse(imageUrls);
        if (Array.isArray(parsed) && parsed.length > 0) {
          imageArray = parsed;
        } else if (typeof parsed === 'string') {
          imageArray = [parsed];
        }
      } else {
        // It's a regular string path
        imageArray = [imageUrls];
      }
    } else if (Array.isArray(imageUrls)) {
      imageArray = imageUrls;
    }
  } catch (error) {
    console.error('Error parsing image URLs:', error);
    // If parsing fails, try to use the raw string
    if (typeof imageUrls === 'string') {
      imageArray = [imageUrls];
    }
  }

  // If we have no valid images after parsing, return fallback
  if (imageArray.length === 0) return FALLBACK_IMAGE;

  // Get the first valid image URL
  const firstImage = imageArray[0];
  
  if (!firstImage || !firstImage.trim()) return FALLBACK_IMAGE;
  
  // Clean up the URL - remove any quotes or brackets that might remain
  let cleanedUrl = firstImage.replace(/^["'\[]+|["'\]]+$/g, '').trim();
  
  if (!cleanedUrl) return FALLBACK_IMAGE;
  
  // If it's already a full URL, use it directly
  if (cleanedUrl.startsWith('http')) {
    return { uri: cleanedUrl };
  }
  
  // If it's a relative path, prepend the base URL
  // Remove any leading slashes to avoid double slashes
  const normalizedPath = cleanedUrl.startsWith('/') ? cleanedUrl.substring(1) : cleanedUrl;
  return { uri: `https://app.bmgjewellers.com/${normalizedPath}` };
};
  /** Get status color based on order status */
  const getStatusColor = (status: string) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'PENDING':
      case 'PROCESSING':
        return '#FF9500';
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return '#007AFF';
      case 'DELIVERED':
      case 'COMPLETED':
        return '#34C759';
      case 'CANCELLED':
        return '#FF3B30';
      default:
        return COLORS.primary;
    }
  };

  /** Get status background color */
  const getStatusBgColor = (status: string) => {
    const statusColor = getStatusColor(status);
    return statusColor + '15'; // Add transparency
  };

  /** Modern Order Card Component */
  const ModernOrderCard = ({ 
    id, 
    title, 
    price, 
    image, 
    status, 
    offer, 
    onPress, 
    btntitel,
    itemCount 
  }: any) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    
    const handleImageError = () => {
      setImageError(true);
      setImageLoading(false);
    };
    
    const handleImageLoad = () => {
      setImageLoading(false);
    };

    const onPressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    };

    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          marginHorizontal: 16,
          marginBottom: 16,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 20,
            flexDirection: 'row',
            alignItems: 'flex-start',
            shadowColor: Platform.OS === 'ios' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.3)',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: Platform.OS === 'ios' ? 1 : 0.8,
            shadowRadius: 12,
            elevation: 8,
            borderWidth: 1,
            borderColor: colors.border || 'rgba(0,0,0,0.05)',
          }}
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={0.9}
        >
          {/* Enhanced Image Container */}
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 16,
              backgroundColor: colors.background,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
              overflow: 'hidden',
              shadowColor: 'rgba(0,0,0,0.1)',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {imageLoading && !imageError && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  zIndex: 1,
                }}
              >
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            )}
            
            {(imageError || !image) ? (
              <LinearGradient
                colors={[COLORS.primary + '20', COLORS.primary + '10']}
                style={{
                  width: '100%',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    ...FONTS.fontSm,
                    color: COLORS.primary,
                    textAlign: 'center',
                    fontWeight: '600',
                  }}
                >
                  📦
                </Text>
                <Text
                  style={{
                    ...FONTS.fontXs,
                    color: COLORS.primary,
                    textAlign: 'center',
                    marginTop: 4,
                  }}
                >
                  No Image
                </Text>
              </LinearGradient>
            ) : (
              <Image
                source={image}
                style={{
                  width: '100%',
                  height: '100%',
                  resizeMode: 'cover',
                }}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            )}
            
            {/* Item count badge */}
            {itemCount > 1 && (
              <View
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  backgroundColor: COLORS.primary,
                  borderRadius: 12,
                  minWidth: 24,
                  height: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: colors.card,
                }}
              >
                <Text
                  style={{
                    ...FONTS.fontXs,
                    color: COLORS.white,
                    fontWeight: 'bold',
                    fontSize: 11,
                  }}
                >
                  {itemCount}
                </Text>
              </View>
            )}
          </View>

          {/* Enhanced Content */}
          <View style={{ flex: 1, justifyContent: 'space-between', minHeight: 90 }}>
            {/* Header */}
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    ...FONTS.fontMedium,
                    fontSize: 16,
                    color: colors.title,
                    flex: 1,
                    marginRight: 8,
                    lineHeight: 22,
                  }}
                  numberOfLines={2}
                >
                  {title}
                </Text>
                
                {/* Status Badge */}
                <View
                  style={{
                    backgroundColor: getStatusBgColor(status),
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: getStatusColor(status) + '30',
                  }}
                >
                  <Text
                    style={{
                      ...FONTS.fontXs,
                      color: getStatusColor(status),
                      fontSize: 10,
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                    numberOfLines={1}
                  >
                    {status}
                  </Text>
                </View>
              </View>
              
              {/* Price */}
              <Text
                style={{
                  ...FONTS.fontSemiBold,
                  fontSize: 18,
                  color: COLORS.primary,
                  marginBottom: 8,
                }}
              >
                {price}
              </Text>
            </View>
            
            {/* Footer */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    ...FONTS.fontXs,
                    color: colors.text,
                    opacity: 0.7,
                  }}
                >
                  Order #{id?.slice(-6)}
                </Text>
                <Text
                  style={{
                    ...FONTS.fontXs,
                    color: colors.text,
                    opacity: 0.7,
                    marginTop: 2,
                  }}
                >
                  {offer}
                </Text>
              </View>
              
              {/* Action Button */}
              <TouchableOpacity
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  backgroundColor: COLORS.primary,
                  borderRadius: 12,
                  shadowColor: COLORS.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={onPress}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    ...FONTS.fontMedium,
                    color: COLORS.white,
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                >
                  {btntitel}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const getOrderDisplayItem = (order: Order): OrderItem | null => {
    return order.orderItems?.[0] || null;
  };

  const getOrderTitle = (order: Order): string => {
    const displayItem = getOrderDisplayItem(order);
    const itemCount = order.orderItems?.length || 0;
    if (!displayItem) return `Order ${order.orderId}`;
    return itemCount > 1
      ? `${displayItem.productName} +${itemCount - 1} more`
      : displayItem.productName;
  };

  const getOrderPrice = (order: Order): string => {
    if (order.totalFormatted) return order.totalFormatted;
    if (order.totalAmount) return `₹${order.totalAmount.toFixed(2)}`;
    const displayItem = getOrderDisplayItem(order);
    return displayItem?.price
      ? displayItem.priceFormatted || `₹${displayItem.price.toFixed(2)}`
      : '₹0.00';
  };

  /** Enhanced Empty State */
  const EmptyState = ({ type }: { type: 'ongoing' | 'completed' }) => (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
      }}
    >
      <LinearGradient
        colors={[COLORS.primary + '15', COLORS.primary + '05']}
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <Text style={{ fontSize: 48 }}>
          {type === 'ongoing' ? '⏳' : '✅'}
        </Text>
      </LinearGradient>
      
      <Text
        style={{
          ...FONTS.fontSemiBold,
          fontSize: 20,
          color: colors.title,
          marginBottom: 8,
          textAlign: 'center',
        }}
      >
        No {type} orders
      </Text>
      
      <Text
        style={{
          ...FONTS.fontRegular,
          color: colors.text,
          textAlign: 'center',
          opacity: 0.7,
          marginBottom: 24,
          lineHeight: 22,
        }}
      >
        {type === 'ongoing' 
          ? "You don't have any ongoing orders at the moment"
          : "You haven't completed any orders yet"}
      </Text>
      
      <TouchableOpacity
        style={{
          paddingHorizontal: 24,
          paddingVertical: 12,
          backgroundColor: COLORS.primary,
          borderRadius: 16,
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}
        onPress={() => loadOrders(true)}
        activeOpacity={0.8}
      >
        <Text
          style={{
            ...FONTS.fontMedium,
            color: COLORS.white,
            fontWeight: '600',
          }}
        >
          Refresh Orders
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderOrderCards = (
    orders: Order[],
    buttonTitle: string,
    navigateTo: string
  ) => {
    if (orders.length === 0) {
      return <EmptyState type={currentIndex === 0 ? 'ongoing' : 'completed'} />;
    }

    return orders.map((order, index) => {
      const displayItem = getOrderDisplayItem(order);
      const imageSource = renderImageSource(displayItem?.imagePath || displayItem?.imageUrls);
      const itemCount = order.orderItems?.length || 0;

      return (
        <ModernOrderCard
          key={`${order.orderId}-${index}`}
          id={order.orderId}
          title={getOrderTitle(order)}
          price={getOrderPrice(order)}
          image={imageSource}
          status={order.statusInfo?.label || order.status || ''}
          offer={order.formattedDate || ''}
          btntitel={buttonTitle}
          itemCount={itemCount}
          onPress={() =>
            navigation.navigate('OrderDetails', {
              order: {
                orderId: order.orderId,
                customerName: order.customerName,
                contact: order.contact,
                email: order.email,
                address: order.address,
                totalAmount: order.totalAmount,
                status: order.status,
                orderTime: order.orderTime,
                paymentMode: order.paymentMode,
                paymentStatus: order.paymentStatus,
                courierTrackingId: order.courierTrackingId,
                orderItems: order.orderItems,
                formattedDate: order.formattedDate,
                totalFormatted: order.totalFormatted
              }
            })
          }
        />
      );
    });
  };

  /** Loading State */
  if (loading && !refreshing) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
        }}
      >
        <Header title="My Orders" leftIcon="back" />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text
            style={{
              ...FONTS.fontRegular,
              marginTop: 16,
              color: colors.text,
              opacity: 0.7,
            }}
          >
            Loading your orders...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /** Error State */
  if (error && !refreshing) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
        }}
      >
        <Header title="My Orders" leftIcon="back" />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 40,
          }}
        >
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: '#FF3B3020',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 48 }}>⚠️</Text>
          </View>
          
          <Text
            style={{
              ...FONTS.fontSemiBold,
              fontSize: 18,
              color: colors.title,
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            Something went wrong
          </Text>
          
          <Text
            style={{
              ...FONTS.fontRegular,
              marginBottom: 24,
              color: colors.text,
              textAlign: 'center',
              opacity: 0.7,
              lineHeight: 22,
            }}
          >
            {error}
          </Text>
          
          <TouchableOpacity
            style={{
              paddingHorizontal: 24,
              paddingVertical: 12,
              backgroundColor: COLORS.primary,
              borderRadius: 16,
            }}
            onPress={() => loadOrders(true)}
          >
            <Text style={{ ...FONTS.fontMedium, color: COLORS.white }}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /** Main UI */
  return (
    <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
      <Header title="My Orders" leftIcon="back" />

      <View style={{ flex: 1 }}>
        {/* Enhanced Modern Tabs */}
        <LinearGradient
          colors={['rgba(236,245,241,0)', 'rgba(236,245,241,0.80)']}
          style={{
            width: '100%',
            height: 100,
            bottom: 0,
            position: 'absolute',
            zIndex: 10,
            backgroundColor: 'rgba(255,255,255,.1)',
          }}
        >
          <View
            style={{
              paddingTop: 20,
              paddingHorizontal: 20,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: colors.card,
                borderRadius: 20,
                padding: 4,
                width: width - 80,
                shadowColor: Platform.OS === 'ios' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.3)',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <TouchableOpacity
                onPress={() => onPressTouch(0)}
                style={{
                  flex: 1,
                  backgroundColor: currentIndex === 0 ? COLORS.primary : 'transparent',
                  borderRadius: 16,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  alignItems: 'center',
                  ...(currentIndex === 0 && {
                    shadowColor: COLORS.primary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                  }),
                }}
              >
                <Text
                  style={{
                    ...FONTS.fontMedium,
                    fontSize: 15,
                    color: currentIndex === 0 ? COLORS.white : colors.text,
                    fontWeight: currentIndex === 0 ? '600' : '400',
                  }}
                >
                  Ongoing ({ongoingOrders.length})
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => onPressTouch(1)}
                style={{
                  flex: 1,
                  backgroundColor: currentIndex === 1 ? COLORS.primary : 'transparent',
                  borderRadius: 16,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  alignItems: 'center',
                  ...(currentIndex === 1 && {
                    shadowColor: COLORS.primary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                  }),
                }}
              >
                <Text
                  style={{
                    ...FONTS.fontMedium,
                    fontSize: 15,
                    color: currentIndex === 1 ? COLORS.white : colors.text,
                    fontWeight: currentIndex === 1 ? '600' : '400',
                  }}
                >
                  Completed ({completedOrders.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Orders List */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          ref={scrollRef}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onMomentumScrollEnd={(e: any) => {
            const pageIndex = Math.round(
              e.nativeEvent.contentOffset.x / SIZES.width
            );
            setCurrentIndex(pageIndex);
          }}
        >
          {/* Ongoing Orders */}
          <View style={{ width: SIZES.width }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ 
                paddingBottom: 120,
                paddingTop: 20,
              }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[COLORS.primary]}
                  tintColor={COLORS.primary}
                />
              }
            >
              {renderOrderCards(ongoingOrders, 'View Details', 'OrderDetails')}
            </ScrollView>
          </View>

          {/* Completed Orders */}
          <View style={{ width: SIZES.width }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ 
                paddingBottom: 120,
                paddingTop: 20,
              }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[COLORS.primary]}
                  tintColor={COLORS.primary}
                />
              }
            >
              {renderOrderCards(completedOrders, 'View Details', 'OrderDetails')}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Myorder;