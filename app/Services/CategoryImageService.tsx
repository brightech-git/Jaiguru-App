import { API_BASE_URL } from "../Config/baseUrl";

const IMAGE_BASE_URL = 'https://app.bmgjewellers.com';

// Helper function to construct proper image URLs
const getImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  
  // If path is already a full URL, return it directly
  if (path.startsWith('http')) {
    return path;
  }
  
  // Remove any leading slash if the path already starts with one
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${IMAGE_BASE_URL}${cleanPath}`;
};

export const getMainCategoryImages = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/mainCategory_images/list`);

    if (!response.ok) {
      return []; // return empty array on bad status
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    // Use the helper function in your mapping
    return data.map(item => ({
      id: item.id,
      name: item.item_name?.trim() || "Unnamed",
      image: getImageUrl(item.image_path),
      createdAt: item.created_at
    }));
  } catch {
    return []; // fail silently and return empty array
  }
};