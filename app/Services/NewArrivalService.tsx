import { API_BASE_URL } from "../Config/baseUrl";
import { IMAGES } from '../constants/Images';

const IMAGE_BASE_URL = "https://app.bmgjewellers.com";

// Helper function to process image paths
const processImagePath = (imagePath: any): string => {
  if (!imagePath) return IMAGES.item11;

  try {
    let images: string[] = [];

    // Handle different image path formats
    if (typeof imagePath === 'string') {
      if (imagePath.startsWith('[') && imagePath.endsWith(']')) {
        try {
          images = JSON.parse(imagePath);
        } catch {
          const pathMatch = imagePath.match(/"([^"]+)"/g);
          images = pathMatch ? pathMatch.map((path: string) => path.replace(/"/g, '')) : [imagePath];
        }
      } else {
        images = [imagePath];
      }
    } else if (Array.isArray(imagePath)) {
      images = imagePath;
    } else {
      return IMAGES.item11;
    }

    // Get the first valid image
    const firstImage = images[0]?.trim();
    if (!firstImage) return IMAGES.item11;

    // Clean and format the URL
    const cleanedPath = firstImage.replace(/["'[\]]/g, '').trim();

    if (cleanedPath.startsWith('http')) {
      return cleanedPath;
    } else if (cleanedPath.startsWith('/')) {
      return `${IMAGE_BASE_URL}${cleanedPath}`;
    } else {
      return `${IMAGE_BASE_URL}/${cleanedPath}`;
    }
  } catch {
    return IMAGES.item11;
  }
};

export const getNewArrivalProducts = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/product/items/filter?new_arrival=y`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const json = await response.json();

    // Map data and construct full image URL and format price
    return (json.data || []).map(item => ({
      ...item,
      id: item.SNO,
      image: processImagePath(item.ImagePath),
      title: item.ITEMNAME || "Jewelry Item",
      price: `₹${parseFloat(item.GrandTotal || "0").toFixed(2)}`,
      discount: `₹${parseFloat(item.GrandTotal || "0").toFixed(2)}`,
      offer: item.GSTPer || "3% GST",
    }));

  } catch {
    return [];
  }
};