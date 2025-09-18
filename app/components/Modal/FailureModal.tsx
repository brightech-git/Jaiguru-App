import React, { useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useTheme, useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const FailureModal = () => {
  const { colors }: { colors: any } = useTheme();
  const navigation = useNavigation<any>();

  // Auto navigate after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('MyCart'); // change 'Home' to your actual home screen name
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  const handleOkPress = () => {
    navigation.navigate('MyCart');
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          alignItems: 'center',
          paddingHorizontal: 30,
          paddingVertical: 20,
          paddingBottom: 30,
          backgroundColor: colors.card,
          width: 320,
          borderRadius: SIZES.radius,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 5,
        }}
      >
        {/* Circle with cross icon */}
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 15,
            marginTop: 10,
          }}
        >
          <View
            style={{
              height: 80,
              width: 80,
              opacity: 0.2,
              backgroundColor: COLORS.danger,
              borderRadius: 80,
            }}
          />
          <View
            style={{
              height: 65,
              width: 65,
              backgroundColor: COLORS.danger,
              borderRadius: 65,
              position: 'absolute',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FeatherIcon size={32} color={COLORS.white} name="x" />
          </View>
        </View>

        {/* Title */}
        <Text
          style={{
            ...FONTS.h5,
            color: colors.title,
            marginBottom: 10,
          }}
        >
          Oops!
        </Text>

        {/* Subtitle */}
        <Text
          style={{
            ...FONTS.font,
            color: colors.text,
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          Something went wrong. Please try again.
        </Text>

        {/* OK Button */}
        <TouchableOpacity
          onPress={handleOkPress}
          style={{
            backgroundColor: COLORS.danger,
            paddingVertical: 10,
            paddingHorizontal: 30,
            borderRadius: SIZES.radius,
          }}
        >
          <Text style={{ ...FONTS.font, color: COLORS.white }}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FailureModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)', // dim background
    justifyContent: 'center',
    alignItems: 'center',
  },
});



//Paymnet redirections

// import React, { useEffect } from 'react';
// import { WebView, WebViewNavigation } from 'react-native-webview';
// import { SafeAreaView, Linking, Alert, ActivityIndicator } from 'react-native';
// import { StackScreenProps } from '@react-navigation/stack';
// import { RootStackParamList } from '../Navigations/RootStackParamList';
// import { CommonActions } from '@react-navigation/native';

// type PaymentGatewayScreenProps = StackScreenProps<RootStackParamList, 'PaymentGateway'>;

// const PaymentGateway = ({ route, navigation }: PaymentGatewayScreenProps) => {
//     const { paymentUrl, orderDetails } = route.params;

//     // Handle deep linking
//     useEffect(() => {
//         const deepLinkListener = Linking.addEventListener('url', handleDeepLink);
//         return () => deepLinkListener.remove();
//     }, []);

//     const handleDeepLink = (event: { url: string }) => {
//         const url = new URL(event.url);
//         if (url.host === 'payment-result') {
//             handlePaymentResult(url.searchParams);
//         }
//     };

//     const handlePaymentResult = (params: URLSearchParams) => {
//         const status = params.get('status');
//         const orderId = params.get('orderId');
        
//         if (status === 'success') {
//             handlePaymentSuccess(orderId);
//         } else {
//             // Check if payment was cancelled
//             const isCancelled = params.get('cancelled') === 'true' || status === 'cancelled';
            
//             handlePaymentFailure(orderId, isCancelled);
//         }
//     };

//     const handleNavigationStateChange = (navState: WebViewNavigation) => {
//         // Check for both web and deep link URLs
//         if (navState.url.includes('payment-success') || 
//             navState.url.includes('bmgjewellers://payment-result?status=success')) {
//             handlePaymentSuccess();
//         } else if (navState.url.includes('payment-failure') || 
//                  navState.url.includes('bmgjewellers://payment-result?status=failure')) {
//             handlePaymentFailure(null, false);
//         } else if (navState.url.includes('payment-cancelled') || 
//                  navState.url.includes('bmgjewellers://payment-result?status=cancelled')) {
//             handlePaymentFailure(null, true);
//         }
//     };

//     const handlePaymentSuccess = (orderId?: string | null) => {
//         navigation.navigate('SuccessModal', {
//             orderDetails: {
//                 ...orderDetails,
//                 orderId: orderId || orderDetails.orderId,
//                 status: 'Confirmed'
//             },
//             onDismiss: () => {
//                 // Reset navigation stack and go to Home
//                 navigation.dispatch(
//                     CommonActions.reset({
//                         index: 0,
//                         routes: [{ name: 'Home' }],
//                     })
//                 );
//             }
//         });
//     };

//     const handlePaymentFailure = (orderId: string | null, isCancelled: boolean) => {
//         navigation.navigate('FailureModal', {
//             errorMessage: isCancelled ? 'Payment was cancelled' : 'Payment failed',
//             orderId: orderId || orderDetails.orderId,
//             isCancelled: isCancelled,
//             onDismiss: () => {
//                 // Reset navigation stack and go to Cart
//                 navigation.dispatch(
//                     CommonActions.reset({
//                         index: 0,
//                         routes: [{ name: 'Cart' }],
//                     })
//                 );
//             }
//         });
//     };

//     return (
//         <SafeAreaView style={{ flex: 1 }}>
//             <WebView
//                 source={{ uri: paymentUrl }}
//                 onNavigationStateChange={handleNavigationStateChange}
//                 startInLoadingState={true}
//                 onError={(error) => {
//                     console.error('WebView error:', error);
//                     navigation.navigate('FailureModal', {
//                         errorMessage: 'Payment failed to load',
//                         orderId: orderDetails.orderId,
//                         isCancelled: false,
//                         onDismiss: () => {
//                             // Reset navigation stack and go to Cart
//                             navigation.dispatch(
//                                 CommonActions.reset({
//                                     index: 0,
//                                     routes: [{ name: 'Cart' }],
//                                 })
//                             );
//                         }
//                     });
//                 }}
//                 renderLoading={() => (
//                     <ActivityIndicator size="large" style={{ flex: 1 }} />
//                 )}
//             />
//         </SafeAreaView>
//     );
// };

// export default PaymentGateway;