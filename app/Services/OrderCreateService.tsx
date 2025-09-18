// services/orderService.js
import { API_BASE_URL } from "../Config/baseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const createOrder = async (orderData) => {
    
    const token = await AsyncStorage.getItem('user_token');
    console.log("📌 Retrieved token:", token);
  try {
    const response = await fetch(`${API_BASE_URL}/order/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add Authorization header if required
         "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
      
    });
console.log("📦 Order Create Service:", orderData);
    const json = await response.json();
    return json;
  } catch (error) {
    console.error("❌ Error creating order:", error);
    throw error;
  }
};
