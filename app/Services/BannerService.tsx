// services/bannerService.ts
import { API_BASE_URL } from "../Config/baseUrl";

export const getBanners = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/banner/list`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching banners:", error);
    throw error;
  }
};
