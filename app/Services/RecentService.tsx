import { API_BASE_URL } from '../Config/baseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IMAGES } from '../constants/Images';

const API_IMAGE_URL = 'https://app.bmgjewellers.com';

// Enhanced image processing function for JSON string arrays
export const processImageUrl = (imagePath: any): string => {
  if (!imagePath) return IMAGES.item11;

  try {
    let images: string[] = [];

    if (typeof imagePath === 'string') {
      // Handle JSON string arrays
      if (imagePath.startsWith('[') && imagePath.endsWith(']')) {
        try {
          images = JSON.parse(imagePath);
        } catch {
          // Fallback parsing for malformed JSON
          const pathMatch = imagePath.match(/"([^"]+)"/g);
          if (pathMatch) {
            images = pathMatch.map((path: string) =>
              path.replace(/"/g, '').trim()
            );
          } else {
            images = [imagePath.replace(/["'[\]]/g, '').trim()];
          }
        }
      } else {
        // Handle simple string paths
        images = [imagePath.trim()];
      }
    } else if (Array.isArray(imagePath)) {
      // Handle already parsed arrays
      images = imagePath;
    } else {
      return IMAGES.item11;
    }

    // Get the first image
    const firstImage = images[0]?.trim();
    if (!firstImage) return IMAGES.item11;

    let cleanedPath = firstImage.replace(/["'[\]]/g, '').trim();

    // Format the URL properly
    if (cleanedPath.startsWith('http')) {
      return cleanedPath;
    } else if (cleanedPath.startsWith('/')) {
      return `${API_IMAGE_URL}${cleanedPath}`;
    } else {
      return `${API_IMAGE_URL}/${cleanedPath}`;
    }
  } catch (error) {
    console.error('Image processing error:', error);
    return IMAGES.item11;
  }
};



export const getRecentlyViewedProducts = async () => {
  try {
    const token = await AsyncStorage.getItem('user_token');
    if (!token) return [];

    // Step 1: Get recently viewed IDs
    const recentlyViewedUrl = `${API_BASE_URL}/recently-viewed/list`;
    const recentlyViewedResponse = await fetch(recentlyViewedUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!recentlyViewedResponse.ok) {
      return [];
    }

    const recentlyViewedData = await recentlyViewedResponse.json();
    if (!recentlyViewedData.data || !Array.isArray(recentlyViewedData.data)) {
      return [];
    }

    // Direct product data with ImagePath (if API returns full product data)
    if (
      recentlyViewedData.data.length > 0 &&
      typeof recentlyViewedData.data[0] === 'object' &&
      recentlyViewedData.data[0].ImagePath
    ) {
      return recentlyViewedData.data.map((item: any) => ({
        SNO: item.SNO || item.id || `product-${Math.random()}`,
        SUBITEMNAME:
          item.SUBITEMNAME || item.ITEMNAME || item.title || 'Unknown Product',
        GrandTotal: item.GrandTotal || item.price || '0.00',
        RATE: item.RATE || item.price || '0.00',
        ImagePath: item.ImagePath, // Keep raw ImagePath for processing in component
        TAGKEY: item.TAGKEY,
        ITEMNAME: item.ITEMNAME,
        discount: item.discount || 0,
      }));
    }

    // Step 2: Fetch product details by IDs
    const productDetailsPromises = recentlyViewedData.data.map(
      async (sno: string) => {
        try {
          const productDetailsUrl = `${API_BASE_URL}/product/getSnofilter?sno=${sno}`;
          const productDetailsResponse = await fetch(productDetailsUrl);

          if (!productDetailsResponse.ok) {
            return null;
          }

          const productData = await productDetailsResponse.json();
          return productData;
        } catch (error) {
          console.error(`Product ${sno} fetch error:`, error);
          return null;
        }
      }
    );

    const productDetailsResults = await Promise.all(productDetailsPromises);

    const productDetailsData = productDetailsResults
      .filter(Boolean)
      .flatMap((result) => {
        if (Array.isArray(result)) return result;
        if (result.data && Array.isArray(result.data)) return result.data;
        return [result];
      })
      .filter((item) => item !== null && item !== undefined);

    // Step 3: Map final products
    return productDetailsData.map((item: any) => ({
      SNO: item.SNO || item.id || `product-${Math.random()}`,
      SUBITEMNAME:
        item.SUBITEMNAME || item.ITEMNAME || item.title || 'Unknown Product',
      GrandTotal: item.GrandTotal || item.price || '0.00',
      RATE: item.RATE || item.price || '0.00',
      ImagePath: item.ImagePath, // Keep raw ImagePath for processing in component
      TAGKEY: item.TAGKEY,
      ITEMNAME: item.ITEMNAME,
      discount: item.discount || 0,
    }));
  } catch (error) {
    console.error('Error in getRecentlyViewedProducts:', error);
    return [];
  }
};