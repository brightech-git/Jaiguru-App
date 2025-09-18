import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import Header from '../../layout/Header';
import { useTheme } from '@react-navigation/native';
import { IMAGES } from '../../constants/Images';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconFeather from 'react-native-vector-icons/Feather';

type OrderDetailsScreenProps = StackScreenProps<RootStackParamList, 'OrderDetails'>;

interface OrderItem {
  id: number;
  sno: string;
  itemid: number;
  tagno: string;
  productName: string;
  quantity: number;
  price: number;
  image_path: string;
  imageUrls?: string[];
  priceFormatted?: string;
}

interface Order {
  id: number | null;
  orderId: string;
  customerName: string;
  contact: string;
  email: string;
  address: any;
  totalAmount: number;
  status: string;
  orderTime: string;
  paymentMode: string | null;
  paymentStatus: string | null;
  courierName: string | null;
  courierTrackingId: string | null;
  orderItems: OrderItem[];
  statusInfo?: any;
  formattedDate?: string;
  totalFormatted?: string;
}

const OrderDetails = ({ route, navigation }: OrderDetailsScreenProps) => {
  const { order: routeOrder } = route.params;
  const theme = useTheme();
  const { colors }: { colors: any } = theme;
  const [expandedSections, setExpandedSections] = useState({
    orderSummary: true,
    shippingInfo: true,
    paymentInfo: true,
    orderItems: true,
    courierInfo: true
  });

  // Normalize the order data to handle different structures
  const order = useMemo(() => {
    if (!routeOrder) return null;
    
    // If the order object already has the expected structure
    if (routeOrder.orderId) {
      return {
        ...routeOrder,
        // Ensure address is a string
        address: typeof routeOrder.address === 'string' 
          ? routeOrder.address 
          : routeOrder.address?.addressLine 
            ? `${routeOrder.address.addressLine}, ${routeOrder.address.city}, ${routeOrder.address.state} - ${routeOrder.address.pincode}`
            : 'Address not available',
        // Ensure orderItems have proper structure
        orderItems: Array.isArray(routeOrder.orderItems) 
          ? routeOrder.orderItems.map((item, index) => ({
              id: item.itemid || item.id || index,
              itemid: item.itemid || item.id || index,
              sno: item.sno || `SNO-${index}`,
              tagno: item.tagno || `TAG-${index}`,
              productName: item.productName || `Product ${index + 1}`,
              quantity: item.quantity || 1,
              price: item.price || 0,
              image_path: item.imagePath || item.image_path,
              imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls : [item.imagePath].filter(Boolean),
              priceFormatted: item.priceFormatted || (item.price ? `₹${item.price.toFixed(2)}` : '₹0.00')
            }))
          : []
      };
    }
    
    return null;
  }, [routeOrder]);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Function to process image paths from API
  const processImagePaths = (imagePath: any): string[] => {
    if (!imagePath) return [];
    
    try {
      let paths: string[] = [];
      
      if (Array.isArray(imagePath)) {
        paths = imagePath;
      } 
      else if (typeof imagePath === 'string' && imagePath.trim().startsWith('[')) {
        paths = JSON.parse(imagePath);
      }
      else if (typeof imagePath === 'string') {
        paths = [imagePath];
      }
      else if (typeof imagePath === 'object' && imagePath.image) {
        paths = [imagePath.image];
      }
      
      return paths
        .filter(path => path && typeof path === 'string')
        .map(path => {
          const cleanPath = path.trim();
          
          if (cleanPath.startsWith('http')) {
            return cleanPath;
          }
          
          if (cleanPath.startsWith('/')) {
            return `https://app.bmgjewellers.com${cleanPath}`;
          }
          
          return `https://app.bmgjewellers.com/${cleanPath}`;
        });
    } catch (error) {
      console.warn('Error processing image paths:', error);
      return [];
    }
  };

  const renderImageSource = (imageUrls: string[] | null | undefined) => {
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return IMAGES.fallbackImage;
    }

    for (const imageUrl of imageUrls) {
      if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
        const cleanUrl = imageUrl.trim();
        if (cleanUrl.startsWith('http') || cleanUrl.startsWith('file')) {
          return { uri: cleanUrl };
        }
      }
    }

    return IMAGES.fallbackImage;
  };

  const getStatusColor = (status: string) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'PLACED':
      case 'PENDING':
        return COLORS.warning;
      case 'PROCESSING':
        return COLORS.info;
      case 'SHIPPED':
        return COLORS.primary;
      case 'DELIVERED':
      case 'COMPLETED':
        return COLORS.success;
      case 'CANCELLED':
        return COLORS.danger;
      default:
        return COLORS.secondary;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleTrackOrder = () => {
    if (!order?.orderId) {
      Alert.alert('Error', 'No order ID available for tracking');
      return;
    }
   console.log("Navigating with orderId:", order.orderId);
navigation.navigate('Trackorder', { orderId: order.orderId });

  };

  const SectionHeader = ({ title, isExpanded, onToggle, icon }: { title: string, isExpanded: boolean, onToggle: () => void, icon: string }) => (
    <TouchableOpacity onPress={onToggle} style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        <Icon name={icon} size={20} color={COLORS.primary} style={styles.sectionIcon} />
        <Text style={[styles.sectionTitle, { color: colors.title }]}>{title}</Text>
      </View>
      <Icon 
        name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
        size={24} 
        color={colors.text} 
      />
    </TouchableOpacity>
  );

  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ ...FONTS.fontRegular, color: colors.text }}>Order not found or invalid data structure</Text>
        <Text style={{ ...FONTS.fontRegular, color: colors.text, marginTop: 10, textAlign: 'center' }}>
          Received data: {JSON.stringify(routeOrder).substring(0, 100)}...
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ ...FONTS.fontMedium, color: COLORS.primary }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Order Details" leftIcon="back" />
      
      <ScrollView contentContainerStyle={styles.container}>
        {/* Order Status Header */}
        <View style={[styles.statusHeader, { backgroundColor: colors.card }]}>
          <View style={styles.statusHeaderTop}>
            <View style={styles.orderIdContainer}>
              <Text style={[styles.orderIdLabel, { color: colors.text }]}>ORDER #</Text>
              <Text style={[styles.orderId, { color: colors.title }]}>{order.orderId}</Text>
            </View>
            <View style={[styles.statusBadgeLarge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusTextLarge}>{order.status}</Text>
            </View>
          </View>
          
          <View style={styles.statusHeaderBottom}>
            <View style={styles.statusDateContainer}>
              <Icon name="event" size={16} color={colors.text} style={{ opacity: 0.7 }} />
              <Text style={[styles.statusDate, { color: colors.text }]}>
                {formatDate(order.orderTime)}
              </Text>
            </View>
            <Text style={[styles.totalAmount, { color: colors.title }]}>
              {order.totalFormatted || `₹${order.totalAmount?.toFixed(2) || '0.00'}`}
            </Text>
          </View>
          
          {/* Track Order Button */}
          <TouchableOpacity 
            style={[styles.trackOrderButton, { backgroundColor: COLORS.primary }]}
            onPress={handleTrackOrder}
          >
            <Icon name="my-location" size={18} color={COLORS.white} style={{ marginRight: 8 }} />
            <Text style={styles.trackOrderButtonText}>Track Order</Text>
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <SectionHeader 
            title="Order Summary" 
            isExpanded={expandedSections.orderSummary} 
            onToggle={() => toggleSection('orderSummary')}
            icon="receipt"
          />
          
          {expandedSections.orderSummary && (
            <View style={styles.sectionContent}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryIcon}>
                  <Icon name="event" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.summaryTextContainer}>
                  <Text style={[styles.summaryLabel, { color: colors.text }]}>Order Date</Text>
                  <Text style={[styles.summaryValue, { color: colors.title }]}>{formatDate(order.orderTime)}</Text>
                </View>
              </View>
              
              <View style={styles.summaryRow}>
                <View style={styles.summaryIcon}>
                  <Icon name="payments" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.summaryTextContainer}>
                  <Text style={[styles.summaryLabel, { color: colors.text }]}>Total Amount</Text>
                  <Text style={[styles.summaryValue, { color: colors.title }]}>
                    {order.totalFormatted || `₹${order.totalAmount?.toFixed(2) || '0.00'}`}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryIcon}>
                  <Icon name="inventory" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.summaryTextContainer}>
                  <Text style={[styles.summaryLabel, { color: colors.text }]}>Items</Text>
                  <Text style={[styles.summaryValue, { color: colors.title }]}>
                    {order.orderItems?.length || 0}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Shipping Information */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <SectionHeader 
            title="Shipping Information" 
            isExpanded={expandedSections.shippingInfo} 
            onToggle={() => toggleSection('shippingInfo')}
            icon="local-shipping"
          />
          
          {expandedSections.shippingInfo && (
            <View style={styles.sectionContent}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon name="person" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: colors.text }]}>Name</Text>
                  <Text style={[styles.infoValue, { color: colors.title }]}>{order.customerName || 'N/A'}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon name="phone" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: colors.text }]}>Contact</Text>
                  <View style={styles.contactContainer}>
                    <Text style={[styles.infoValue, { color: colors.title }]}>{order.contact || 'N/A'}</Text>
                    {order.contact && (
                      <TouchableOpacity 
                        style={styles.contactAction}
                        onPress={() => handleCall(order.contact)}
                      >
                        <Icon name="call" size={18} color={COLORS.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon name="email" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: colors.text }]}>Email</Text>
                  <View style={styles.contactContainer}>
                    <Text style={[styles.infoValue, { color: colors.title }]}>{order.email || 'N/A'}</Text>
                    {order.email && (
                      <TouchableOpacity 
                        style={styles.contactAction}
                        onPress={() => handleEmail(order.email)}
                      >
                        <Icon name="email" size={18} color={COLORS.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon name="location-on" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: colors.text }]}>Address</Text>
                  <Text style={[styles.infoValue, { color: colors.title }]}>{order.address || 'N/A'}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Payment Information */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <SectionHeader 
            title="Payment Information" 
            isExpanded={expandedSections.paymentInfo} 
            onToggle={() => toggleSection('paymentInfo')}
            icon="payment"
          />
          
          {expandedSections.paymentInfo && (
            <View style={styles.sectionContent}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon name="credit-card" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: colors.text }]}>Payment Mode</Text>
                  <Text style={[styles.infoValue, { color: colors.title }]}>{order.paymentMode || 'N/A'}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon name="account-balance-wallet" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: colors.text }]}>Payment Status</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: order.paymentStatus === 'SUCCESS' ? COLORS.success : COLORS.warning 
                  }]}>
                    <Text style={styles.statusText}>{order.paymentStatus || 'N/A'}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Order Items */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <SectionHeader 
            title={`Order Items (${order.orderItems?.length || 0})`}
            isExpanded={expandedSections.orderItems} 
            onToggle={() => toggleSection('orderItems')}
            icon="shopping-bag"
          />
          
          {expandedSections.orderItems && order.orderItems && order.orderItems.map((item, index) => {
            const imageUrls = processImagePaths(item.image_path);
            const imageSource = renderImageSource(imageUrls);
            const itemTotal = item.price * (item.quantity || 1);
            
            return (
              <View 
                key={item.id || index} 
                style={[styles.orderItemCard, { backgroundColor: colors.background }]}
              >
                <Image 
                  source={imageSource} 
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                
                <View style={styles.itemDetails}>
                  <Text style={[styles.itemName, { color: colors.title }]} numberOfLines={2}>
                    {item.productName || `Item ${index + 1}`}
                  </Text>
                  
                  <View style={styles.itemMeta}>
                    <View style={styles.quantityContainer}>
                      <Text style={[styles.itemMetaText, { color: colors.text }]}>
                        Qty: {item.quantity || 1}
                      </Text>
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={[styles.itemUnitPrice, { color: colors.text }]}>
                        {item.priceFormatted || formatCurrency(item.price)}
                      </Text>
                      <Text style={[styles.itemTotalPrice, { color: colors.title }]}>
                        {formatCurrency(itemTotal)}
                      </Text>
                    </View>
                  </View>
                  
                  {item.tagno && (
                    <View style={styles.tagContainer}>
                      <IconFeather name="tag" size={12} color={colors.text} style={{ opacity: 0.7 }} />
                      <Text style={[styles.itemTag, { color: colors.text }]}>
                        {item.tagno}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Courier Information (if available) */}
        {order.courierTrackingId && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <SectionHeader 
              title="Courier Information" 
              isExpanded={expandedSections.courierInfo} 
              onToggle={() => toggleSection('courierInfo')}
              icon="local-shipping"
            />
            
            {expandedSections.courierInfo && (
              <View style={styles.sectionContent}>
                {order.courierName && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoIcon}>
                      <Icon name="local-shipping" size={18} color={COLORS.primary} />
                    </View>
                    <View style={styles.infoTextContainer}>
                      <Text style={[styles.infoLabel, { color: colors.text }]}>Courier</Text>
                      <Text style={[styles.infoValue, { color: colors.title }]}>{order.courierName}</Text>
                    </View>
                  </View>
                )}
                
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Icon name="qr-code" size={18} color={COLORS.primary} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoLabel, { color: colors.text }]}>Tracking ID</Text>
                    <Text style={[styles.infoValue, { color: colors.title }]}>{order.courierTrackingId}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 30,
  },
  statusHeader: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statusHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusHeaderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderIdContainer: {
    flex: 1,
  },
  orderIdLabel: {
    ...FONTS.fontRegular,
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  orderId: {
    ...FONTS.fontBold,
    fontSize: 18,
  },
  statusBadgeLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusTextLarge: {
    ...FONTS.fontMedium,
    fontSize: 14,
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDate: {
    ...FONTS.fontRegular,
    fontSize: 14,
    marginLeft: 8,
  },
  totalAmount: {
    ...FONTS.fontBold,
    fontSize: 18,
  },
  trackOrderButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  trackOrderButtonText: {
    ...FONTS.fontMedium,
    fontSize: 16,
    color: COLORS.white,
  },
  section: {
    borderRadius: 16,
    padding: 0,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 12,
  },
  sectionTitle: {
    ...FONTS.fontSemiBold,
    fontSize: 16,
  },
  sectionContent: {
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryIcon: {
    width: 24,
    alignItems: 'center',
    marginRight: 16,
  },
  summaryTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    ...FONTS.fontRegular,
    fontSize: 14,
  },
  summaryValue: {
    ...FONTS.fontMedium,
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    ...FONTS.fontRegular,
    fontSize: 12,
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  infoIcon: {
    width: 24,
    alignItems: 'center',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    ...FONTS.fontRegular,
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  infoValue: {
    ...FONTS.fontMedium,
    fontSize: 15,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactAction: {
    padding: 4,
  },
  orderItemCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    ...FONTS.fontMedium,
    fontSize: 16,
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityContainer: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  itemMetaText: {
    ...FONTS.fontRegular,
    fontSize: 14,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  itemUnitPrice: {
    ...FONTS.fontRegular,
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  itemTotalPrice: {
    ...FONTS.fontBold,
    fontSize: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTag: {
    ...FONTS.fontRegular,
    fontSize: 13,
    opacity: 0.7,
    marginLeft: 6,
  },
});

export default OrderDetails;