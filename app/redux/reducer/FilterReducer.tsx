import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Enhanced interfaces for better type safety
export interface PriceRange {
  min: number;
  max: number;
}

export interface SortOptions {
  field: 'price' | 'name' | 'date' | 'popularity' | 'rating';
  order: 'asc' | 'desc';
}

export interface FilterState {
  // Basic filters
  brand: string;
  category: string;
  colorAccent: string;
  gender: string;
  materialFinish: string;
  occasion: string;
  sizeName: string;
  itemName: string;
  subItemName: string;
  
  // Enhanced price filtering
  priceRange: PriceRange;
  
  // Search functionality
  searchQuery: string;
  searchHistory: string[];
  
  // Advanced filters
  stoneType: string;
  purity: string;
  collectionType: string;
  
  // Product features
  bestDesign: boolean | null;
  newArrival: boolean | null;
  featuredProducts: boolean | null;
  
  // Weight range
  weightRange: {
    min: number;
    max: number;
  };
  
  // Sorting
  sortBy: SortOptions;
  
  // UI state
  appliedFilters: string[];
  totalFiltersCount: number;
  isFilterPanelOpen: boolean;
  
  // Filter presets
  savedFilters: Array<{
    id: string;
    name: string;
    filters: Partial<FilterState>;
    timestamp: number;
  }>;
  
  // Recent searches and suggestions
  recentSearches: string[];
  searchSuggestions: string[];
  
  // Quick filters
  quickFilters: {
    underBudget: number | null;
    trending: boolean;
    discounted: boolean;
    inStock: boolean;
  };
}

// Default values with better organization
const defaultPriceRange: PriceRange = {
  min: 0,
  max: 10000000000,
};

const defaultWeightRange = {
  min: 0,
  max: 1000,
};

const defaultSortBy: SortOptions = {
  field: 'popularity',
  order: 'desc',
};

const initialState: FilterState = {
  // Basic filters
  brand: '',
  category: '',
  colorAccent: '',
  gender: '',
  materialFinish: '',
  occasion: '',
  sizeName: '',
  itemName: '',
  subItemName: '',
  
  // Enhanced price filtering
  priceRange: defaultPriceRange,
  
  // Search functionality
  searchQuery: '',
  searchHistory: [],
  
  // Advanced filters
  stoneType: '',
  purity: '',
  collectionType: '',
  
  // Product features
  bestDesign: null,
  newArrival: null,
  featuredProducts: null,
  
  // Weight range
  weightRange: defaultWeightRange,
  
  // Sorting
  sortBy: defaultSortBy,
  
  // UI state
  appliedFilters: [],
  totalFiltersCount: 0,
  isFilterPanelOpen: false,
  
  // Filter presets
  savedFilters: [],
  
  // Recent searches
  recentSearches: [],
  searchSuggestions: [],
  
  // Quick filters
  quickFilters: {
    underBudget: null,
    trending: false,
    discounted: false,
    inStock: true,
  },
};

// Helper function to count active filters
const countActiveFilters = (state: FilterState): number => {
  let count = 0;
  
  // Basic string filters
  const stringFilters = [
    'brand', 'category', 'colorAccent', 'gender', 'materialFinish', 
    'occasion', 'sizeName', 'itemName', 'subItemName', 'searchQuery',
    'stoneType', 'purity', 'collectionType'
  ] as const;
  
  stringFilters.forEach(filter => {
    if (state[filter] && state[filter].trim() !== '') count++;
  });
  
  // Price range filter
  if (state.priceRange.min > 0 || state.priceRange.max < defaultPriceRange.max) count++;
  
  // Weight range filter
  if (state.weightRange.min > 0 || state.weightRange.max < defaultWeightRange.max) count++;
  
  // Boolean filters
  if (state.bestDesign !== null) count++;
  if (state.newArrival !== null) count++;
  if (state.featuredProducts !== null) count++;
  
  // Quick filters
  if (state.quickFilters.underBudget !== null) count++;
  if (state.quickFilters.trending) count++;
  if (state.quickFilters.discounted) count++;
  if (!state.quickFilters.inStock) count++; // Count when not in stock (non-default)
  
  // Sort filter (count if not default)
  if (state.sortBy.field !== defaultSortBy.field || state.sortBy.order !== defaultSortBy.order) count++;
  
  return count;
};

// Helper function to generate applied filters list
const generateAppliedFilters = (state: FilterState): string[] => {
  const filters: string[] = [];
  
  if (state.brand) filters.push(`Brand: ${state.brand}`);
  if (state.category) filters.push(`Category: ${state.category}`);
  if (state.colorAccent) filters.push(`Color: ${state.colorAccent}`);
  if (state.gender) filters.push(`Gender: ${state.gender}`);
  if (state.materialFinish) filters.push(`Material: ${state.materialFinish}`);
  if (state.occasion) filters.push(`Occasion: ${state.occasion}`);
  if (state.sizeName) filters.push(`Size: ${state.sizeName}`);
  if (state.stoneType) filters.push(`Stone: ${state.stoneType}`);
  if (state.purity) filters.push(`Purity: ${state.purity}%`);
  if (state.collectionType) filters.push(`Collection: ${state.collectionType}`);
  if (state.searchQuery) filters.push(`Search: "${state.searchQuery}"`);
  
  // Price range
  if (state.priceRange.min > 0 || state.priceRange.max < defaultPriceRange.max) {
    filters.push(`Price: ₹${state.priceRange.min} - ₹${state.priceRange.max}`);
  }
  
  // Weight range
  if (state.weightRange.min > 0 || state.weightRange.max < defaultWeightRange.max) {
    filters.push(`Weight: ${state.weightRange.min}g - ${state.weightRange.max}g`);
  }
  
  // Boolean filters
  if (state.bestDesign === true) filters.push('Best Design');
  if (state.newArrival === true) filters.push('New Arrival');
  if (state.featuredProducts === true) filters.push('Featured');
  
  // Quick filters
  if (state.quickFilters.underBudget) filters.push(`Under ₹${state.quickFilters.underBudget}`);
  if (state.quickFilters.trending) filters.push('Trending');
  if (state.quickFilters.discounted) filters.push('Discounted');
  if (!state.quickFilters.inStock) filters.push('Include Out of Stock');
  
  // Sort
  if (state.sortBy.field !== defaultSortBy.field || state.sortBy.order !== defaultSortBy.order) {
    const sortLabel = state.sortBy.field.charAt(0).toUpperCase() + state.sortBy.field.slice(1);
    filters.push(`Sort: ${sortLabel} ${state.sortBy.order === 'asc' ? '↑' : '↓'}`);
  }
  
  return filters;
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    // Enhanced filter setting with better type safety
    setFilters: (state, action: PayloadAction<Partial<FilterState>>) => {
      const newState = { ...state, ...action.payload };
      newState.totalFiltersCount = countActiveFilters(newState);
      newState.appliedFilters = generateAppliedFilters(newState);
      return newState;
    },

    // Set individual filter values
    setBrand: (state, action: PayloadAction<string>) => {
      state.brand = action.payload;
      state.totalFiltersCount = countActiveFilters(state);
      state.appliedFilters = generateAppliedFilters(state);
    },

    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
      state.totalFiltersCount = countActiveFilters(state);
      state.appliedFilters = generateAppliedFilters(state);
    },

    setColorAccent: (state, action: PayloadAction<string>) => {
      state.colorAccent = action.payload;
      state.totalFiltersCount = countActiveFilters(state);
      state.appliedFilters = generateAppliedFilters(state);
    },

    setGender: (state, action: PayloadAction<string>) => {
      state.gender = action.payload;
      state.totalFiltersCount = countActiveFilters(state);
      state.appliedFilters = generateAppliedFilters(state);
    },

    setPriceRange: (state, action: PayloadAction<PriceRange>) => {
      state.priceRange = action.payload;
      state.totalFiltersCount = countActiveFilters(state);
      state.appliedFilters = generateAppliedFilters(state);
    },

    setWeightRange: (state, action: PayloadAction<{ min: number; max: number }>) => {
      state.weightRange = action.payload;
      state.totalFiltersCount = countActiveFilters(state);
      state.appliedFilters = generateAppliedFilters(state);
    },

    setSortBy: (state, action: PayloadAction<SortOptions>) => {
      state.sortBy = action.payload;
      state.totalFiltersCount = countActiveFilters(state);
      state.appliedFilters = generateAppliedFilters(state);
    },

    // Search functionality
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.totalFiltersCount = countActiveFilters(state);
      state.appliedFilters = generateAppliedFilters(state);
      
      // Add to search history if it's a meaningful search
      if (action.payload.trim() && action.payload.length > 2) {
        const trimmedQuery = action.payload.trim();
        
        // Remove if already exists and add to front
        state.searchHistory = [
          trimmedQuery,
          ...state.searchHistory.filter(item => item !== trimmedQuery)
        ].slice(0, 10); // Keep only last 10 searches
      }
    },

    // Advanced search operations
    addToSearchHistory: (state, action: PayloadAction<string>) => {
      const query = action.payload.trim();
      if (query && !state.searchHistory.includes(query)) {
        state.searchHistory = [query, ...state.searchHistory].slice(0, 10);
      }
    },

    removeFromSearchHistory: (state, action: PayloadAction<string>) => {
      state.searchHistory = state.searchHistory.filter(item => item !== action.payload);
    },

    clearSearchHistory: (state) => {
      state.searchHistory = [];
    },

    setSearchSuggestions: (state, action: PayloadAction<string[]>) => {
      state.searchSuggestions = action.payload;
    },

    // Quick filters
    setQuickFilters: (state, action: PayloadAction<Partial<FilterState['quickFilters']>>) => {
      state.quickFilters = { ...state.quickFilters, ...action.payload };
      state.totalFiltersCount = countActiveFilters(state);
      state.appliedFilters = generateAppliedFilters(state);
    },

    // Feature filters
    setBestDesign: (state, action: PayloadAction<boolean | null>) => {
      state.bestDesign = action.payload;
      state.totalFiltersCount = countActiveFilters(state);
      state.appliedFilters = generateAppliedFilters(state);
    },

    setNewArrival: (state, action: PayloadAction<boolean | null>) => {
      state.newArrival = action.payload;
      state.totalFiltersCount = countActiveFilters(state);
      state.appliedFilters = generateAppliedFilters(state);
    },

    setFeaturedProducts: (state, action: PayloadAction<boolean | null>) => {
      state.featuredProducts = action.payload;
      state.totalFiltersCount = countActiveFilters(state);
      state.appliedFilters = generateAppliedFilters(state);
    },

    // Remove individual filters
    removeFilter: (state, action: PayloadAction<string>) => {
      const filterToRemove = action.payload.toLowerCase();
      
      // Reset the specific filter based on the key
      if (filterToRemove.includes('brand')) state.brand = '';
      else if (filterToRemove.includes('category')) state.category = '';
      else if (filterToRemove.includes('color')) state.colorAccent = '';
      else if (filterToRemove.includes('gender')) state.gender = '';
      else if (filterToRemove.includes('material')) state.materialFinish = '';
      else if (filterToRemove.includes('occasion')) state.occasion = '';
      else if (filterToRemove.includes('size')) state.sizeName = '';
      else if (filterToRemove.includes('stone')) state.stoneType = '';
      else if (filterToRemove.includes('purity')) state.purity = '';
      else if (filterToRemove.includes('collection')) state.collectionType = '';
      else if (filterToRemove.includes('search')) state.searchQuery = '';
      else if (filterToRemove.includes('price')) state.priceRange = defaultPriceRange;
      else if (filterToRemove.includes('weight')) state.weightRange = defaultWeightRange;
      else if (filterToRemove.includes('best design')) state.bestDesign = null;
      else if (filterToRemove.includes('new arrival')) state.newArrival = null;
      else if (filterToRemove.includes('featured')) state.featuredProducts = null;
      else if (filterToRemove.includes('under')) state.quickFilters.underBudget = null;
      else if (filterToRemove.includes('trending')) state.quickFilters.trending = false;
      else if (filterToRemove.includes('discounted')) state.quickFilters.discounted = false;
      else if (filterToRemove.includes('stock')) state.quickFilters.inStock = true;
      else if (filterToRemove.includes('sort')) state.sortBy = defaultSortBy;
      
      state.totalFiltersCount = countActiveFilters(state);
      state.appliedFilters = generateAppliedFilters(state);
    },

    // UI state management
    toggleFilterPanel: (state) => {
      state.isFilterPanelOpen = !state.isFilterPanelOpen;
    },

    setFilterPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.isFilterPanelOpen = action.payload;
    },

    // Filter presets management
    saveFilterPreset: (state, action: PayloadAction<{ name: string }>) => {
      const preset = {
        id: Date.now().toString(),
        name: action.payload.name,
        filters: {
          brand: state.brand,
          category: state.category,
          colorAccent: state.colorAccent,
          gender: state.gender,
          materialFinish: state.materialFinish,
          occasion: state.occasion,
          sizeName: state.sizeName,
          priceRange: state.priceRange,
          weightRange: state.weightRange,
          bestDesign: state.bestDesign,
          newArrival: state.newArrival,
          featuredProducts: state.featuredProducts,
          quickFilters: state.quickFilters,
          sortBy: state.sortBy,
        },
        timestamp: Date.now(),
      };
      
      state.savedFilters = [preset, ...state.savedFilters].slice(0, 5); // Keep only 5 presets
    },

    loadFilterPreset: (state, action: PayloadAction<string>) => {
      const preset = state.savedFilters.find(p => p.id === action.payload);
      if (preset) {
        Object.assign(state, preset.filters);
        state.totalFiltersCount = countActiveFilters(state);
        state.appliedFilters = generateAppliedFilters(state);
      }
    },

    removeFilterPreset: (state, action: PayloadAction<string>) => {
      state.savedFilters = state.savedFilters.filter(p => p.id !== action.payload);
    },

    // Bulk operations
    applyMultipleFilters: (state, action: PayloadAction<{
      filters: Partial<FilterState>;
      addToHistory?: boolean;
    }>) => {
      const { filters, addToHistory = false } = action.payload;
      
      Object.assign(state, filters);
      
      state.totalFiltersCount = countActiveFilters(state);
      state.appliedFilters = generateAppliedFilters(state);
      
      // Optionally add search query to history
      if (addToHistory && filters.searchQuery) {
        const query = filters.searchQuery.trim();
        if (query && !state.searchHistory.includes(query)) {
          state.searchHistory = [query, ...state.searchHistory].slice(0, 10);
        }
      }
    },

    // Reset with options
    resetFilters: (state, action: PayloadAction<{ keepSearch?: boolean; keepSort?: boolean }> = {}) => {
      const { keepSearch = false, keepSort = false } = action.payload || {};
      
      const searchQuery = keepSearch ? state.searchQuery : '';
      const sortBy = keepSort ? state.sortBy : defaultSortBy;
      const searchHistory = state.searchHistory;
      const savedFilters = state.savedFilters;
      
      Object.assign(state, initialState);
      
      // Restore preserved values
      state.searchQuery = searchQuery;
      state.sortBy = sortBy;
      state.searchHistory = searchHistory;
      state.savedFilters = savedFilters;
      
      state.totalFiltersCount = countActiveFilters(state);
      state.appliedFilters = generateAppliedFilters(state);
    },

    // Complete reset (including history)
    clearFilters: (state) => {
      Object.assign(state, initialState);
    },

    // Recent searches management
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const search = action.payload.trim();
      if (search) {
        state.recentSearches = [
          search,
          ...state.recentSearches.filter(item => item !== search)
        ].slice(0, 5); // Keep only last 5
      }
    },

    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
  },
});

// Export actions with better organization
export const {
  // Core filter actions
  setFilters,
  setBrand,
  setCategory,
  setColorAccent,
  setGender,
  setPriceRange,
  setWeightRange,
  setSortBy,
  
  // Search actions
  setSearchQuery,
  addToSearchHistory,
  removeFromSearchHistory,
  clearSearchHistory,
  setSearchSuggestions,
  
  // Quick filter actions
  setQuickFilters,
  setBestDesign,
  setNewArrival,
  setFeaturedProducts,
  
  // Filter management
  removeFilter,
  applyMultipleFilters,
  resetFilters,
  clearFilters,
  
  // UI actions
  toggleFilterPanel,
  setFilterPanelOpen,
  
  // Preset actions
  saveFilterPreset,
  loadFilterPreset,
  removeFilterPreset,
  
  // Recent searches
  addRecentSearch,
  clearRecentSearches,
} = filterSlice.actions;

// Selectors for better performance
export const selectActiveFiltersCount = (state: { filters: FilterState }) => 
  state.filters.totalFiltersCount;

export const selectAppliedFilters = (state: { filters: FilterState }) => 
  state.filters.appliedFilters;

export const selectHasActiveFilters = (state: { filters: FilterState }) => 
  state.filters.totalFiltersCount > 0;

export const selectSearchState = (state: { filters: FilterState }) => ({
  query: state.filters.searchQuery,
  history: state.filters.searchHistory,
  suggestions: state.filters.searchSuggestions,
  recent: state.filters.recentSearches,
});

export const selectFilterPresets = (state: { filters: FilterState }) => 
  state.filters.savedFilters;

export const selectQuickFilters = (state: { filters: FilterState }) => 
  state.filters.quickFilters;

export const selectSortOptions = (state: { filters: FilterState }) => 
  state.filters.sortBy;

export const selectPriceRange = (state: { filters: FilterState }) => 
  state.filters.priceRange;

export default filterSlice.reducer;