import { API_BASE_URL } from "../Config/baseUrl";

const IMAGE_BASE_URL = "https://app.bmgjewellers.com";

// Helper function to construct proper image URLs
const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return `${IMAGE_BASE_URL}/fallback-image.jpg`;

  // If path is already a full URL, return it directly
  if (path.startsWith('http')) {
    return path;
  }
  
  // Remove any leading slash if the path already starts with one
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${IMAGE_BASE_URL}${cleanPath}`;
};

export const getFestivalBanners = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/festival_banner/list?page=0&pageSize=100`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    
    // Process images to ensure proper URLs
    return Array.isArray(data) ? data.map(banner => ({
      ...banner,
      image_path: getImageUrl(banner.image_path)
    })) : [];
    
  } catch (error) {
    console.error("Failed to fetch festival banners:", error);
    throw error;
  }
};