// services/bestDesignService.js
import { API_BASE_URL } from "../Config/baseUrl";

const IMAGE_BASE_URL = "https://app.bmgjewellers.com";

export const fetchBestDesignProducts = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/product/items/filter?best_design=true`
    );
    const json = await response.json();

    return json?.data || [];
  } catch (error) {
    console.error("Error fetching best design products:", error);
    throw error;
  }
};
