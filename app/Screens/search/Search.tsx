import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, SafeAreaView, Image, TouchableOpacity, TextInput, Platform, FlatList, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { FONTS, COLORS as colors } from '../../constants/theme';
import { ScrollView } from 'react-native-gesture-handler';
import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import SearchService from '../../Services/SearchService';

const IMAGE_BASE_URL = "https://app.bmgjewellers.com";
const FALLBACK_IMAGE = IMAGES.item11;

const SearchHistoryData = [
    { title: "Rings" },
    { title: "Bracelet" },
    { title: "Pendant" },
    { title: "Earrings" },
    { title: "Chains" },
];

type ProductItem = {
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
    ImagePath: string;
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
    GrandTotal: string;
    ColorAccents: string;
    ITEMID: string;
    ITEMNAME: string;
};

type SearchScreenProps = StackScreenProps<RootStackParamList, 'Search'>;

const Search = ({ navigation }: SearchScreenProps) => {
    const theme = useTheme();
    const { colors }: { colors: any } = theme;

    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState<ProductItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMorePages, setHasMorePages] = useState(true);
    const [totalResults, setTotalResults] = useState(0);
    const [items, setItems] = useState(SearchHistoryData);
    const [show, setShow] = useState(SearchHistoryData);
    const [selectedCategory, setSelectedCategory] = useState('All');
    
    // Track current image index for each product and failed images
    const [currentImageIndexes, setCurrentImageIndexes] = useState<Map<string, number>>(new Map());
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
    const [productImageArrays, setProductImageArrays] = useState<Map<string, string[]>>(new Map());

    const searchTimeoutRef = useRef<NodeJS.Timeout>();
    const pageSize = 20;

    // Enhanced image processing function that returns all images
    const processAllImagesFromPath = useCallback((imagePath: string | null | undefined): string[] => {
        if (!imagePath || imagePath.trim() === '') {
            return [];
        }

        try {
            let imageUrls: string[] = [];
            
            // Try to parse as JSON array first
            if (imagePath.startsWith('[') && imagePath.endsWith(']')) {
                const parsedImages = JSON.parse(imagePath);
                if (Array.isArray(parsedImages)) {
                    imageUrls = parsedImages
                        .filter(img => img && typeof img === 'string' && img.trim() !== '')
                        .map(img => {
                            const cleanImg = img.trim();
                            if (cleanImg.startsWith('http')) {
                                return cleanImg;
                            } else if (cleanImg.startsWith('/uploads')) {
                                return `${IMAGE_BASE_URL}${cleanImg}`;
                            } else {
                                return `${IMAGE_BASE_URL}/uploads/${cleanImg}`;
                            }
                        });
                }
            } else {
                // Handle single image path
                const cleanPath = imagePath.trim();
                if (cleanPath !== '') {
                    let fullUrl = '';
                    if (cleanPath.startsWith('http')) {
                        fullUrl = cleanPath;
                    } else if (cleanPath.startsWith('/uploads')) {
                        fullUrl = `${IMAGE_BASE_URL}${cleanPath}`;
                    } else {
                        fullUrl = `${IMAGE_BASE_URL}/uploads/${cleanPath}`;
                    }
                    imageUrls = [fullUrl];
                }
            }

            return imageUrls;
        } catch (error) {
            console.warn('⚠️ Image path processing failed:', imagePath, error);
            return [];
        }
    }, []);

    // Get current image source for a product
    const getCurrentImageSource = useCallback((item: ProductItem) => {
        const productKey = item.TAGKEY || item.SNO;
        const imageArray = productImageArrays.get(productKey) || [];
        const currentIndex = currentImageIndexes.get(productKey) || 0;

        if (imageArray.length === 0 || currentIndex >= imageArray.length) {
            return null;
        }

        const currentImageUrl = imageArray[currentIndex];
        
        // If this specific image has failed, return null
        if (failedImages.has(currentImageUrl)) {
            return null;
        }

        return { uri: currentImageUrl };
    }, [currentImageIndexes, failedImages, productImageArrays]);

    // Handle individual image errors and try next image
    const handleImageError = useCallback((item: ProductItem, failedImageUrl: string) => {
        const productKey = item.TAGKEY || item.SNO;
        const imageArray = productImageArrays.get(productKey) || [];
        const currentIndex = currentImageIndexes.get(productKey) || 0;

        console.warn(`⚠️ Image failed for product ${productKey}:`, failedImageUrl);
        
        // Mark this specific image as failed
        setFailedImages(prev => new Set([...prev, failedImageUrl]));

        // Try to move to next image in the array
        const nextIndex = currentIndex + 1;
        if (nextIndex < imageArray.length) {
            // Check if the next image hasn't failed yet
            const nextImageUrl = imageArray[nextIndex];
            if (!failedImages.has(nextImageUrl)) {
                setCurrentImageIndexes(prev => new Map([...prev, [productKey, nextIndex]]));
                return; // Don't update state immediately, let the component re-render with new index
            } else {
                // If next image has also failed, continue to the one after
                let workingIndex = -1;
                for (let i = nextIndex; i < imageArray.length; i++) {
                    if (!failedImages.has(imageArray[i])) {
                        workingIndex = i;
                        break;
                    }
                }
                
                if (workingIndex !== -1) {
                    setCurrentImageIndexes(prev => new Map([...prev, [productKey, workingIndex]]));
                }
                // If no working image found, the component will show "No Image Available"
            }
        }
        // If no more images to try, the component will show "No Image Available"
    }, [currentImageIndexes, failedImages, productImageArrays]);

    // Check if all images for a product have failed
    const hasAllImagesFailed = useCallback((item: ProductItem): boolean => {
        const productKey = item.TAGKEY || item.SNO;
        const imageArray = productImageArrays.get(productKey) || [];
        
        if (imageArray.length === 0) return true;
        
        return imageArray.every(imageUrl => failedImages.has(imageUrl));
    }, [failedImages, productImageArrays]);

    const debounce = (func: Function, delay: number) => {
        return (...args: any[]) => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            searchTimeoutRef.current = setTimeout(() => func(...args), delay);
        };
    };

    const searchProducts = async (text: string, page: number = 1, isNewSearch: boolean = true) => {
        if (text.trim().length === 0) {
            setSearchResults([]);
            setHasMorePages(true);
            setCurrentPage(1);
            setTotalResults(0);
            return;
        }

        if (isNewSearch) {
            setIsSearching(true);
            setCurrentPage(1);
            // Clear failed images and indexes on new search
            setFailedImages(new Set());
            setCurrentImageIndexes(new Map());
            setProductImageArrays(new Map());
        } else {
            setIsLoadingMore(true);
        }

        try {
            const searchParams = {
                subItemName: text,
                page: 0,
                pageSize: 100000,
                ...(selectedCategory !== 'All' && { category: selectedCategory })
            };

            const response = await SearchService.searchProducts(searchParams);
            const products = response.data || [];

            // Process images for all products and store them
            const newImageArrays = new Map(productImageArrays);
            const newCurrentIndexes = new Map(currentImageIndexes);

            products.forEach((product: ProductItem) => {
                const productKey = product.TAGKEY || product.SNO;
                const imageArray = processAllImagesFromPath(product.ImagePath);
                
                if (imageArray.length > 0) {
                    newImageArrays.set(productKey, imageArray);
                    // Start with index 0 for new products
                    if (!newCurrentIndexes.has(productKey)) {
                        newCurrentIndexes.set(productKey, 0);
                    }
                }
            });

            setProductImageArrays(newImageArrays);
            setCurrentImageIndexes(newCurrentIndexes);

            if (isNewSearch) {
                setSearchResults(products);
            } else {
                setSearchResults(prevResults => [...prevResults, ...products]);
            }

            // Assuming the API returns total count and current page info
            const totalCount = response.totalCount || products.length || 0;
            const hasMore = response.hasMore !== undefined ? response.hasMore :
                (products && products.length === pageSize);

            setTotalResults(totalCount);
            setHasMorePages(hasMore);
            setCurrentPage(page);

            // Add to search history if it's a new search and has results
            if (isNewSearch && products && products.length > 0) {
                addToSearchHistory(text);
            }

        } catch (error) {
            console.error('Search error:', error);
            if (isNewSearch) {
                setSearchResults([]);
            }
            setHasMorePages(false);
        } finally {
            setIsSearching(false);
            setIsLoadingMore(false);
        }
    };

    const handleSearch = useCallback(debounce(async (text: string) => {
        await searchProducts(text, 1, true);
    }, 300), [selectedCategory]);

    const loadMoreResults = async () => {
        if (!isLoadingMore && hasMorePages && searchText.trim().length > 0) {
            const nextPage = currentPage + 1;
            await searchProducts(searchText, nextPage, false);
        }
    };

    const addToSearchHistory = (searchTerm: string) => {
        const trimmedTerm = searchTerm.trim();
        if (trimmedTerm && !show.some(item => item.title.toLowerCase() === trimmedTerm.toLowerCase())) {
            const newHistoryItem = { title: trimmedTerm };
            setShow(prevShow => [newHistoryItem, ...prevShow.slice(0, 4)]); // Keep only last 5 searches
            setItems(prevItems => [newHistoryItem, ...prevItems.slice(0, 4)]);
        }
    };

    const handleSearchHistoryPress = (searchTerm: string) => {
        setSearchText(searchTerm);
    };

    useEffect(() => {
        handleSearch(searchText);
    }, [searchText, handleSearch]);

    const removeItem = () => {
        setItems([]);
        setShow([]);
    };

    const removeItem2 = (indexToRemove: number) => {
        setShow(prevItems => prevItems.filter((item, index) => index !== indexToRemove));
    };

    const renderSearchItem = ({ item, index }: { item: ProductItem; index: number }) => {
        const imageSource = getCurrentImageSource(item);
        const allImagesFailed = hasAllImagesFailed(item);
        const productKey = item.TAGKEY || item.SNO;
        const imageArray = productImageArrays.get(productKey) || [];
        const currentIndex = currentImageIndexes.get(productKey) || 0;

        return (
            <TouchableOpacity
                style={{
                    width: '48%',
                    marginBottom: 16,
                    marginHorizontal: '1%',
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    shadowColor: 'rgba(0,0,0,0.1)',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.8,
                    shadowRadius: 4,
                    elevation: 3,
                }}
                onPress={() => navigation.navigate('ProductDetails', { sno: item.SNO })}
            >
                <View style={{ padding: 12 }}>
                    {/* Image Container */}
                    <View style={{
                        width: '100%',
                        height: 160,
                        borderRadius: 8,
                        marginBottom: 8,
                        backgroundColor: colors.border,
                        overflow: 'hidden',
                        position: 'relative',
                    }}>
                        {imageSource && !allImagesFailed ? (
                            <>
                                <Image
                                    source={imageSource}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        resizeMode: 'cover',
                                    }}
                                    onError={() => {
                                        if (imageArray.length > currentIndex) {
                                            handleImageError(item, imageArray[currentIndex]);
                                        }
                                    }}
                                    defaultSource={Platform.OS === 'ios' ? FALLBACK_IMAGE : undefined}
                                />
                                
                                {/* Image Counter - Show if multiple images */}
                                {imageArray.length > 1 && (
                                    <View style={{
                                        position: 'absolute',
                                        top: 8,
                                        left: 8,
                                        backgroundColor: 'rgba(0,0,0,0.6)',
                                        paddingHorizontal: 6,
                                        paddingVertical: 2,
                                        borderRadius: 10,
                                    }}>
                                        <Text style={{
                                            ...FONTS.fontMedium,
                                            fontSize: 8,
                                            color: 'white',
                                        }}>
                                            {currentIndex + 1}/{imageArray.length}
                                        </Text>
                                    </View>
                                )}
                            </>
                        ) : (
                            <View
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: colors.border,
                                }}
                            >
                                <Image
                                    source={IMAGES.photo || FALLBACK_IMAGE}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        opacity: 0.3,
                                        tintColor: colors.text,
                                        marginBottom: 8,
                                    }}
                                />
                                <Text style={{
                                    ...FONTS.fontRegular,
                                    fontSize: 11,
                                    color: colors.text,
                                    opacity: 0.5,
                                    textAlign: 'center',
                                }}>
                                    No Image Available
                                </Text>
                                {imageArray.length > 0 && (
                                    <Text style={{
                                        ...FONTS.fontRegular,
                                        fontSize: 9,
                                        color: colors.text,
                                        opacity: 0.3,
                                        textAlign: 'center',
                                        marginTop: 2,
                                    }}>
                                        ({imageArray.length} images failed)
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>

                    <Text
                        style={{
                            ...FONTS.fontMedium,
                            fontSize: 13,
                            color: colors.title,
                            lineHeight: 16,
                            marginBottom: 4,
                        }}
                        numberOfLines={2}
                    >
                        {item.SUBITEMNAME}
                    </Text>

                    <Text
                        style={{
                            ...FONTS.fontRegular,
                            fontSize: 11,
                            color: colors.text,
                            opacity: 0.8,
                            marginBottom: 4,
                        }}
                        numberOfLines={1}
                    >
                        {item.CATNAME}
                    </Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text
                            style={{
                                ...FONTS.fontSemiBold,
                                fontSize: 14,
                                color: colors.title,
                            }}
                        >
                            ₹{item.GrandTotal}
                        </Text>
                        <Text
                            style={{
                                ...FONTS.fontRegular,
                                fontSize: 10,
                                color: colors.text,
                                opacity: 0.7,
                            }}
                            numberOfLines={1}
                        >
                            {item.MaterialFinish}
                        </Text>
                    </View>

                    {item.NewArrival && (
                        <View
                            style={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                backgroundColor: '#FF6B6B',
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 4,
                            }}
                        >
                            <Text style={{ ...FONTS.fontMedium, fontSize: 8, color: 'white' }}>NEW</Text>
                        </View>
                    )}

                    {item.Best_Design && (
                        <View
                            style={{
                                position: 'absolute',
                                top: item.NewArrival ? 28 : 8,
                                right: 8,
                                backgroundColor: '#4ECDC4',
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 4,
                            }}
                        >
                            <Text style={{ ...FONTS.fontMedium, fontSize: 8, color: 'white' }}>BEST</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderFooter = () => {
        if (!isLoadingMore) return null;
        return (
            <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.primary || '#C37B5F'} />
                <Text style={{ ...FONTS.fontRegular, fontSize: 12, color: colors.text, marginTop: 8 }}>
                    Loading more products...
                </Text>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Image
                source={IMAGES.search || { uri: 'https://via.placeholder.com/100x100' }}
                style={{ width: 80, height: 80, opacity: 0.3, marginBottom: 16 }}
            />
            <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title, marginBottom: 8 }}>
                No results found
            </Text>
            <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.text, textAlign: 'center' }}>
                Try adjusting your search or browse our categories
            </Text>
        </View>
    );

    const handleRefresh = () => {
        setFailedImages(new Set());
        setCurrentImageIndexes(new Map());
        setProductImageArrays(new Map());
        if (searchText.trim().length > 0) {
            searchProducts(searchText, 1, true);
        }
    };

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            {theme.dark ? null : (
                <LinearGradient
                    colors={['#C37B5F', '#F9F5F3']}
                    style={{ width: '100%', height: 230, top: 0, position: 'absolute' }}
                />
            )}
            <View style={[GlobalStyleSheet.container, { flex: 1 }]}>
                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 20 }}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={[
                            GlobalStyleSheet.background,
                            {
                                height: 48,
                                width: 48,
                                backgroundColor: colors.card,
                                borderRadius: 15,
                            },
                        ]}
                    >
                        <Image
                            style={{ height: 18, width: 18, resizeMode: 'contain', tintColor: colors.text }}
                            source={IMAGES.arrowleft}
                        />
                    </TouchableOpacity>
                    <View style={{ height: 48, flex: 1, backgroundColor: colors.card, borderRadius: 15, flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput
                            style={{ ...FONTS.fontRegular, fontSize: 16, color: colors.text, paddingLeft: 20, flex: 1 }}
                            placeholder='Search jewelry, rings, necklaces...'
                            placeholderTextColor={colors.title}
                            value={searchText}
                            onChangeText={setSearchText}
                            autoFocus
                            returnKeyType="search"
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setSearchText('')}
                                style={{ paddingRight: 15 }}
                            >
                                <Image
                                    style={{ height: 16, width: 16, tintColor: colors.text, opacity: 0.5 }}
                                    source={IMAGES.close}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Search Results */}
                {searchText.length > 0 && (
                    <View style={{ flex: 1 }}>
                        {/* Results Header */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title }}>
                                {isSearching ? 'Searching...' : `${totalResults} Results`}
                            </Text>
                            {totalResults > 0 && (
                                <TouchableOpacity onPress={handleRefresh} style={{ padding: 4 }}>
                                    <Text style={{ ...FONTS.fontRegular, fontSize: 12, color: colors.primary || '#C37B5F' }}>
                                        Refresh
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Results List */}
                        {isSearching ? (
                            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                                <ActivityIndicator size="large" color={colors.primary || '#C37B5F'} />
                                <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.text, marginTop: 16 }}>
                                    Searching for "{searchText}"...
                                </Text>
                            </View>
                        ) : searchResults.length > 0 ? (
                            <FlatList
                                data={searchResults}
                                renderItem={renderSearchItem}
                                keyExtractor={(item) => item.TAGKEY}
                                numColumns={2}
                                showsVerticalScrollIndicator={false}
                                onEndReached={loadMoreResults}
                                onEndReachedThreshold={0.3}
                                ListFooterComponent={renderFooter}
                                contentContainerStyle={{ paddingBottom: 20 }}
                            />
                        ) : (
                            renderEmptyState()
                        )}
                    </View>
                )}

                {/* Default Content (Categories and History) */}
                {searchText.length === 0 && (
                    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                        {/* Search History */}
                        {show.length > 0 && (
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <Text style={{ ...FONTS.Marcellus, fontSize: 20, color: colors.title }}>
                                        Recent Searches
                                    </Text>
                                    <TouchableOpacity activeOpacity={0.7} onPress={removeItem}>
                                        <Text style={{ ...FONTS.fontMedium, fontSize: 12, color: colors.primary || '#C37B5F' }}>
                                            Clear All
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View>
                                    {show.map((data, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => handleSearchHistoryPress(data.title)}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                paddingVertical: 12,
                                                paddingHorizontal: 4,
                                            }}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                                <Image
                                                    source={IMAGES.search}
                                                    style={{ width: 16, height: 16, tintColor: colors.text, opacity: 0.5, marginRight: 12 }}
                                                />
                                                <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, flex: 1 }}>
                                                    {data.title}
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                onPress={() => removeItem2(index)}
                                                style={{ padding: 4 }}
                                            >
                                                <Image
                                                    style={{ height: 16, width: 16, resizeMode: 'contain', opacity: 0.5, tintColor: colors.title }}
                                                    source={IMAGES.close}
                                                />
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    </ScrollView>
                )}

                {/* Debug Info in Development */}
                {__DEV__ && searchText.length > 0 && (
                    <View style={{ 
                        position: 'absolute', 
                        bottom: 20, 
                        right: 20, 
                        backgroundColor: 'rgba(0,0,0,0.7)', 
                        padding: 8, 
                        borderRadius: 4 
                    }}>
                        <Text style={{ color: 'white', fontSize: 10 }}>
                            Failed Images: {failedImages.size}
                        </Text>
                        <Text style={{ color: 'white', fontSize: 10 }}>
                            Products with Images: {productImageArrays.size}
                        </Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

export default Search;