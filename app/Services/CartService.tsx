import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../Config/baseUrl';

export interface CartItem {
  sno: number;
  itemTagSno: string;
  quantity: number;
  userId: number;
  [key: string]: any;
}

export interface Product {
  SNO: string;
  ImagePath?: string;
  GrandTotal?: string;
  quantity?: number;
  cartSno?: number;
  itemTagSno?: string;
  [key: string]: any;
}

const getAuthData = async (): Promise<{ token: string; phone: string }> => {
  const token = await AsyncStorage.getItem('user_token');
  const phone = await AsyncStorage.getItem('user_contact');

  if (!token) throw new Error('User token not found');
  if (!phone) throw new Error('User contact number not found');

  return { token, phone };
};

export const cartService = {
  getItemsByPhone: async (): Promise<CartItem[]> => {
    try {
      const { token, phone } = await getAuthData();

      const res = await fetch(`${API_BASE_URL}/cart/by-phone?phone=${phone}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 204) return [];

      const text = await res.text();

      if (!res.ok) throw new Error(text || 'Failed to fetch cart items');

      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch {
        if (text.includes('Your cart is empty')) {
          return [];
        }
        throw new Error('Unexpected response format from cart API');
      }

      const items =
        Array.isArray(parsed) ? parsed :
        Array.isArray(parsed?.data) ? parsed.data :
        [];

      // ✅ Show only cart length
      console.log(`🛒 Cart Items Count: ${items.length}`);

      return items;
    } catch {
      return [];
    }
  },

  getDetailedCartProducts: async (): Promise<Product[]> => {
    try {
      const { token } = await getAuthData();
      const cartItems = await cartService.getItemsByPhone();

      const products = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const url = `${API_BASE_URL}/product/getSnofilter?sno=${encodeURIComponent(item.itemTagSno)}`;
            const res = await fetch(url, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            const text = await res.text();
            if (res.status === 204 || !text.trim()) {
              return null;
            }

            let parsed: any;
            try {
              parsed = JSON.parse(text);
            } catch {
              return null;
            }

            const product =
              Array.isArray(parsed?.result) ? parsed.result[0]
              : Array.isArray(parsed) ? parsed[0]
              : parsed?.result ?? parsed;

            if (!product || !product.SNO) return null;

            return {
              ...product,
              quantity: item.quantity,
              cartSno: item.sno,
              itemTagSno: item.itemTagSno,
              ImagePath: product.ImagePath || 'https://via.placeholder.com/150',
            };
          } catch {
            return null;
          }
        })
      );

      return products.filter((p): p is Product => p !== null);
    } catch {
      return [];
    }
  },

  addItem: async (payload: Omit<CartItem, 'sno'>): Promise<void> => {
    const { token } = await getAuthData();

    const res = await fetch(`${API_BASE_URL}/cart/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorRes = await res.json().catch(() => ({}));
      throw new Error(errorRes.message || 'Failed to add item to cart');
    }
  },

  removeItem: async (sno: number): Promise<void> => {
    const { token } = await getAuthData();

    const res = await fetch(`${API_BASE_URL}/cart/delete/${sno}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const errorRes = await res.json().catch(() => ({}));
      throw new Error(errorRes.message || 'Failed to remove item from cart');
    }
  },

  updateItemQuantity: async (sno: number, quantity: number): Promise<void> => {
    const { token } = await getAuthData();

    const res = await fetch(`${API_BASE_URL}/cart/update-quantity`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sno, quantity }),
    });

    if (!res.ok) {
      const errorRes = await res.json().catch(() => ({}));
      throw new Error(errorRes.message || 'Failed to update item quantity');
    }
  },

  isItemInCart: async (itemTagSno: string): Promise<boolean> => {
    const items = await cartService.getItemsByPhone();
    return items.some((item) => item.itemTagSno === itemTagSno);
  },
};
