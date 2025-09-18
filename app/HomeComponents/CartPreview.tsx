import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../constants/StyleSheet';
import { FONTS, COLORS, SIZES } from '../constants/theme';
import { IMAGES } from '../constants/Images';
import Button from '../components/Button/Button';
import { Feather } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';

type CartItem = {
  sno: string;
  fullDetails?: {
    SNO: string;
    ITEMNAME: string;
    GrandTotal: string;
    ImagePath: string;
  };
};

type CartItemsPreviewProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
  loading: boolean;
  cartProducts: CartItem[];
  handleRemove: (item: CartItem) => void;
  getImageUrl: (imagePath?: string) => string;
};

const CartItemsPreview = ({
  navigation,
  loading,
  cartProducts,
  handleRemove,
  getImageUrl,
}: CartItemsPreviewProps) => {
  const { colors, dark } = useTheme();

  return (
    <View style={[styles.wrapper, { backgroundColor: dark ? COLORS.darkBackground : COLORS.background }]}>
      <View style={[GlobalStyleSheet.container, styles.innerContainer]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: dark ? COLORS.darkTitle : COLORS.title }]}>
            Items In Your Cart
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyCart')}>
            <Text style={[styles.viewCart, { color: dark ? COLORS.darkText : COLORS.text }]}>
              View Cart
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loader */}
        {loading ? (
          <View style={[styles.centerContent, { backgroundColor: dark ? COLORS.darkCard : COLORS.card }]}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={[styles.loadingText, { color: dark ? COLORS.darkText : COLORS.text }]}>
              Loading cart items...
            </Text>
          </View>
        ) : cartProducts.length > 0 ? (
          <>
            {/* Cart Items */}
            {cartProducts.slice(0, 3).map((item, index) => {
              const imageUri = getImageUrl(item.fullDetails?.ImagePath);
              return (
                <TouchableOpacity
                  key={`${item.sno}-${index}`}
                  style={[styles.cartItem, { backgroundColor: dark ? COLORS.darkCard : COLORS.card }]}
                  onPress={() =>
                    navigation.navigate('ProductDetails', {
                      sno: item.fullDetails?.SNO,
                    })
                  }
                >
                  {/* Product Image */}
                  <Image
                    style={[
                      styles.productImage,
                      { borderColor: dark ? COLORS.darkBorderColor : COLORS.borderColor },
                    ]}
                    source={{ uri: imageUri }}
                    defaultSource={IMAGES.item11}
                    resizeMode="cover"
                  />

                  {/* Product Details */}
                  <View style={styles.productInfo}>
                    <Text
                      style={[styles.productName, { color: dark ? COLORS.darkTitle : COLORS.title }]}
                      numberOfLines={1}
                    >
                      {item.fullDetails?.ITEMNAME || 'Unknown Product'}
                    </Text>

                    <View style={styles.ratingRow}>
                      <Text
                        style={[styles.price, { color: dark ? COLORS.darkTitle : COLORS.title }]}
                      >
                        ₹
                        {parseFloat(item.fullDetails?.GrandTotal || '0').toFixed(2)}
                      </Text>
                      <Image
                        style={styles.ratingIcon}
                        source={IMAGES.star4}
                      />
                      <Text
                        style={[
                          styles.reviewText,
                          { color: dark ? COLORS.darkTextLight : COLORS.textLight },
                        ]}
                      >
                        (2k review)
                      </Text>
                    </View>

                    <Text
                      style={[styles.quantity, { color: dark ? COLORS.darkText : COLORS.text }]}
                    >
                      Quantity: <Text style={styles.quantityValue}>1</Text>
                    </Text>
                  </View>

                  {/* Remove Button */}
                  <TouchableOpacity
                    style={[styles.removeBtn, { backgroundColor: dark ? COLORS.darkBackground : COLORS.background }]}
                    onPress={() => handleRemove(item)}
                  >
                    <Image
                      style={[
                        styles.removeIcon,
                        { tintColor: dark ? COLORS.darkText : COLORS.title },
                      ]}
                      source={IMAGES.close}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}

            {/* Checkout Button */}
            <View style={styles.checkoutBtn}>
              <Button
                title={`Proceed to checkout (${cartProducts.length})`}
                onPress={() => navigation.navigate('MyCart')}
                btnRounded
                outline
                icon={<Feather size={SIZES.fontLg} color={dark ? COLORS.darkCard : COLORS.card} name="arrow-right" />}
                color={dark ? COLORS.darkCard : COLORS.card}
                text={COLORS.primary}
              />
            </View>
          </>
        ) : (
          /* Empty State */
          <View style={[styles.centerContent, { backgroundColor: dark ? COLORS.darkCard : COLORS.card }]}>
            <Feather name="shopping-cart" size={SIZES.fontXxl} color={COLORS.primary} />
            <Text style={[styles.emptyText, { color: dark ? COLORS.darkText : COLORS.text }]}>
              Your cart is empty
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingBottom: SIZES.padding / 2,
    backgroundColor: COLORS.background,
  },
  innerContainer: {
    marginVertical: SIZES.margin / 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
  },
  headerTitle: {
    ...FONTS.h3,
    fontSize: SIZES.h4,
    color: COLORS.title,
  },
  viewCart: {
    ...FONTS.fontMedium,
    fontSize: SIZES.fontSm,
    color: COLORS.text,
  },
  centerContent: {
    alignItems: 'center',
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius_lg,
  },
  loadingText: {
    ...FONTS.fontRegular,
    fontSize: SIZES.font,
    marginTop: SIZES.margin / 2,
    color: COLORS.text,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: SIZES.margin,
    padding: SIZES.padding - 4,
    borderRadius: SIZES.radius_lg,
    backgroundColor: COLORS.card,
  },
  productImage: {
    width: 75,
    height: 75,
    borderRadius: SIZES.radius_md,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...FONTS.fontMedium,
    fontSize: SIZES.font,
    color: COLORS.title,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
  },
  price: {
    ...FONTS.fontSemiBold,
    fontSize: SIZES.fontLg,
    color: COLORS.title,
  },
  ratingIcon: {
    height: 12,
    width: 12,
    resizeMode: 'contain',
  },
  reviewText: {
    ...FONTS.fontRegular,
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
  },
  quantity: {
    ...FONTS.fontRegular,
    fontSize: SIZES.font,
    marginTop: 2,
    color: COLORS.text,
  },
  quantityValue: {
    ...FONTS.fontBold,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  removeBtn: {
    height: 40,
    width: 40,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  removeIcon: {
    height: 18,
    width: 18,
    resizeMode: 'contain',
  },
  checkoutBtn: {
    marginTop: SIZES.margin,
    paddingHorizontal: SIZES.padding,
  },
  emptyText: {
    ...FONTS.fontRegular,
    fontSize: SIZES.font,
    marginTop: SIZES.margin / 2,
    color: COLORS.text,
  },
});

export default CartItemsPreview;