import React from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    Image,
    Platform,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import Button from '../../components/Button/Button';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { createOrder } from '../../Services/OrderCreateService';
import { initiatePayment, getPaymentRedirectUrl, checkPaymentStatus } from '../../Services/PaymentService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define CartItemWithDetails type locally
type CartItemWithDetails = {
    sno: number;
    itemTagSno: string;
    fullDetails: {
        MaterialFinish: string;
        Description: string;
        TAGNO: string;
        Occasion: string;
        RATE: string;
        GSTAmount: number;
        TAGKEY: string;
        Gender: string;
        SIZEID: number;
        Best_Design: boolean;
        SNO: string;
        CollectionType: string;
        ImagePath: string;
        NewArrival: boolean;
        GrossAmount: number;
        Featured_Products: boolean;
        SIZENAME: string | null;
        Rate: number;
        StoneType: string | null;
        SUBITEMNAME: string;
        CATNAME: string;
        NETWT: number;
        GSTPer: string;
        GrandTotal: number;
        ColorAccents: string;
        ITEMID: string;
        ITEMNAME: string;
        quantity: number;
    };
};

type OrderSummary = {
    subtotal: number;
    gst: number;
    grandTotal: number;
    itemCount: number;
};

type PaymentMethod = {
    id: string;
    name: string;
    icon: string;
    description: string;
    enabled: boolean;
};

type AddressType = {
    id?: string;
    customerId?: string;
    name?: string;
    phone?: string;
    alternatePhone?: string;
    addressLine?: string;
    locality?: string;
    landmark?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    type?: string;
    isDefault?: boolean;
    gstNumber?: string;
    companyName?: string;
    email?: string;
};

type PaymentScreenProps = StackScreenProps<RootStackParamList, 'Payment'>;

const Payment = ({ navigation, route }: PaymentScreenProps) => {
    const theme = useTheme();
    const { colors }: { colors: any } = theme;
    const [loading, setLoading] = React.useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<string | null>(null);
    const [userEmail, setUserEmail] = React.useState('');
    const [userContact, setUserContact] = React.useState('');

    // Get data from navigation params with proper defaults
    const { 
        products = [], 
        selectedAddress = null, 
        orderSummary = {
            subtotal: 0,
            gst: 0,
            grandTotal: 0,
            itemCount: 0
        }, 
        paymentResult = null 
    } = route.params || {};

    React.useEffect(() => {
        const fetchUserData = async () => {
            try {
                const email = await AsyncStorage.getItem('user_email');
                const contact = await AsyncStorage.getItem('user_contact');
                if (email) setUserEmail(email);
                if (contact) setUserContact(contact);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    const paymentMethods: PaymentMethod[] = [
        {
            id: 'razorpay',
            name: 'Online Payment',
            icon: 'credit-card',
            description: 'Pay with Credit/Debit Card, UPI, Net Banking',
            enabled: true
        },
        {
            id: 'cod',
            name: 'Cash on Delivery',
            icon: 'truck',
            description: 'Pay when your order is delivered',
            enabled: true
        }
    ];

    const formatAddress = (address: AddressType | null | undefined): string => {
        if (!address) return "No address selected";
        
        const parts = [];
        if (address.addressLine) parts.push(address.addressLine);
        if (address.locality) parts.push(address.locality);
        if (address.city) parts.push(address.city);
        if (address.state) parts.push(address.state);
        if (address.pincode) parts.push(address.pincode);
        
        return parts.length > 0 ? parts.join(', ') : "Invalid address format";
    };

    const getImageUrl = (imagePath?: string): string => {
        if (!imagePath || imagePath.length < 5) return 'https://via.placeholder.com/150';
        try {
            // Handle both string and array formats
            let imageArray;
            if (typeof imagePath === 'string') {
                try {
                    imageArray = JSON.parse(imagePath);
                } catch {
                    // If it's not valid JSON, treat it as a single image string
                    imageArray = [imagePath];
                }
            } else if (Array.isArray(imagePath)) {
                imageArray = imagePath;
            } else {
                return 'https://via.placeholder.com/150';
            }

            let image = imageArray?.[0] || '';
            if (!image || typeof image !== 'string') return 'https://via.placeholder.com/150';
            
            // Ensure proper URL format
            if (!image.startsWith('http')) {
                image = `https://app.bmgjewellers.com${image.startsWith('/') ? image : '/' + image}`;
            }
            return image;
        } catch (err) {
            console.error('Error parsing image path:', err);
            return 'https://via.placeholder.com/150';
        }
    };

    const prepareOrderData = (paymentMethod: string, paymentStatus: string = 'pending') => {
        // Safely extract address properties with fallbacks
        const addressData = selectedAddress || {} as AddressType;
        
        return {
            customerName: addressData.name || '',
            contact: addressData.phone || userContact,
            email: addressData.email || userEmail,
            totalAmount: orderSummary?.grandTotal || 0,
            address: {
                addressLine: addressData.addressLine || '',
                locality: addressData.locality || '',
                landmark: addressData.landmark || '',
                name: addressData.name || '',
                phone: addressData.phone || userContact,
                alternatePhone: addressData.alternatePhone || '',
                isDefault: addressData.isDefault || false,
                id: addressData.id || '',
                customerId: addressData.customerId || '',
                gstNumber: addressData.gstNumber || '',
                companyName: addressData.companyName || '',
                city: addressData.city || '',
                state: addressData.state || '',
                country: addressData.country || "India",
                pincode: addressData.pincode || '',
            },
            paymentMode: paymentMethod.toUpperCase(),
            paymentStatus: paymentStatus.toUpperCase(),
            items: products.map((item: CartItemWithDetails) => ({
                productId: `${item.fullDetails?.ITEMID || ''}-${item.fullDetails?.TAGNO || ''}`,
                productName: item.fullDetails?.SUBITEMNAME || 'Unnamed Product',
                price: item.fullDetails?.GrandTotal || 0,
                itemId: item.fullDetails?.ITEMID || '',
                tagNo: item.fullDetails?.TAGNO || '',
                sno: item.itemTagSno,
                imagePath: item.fullDetails?.ImagePath || '',
                quantity: item.fullDetails?.quantity || 1,
                // Include additional details that might be needed
                category: item.fullDetails?.CATNAME || '',
                material: item.fullDetails?.MaterialFinish || '',
                size: item.fullDetails?.SIZENAME || '',
                weight: item.fullDetails?.NETWT || 0
            }))
        };
    };

    const handlePaymentInitiation = async (orderId: string, totalAmount: number, email: string, contact: string) => {
        try {
            // Prepare payment data
            const paymentData = {
                merchantTxnNo: orderId,
                amount: totalAmount,
                currencyCode: 356, // INR
                payType: 0,
                transactionType: "SALE",
                addlParam1: '',
                addlParam2: '',
                returnURL: "https://bmgjewellers.com",
                customerEmailID: email,
                customerMobileNo: contact
            };

            console.log('Initiating payment with data:', paymentData);

            // Step 1: Initiate payment
            const paymentResponse = await initiatePayment(paymentData);
            console.log('Payment initiation response:', paymentResponse);

            if (paymentResponse.responseCode !== "R1000") {
                throw new Error(`Payment failed with code: ${paymentResponse.responseCode}`);
            }

            // Step 2: Get redirect URL
            const paymentRedirectUrl = await getPaymentRedirectUrl(
                paymentResponse.redirectURI,
                paymentResponse.tranCtx,
                paymentResponse.merchantTxnNo
            );
            console.log('Payment redirect URL:', paymentRedirectUrl);

            return {
                paymentResponse,
                paymentRedirectUrl
            };

        } catch (error) {
            console.error('Payment initiation failed:', error);
            throw error;
        }
    };

    const handleSubmitOrder = async () => {
        if (!selectedAddress) {
            Alert.alert('Error', 'Please select a delivery address');
            return;
        }

        if (products.length === 0) {
            Alert.alert('Error', 'Your cart is empty');
            return;
        }

        if (!selectedPaymentMethod) {
            Alert.alert('Error', 'Please select a payment method');
            return;
        }

        try {
            setLoading(true);

            // Determine initial payment status and mode based on selected method
            let paymentMode, paymentStatus, orderStatus;
            
            if (selectedPaymentMethod === 'cod') {
                paymentMode = 'COD';
                paymentStatus = 'PENDING';
                orderStatus = 'CONFIRMED';
            } else {
                paymentMode = 'ONLINE';
                paymentStatus = 'PENDING'; // Payment not completed yet
                orderStatus = 'PENDING';
            }
            
            // Prepare order data with correct payment mode and status
            const orderData = prepareOrderData(paymentMode, paymentStatus);
            console.log('📦 Order Create Service Data:', JSON.stringify(orderData, null, 2));

            // Call the order service
            const response = await createOrder(orderData);
            console.log('🔄 Order Service Response:', response);

            // Check if response contains orderId (success case)
            if (response && response.orderId) {
                // Handle different payment methods
                if (selectedPaymentMethod === 'cod') {
                    // For COD, show SuccessModal with COD payment status
                    const orderDetails = {
                        orderId: response.orderId,
                        items: products,
                        total: orderSummary?.grandTotal || 0,
                        date: response.orderTime || new Date().toISOString(),
                        status: orderStatus,
                        address: selectedAddress,
                        paymentMode: paymentMode,
                        paymentStatus: paymentStatus,
                        paymentId: null
                    };
                    console.log('📦 Order Details for SuccessModal:', orderDetails);

                    navigation.navigate('SuccessModal', {
                        orderDetails,
                        onDismiss: () => {
                            navigation.navigate('MyCart');
                        }
                    });
                } else {
                    // For online payments, initiate payment gateway
                    try {
                        const paymentResult = await handlePaymentInitiation(
                            response.orderId,
                            orderSummary?.grandTotal || 0,
                            selectedAddress?.email || userEmail,
                            selectedAddress?.phone || userContact
                        );

                        // Navigate to payment screen with the redirect URL
                        navigation.navigate('PaymentGateway', {
                            paymentUrl: paymentResult.paymentRedirectUrl,
                            orderDetails: {
                                orderId: response.orderId,
                                items: products,
                                total: orderSummary?.grandTotal || 0,
                                date: response.orderTime || new Date().toISOString(),
                                status: orderStatus,
                                address: selectedAddress,
                                paymentMode: paymentMode,
                                paymentStatus: paymentStatus
                            }
                        });
                    } catch (paymentError) {
                        console.error('❌ Payment initiation error:', paymentError);
                        
                        // If payment initiation fails, show failure modal
                        navigation.navigate('FailureModal', {
                            errorMessage: 'Failed to initiate payment. Please try again.',
                            onDismiss: () => {
                                navigation.navigate('MyCart');
                            }
                        });
                    }
                }
            } else {
                // Handle case where response exists but no orderId
                throw new Error(response?.message || 'Order created but no order ID received');
            }
        } catch (error: any) {
            console.error('❌ Order submission error:', error);

            let errorMessage = 'Failed to place order. Please try again.';

            if (error.response) {
                // Handle HTTP error responses
                errorMessage = error.response.data?.message || errorMessage;
            } else if (error.message) {
                // Handle custom error messages
                errorMessage = error.message;
            }

            // Show FailureModal and then navigate to Cart
            navigation.navigate('FailureModal', {
                errorMessage,
                onDismiss: () => {
                    navigation.navigate('MyCart');
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const renderPaymentMethod = (method: PaymentMethod) => (
        <TouchableOpacity
            key={method.id}
            onPress={() => method.enabled && setSelectedPaymentMethod(method.id)}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: selectedPaymentMethod === method.id ? `${COLORS.primary}15` : colors.card,
                borderWidth: selectedPaymentMethod === method.id ? 2 : 1,
                borderColor: selectedPaymentMethod === method.id ? COLORS.primary : colors.border,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                opacity: method.enabled ? 1 : 0.5,
            }}
            disabled={!method.enabled}
        >
            <View style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: selectedPaymentMethod === method.id ? COLORS.primary : colors.background,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 15
            }}>
                <Feather
                    name={method.icon as any}
                    size={24}
                    color={selectedPaymentMethod === method.id ? 'white' : COLORS.primary}
                />
            </View>

            <View style={{ flex: 1 }}>
                <Text style={{
                    ...FONTS.fontSemiBold,
                    fontSize: 16,
                    color: method.enabled ? colors.title : colors.text,
                    marginBottom: 4
                }}>
                    {method.name}
                </Text>
                <Text style={{
                    ...FONTS.fontRegular,
                    fontSize: 12,
                    color: method.enabled ? colors.text : colors.text,
                    opacity: 0.7
                }}>
                    {method.description}
                </Text>
            </View>

            <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: selectedPaymentMethod === method.id ? COLORS.primary : colors.border,
                backgroundColor: selectedPaymentMethod === method.id ? COLORS.primary : 'transparent',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {selectedPaymentMethod === method.id && (
                    <Feather name="check" size={12} color="white" />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header
                title="Payment"
                leftIcon="back"
                onPressLeft={() => navigation.goBack()}
            />

            <View style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{
                        paddingBottom: 200,
                        paddingTop: 10
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={GlobalStyleSheet.container}>
                        {/* Order Summary Card */}
                        <View style={{
                            backgroundColor: colors.card,
                            borderRadius: 15,
                            padding: 20,
                            marginBottom: 20,
                            shadowColor: 'rgba(0,0,0,0.1)',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.8,
                            shadowRadius: 4,
                            elevation: 3,
                        }}>
                            <Text style={{ ...FONTS.fontSemiBold, fontSize: 18, color: colors.title, marginBottom: 15 }}>
                                Order Summary
                            </Text>

                            <View style={{ backgroundColor: colors.background, borderRadius: 10, padding: 15 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.text }}>
                                        Subtotal ({orderSummary?.itemCount || 0} items)
                                    </Text>
                                    <Text style={{ ...FONTS.fontMedium, fontSize: 14, color: colors.title }}>
                                        ₹{orderSummary?.subtotal?.toFixed(2) || '0.00'}
                                    </Text>
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.text }}>
                                        GST ({products[0]?.fullDetails?.GSTPer || '3%'})
                                    </Text>
                                    <Text style={{ ...FONTS.fontMedium, fontSize: 14, color: colors.title }}>
                                        ₹{orderSummary?.gst?.toFixed(2) || '0.00'}
                                    </Text>
                                </View>

                                <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10 }} />

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ ...FONTS.fontBold, fontSize: 18, color: colors.title }}>Total Amount</Text>
                                    <Text style={{ ...FONTS.fontBold, fontSize: 20, color: COLORS.primary }}>
                                        ₹{orderSummary?.grandTotal?.toFixed(2) || '0.00'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Delivery Address Summary */}
                        <View style={{
                            backgroundColor: colors.card,
                            borderRadius: 15,
                            padding: 20,
                            marginBottom: 20,
                            shadowColor: 'rgba(0,0,0,0.1)',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.8,
                            shadowRadius: 4,
                            elevation: 3,
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                <Feather name="map-pin" size={18} color={COLORS.primary} />
                                <Text style={{ ...FONTS.fontSemiBold, fontSize: 16, color: colors.title, marginLeft: 8 }}>
                                    Delivery Address
                                </Text>
                            </View>

                            <View style={{ backgroundColor: colors.background, borderRadius: 10, padding: 15 }}>
                                <Text style={{ ...FONTS.fontMedium, fontSize: 14, color: colors.title, marginBottom: 4 }}>
                                    {selectedAddress?.name || 'No name'} • {selectedAddress?.type || 'Home'}
                                </Text>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 13, color: colors.text, lineHeight: 18 }}>
                                    {formatAddress(selectedAddress)}
                                </Text>
                                {selectedAddress?.phone && (
                                    <Text style={{ ...FONTS.fontRegular, fontSize: 12, color: colors.text, marginTop: 8 }}>
                                        📞 {selectedAddress.phone}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Order Items Preview */}
                        <View style={{
                            backgroundColor: colors.card,
                            borderRadius: 15,
                            padding: 20,
                            marginBottom: 20,
                            shadowColor: 'rgba(0,0,0,0.1)',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.8,
                            shadowRadius: 4,
                            elevation: 3,
                        }}>
                            <Text style={{ ...FONTS.fontSemiBold, fontSize: 16, color: colors.title, marginBottom: 15 }}>
                                Order Items ({products?.length || 0})
                            </Text>

                            {products?.slice(0, 2).map((item: CartItemWithDetails, index: number) => (
                                <View key={index} style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginBottom: index === products.length - 1 ? 0 : 15,
                                    backgroundColor: colors.background,
                                    borderRadius: 10,
                                    padding: 12,
                                }}>
                                    <Image
                                        source={{ uri: getImageUrl(item.fullDetails?.ImagePath) }}
                                        style={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: 8,
                                            marginRight: 12,
                                            resizeMode: 'cover',
                                        }}
                                    />
                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={{ ...FONTS.fontMedium, fontSize: 14, color: colors.title, marginBottom: 4 }}
                                            numberOfLines={1}
                                        >
                                            {item.fullDetails?.SUBITEMNAME || 'Unnamed Product'}
                                        </Text>
                                        <Text style={{ ...FONTS.fontRegular, fontSize: 12, color: colors.text, marginBottom: 2 }}>
                                            {item.fullDetails?.CATNAME}
                                        </Text>
                                        <Text style={{ ...FONTS.fontRegular, fontSize: 11, color: colors.text, opacity: 0.7 }}>
                                            Qty: {item.fullDetails?.quantity || 1}
                                        </Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={{ ...FONTS.fontBold, fontSize: 14, color: COLORS.primary }}>
                                            ₹{item.fullDetails?.GrandTotal?.toFixed(2) || '0.00'}
                                        </Text>
                                    </View>
                                </View>
                            ))}

                            {products && products.length > 2 && (
                                <Text style={{
                                    ...FONTS.fontRegular,
                                    fontSize: 12,
                                    color: COLORS.primary,
                                    textAlign: 'center',
                                    marginTop: 10
                                }}>
                                    +{products.length - 2} more items
                                </Text>
                            )}
                        </View>

                        {/* Payment Methods */}
                        <View style={{
                            backgroundColor: colors.card,
                            borderRadius: 15,
                            padding: 20,
                            shadowColor: 'rgba(0,0,0,0.1)',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.8,
                            shadowRadius: 4,
                            elevation: 3,
                        }}>
                            <Text style={{ ...FONTS.fontSemiBold, fontSize: 18, color: colors.title, marginBottom: 15 }}>
                                Choose Payment Method
                            </Text>

                            {paymentMethods.map(renderPaymentMethod)}

                            <View style={{
                                backgroundColor: colors.background,
                                borderRadius: 10,
                                padding: 15,
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 10
                            }}>
                                <MaterialIcons name="security" size={20} color={COLORS.success} />
                                <Text style={{
                                    ...FONTS.fontRegular,
                                    fontSize: 12,
                                    color: colors.text,
                                    marginLeft: 10,
                                    flex: 1,
                                    lineHeight: 16
                                }}>
                                    Your payment information is secure and encrypted. We don't store your card details.
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Fixed Bottom Payment Button */}
                <View style={[{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    shadowColor: 'rgba(195, 123, 95, 0.25)',
                    shadowOffset: { width: 2, height: -20 },
                    shadowOpacity: .1,
                    shadowRadius: 5,
                }, Platform.OS === "ios" && {
                    backgroundColor: colors.card,
                    borderTopLeftRadius: 25,
                    borderTopRightRadius: 25,
                    bottom: 30
                }]}
                >
                    <View style={{
                        backgroundColor: colors.card,
                        borderTopLeftRadius: 25,
                        borderTopRightRadius: 25,
                        paddingHorizontal: 20,
                        paddingTop: 20,
                        paddingBottom: Platform.OS === 'ios' ? 40 : 20
                    }}>
                        {selectedPaymentMethod && (
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 15,
                                paddingBottom: 15,
                                borderBottomWidth: 1,
                                borderBottomColor: colors.border
                            }}>
                                <Feather
                                    name={paymentMethods.find(m => m.id === selectedPaymentMethod)?.icon as any || 'credit-card'}
                                    size={20}
                                    color={COLORS.primary}
                                />
                                <Text style={{
                                    ...FONTS.fontMedium,
                                    fontSize: 14,
                                    color: colors.title,
                                    marginLeft: 10,
                                    flex: 1
                                }}>
                                    {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                                </Text>
                                <Text style={{
                                    ...FONTS.fontBold,
                                    fontSize: 16,
                                    color: COLORS.primary
                                }}>
                                    {selectedPaymentMethod === 'cod' ? 'Pay on Delivery' : `Pay ₹${orderSummary?.grandTotal?.toFixed(2) || '0.00'}`}
                                </Text>
                            </View>
                        )}

                        <Button
                            title={
                                loading ? "Processing..." :
                                    selectedPaymentMethod === 'cod' ?
                                        `Confirm COD Order` :
                                        `Pay ₹${orderSummary?.grandTotal?.toFixed(2) || '0.00'}`
                            }
                            onPress={handleSubmitOrder}
                            color={COLORS.primary}
                            btnRounded
                            disabled={loading || !selectedPaymentMethod || (products?.length || 0) === 0 || !selectedAddress}
                            icon={loading && (
                                <ActivityIndicator
                                    color="#fff"
                                    size="small"
                                    style={{ marginRight: 10 }}
                                />
                            )}
                        />

                        {(!selectedPaymentMethod || !selectedAddress || (products?.length || 0) === 0) && (
                            <Text style={{
                                ...FONTS.fontRegular,
                                fontSize: 12,
                                color: colors.text,
                                textAlign: 'center',
                                marginTop: 8,
                                opacity: 0.7
                            }}>
                                {!selectedPaymentMethod ? 'Please select a payment method' :
                                    !selectedAddress ? 'Address required' :
                                        'No items to pay for'}
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Payment;