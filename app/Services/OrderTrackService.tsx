import { API_BASE_URL } from "../Config/baseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const trackOrder = async (orderId: string) => {

    const token = await AsyncStorage.getItem('user_token');
  try {
    const response = await fetch(
      `${API_BASE_URL}/order/track/user?orderId=${orderId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization if needed
          'Authorization': `Bearer ${token}`
        },
      }
    );
console.log('Track order response:', response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error tracking order:', error);
    throw error;
  }
};
