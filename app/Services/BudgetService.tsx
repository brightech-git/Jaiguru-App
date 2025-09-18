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

export const fetchBudgetCategories = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/budget-categories/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const json = await response.json();
    const categories = json || [];

    return categories.map((cat: any) => ({
      id: cat.id,
      title: cat.title,
      subtitle: cat.subtitle,
      min: cat.min_price,
      max: cat.max_price,
      image: getImageUrl(cat.image_path),
    }));
  } catch (error) {
    console.error("Error fetching budget categories:", error);
    return [];
  }
};