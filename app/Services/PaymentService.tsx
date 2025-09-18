// services/paymentService.ts
import { API_BASE_URL } from "../Config/baseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PaymentResponse {
    aggregatorID: string | null;
    authorizeURI: string | null;
    generateOTPURI: string | null;
    merchantId: string;
    merchantTxnNo: string;
    redirectURI: string;
    responseCode: string;
    secureHash: string;
    showOTPCapturePage: string;
    tranCtx: string;
    verifyOTPURI: string | null;
}

export const initiatePayment = async (paymentData: {
    merchantTxnNo: string;
    amount: number;
    currencyCode: number;
    payType: number;
    transactionType: string;
    addlParam1: string;
    addlParam2: string;
    returnURL: string;
    customerEmailID: string;
    customerMobileNo: string;
}): Promise<PaymentResponse> => {
    try {
        const token = await AsyncStorage.getItem('user_token');
        const response = await fetch(`${API_BASE_URL}/payment/initiate-sale`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
            throw new Error(`Payment initiation failed: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Payment initiation error:", error);
        throw error;
    }
};

export const getPaymentRedirectUrl = async (
    redirectURI: string,
    tranCtx: string,
    merchantTxnNo: string
): Promise<string> => {
    try {
        const token = await AsyncStorage.getItem('user_token');
        const response = await fetch(`${API_BASE_URL}/payment/redirect-url`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                redirectURI,
                tranCtx,
                merchantTxnNo
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to get redirect URL: ${response.statusText}`);
        }

        return await response.text();
    } catch (error) {
        console.error("Failed to get redirect URL:", error);
        throw error;
    }
};

// In your PaymentService file, add this function:
export const checkPaymentStatus = async (statusData) => {
  try {
    const response = await fetch(
      'https://app.bmgjewellers.com/api/v1/payment/status',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statusData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Payment status response:", data);
    return data;
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
};
