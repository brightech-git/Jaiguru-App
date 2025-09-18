import { API_BASE_URL } from "../Config/baseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_IMAGE_URL = "https://app.bmgjewellers.com";

export const fetchOrderHistory = async () => {
  try {
    const token = await AsyncStorage.getItem("user_token");
    if (!token) throw new Error("No token found. Please log in.");

    const response = await fetch(
      `${API_BASE_URL}/order/history?page=0&size=100000`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.status}`);
    }

    const json = await response.json();

    // Transform orders
    return json.map((order) => ({
      ...order,
      orderItems: processOrderItems(order.orderItems),
    }));
  } catch (error) {
    console.error("OrderService Error:", error.message);
    throw error;
  }
};

const processOrderItems = (orderItems) => {
  if (!Array.isArray(orderItems)) return [];

  return orderItems.map((item, index) => {
    try {
      const imageUrls = processImagePath(item.imagePath); // ✅ fixed key
      return {
        ...item,
        imageUrls: imageUrls.length > 0 ? imageUrls : [null],
      };
    } catch (error) {
      console.warn(
        `Failed to process order item images for item ${index}:`,
        error
      );
      return {
        ...item,
        imageUrls: [null],
      };
    }
  });
};

const processImagePath = (imagePath) => {
  if (!imagePath) return [];

  // Case 1: Already an array
  if (Array.isArray(imagePath)) {
    return imagePath.map((p) => normalizePath(p));
  }

  // Case 2: String
  if (typeof imagePath === "string") {
    return [normalizePath(imagePath)];
  }

  // Case 3: Unexpected
  console.warn("Unexpected imagePath format:", imagePath);
  return [];
};

const normalizePath = (path) => {
  if (!path) return null;
  const cleanPath = String(path).trim();

  // Already a full URL
  if (cleanPath.startsWith("http")) return cleanPath;

  // Relative path
  return `${API_IMAGE_URL}${cleanPath.startsWith("/") ? "" : "/"}${cleanPath}`;
};
