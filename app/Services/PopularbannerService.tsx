// services/bannerService.js

import { API_BASE_URL } from "../Config/baseUrl";

export const bannerService = {
  async getBanners() {
    try {
      const response = await fetch(`${API_BASE_URL}/App_banner/list`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data; // API returns array of banners
    } catch (error) {
      console.error("Error fetching banners:", error);
      throw error;
    }
  },
};
