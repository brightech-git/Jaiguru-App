import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from '../../layout/Header';
import Button from '../../components/Button/Button';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { FONTS, COLORS } from '../../constants/theme';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';

import { addItemToCart, fetchCartItems } from '../../redux/reducer/cartReducer';
import { RootState } from '../../redux/store';
import { API_BASE_URL } from '../../Config/baseUrl';
import { cartService } from '../../Services/CartService';
import fallbackImage from '../../assets/images/item/pic6.png';
import { productService, ProductItem, ProductFilters } from '../../Services/ProductService';

interface CartItemWithDetails {
  sno: string;
  itemTagSno: string;
  fullDetails: {
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
}

type Props = StackScreenProps<RootStackParamList, 'ProductDetails'>;

const ProductDetails = ({ navigation, route }: Props) => {
  const theme = useTheme();
  const { colors }: { colors: any } = theme;
  const dispatch = useDispatch();

  const [product, setProduct] = useState<any>(null);
  const [activeSize, setActiveSize] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [imageArray, setImageArray] = useState<string[]>([]);
  const [isInCart, setIsInCart] = useState<boolean>(false);
  const [cartLoading, setCartLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductItem[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [hasMoreRelated, setHasMoreRelated] = useState(true);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [mainImageError, setMainImageError] = useState(false);

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const sno = route?.params?.sno || '';
  console.log('Product SNO:', sno);

  const addToRecentlyViewed = async (itemSno: string) => {
    try {
      const token = await AsyncStorage.getItem('user_token');
      if (!token) {
        console.log('User not logged in, skipping recently viewed');
        return;
      }

      const checkUrl = `${API_BASE_URL}/recently-viewed/check?itemSno=${itemSno}`;
      const checkResponse = await fetch(checkUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.exists) {
          console.log('Product already in recently viewed');
          return;
        }
      }

      const addUrl = `${API_BASE_URL}/recently-viewed/add?itemSno=${itemSno}`;
      const addResponse = await fetch(addUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (addResponse.ok) {
        console.log('Product added to recently viewed');
      } else {
        console.log('Failed to add to recently viewed');
      }
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
    }
  };

  const processImagePath = (imagePath: string | string[]) => {
    try {
      let parsedImages: string[] = [];
      if (Array.isArray(imagePath)) {
        parsedImages = imagePath;
      } else if (typeof imagePath === 'string') {
        if (imagePath.startsWith('[') && imagePath.endsWith(']')) {
          parsedImages = JSON.parse(imagePath);
        } else {
          parsedImages = [imagePath];
        }
      }

      const validImages = parsedImages
        .filter(img => img && typeof img === 'string' && img.trim() !== '')
        .map(img => {
          const cleanImg = img.trim();
          if (cleanImg.startsWith('http')) {
            return cleanImg;
          } else if (cleanImg.startsWith('/Uploads')) {
            return `https://app.bmgjewellers.com${cleanImg}`;
          } else {
            return `https://app.bmgjewellers.com/uploads/${cleanImg}`;
          }
        });

      return validImages;
    } catch (err) {
      console.warn('⚠️ ImagePath processing failed:', err);
      return [];
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/product/getSnofilter?sno=${sno}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        const data = text ? JSON.parse(text) : null;
        const prod = Array.isArray(data) ? data[0] : data?.result?.[0] || data;

        if (prod) {
          setProduct(prod);
          if (prod.SIZENAME) setActiveSize(prod.SIZENAME);

          const processedImages = processImagePath(prod.ImagePath);
          if (processedImages.length > 0) {
            setImageArray(processedImages);
            setSelectedImage(processedImages[0]);
          } else {
            console.warn('⚠️ No valid images found');
            setImageArray([]);
            setSelectedImage('');
          }

          addToRecentlyViewed(prod.SNO);
        } else {
          setError('No product data available');
        }
      } catch (err) {
        console.error(`❌ Error fetching product for SNO ${sno}:`, err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (sno) {
      fetchProduct();
    } else {
      setError('Invalid Product: No product ID provided');
      setLoading(false);
    }
  }, [sno]);

  useEffect(() => {
    if (product?.ITEMNAME && product?.SUBITEMNAME) {
      const fetchRelatedProducts = async (isLoadMore = false) => {
        if (!hasMoreRelated || relatedLoading) return;

        try {
          setRelatedLoading(true);
          if (!isLoadMore) {
            productService.resetPagination();
            setRelatedProducts([]); // Clear existing products for a fresh fetch
          }

          const filters: ProductFilters = {
            itemName: product.ITEMNAME,
            subItemName: product.SUBITEMNAME,
          };

          const items = await productService.getFilteredProducts(filters);
          console.log('Related products response:', items);

          const filteredItems = items.filter(item => item.SNO !== product.SNO);
          setRelatedProducts(prev => isLoadMore ? [...prev, ...filteredItems] : filteredItems);
          setHasMoreRelated(productService.hasMoreData());
        } catch (err) {
          console.error('Error fetching related products:', err);
        } finally {
          setRelatedLoading(false);
        }
      };

      fetchRelatedProducts();
    }
  }, [product]);

  useEffect(() => {
    const checkCartStatus = async () => {
      if (product?.SNO) {
        try {
          const inCart = await cartService.isItemInCart(product.SNO);
          setIsInCart(inCart);
        } catch (error) {
          console.error('Error checking cart status:', error);
        }
      }
    };

    checkCartStatus();
  }, [product, cartItems]);

  const handleImageError = (imageUri: string) => {
    setFailedImages(prev => new Set([...prev, imageUri]));
    if (imageUri === selectedImage) {
      const workingImages = imageArray.filter(img => !failedImages.has(img) && img !== imageUri);
      if (workingImages.length > 0) {
        setSelectedImage(workingImages[0]);
      } else {
        setMainImageError(true);
      }
    }
  };

  const handleMainImageError = () => {
    setMainImageError(true);
    const workingImages = imageArray.filter(img => !failedImages.has(img) && img !== selectedImage);
    if (workingImages.length > 0) {
      setSelectedImage(workingImages[0]);
      setMainImageError(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || !product.SNO || cartLoading) return;

    setCartLoading(true);
    try {
      const cartPayload = {
        itemTagSno: product.SNO,
        imagePath: selectedImage || (imageArray.length > 0 ? imageArray[0] : ''),
      };

      await dispatch(addItemToCart(cartPayload)).unwrap();
      await dispatch(fetchCartItems());
      setIsInCart(true);
      Alert.alert('Success', 'Item added to cart.');
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      Alert.alert('Error', 'Failed to add item to cart.');
    } finally {
      setCartLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || !product.SNO) return;

    const cartItem: CartItemWithDetails = {
      sno: product.SNO || '',
      itemTagSno: product.SNO || '',
      fullDetails: {
        MaterialFinish: product.MaterialFinish || '',
        Description: product.Description || '',
        TAGNO: product.TAGNO || product.SNO || '',
        Occasion: product.Occasion || '',
        RATE: product.RATE || product.GrandTotal || '0',
        GSTAmount: product.GSTAmount || '0',
        TAGKEY: product.TAGKEY || product.SNO || '',
        Gender: product.Gender || '',
        SIZEID: product.SIZEID || 0,
        Best_Design: product.Best_Design || false,
        SNO: product.SNO || '',
        CollectionType: product.CollectionType || '',
        ImagePath: selectedImage || (imageArray.length > 0 ? imageArray[0] : ''),
        NewArrival: product.NewArrival || false,
        GrossAmount: product.GrossAmount || product.GrandTotal || '0',
        Featured_Products: product.Featured_Products || false,
        SIZENAME: product.SIZENAME || null,
        Rate: product.RATE || product.GrandTotal || '0',
        StoneType: product.StoneType || null,
        SUBITEMNAME: product.SUBITEMNAME || 'Unnamed Product',
        CATNAME: product.CATNAME || '',
        NETWT: product.NETWT || product.GRSWT || '0',
        GSTPer: product.GSTPer || '0',
        GrandTotal: product.GrandTotal || product.RATE || '0',
        ColorAccents: product.ColorAccents || '',
        ITEMID: product.ITEMID || product.SNO || '',
        ITEMNAME: product.ITEMNAME || product.SUBITEMNAME || 'Unnamed Product',
      },
    };

    if (!isInCart) {
      setCartLoading(true);
      try {
        const cartPayload = {
          itemTagSno: product.SNO,
          imagePath: selectedImage || (imageArray.length > 0 ? imageArray[0] : ''),
        };

        await dispatch(addItemToCart(cartPayload)).unwrap();
        await dispatch(fetchCartItems());
        setIsInCart(true);
      } catch (error) {
        console.error('❌ Add to cart error:', error);
        Alert.alert('Error', 'Failed to add item to cart.');
        setCartLoading(false);
        return;
      } finally {
        setCartLoading(false);
      }
    }

    navigation.navigate('Checkout', {
      products: [cartItem],
      fromProductDetail: true,
    });
  };

  const handleExploreProducts = () => {
    navigation.navigate('Products');
  };

  const loadMoreRelatedProducts = () => {
    if (product?.ITEMNAME && product?.SUBITEMNAME && hasMoreRelated && !relatedLoading) {
      const fetchRelatedProducts = async () => {
        try {
          setRelatedLoading(true);
          const filters: ProductFilters = {
            itemName: product.ITEMNAME,
            subItemName: product.SUBITEMNAME,
          };

          const items = await productService.getFilteredProducts(filters);
          console.log('Related products response (load more):', items);

          const filteredItems = items.filter(item => item.SNO !== product.SNO);
          setRelatedProducts(prev => [...prev, ...filteredItems]);
          setHasMoreRelated(productService.hasMoreData());
        } catch (err) {
          console.error('Error fetching more related products:', err);
        } finally {
          setRelatedLoading(false);
        }
      };

      fetchRelatedProducts();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ position: 'absolute', width: '100%', zIndex: 99, top: Platform.OS === 'ios' ? 47 : 0 }}>
          <Header
            title="Product Details"
            leftIcon="back"
            color
            onPressLeft={() => navigation.goBack()}
          />
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Image
            source={fallbackImage}
            style={{ width: 200, height: 200, marginBottom: 30 }}
            resizeMode="contain"
          />

          <Text style={{ ...FONTS.h4, color: colors.title, marginBottom: 10, textAlign: 'center' }}>
            No Product Available
          </Text>

          <Text style={{
            ...FONTS.fontRegular,
            fontSize: 16,
            color: colors.text,
            opacity: 0.7,
            marginBottom: 30,
            textAlign: 'center'
          }}>
            {error || 'We couldn\'t find the product you\'re looking for.'}
          </Text>

          <Button
            title="Explore Products"
            onPress={handleExploreProducts}
            color={COLORS.primary}
            btnRounded
            style={{ width: '80%' }}
            icon={
              <Feather
                name="shopping-bag"
                size={18}
                color={COLORS.white}
                style={{ marginRight: 8 }}
              />
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  const workingImages = imageArray.filter(img => !failedImages.has(img));
  const groupedRelatedProducts: ProductItem[][] = [];
  for (let i = 0; i < relatedProducts.length; i += 2) {
    groupedRelatedProducts.push(relatedProducts.slice(i, i + 2));
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ position: 'absolute', width: '100%', zIndex: 99, top: Platform.OS === 'ios' ? 47 : 0 }}>
        <Header
          title="Product Details"
          leftIcon="back"
          rightIcon="cart"
          color
          onPressRight={() => navigation.navigate('MyCart')}
          onPressLeft={() => navigation.goBack()}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ position: 'relative' }}>
          <Image
            style={{ width: '100%', aspectRatio: 1 / 1.2, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
            source={
              mainImageError || !selectedImage || failedImages.has(selectedImage)
                ? fallbackImage
                : { uri: selectedImage }
            }
            onError={handleMainImageError}
            resizeMode="cover"
          />
          
          {(mainImageError || (!selectedImage && imageArray.length === 0)) && (
            <View style={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              backgroundColor: 'rgba(0,0,0,0.7)',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 5,
            }}>
              <Text style={{ color: 'white', fontSize: 12 }}>No Image Available</Text>
            </View>
          )}
        </View>

        {workingImages.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 10, paddingHorizontal: 10 }}
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            {workingImages.map((uri, index) => (
              <TouchableOpacity
                key={`${uri}-${index}`}
                onPress={() => {
                  setSelectedImage(uri);
                  setMainImageError(false);
                }}
                style={{
                  marginRight: 10,
                  borderWidth: selectedImage === uri ? 2 : 0,
                  borderColor: COLORS.primary,
                  borderRadius: 10,
                  overflow: 'hidden',
                }}
              >
                <Image
                  source={{ uri }}
                  style={{ width: 70, height: 70, borderRadius: 10 }}
                  resizeMode="cover"
                  onError={() => handleImageError(uri)}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={[GlobalStyleSheet.container, { marginTop: 5 }]}>
          <Text style={{ ...FONTS.Marcellus, fontSize: 24, color: colors.title }}>
            {product.SUBITEMNAME?.trim() || 'Unnamed Product'}
          </Text>

          <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, opacity: 0.7, marginTop: 10 }}>
            {product.GSTPer || 0} GST
          </Text>

          <View style={{ flexDirection: 'row', gap: 60, marginTop: 20 }}>
            <View>
              <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title }}>Price:</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 }}>
                <Text style={{ ...FONTS.fontMedium, fontSize: 20, color: colors.title }}>
                  ₹{Number(product.GrandTotal || 0) > 0
                    ? Number(product.GrandTotal || 0).toFixed(2)
                    : Number(product.RATE || 0).toFixed(2)}
                </Text>

                <Text style={{
                  ...FONTS.fontRegular,
                  fontSize: 15,
                  color: colors.title,
                  textDecorationLine: 'line-through',
                }}>
                  ₹{Number(product.GrandTotal || 0) > 0
                    ? (Number(product.GrandTotal || 0) * 1.1).toFixed(2)
                    : (Number(product.RATE || 0) * 1.1).toFixed(2)}
                </Text>
              </View>
            </View>

            {product.SIZENAME && (
              <View>
                <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title }}>Size:</Text>
                <TouchableOpacity
                  onPress={() => setActiveSize(product.SIZENAME)}
                  style={{
                    height: 40,
                    width: 60,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: activeSize === product.SIZENAME ? COLORS.primary : colors.card,
                    marginTop: 10,
                  }}
                >
                  <Text style={{
                    ...FONTS.fontSemiBold,
                    fontSize: 12,
                    color: activeSize === product.SIZENAME ? COLORS.white : colors.title,
                  }}>
                    {product.SIZENAME || 'N/A'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={{ marginTop: 20 }}>
            <Text style={{ ...FONTS.fontSemiBold, fontSize: 16, color: colors.title, marginBottom: 10 }}>Product Details:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15 }}>
              {product.TAGKEY && (
                <View style={{ minWidth: '45%' }}>
                  <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.text, opacity: 0.7 }}>Tag No:</Text>
                  <Text style={{ ...FONTS.fontMedium, fontSize: 14, color: colors.title }}>{product.TAGKEY || 'N/A'}</Text>
                </View>
              )}
              {product.GRSWT && (
                <View style={{ minWidth: '45%' }}>
                  <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.text, opacity: 0.7 }}>Weight:</Text>
                  <Text style={{ ...FONTS.fontMedium, fontSize: 14, color: colors.title }}>{product.GRSWT || '0'}g</Text>
                </View>
              )}
              {product.PURITY && (
                <View style={{ minWidth: '45%' }}>
                  <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.text, opacity: 0.7 }}>Purity:</Text>
                  <Text style={{ ...FONTS.fontMedium, fontSize: 14, color: colors.title }}>{product.PURITY || '0'}%</Text>
                </View>
              )}
              {product.CATNAME && (
                <View style={{ minWidth: '45%' }}>
                  <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.text, opacity: 0.7 }}>Category:</Text>
                  <Text style={{ ...FONTS.fontMedium, fontSize: 14, color: colors.title }}>{product.CATNAME || 'Uncategorized'}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={{ marginTop: 20 }}>
            <Text style={{ ...FONTS.fontSemiBold, fontSize: 16, color: colors.title }}>Description:</Text>
            <Text style={{
              ...FONTS.fontRegular,
              fontSize: 15,
              color: colors.title,
              opacity: 0.7,
              marginTop: 10,
              lineHeight: 22,
            }}>
              {product.Description || 'Elevate your ethnic look with this premium silver ornament crafted with precision and attention to detail.'}
            </Text>
          </View>

          <View style={{ marginTop: 30, paddingHorizontal: 15 }}>
            <Text style={{ ...FONTS.fontSemiBold, fontSize: 18, color: colors.title, marginBottom: 15 }}>Related Products</Text>
            {relatedProducts.length > 0 ? (
              <FlatList
                data={groupedRelatedProducts}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item: group }) => (
                  <View style={{ flexDirection: 'column', marginRight: 15 }}>
                    {group.map((item, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => navigation.navigate('ProductDetails', { sno: item.SNO })}
                        style={{
                          width: 160,
                          marginBottom: idx === 0 ? 15 : 0,
                          backgroundColor: colors.card,
                          borderRadius: 10,
                          overflow: 'hidden',
                        }}
                      >
                        <Image
                          source={item.ImagePaths?.[0] ? { uri: item.ImagePaths[0] } : fallbackImage}
                          style={{ width: '100%', height: 200 }}
                          resizeMode="cover"
                        />
                        <View style={{ padding: 10 }}>
                          <Text numberOfLines={1} style={{ ...FONTS.fontMedium, color: colors.title }}>
                            {item.SUBITEMNAME || 'Unnamed Product'}
                          </Text>
                          <Text style={{ ...FONTS.fontRegular, color: colors.text }}>
                            ₹{item.GrandTotal || '0'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                    {group.length === 1 && (
                      <View style={{ width: 160, height: 250 }} />
                    )}
                  </View>
                )}
                onEndReached={loadMoreRelatedProducts}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  relatedLoading ? (
                    <View style={{ padding: 10 }}>
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    </View>
                  ) : null
                }
              />
            ) : (
              <Text style={{ ...FONTS.fontRegular, color: colors.text }}>
                {relatedLoading ? 'Loading related products...' : 'No related products found'}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={[
        styles.bottomContainer,
        {
          backgroundColor: colors.card,
          shadowColor: 'rgba(195,123,95,0.25)',
        },
      ]}>
        <View style={[GlobalStyleSheet.container, { paddingHorizontal: 15 }]}>
          <View style={styles.buttonRow}>
            <View style={styles.buttonContainer}>
              <Button
                title={
                  cartLoading
                    ? 'Adding...'
                    : isInCart
                      ? 'Go to Cart'
                      : 'Add To Cart'
                }
                onPress={() => {
                  if (isInCart) {
                    navigation.navigate('MyCart');
                  } else {
                    handleAddToCart();
                  }
                }}
                color={COLORS.primary}
                btnRounded
                loading={cartLoading}
                disabled={cartLoading}
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title="Buy Now"
                onPress={handleBuyNow}
                color={COLORS.success}
                textColor={COLORS.white}
                btnRounded
                icon={
                  <Feather
                    name="shopping-bag"
                    size={18}
                    color={COLORS.textLight}
                    style={{ marginRight: 8 }}
                  />
                }
              />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 15,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowOffset: { width: 2, height: -20 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  buttonContainer: {
    flex: 1,
  },
});

export default ProductDetails;