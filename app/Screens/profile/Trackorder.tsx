import { useTheme } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, SafeAreaView, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import Header from '../../layout/Header';
import { FONTS, COLORS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import CardStyle3 from '../../components/Card/CardStyle3';
import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { trackOrder } from '../../Services/OrderTrackService';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TrackOrderScreenProps = StackScreenProps<RootStackParamList, 'Trackorder'>;

interface TimelineItem {
  updated_at: string;
  label: string;
  remarks?: string;
}

interface OrderItem {
  id: number;
  sno: string;
  itemid: number;
  tagno: string;
  productName: string;
  quantity: number;
  price: number;
  image_path: string;
}

interface OrderData {
  current_status: string;
  timeline: TimelineItem[];
  order_id: string;
  items: OrderItem[];
  canCancel: boolean;
}

interface DisplayTimelineItem {
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'current' | 'pending' | 'failed' | 'cancelled';
  isLast?: boolean;
}

const Trackorder = ({ route, navigation }: TrackOrderScreenProps) => {
  const { orderId } = route.params;
  const theme = useTheme();
  const { colors }: { colors: any } = theme;

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllProducts, setShowAllProducts] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [cancelling, setCancelling] = useState<boolean>(false); // Added missing state

  // Function to process image paths
  const processImagePath = (imagePath: string | null | undefined): any => {
    if (!imagePath) {
      return IMAGES.placeholder;
    }
    
    try {
      // Parse the JSON string to get the array of image paths
      const imageArray = JSON.parse(imagePath);
      
      // If it's an array and has at least one image, use the first one
      if (Array.isArray(imageArray) && imageArray.length > 0) {
        let firstImage = imageArray[0];
        
        // If it's already a full URL, use it directly
        if (firstImage.startsWith('http')) {
          return { uri: firstImage };
        }
        
        // If it's a relative path, construct the full URL
        if (firstImage.startsWith('/')) {
          const baseUrl = 'https://app.bmgjewellers.com';
          return { uri: `${baseUrl}${firstImage}` };
        }
        
        // If it's just a filename, construct the path
        const baseUrl = 'https://app.bmgjewellers.com/static/media/';
        return { uri: `${baseUrl}${firstImage}` };
      }
    } catch (parseError) {
      console.log('Error parsing image path JSON:', parseError);
      
      // Fallback: treat as a single string if JSON parsing fails
      if (imagePath.startsWith('http')) {
        return { uri: imagePath };
      }
      
      if (imagePath.startsWith('/')) {
        const baseUrl = 'https://app.bmgjewellers.com';
        return { uri: `${baseUrl}${imagePath}` };
      }
      
      const baseUrl = 'https://app.bmgjewellers.com/static/media/';
      return { uri: `${baseUrl}${imagePath}` };
    }
    
    // Final fallback to placeholder
    return IMAGES.placeholder;
  };

  // Fetch order details
  const fetchOrder = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const data = await trackOrder(orderId);
      console.log('Track order data:', data);
      setOrderData(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch order data. Please try again.');
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }
    fetchOrder();
  }, [orderId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrder(true);
  };

  const showAlert = (title: string, message: string) => {
    Alert.alert(title, message, [{ text: 'OK', style: 'default' }]);
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              console.log('Cancelling order:', orderId);
              const paymentMode = orderData?.paymentMode || 'ONLINE';
              const paymentStatus = orderData?.paymentStatus || 'PENDING';
              // console.log('Cancelling order with payment mode:', paymentMode, 'and payment status:', paymentStatus);
              const token = await AsyncStorage.getItem('user_token');

              // API call to cancel the order
              const response = await fetch('https://app.bmgjewellers.com/api/v1/order/update-status', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`, // Replace with actual token
                },
                body: JSON.stringify({
                  orderId: orderId,
                  newStatus: 'CANCELLED',
                  remarks: 'Order cancelled by user',
                  paymentMode: paymentMode,
                  paymentStatus: paymentStatus
                })
              });
              
              const result = await response.json();
              
              if (response.ok) {
                // Refresh order data after successful cancellation
                fetchOrder();
                showAlert('Success', 'Order has been cancelled successfully.');
              } else {
                showAlert('Error', result.message || 'Failed to cancel order.');
              }
            } catch (error) {
              console.error('Cancel order error:', error);
              showAlert('Error', 'An error occurred while cancelling the order.');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  // Create timeline based on new API structure
  const createTimeline = (): DisplayTimelineItem[] => {
    if (!orderData?.timeline) return [];

    const timeline: DisplayTimelineItem[] = [];
    const currentStatus = orderData.current_status.toUpperCase();
    
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Process existing timeline items from API
    orderData.timeline.forEach((item, index) => {
      timeline.push({
        title: item.label,
        description: item.remarks || '',
        date: formatDate(item.updated_at),
        status: 'completed'
      });
    });

    // Define the complete order flow
    const orderFlow = [
      { key: 'ORDER_CONFIRMED', title: 'Order Confirmed', desc: 'Your order has been placed successfully.' },
      { key: 'ORDER_PROCESSED', title: 'Order Processed', desc: 'Your order has been processed.' },
      { key: 'PACKED', title: 'Order Packed', desc: 'Your order has been packed.' },
      { key: 'READY_TO_SHIP', title: 'Ready to Ship', desc: 'Your order is ready to be shipped.' },
      { key: 'SHIPPED', title: 'Shipped', desc: 'Your order has been shipped.' },
      { key: 'OUT_FOR_DELIVERY', title: 'Out for Delivery', desc: 'Your order is out for delivery.' },
      { key: 'DELIVERED', title: 'Delivered', desc: 'Your order has been delivered successfully.' }
    ];

    // Find current step index
    const getCurrentStepIndex = () => {
      switch (currentStatus) {
        case 'ORDER_CONFIRMED': return 0;
        case 'ORDER_PROCESSED': return 1;
        case 'PACKED': return 2;
        case 'READY_TO_SHIP': return 3;
        case 'SHIPPED': return 4;
        case 'OUT_FOR_DELIVERY': return 5;
        case 'DELIVERED': return 6;
        default: return orderData.timeline.length - 1;
      }
    };

    const currentStepIndex = getCurrentStepIndex();

    // Add pending steps if needed
    const completedSteps = orderData.timeline.length;
    
    if (completedSteps < orderFlow.length) {
      // Add current step if it's not in completed timeline
      if (currentStepIndex >= completedSteps) {
        timeline.push({
          title: orderFlow[currentStepIndex].title,
          description: orderFlow[currentStepIndex].desc,
          date: '',
          status: 'current'
        });
        
        // Add remaining pending steps
        for (let i = currentStepIndex + 1; i < orderFlow.length; i++) {
          timeline.push({
            title: orderFlow[i].title,
            description: orderFlow[i].desc,
            date: '',
            status: 'pending'
          });
        }
      } else {
        // Add remaining pending steps
        for (let i = completedSteps; i < orderFlow.length; i++) {
          const status = i === currentStepIndex ? 'current' : 'pending';
          timeline.push({
            title: orderFlow[i].title,
            description: orderFlow[i].desc,
            date: '',
            status: status
          });
        }
      }
    }

    // Handle special cases (cancelled, failed, etc.)
    const isProblematicStatus = ['CANCELLED', 'RETURNED', 'REFUNDED', 'DELIVERY_FAILED'].includes(currentStatus);
    if (isProblematicStatus) {
      timeline.forEach(item => {
        if (item.status === 'pending') {
          item.status = 'cancelled';
        }
      });
    }

    // Mark last item
    if (timeline.length > 0) {
      timeline[timeline.length - 1].isLast = true;
    }

    return timeline;
  };

  // Filter out invalid items (null/empty items)
  const getValidItems = () => {
    if (!orderData?.items) return [];
    return orderData.items.filter(item => 
      item && 
      item.productName && 
      item.quantity > 0 && 
      item.price !== null && 
      item.price !== undefined
    );
  };

  const getTotalItems = () => {
    const validItems = getValidItems();
    return validItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    const validItems = getValidItems();
    return validItems.reduce((total: number, item: any) => total + (item.price * item.quantity || 0), 0);
  };

  const getCurrentStatusInfo = () => {
    if (!orderData) return { text: 'Unknown', color: COLORS.gray };

    const status = orderData.current_status.toUpperCase();
    
    const statusMap: { [key: string]: { text: string; color: string } } = {
      'ORDER_CONFIRMED': { text: 'Order Confirmed', color: COLORS.success },
      'ORDER_PROCESSED': { text: 'Processing', color: COLORS.primary },
      'PACKED': { text: 'Packed', color: COLORS.primary },
      'READY_TO_SHIP': { text: 'Ready to Ship', color: COLORS.primary },
      'SHIPPED': { text: 'Shipped', color: COLORS.primary },
      'OUT_FOR_DELIVERY': { text: 'Out for Delivery', color: COLORS.primary },
      'DELIVERED': { text: 'Delivered', color: COLORS.success },
      'CANCELLED': { text: 'Cancelled', color: COLORS.danger },
      'RETURNED': { text: 'Returned', color: COLORS.danger },
      'REFUNDED': { text: 'Refunded', color: COLORS.danger },
      'DELIVERY_FAILED': { text: 'Delivery Failed', color: COLORS.danger },
    };
    
    return statusMap[status] || { text: status, color: COLORS.primary };
  };

  const getStatusIcon = (status: 'completed' | 'current' | 'pending' | 'failed' | 'cancelled') => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'current': return 'radio-button-checked';
      case 'failed': return 'error';
      case 'cancelled': return 'cancel';
      default: return 'radio-button-unchecked';
    }
  };

  const getStatusColor = (status: 'completed' | 'current' | 'pending' | 'failed' | 'cancelled') => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'current': return COLORS.primary;
      case 'failed': return COLORS.danger;
      case 'cancelled': return '#FF8C00';
      default: return COLORS.light;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: colors.text, marginTop: 10 }}>Loading order details...</Text>
      </SafeAreaView>
    );
  }

  if (error || !orderData) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 20 }}>
        <Icon name="error-outline" size={48} color={COLORS.danger} style={{ marginBottom: 15 }} />
        <Text style={{ color: colors.title, fontSize: 18, textAlign: 'center', marginBottom: 10 }}>
          {error || 'Order not found'}
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: COLORS.primary }]}
          onPress={() => fetchOrder()}
        >
          <Text style={[styles.retryButtonText, { color: COLORS.white }]}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentStatusInfo = getCurrentStatusInfo();
  const timeline = createTimeline();
  const validItems = getValidItems();
  const displayedProducts = showAllProducts ? validItems : validItems.slice(0, 2);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Track Order" leftIcon="back" />
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={GlobalStyleSheet.container}>
          {/* Order Summary */}
          <View style={[styles.orderSummary, { backgroundColor: colors.card }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>Order ID</Text>
              <Text style={[styles.summaryValue, { color: colors.title }]}>{orderData.order_id}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: `${currentStatusInfo.color}20` }]}>
                <Text style={[styles.statusBadgeText, { color: currentStatusInfo.color }]}>
                  {currentStatusInfo.text}
                </Text>
              </View>
            </View>
            
            {validItems.length > 0 && (
              <>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.text }]}>Items</Text>
                  <Text style={[styles.summaryValue, { color: colors.title }]}>{getTotalItems()} items</Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.text }]}>Total</Text>
                  <Text style={[styles.summaryValue, { color: COLORS.success }]}>₹{getTotalPrice().toLocaleString('en-IN')}</Text>
                </View>
              </>
            )}
          </View>

          {/* Cancel Order Button - Only show when canCancel is true */}
          {orderData.canCancel && (
            <TouchableOpacity 
              style={[
                styles.cancelButton, 
                { 
                  backgroundColor: cancelling ? COLORS.gray : COLORS.danger,
                  opacity: cancelling ? 0.7 : 1
                }
              ]}
              onPress={handleCancelOrder}
              disabled={cancelling}
            >
              {cancelling ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Icon name="cancel" size={20} color={COLORS.white} />
              )}
              <Text style={[styles.cancelButtonText, { color: COLORS.white }]}>
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Timeline */}
          <View style={[styles.timelineContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.timelineHeader, { color: colors.title }]}>Order Timeline</Text>
            
            {timeline.length === 0 ? (
              <Text style={[styles.noTimelineText, { color: colors.text }]}>
                No timeline information available
              </Text>
            ) : (
              timeline.map((item, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.timelineIcon,
                      { backgroundColor: getStatusColor(item.status) }
                    ]}>
                      <Icon 
                        name={getStatusIcon(item.status)} 
                        size={16} 
                        color={item.status === 'pending' ? COLORS.gray : COLORS.white} 
                      />
                    </View>
                    {!item.isLast && (
                      <View style={[
                        styles.timelineLine,
                        { backgroundColor: item.status === 'pending' ? colors.border : getStatusColor(item.status) }
                      ]} />
                    )}
                  </View>
                  
                  <View style={styles.timelineContent}>
                    <Text style={[
                      styles.timelineTitle,
                      { color: item.status === 'pending' ? colors.text : getStatusColor(item.status) }
                    ]}>
                      {item.title}
                    </Text>
                    {item.date ? (
                      <Text style={[styles.timelineDate, { color: colors.text }]}>
                        {item.date}
                      </Text>
                    ) : null}
                    <Text style={[styles.timelineDesc, { color: colors.text }]}>
                      {item.description}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Contact Support for issues */}
          {(currentStatusInfo.text === 'Delivery Failed' || currentStatusInfo.text === 'Return in Progress') && (
            <TouchableOpacity 
              style={[styles.supportButton, { backgroundColor: COLORS.primary }]}
              onPress={() => showAlert('Customer Support', 'Please contact our support team for assistance with your order delivery.')}
            >
              <Icon name="headset-mic" size={20} color={COLORS.white} />
              <Text style={[styles.supportButtonText, { color: COLORS.white }]}>Contact Support</Text>
            </TouchableOpacity>
          )}

          {/* Order Items - Only show if there are valid items */}
          {validItems.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.title }]}>Order Items</Text>
                {validItems.length > 2 && (
                  <TouchableOpacity onPress={() => setShowAllProducts(!showAllProducts)}>
                    <Text style={[styles.toggleText, { color: COLORS.primary }]}>
                      {showAllProducts ? 'Show Less' : `+${validItems.length - 2} more`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {displayedProducts.map((item: OrderItem, index: number) => {
                const imageSource = processImagePath(item.image_path);
                
                return (
                  <View key={`${item.id}-${index}`} style={{ marginBottom: 15 }}>
                    <CardStyle3
                      id={item.id.toString()}
                      title={item.productName}
                      price={`₹${item.price.toLocaleString('en-IN')} × ${item.quantity}`}
                      image={imageSource}
                      removebtn={true}
                      status={orderData.current_status}
                      grid={true}
                    />
                  </View>
                );
              })}
            </View>
          )}

          {/* Show message when no valid items */}
          {validItems.length === 0 && (
            <View style={[styles.noItemsContainer, { backgroundColor: colors.card }]}>
              <Icon name="inbox" size={48} color={colors.text} style={{ opacity: 0.5, marginBottom: 10 }} />
              <Text style={[styles.noItemsText, { color: colors.text }]}>
                No items information available for this order
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  orderSummary: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    ...FONTS.fontRegular,
    fontSize: 14,
  },
  summaryValue: {
    ...FONTS.fontSemiBold,
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    ...FONTS.fontSemiBold,
    fontSize: 11,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  cancelButtonText: {
    ...FONTS.fontSemiBold,
    fontSize: 14,
  },
  timelineContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  timelineHeader: {
    ...FONTS.fontSemiBold,
    fontSize: 18,
    marginBottom: 16,
  },
  noTimelineText: {
    ...FONTS.fontRegular,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  timelineLeft: {
    width: 24,
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    zIndex: 2,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginTop: -8,
    minHeight: 40,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineTitle: {
    ...FONTS.fontSemiBold,
    fontSize: 16,
    marginBottom: 4,
  },
  timelineDate: {
    ...FONTS.fontRegular,
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.7,
  },
  timelineDesc: {
    ...FONTS.fontRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  supportButtonText: {
    ...FONTS.fontSemiBold,
    fontSize: 14,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    ...FONTS.fontSemiBold,
    fontSize: 18,
  },
  toggleText: {
    ...FONTS.fontRegular,
    fontSize: 14,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    ...FONTS.fontSemiBold,
    fontSize: 16,
  },
  noItemsContainer: {
    padding: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  noItemsText: {
    ...FONTS.fontRegular,
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default Trackorder;