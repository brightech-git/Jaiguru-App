// services/productService.js
import { API_BASE_URL } from "../Config/baseUrl";
import { IMAGES } from "../constants/Images";

const IMAGE_BASE_URL = "https://app.bmgjewellers.com";

// Helper function to process image paths
const processImagePath = (imagePath: any): string => {
  if (!imagePath) return IMAGES.item14;

  try {
    let images: string[] = [];

    // Handle different image path formats
    if (typeof imagePath === 'string') {
      if (imagePath.startsWith('[') && imagePath.endsWith(']')) {
        try {
          // Parse JSON array string
          images = JSON.parse(imagePath);
        } catch {
          // If JSON parsing fails, try to extract paths manually
          const pathMatch = imagePath.match(/"([^"]+)"/g);
          images = pathMatch ? pathMatch.map((path: string) => path.replace(/"/g, '')) : [imagePath];
        }
      } else {
        images = [imagePath];
      }
    } else if (Array.isArray(imagePath)) {
      images = imagePath;
    } else {
      return IMAGES.item14;
    }

    // Get the first valid image
    const firstImage = images[0]?.trim();
    if (!firstImage) return IMAGES.item14;

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
    return IMAGES.item14;
  }
};

export const fetchFeaturedProducts = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/product/items/filter?featured_products=true`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const json = await response.json();

    const products = (json.data || []).map((product) => {
      // Process the image path to get a proper URL
      const imageUrl = processImagePath(product.ImagePath);

      return {
        ...product,
        SNO: product.SNO || product.id || `product-${Math.random()}`,
        mainImage: { uri: imageUrl },
        images: [{ uri: imageUrl }], // Single image for now
      };
    });

    console.log(`✨ Featured Products Count: ${products.length}`);
    return products;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};