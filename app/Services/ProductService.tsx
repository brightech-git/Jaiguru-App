import { API_BASE_URL } from '../Config/baseUrl';

export interface ProductItem {
  MaterialFinish: string;
  Description: string;
  TAGNO: string;
  Occasion: string;
  RATE: string;
  GSTAmount: string;
  TAGKEY: string;
  Gender: string;
  SIZEID: number;
  Best_Design: boolean;
  SNO: string;
  CollectionType: string;
  ImagePaths: string[];
  NewArrival: boolean;
  GrossAmount: string;
  Featured_Products: boolean;
  SIZENAME: string | null;
  Rate: string;
  StoneType: string | null;
  SUBITEMNAME: string;
  CATNAME: string;
  NETWT: string;
  GSTPer: string;
  Top_Trending: boolean;
  GrandTotal: string;
  ColorAccents: string;
  ITEMID: string;
  ITEMNAME: string;
}

export interface ProductFilters {
  itemName?: string;
  subItemName?: string;
  gender?: string;
  occasion?: string;
  colorAccent?: string;
  materialFinish?: string;
  sizeName?: string;
  category?: string;
  brand?: string;
  minGrandTotal?: number;
  maxGrandTotal?: number;
  searchQuery?: string;
}

class ProductService {
  private currentPage: number = 0;
  private pageSize: number = 20;
  private _hasMoreData: boolean = true;
  private readonly BASE_IMAGE_URL = 'https://app.bmgjewellers.com';

  public resetPagination(): void {
    this.currentPage = 0;
    this._hasMoreData = true;
  }

  public hasMoreData(): boolean {
    return this._hasMoreData;
  }

  private processImagePaths(imagePath: string | string[]): string[] {
    try {
      let parsedImages: string[] = [];
      
      if (Array.isArray(imagePath)) {
        parsedImages = imagePath.filter(img => img && typeof img === 'string');
      } else if (typeof imagePath === 'string') {
        const trimmedPath = imagePath.trim();
        
        if (!trimmedPath) {
          return [];
        }
        
        if (trimmedPath.startsWith('[') && trimmedPath.endsWith(']')) {
          try {
            const parsed = JSON.parse(trimmedPath);
            if (Array.isArray(parsed)) {
              parsedImages = parsed.filter(img => img && typeof img === 'string');
            }
          } catch (jsonError) {
            parsedImages = [trimmedPath];
          }
        } else {
          parsedImages = trimmedPath.includes(',') 
            ? trimmedPath.split(',').map(img => img.trim()).filter(Boolean)
            : [trimmedPath];
        }
      }

      const validImages = parsedImages
        .map(img => {
          const cleanImg = img.trim();
          
          if (!cleanImg) {
            return null;
          }

          if (cleanImg.startsWith('http://') || cleanImg.startsWith('https://')) {
            return cleanImg;
          }
          
          return `${this.BASE_IMAGE_URL}${cleanImg.startsWith('/') ? cleanImg : `/${cleanImg}`}`;
        })
        .filter(Boolean) as string[];

      return validImages.length > 0 ? validImages : [];
      
    } catch (error) {
      return [];
    }
  }

  private buildQueryParams(filters: ProductFilters, page: number): URLSearchParams {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: this.pageSize.toString(),
    });

    const filterMapping = {
      itemName: filters.itemName,
      subItemName: filters.subItemName,
      gender: filters.gender,
      occasion: filters.occasion,
      colorAccent: filters.colorAccent,
      materialFinish: filters.materialFinish,
      sizeName: filters.sizeName,
      category: filters.category,
      brand: filters.brand,
      searchQuery: filters.searchQuery,
    };

    Object.entries(filterMapping).forEach(([key, value]) => {
      if (value && value.toString().trim() !== '') {
        queryParams.append(key, value.toString().trim());
      }
    });

    if (filters.minGrandTotal !== undefined && !isNaN(filters.minGrandTotal) && filters.minGrandTotal > 0) {
      queryParams.append('minGrandTotal', filters.minGrandTotal.toString());
    }
    
    if (filters.maxGrandTotal !== undefined && !isNaN(filters.maxGrandTotal) && filters.maxGrandTotal < 10000000000) {
      queryParams.append('maxGrandTotal', filters.maxGrandTotal.toString());
    }

    return queryParams;
  }

  public async getFilteredProducts(filters: ProductFilters = {}): Promise<ProductItem[]> {
    try {
      // Check if we have more data to fetch
      if (!this._hasMoreData && this.currentPage > 0) {
        return [];
      }

      // Build API URL
      const queryParams = this.buildQueryParams(filters, this.currentPage);
      const apiUrl = `${API_BASE_URL}/product/items/filter?${queryParams.toString()}`;

      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      let parsed: any;

      try {
        parsed = JSON.parse(text);
      } catch (err) {
        throw new Error('Invalid JSON response from server');
      }

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid response format from server');
      }

      const items = parsed.data || parsed.items || parsed;
      
      if (!Array.isArray(items)) {
        this._hasMoreData = false;
        return [];
      }

      const itemsCount = items.length;
      
      // Check if we've reached the end
      if (itemsCount < this.pageSize) {
        this._hasMoreData = false;
      }

      // Process products
      const products: ProductItem[] = items.map((item: any, index: number) => {
        try {
          const processedImages = this.processImagePaths(item.ImagePath || item.imagePath || item.images || '');
          
          return {
            ...item,
            ImagePaths: processedImages,
            SUBITEMNAME: item.SUBITEMNAME || item.ItemName || `Unknown Product ${index + 1}`,
            RATE: item.RATE || item.Rate || '0',
            GrandTotal: item.GrandTotal || item.RATE || item.Rate || '0',
            ITEMID: item.ITEMID || item.ItemId || `item_${Date.now()}_${Math.random()}`,
            SNO: item.SNO || item.Id || `sno_${Date.now()}_${Math.random()}`,
            Gender: item.Gender || '',
            Occasion: item.Occasion || '',
            MaterialFinish: item.MaterialFinish || '',
            ColorAccents: item.ColorAccents || item.ColorAccent || '',
            SIZENAME: item.SIZENAME || item.SizeName || null,
            Description: item.Description || '',
            CATNAME: item.CATNAME || item.CategoryName || '',
            ITEMNAME: item.ITEMNAME || item.ItemName || '',
            Best_Design: Boolean(item.Best_Design),
            NewArrival: Boolean(item.NewArrival),
            Featured_Products: Boolean(item.Featured_Products),
            Top_Trending: Boolean(item.Top_Trending),
            TAGNO: item.TAGNO || '',
            GSTAmount: item.GSTAmount || '0',
            TAGKEY: item.TAGKEY || '',
            SIZEID: item.SIZEID || 0,
            CollectionType: item.CollectionType || '',
            GrossAmount: item.GrossAmount || '0',
            Rate: item.Rate || item.RATE || '0',
            StoneType: item.StoneType || null,
            NETWT: item.NETWT || '0',
            GSTPer: item.GSTPer || '0',
          };
        } catch (itemError) {
          return null;
        }
      }).filter(Boolean) as ProductItem[];

      // Increment page for next fetch
      this.currentPage++;

      return products;

    } catch (error) {
      console.error('ProductService.getFilteredProducts error:', error);
      
      if (this.currentPage === 0) {
        this._hasMoreData = false;
      }
      
      throw error;
    }
  }
}

export const productService = new ProductService();