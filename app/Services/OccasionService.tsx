export interface OccasionBanner {
  id: number;
  image_path: string;
  title: string;
  subtitle: string;
  occasion: string;
  gender: string;
  created_at: string;
}

import { API_BASE_URL } from "../Config/baseUrl";

const IMAGE_BASE_URL = "https://app.bmgjewellers.com";

// Helper function to construct proper image URLs
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return `${IMAGE_BASE_URL}/fallback-image.jpg`;

  // If path is already a full URL, return it directly
  if (path.startsWith('http')) {
    return path;
  }
  
  // Remove any leading slash if the path already starts with one
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${IMAGE_BASE_URL}${cleanPath}`;
};

export const getOccasionBanners = async (): Promise<OccasionBanner[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/occasion_banner/list`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: OccasionBanner[] = await response.json();
    
    // Process images to ensure proper URLs
    return data.map(banner => ({
      ...banner,
      image_path: getImageUrl(banner.image_path)
    }));
    
  } catch (error) {
    console.error('Error fetching banners:', error);
    throw error;
  }
};