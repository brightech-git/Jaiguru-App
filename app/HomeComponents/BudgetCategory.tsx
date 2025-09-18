import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { fetchBudgetCategories } from '../Services/BudgetService';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { GlobalStyleSheet } from '../constants/StyleSheet';
import { IMAGES } from '../constants/Images';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BudgetCategoriesScreen = () => {
  const { colors, dark } = useTheme();
  const navigation = useNavigation();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const { width } = Dimensions.get('window');
  const itemSize = (width - SIZES.padding * 3) / 2;

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get token from AsyncStorage
        const token = await AsyncStorage.getItem('user_token');
        
        if (!token) {
          setError('Please login to view budget categories');
          setLoading(false);
          return;
        }

        const data = await fetchBudgetCategories(token);
        setCategories(data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setError('Failed to load categories. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadCategories();
  }, []);

  const handleImageError = (imageUrl: string) => {
    setFailedImages(prev => new Set(prev).add(imageUrl));
  };

  const getWorkingImage = (item: any) => {
    if (failedImages.has(item.image)) {
      return IMAGES.item11;
    }
    return item.image;
  };

  const chunkArray = (array: any[], chunkSize: number) => {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  };

  const rows = chunkArray(categories, 2);

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: dark ? COLORS.darkBackground : COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: dark ? COLORS.darkText : COLORS.text }]}>
          Loading budget categories...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: dark ? COLORS.darkBackground : COLORS.background }]}>
        <Text style={[styles.errorText, { color: dark ? COLORS.darkText : COLORS.text }]}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { borderColor: dark ? COLORS.darkBorderColor : COLORS.borderColor, backgroundColor: dark ? COLORS.darkCard : COLORS.card }]}
          onPress={() => setLoading(true)}
        >
          <Text style={[styles.retryText, { color: COLORS.primary }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: dark ? COLORS.darkBackground : COLORS.background }]}>
        <Text style={[styles.emptyText, { color: dark ? COLORS.darkText : COLORS.text }]}>
          No budget categories found
        </Text>
        <Text style={[styles.emptySubtext, { color: dark ? COLORS.darkTextLight : COLORS.textLight }]}>
          Check back later for budget options
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.flexContainer, { backgroundColor: dark ? COLORS.darkBackground : COLORS.background }]}>
      {/* Header */}
      <View style={[styles.headerContainer, { borderBottomColor: dark ? COLORS.darkBorderColor : COLORS.borderColor }]}>
        <Text style={[styles.headerTitle, { color: dark ? COLORS.darkTitle : COLORS.title }]}>Shop by Budget</Text>
        <Text style={[styles.headerSubtitle, { color: dark ? COLORS.darkTextLight : COLORS.textLight }]}>
          Find jewelry within your price range
        </Text>
      </View>

      {/* Categories Grid */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((item) => {
              const workingImage = getWorkingImage(item);
              
              return (
                <TouchableOpacity
                  key={item.id.toString()}
                  style={[
                    styles.card,
                    { 
                      width: itemSize, 
                      height: itemSize, 
                      backgroundColor: dark ? COLORS.darkCard : COLORS.card,
                      shadowColor: dark ? COLORS.darkShadow : COLORS.shadow,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('Products', {
                      initialFilters: { 
                        minGrandTotal: item.min, 
                        maxGrandTotal: item.max 
                      },
                    })
                  }
                >
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: workingImage }}
                      style={styles.image}
                      resizeMode="cover"
                      onError={() => handleImageError(item.image)}
                      defaultSource={IMAGES.item11}
                    />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: dark ? COLORS.darkTitle : COLORS.title }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={[styles.subtitle, { color: dark ? COLORS.darkText : COLORS.text }]} numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                    <Text style={[styles.priceRange, { color: COLORS.primary }]} numberOfLines={1}>
                      ₹{item.min} - ₹{item.max}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            {row.length === 1 && <View style={{ width: itemSize }} />}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
  },
  headerContainer: {
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  headerTitle: {
    ...FONTS.h3,
    fontSize: SIZES.h3,
    textAlign: 'center',
    marginBottom: 4,
    color: COLORS.title,
  },
  headerSubtitle: {
    ...FONTS.fontRegular,
    fontSize: SIZES.fontSm,
    textAlign: 'center',
    color: COLORS.textLight,
  },
  loadingText: {
    ...FONTS.fontRegular,
    fontSize: SIZES.font,
    textAlign: 'center',
    marginTop: SIZES.margin / 2,
    color: COLORS.text,
  },
  errorText: {
    ...FONTS.fontRegular,
    fontSize: SIZES.font,
    textAlign: 'center',
    marginBottom: SIZES.margin,
    color: COLORS.text,
  },
  retryButton: {
    padding: SIZES.padding - 4,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.card,
    borderColor: COLORS.borderColor,
  },
  retryText: {
    ...FONTS.fontBold,
    fontSize: SIZES.font,
    color: COLORS.primary,
  },
  emptyText: {
    ...FONTS.fontRegular,
    fontSize: SIZES.font,
    textAlign: 'center',
    marginBottom: 4,
    color: COLORS.text,
  },
  emptySubtext: {
    ...FONTS.fontRegular,
    fontSize: SIZES.fontSm,
    textAlign: 'center',
    color: COLORS.textLight,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.margin,
  },
  card: {
    borderRadius: SIZES.radius_lg,
    overflow: 'hidden',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: COLORS.card,
  },
  imageContainer: {
    height: '60%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    height: '40%',
    padding: SIZES.padding - 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...FONTS.fontBold,
    fontSize: SIZES.font,
    textAlign: 'center',
    marginBottom: 2,
    color: COLORS.title,
  },
  subtitle: {
    ...FONTS.fontRegular,
    fontSize: SIZES.fontSm,
    textAlign: 'center',
    marginBottom: 4,
    color: COLORS.text,
  },
  priceRange: {
    ...FONTS.fontBold,
    fontSize: SIZES.fontSm,
    textAlign: 'center',
    color: COLORS.primary,
  },
});

export default BudgetCategoriesScreen;