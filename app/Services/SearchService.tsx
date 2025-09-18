
import { API_BASE_URL } from "../Config/baseUrl";

interface SearchParams {
  itemName: string;
  page?: number;
  pageSize?: number;
  gender?: string;
  // Add other possible filter parameters as needed
}

interface ProductItem {
  MaterialFinish: string;
  Description: string;
  TAGNO: string;
  Occasion: string;
  RATE: string;
  GSTAmount: string;
  TAGKEY: string;
  Gender: string;
  SIZEID: number;
  // Add other fields from your API response
}

interface SearchResponse {
  data: ProductItem[];
  // Add pagination fields if available in response
  total?: number;
  page?: number;
  pageSize?: number;
}

const SearchService = {
  async searchProducts(params: SearchParams): Promise<SearchResponse> {
    try {
      // Construct query string
      const queryParams = new URLSearchParams();
      queryParams.append('subItemName', params.subItemName);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      
      const url = `${API_BASE_URL}/product/items/filter?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('SearchService error:', error);
      throw error;
    }
  },


};

export default SearchService;