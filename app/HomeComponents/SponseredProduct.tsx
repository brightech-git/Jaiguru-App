import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, Image, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../constants/StyleSheet';
import { IMAGES } from '../constants/Images';
import { FONTS, COLORS } from '../constants/theme';
import { fetchBestDesignProducts } from '../Services/BestDesignService';
import { useNavigation } from '@react-navigation/native';
const IMAGE_BASE_URL = "https://app.bmgjewellers.com";

const SponsoredProducts = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { colors } = theme;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const bestDesignProducts = await fetchBestDesignProducts();
        setProducts(bestDesignProducts);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const parseImagePath = (imagePath) => {
    try {
      const cleanedPath = imagePath?.replace(/\\/g, "") || "[]";
      const parsedPaths = JSON.parse(cleanedPath);
      return parsedPaths.map((path) =>
        path.startsWith("http") ? path : `${IMAGE_BASE_URL}${path}`
      );
    } catch (error) {
      console.warn("Error parsing ImagePath:", error);
      return [];
    }
  };
    const handleProductPress = (sno) => {
    navigation.navigate('ProductDetails', { sno: sno });  // Navigate to ProductDetails with SNO
  };

  if (loading) {
    return (
      <View style={{ padding: 20 }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: colors.text }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: colors.background, width: '100%' }}>
      <View style={[GlobalStyleSheet.container, { paddingBottom: 5 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ ...FONTS.h3, fontSize: 20, color: colors.title }}>Best Designs</Text>
          {/* <TouchableOpacity>
            <Text style={{ ...FONTS.fontRegular, fontSize: 13, color: colors.title }}>See All</Text>
          </TouchableOpacity> */}
        </View>
        <View style={{ marginHorizontal: -15, marginTop: 20 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
              {products.map((product) => {
                const images = parseImagePath(product.ImagePath);
                const mainImage = images.length > 0 ? images[0] : null;

                return (
                  <TouchableOpacity
                   onPress={() => handleProductPress(product.SNO)}
                    key={product.SNO}
                    style={{
                      shadowColor: 'rgba(195, 123, 95, 0.25)',
                      shadowOffset: { width: -10, height: 20 },
                      shadowOpacity: 0.1,
                      shadowRadius: 5,
                      ...(Platform.OS === 'ios' && { backgroundColor: colors.card, borderRadius: 100 }),
                    }}
                  >
                    <View style={{ 
                      backgroundColor: colors.card, 
                      height: 138, 
                      padding: 20, 
                      borderRadius: 20, 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      gap: 15 
                    }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ ...FONTS.Marcellus, fontSize: 16, color: colors.title }}>
                          {product.SUBITEMNAME.split(' ').join('\n')}
                        </Text>
                        <Text style={{ ...FONTS.Marcellus, fontSize: 16, color: colors.title, marginTop: 5 }}>
                          ₹ {product.GrandTotal}
                        </Text>
                      </View>
                      <View>
                        {mainImage ? (
                          <Image
                            style={{ height: 100, width: 100, resizeMode: 'contain' }}
                            source={{ uri: mainImage }}
                          />
                        ) : (
                          <Image
                            style={{ height: 100, width: 100, resizeMode: 'contain' }}
                            source={IMAGES.item12}
                          />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View> 
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default SponsoredProducts;