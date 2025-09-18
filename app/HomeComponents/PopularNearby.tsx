import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from 'react-native';
import { GlobalStyleSheet } from '../constants/StyleSheet';
import appTheme from '../constants/theme';
import { useTheme, useNavigation } from '@react-navigation/native';
import { bannerService } from '../Services/PopularbannerService';

const { COLORS, FONTS, SIZES } = appTheme;

const PopularNearbySection = () => {
  const theme = useTheme();
  const { colors } = theme;
  const navigation = useNavigation();

  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bannerService
      .getBanners()
      .then((data) => {
        setBanners(data);
        console.log("✅ Popular page banners fetched successfully:", data.length);
      })
      .catch((err) => {
        console.error('❌ Failed to load banners:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={COLORS.primary}
        style={{ marginVertical: SIZES.margin }}
      />
    );
  }

  return (
    <>
      <View style={{ backgroundColor: theme.dark ? COLORS.darkBackground : COLORS.background, width: '100%' }}>
        <View
          style={[
            GlobalStyleSheet.container,
            { marginVertical: SIZES.margin / 2, marginBottom: 5 },
          ]}
        >
          <View style={styles.headerRow}>
            <Text style={[FONTS.Marcellus, styles.headerTitle, { color: theme.dark ? COLORS.darkTitle : COLORS.title }]}>
              Popular Nearby
            </Text>
          </View>
          <Text style={[FONTS.fontRegular, styles.subTitle, { color: theme.dark ? COLORS.darkTextLight : COLORS.textLight }]}>
            Up to 60% off + up to ₹107 Cash BACK
          </Text>
        </View>
      </View>

      <View
        style={[
          GlobalStyleSheet.container,
          styles.listWrapper,
          { backgroundColor: theme.dark ? COLORS.darkBackground : COLORS.background },
        ]}
      >
        <FlatList
          data={banners}
          horizontal
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const imageUrl = `https://app.bmgjewellers.com${item.image_path}`;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                style={styles.cardTouchable}
                onPress={() =>
                  navigation.navigate('Products', {
                    itemName: item.itemname,
                    subItemName: '',
                    initialFilters: {},
                  })
                }
              >
                <View
                  style={[
                    styles.cardContainer,
                    {
                      backgroundColor: Platform.OS === 'ios' ? (theme.dark ? COLORS.darkCard : COLORS.card) : undefined,
                    },
                  ]}
                >
                  <Image
                    style={styles.bannerImage}
                    source={{ uri: imageUrl }}
                  />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </>
  );
};

export default PopularNearbySection;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...FONTS.h4, // Using h4 for consistent typography
    fontSize: SIZES.h4,
    color: COLORS.title,
  },
  subTitle: {
    ...FONTS.fontRegular,
    fontSize: SIZES.fontSm,
    marginTop: 2,
    color: COLORS.textLight,
  },
  listWrapper: {
    paddingVertical: 0,
    marginBottom: SIZES.margin,
    backgroundColor: COLORS.background,
  },
  cardTouchable: {
    marginRight: SIZES.margin / 2,
  },
  cardContainer: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: SIZES.radius,
    borderRadius: SIZES.radius_lg,
    width: 400,
    alignItems: 'center',
    backgroundColor: COLORS.card, // Default for non-iOS platforms
  },
  bannerImage: {
    width: '100%',
    height: 200,
    borderRadius: SIZES.radius_lg,
    resizeMode: 'contain',
  },
});