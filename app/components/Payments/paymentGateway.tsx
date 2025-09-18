import React, { useEffect } from 'react';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { SafeAreaView, Linking, Alert, ActivityIndicator } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigations/RootStackParamList';
import { CommonActions } from '@react-navigation/native';
import { checkPaymentStatus } from '../../Services/PaymentService';

type PaymentGatewayScreenProps = StackScreenProps<RootStackParamList, 'PaymentGateway'>;

const PaymentGateway = ({ route, navigation }: PaymentGatewayScreenProps) => {
    const { paymentUrl, orderDetails } = route.params;

    // Handle deep linking
    useEffect(() => {
        const deepLinkListener = Linking.addEventListener('url', handleDeepLink);
        return () => deepLinkListener.remove();
    }, []);

    const handleDeepLink = (event: { url: string }) => {
        const url = new URL(event.url);
        if (url.host === 'payment-result') {
            handlePaymentResult(url.searchParams);
        }
    };

    const handlePaymentResult = async (params: URLSearchParams) => {
        const status = params.get('status');
        const orderId = params.get('orderId');
        
        if (status === 'success') {
            await handlePaymentSuccess(orderId);
        } else {
            // Check if payment was cancelled
            const isCancelled = params.get('cancelled') === 'true' || status === 'cancelled';
            
            handlePaymentFailure(orderId, isCancelled);
        }
    };

    const handleNavigationStateChange = async (navState: WebViewNavigation) => {
        // Check for both web and deep link URLs
        if (navState.url.includes('payment-success') || 
            navState.url.includes('bmgjewellers://payment-result?status=success')) {
            await handlePaymentSuccess();
        } else if (navState.url.includes('payment-failure') || 
                 navState.url.includes('bmgjewellers://payment-result?status=failure')) {
            handlePaymentFailure(null, false);
        } else if (navState.url.includes('payment-cancelled') || 
                 navState.url.includes('bmgjewellers://payment-result?status=cancelled')) {
            handlePaymentFailure(null, true);
        }
    };

    const handlePaymentSuccess = async (orderId?: string | null) => {
        const orderIdToCheck = orderId || orderDetails.orderId;
        
        if (orderIdToCheck) {
            try {
                // Initiate the checkPaymentStatus function
                const statusData = {
                    merchantTxnNo: orderIdToCheck,
                    originalTxnNo: orderIdToCheck,
                    transactionType: "STATUS"
                };
                
                console.log('Calling checkPaymentStatus with data:', statusData);
                
                const response = await checkPaymentStatus(statusData);
                console.log('Payment status response:', response);
                
            } catch (error) {
                console.error('Error checking payment status:', error);
            }
        } else {
            console.warn('No order ID available for payment status check');
        }
        
        // Directly navigate to Home without showing modal
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            })
        );
    };

    const handlePaymentFailure = (orderId: string | null, isCancelled: boolean) => {
        // Directly navigate to Home without showing modal
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            })
        );
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <WebView
                source={{ uri: paymentUrl }}
                onNavigationStateChange={handleNavigationStateChange}
                startInLoadingState={true}
                onError={(error) => {
                    console.error('WebView error:', error);
                    // Directly navigate to Home on error without showing modal
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'Home' }],
                        })
                    );
                }}
                renderLoading={() => (
                    <ActivityIndicator size="large" style={{ flex: 1 }} />
                )}
            />
        </SafeAreaView>
    );
};

export default PaymentGateway;