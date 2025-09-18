import { useTheme } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { FONTS, COLORS } from '../../constants/theme';
import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { getMainCategoryImages } from '../../Services/CategoryImageService'; // Import your service

type CategoryScreenProps = StackScreenProps<RootStackParamList, 'Category'>;

// Helper function to handle image URLs
const getImageUrl = (path: string | null | undefined): any => {
  const IMAGE_BASE_URL = 'https://app.bmgjewellers.com';
  
  if (!path) return IMAGES.item11; // Fallback image
  
  // If path is already a full URL, return it directly
  if (path.startsWith('http')) {
    return { uri: path };
  }
  
  // Remove any leading slash if the path already starts with one
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return { uri: `${IMAGE_BASE_URL}${cleanPath}` };
};

const Category = ({ navigation, route }: CategoryScreenProps) => {
  const theme = useTheme();
  const { colors } = theme;
  const { categories } = route.params || {};
  
  const [loading, setLoading] = useState(!categories);
  const [allCategories, setAllCategories] = useState(categories || []);

  useEffect(() => {
    // If categories weren't passed, fetch them
    if (!categories) {
      fetchAllCategories();
    }
  }, []);

  const fetchAllCategories = async () => {
    try {
      setLoading(true);
      const data = await getMainCategoryImages();
      
      if (data && data.length > 0) {
        setAllCategories(data);
      } else {
        // Fallback to local images if API fails
        setAllCategories([
          { id: 1, name: 'Necklaces', image: IMAGES.item22 },
          { id: 2, name: 'Rings', image: IMAGES.item23 },
          { id: 3, name: 'Earrings', image: IMAGES.item24 },
          { id: 4, name: 'Anklets', image: IMAGES.item25 },
          { id: 5, name: 'Bracelets', image: IMAGES.product3 },
          { id: 6, name: 'Pendants', image: IMAGES.product1 },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Fallback to local images on error
      setAllCategories([
        { id: 1, name: 'Necklaces', image: IMAGES.item22 },
        { id: 2, name: 'Rings', image: IMAGES.item23 },
        { id: 3, name: 'Earrings', image: IMAGES.item24 },
        { id: 4, name: 'Anklets', image: IMAGES.item25 },
        { id: 5, name: 'Bracelets', image: IMAGES.product3 },
        { id: 6, name: 'Pendants', image: IMAGES.product1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (categoryName: string) => {
    navigation.navigate('Products', { 
      itemName: categoryName,
    });
  };

  const handleImageError = (categoryId: string | number) => {
    // If an image fails to load, replace it with a fallback image
    setAllCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, image: IMAGES.item11 } 
          : cat
      )
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
        <Header
          title="All Categories"
          rightIcon2={'search'}
          leftIcon={'back'}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 10, color: colors.text }}>Loading categories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
      <Header
        title="All Categories"
        rightIcon2={'search'}
        leftIcon={'back'}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={GlobalStyleSheet.container}>
          <Text style={{ ...FONTS.Marcellus, fontSize: 20, color: colors.title, marginBottom: 20 }}>
            Browse All Jewelry Categories
          </Text>
          
          <View style={[GlobalStyleSheet.row, { marginTop: 10 }]}>
            {allCategories.map((category, index) => {
              // Determine the image source
              let imageSource;
              if (typeof category.image === 'string') {
                imageSource = getImageUrl(category.image);
              } else {
                imageSource = category.image || IMAGES.item11;
              }
              
              return (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => handleCategoryPress(category.name)}
                  key={category.id || index}
                  style={[GlobalStyleSheet.col50, { marginBottom: 20 }]}
                >
                  <View style={{ justifyContent: 'center' }}>
                    <Image
                      source={imageSource}
                      style={{ 
                        height: undefined, 
                        width: '100%', 
                        aspectRatio: 1/1.2, 
                        borderRadius: 20,
                        resizeMode: 'cover'
                      }}
                      onError={() => handleImageError(category.id || index)}
                    />
                    <View 
                      style={{ 
                        backgroundColor: colors.card,
                        padding: 10,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'absolute',
                        bottom: 10,
                        left: 10,
                        right: 10,
                      }}
                    >
                      <Text 
                        style={{ 
                          ...FONTS.fontMedium, 
                          fontSize: 16, 
                          color: colors.title, 
                          textAlign: 'center' 
                        }}
                        numberOfLines={1}
                      >
                        {category.name}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Category;