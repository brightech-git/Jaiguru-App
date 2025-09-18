import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { FONTS, COLORS, SIZES } from '../../constants/theme';
import { useTheme } from '@react-navigation/native';
import { IMAGES } from '../../constants/Images';
import { useDispatch } from 'react-redux';
import { Feather, Ionicons } from '@expo/vector-icons';
import {
  addProductToWishList,
  removeProductFromWishList,
} from '../../redux/reducer/wishListReducer';
import {
  addItemToCart,
  removeItemFromCart,
} from '../../redux/reducer/cartReducer';

type Props = {
  id: string;
  title: string;
  price: string | number;
  image?: any;
  discount?: string | number;
  review?: string;
  closebtn?: boolean;
  Cardstyle4?: boolean;
  removelikebtn?: boolean;
  wishlist?: boolean;
  card3?: boolean;
  likebtn?: boolean;
  onPress?: () => void;
  onImageError?: (imageUrl: string) => void;
  wishlistActive?: boolean;
  cartActive?: boolean;
  product: any;
  cartItemId?: string;
};

const CardStyle1 = ({
  id,
  image,
  title,
  price,
  discount,
  review,
  onPress,
  onImageError,
  closebtn,
  removelikebtn,
  likebtn,
  card3,
  Cardstyle4,
  wishlistActive = false,
  cartActive = false,
  product,
  cartItemId,
}: Props) => {
  const { colors, dark } = useTheme();
  const dispatch = useDispatch();

  const FALLBACK_IMAGE = IMAGES.item12;
  const [imageSrc, setImageSrc] = useState(
    typeof image === 'string' ? { uri: image } : image || FALLBACK_IMAGE
  );
  const [imageLoading, setImageLoading] = useState(true);

  // Format price as currency
  const formatPrice = (value: string | number) => {
    if (typeof value === 'number') {
      return `₹${value.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      return `₹${numericValue.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    return String(value);
  };

  const handleWishlistPress = () => {
    if (wishlistActive) {
      dispatch(removeProductFromWishList(id));
    } else {
      dispatch(addProductToWishList(product));
    }
  };

  const handleCartPress = () => {
    if (cartActive && cartItemId) {
      Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            dispatch(removeItemFromCart(cartItemId));
            Alert.alert('Removed', 'Item removed from cart');
          },
        },
      ]);
    } else {
      dispatch(
        addItemToCart({
          itemTagSno: id,
          imagePath: typeof image === 'string' ? image : '',
          productData: product,
        })
      );
      Alert.alert('Added', 'Item added to cart');
    }
  };

  const handleImageLoadError = () => {
    setImageSrc(FALLBACK_IMAGE);
    setImageLoading(false);
    if (onImageError && typeof image === 'string') {
      onImageError(image);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <View
      style={[
        styles.cardContainer,
        Platform.OS === 'ios' && {
          backgroundColor: card3 ? undefined : dark ? COLORS.darkCard : COLORS.card,
          borderRadius: SIZES.radius_lg,
        },
        { shadowColor: dark ? COLORS.darkShadow : COLORS.shadow },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.cardTouchable,
          {
            backgroundColor: card3 ? undefined : dark ? COLORS.darkCard : COLORS.card,
            alignItems: card3 ? 'center' : undefined,
          },
        ]}
        onPress={onPress}
      >
        {/* Image Container with Loading State */}
        <View
          style={[
            styles.imageContainer,
            {
              backgroundColor: card3 ? dark ? COLORS.darkCard : COLORS.card : undefined,
              width: card3 ? 127 : undefined,
              height: card3 ? 127 : Cardstyle4 ? undefined : 170,
              borderRadius: card3 ? 40 : undefined,
            },
          ]}
        >
          {imageLoading && (
            <View style={[styles.loadingOverlay, { backgroundColor: dark ? COLORS.darkOverlay : COLORS.overlay }]}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          )}
          
          <Image
            style={styles.productImage}
            source={imageSrc}
            onError={handleImageLoadError}
            onLoad={handleImageLoad}
            resizeMode="contain"
          />
        </View>

        {/* Product Info */}
        <View
          style={[
            styles.infoContainer,
            {
              backgroundColor: card3 ? undefined : dark ? COLORS.darkCard : COLORS.card,
              alignItems: card3 ? 'center' : undefined,
            },
          ]}
        >
          {title ? (
            <Text
              style={[
                styles.titleText,
                {
                  fontSize: card3 ? SIZES.font : SIZES.fontLg,
                  color: dark ? COLORS.darkTitle : COLORS.title,
                  textAlign: card3 ? 'center' : 'left',
                  paddingRight: card3 ? 0 : SIZES.padding * 2,
                },
              ]}
              numberOfLines={2}
            >
              {String(title)}
            </Text>
          ) : null}

          {review ? (
            <Text style={[styles.reviewText, { color: dark ? COLORS.darkTextLight : COLORS.textLight }]}>
              {String(review)}
            </Text>
          ) : null}

          <View
            style={[
              styles.priceContainer,
              Cardstyle4 && styles.priceContainerCard4,
            ]}
          >
            {price ? (
              <Text
                style={[
                  styles.priceText,
                  { fontSize: card3 ? SIZES.font : SIZES.fontLg, color: dark ? COLORS.darkTitle : COLORS.title },
                ]}
              >
                {formatPrice(price)}
              </Text>
            ) : null}

            {discount ? (
              <Text
                style={[
                  styles.discountText,
                  { color: dark ? COLORS.darkTextLight : COLORS.textLight },
                ]}
              >
                {formatPrice(discount)}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Wishlist Button */}
        {!removelikebtn && !likebtn && (
          <View style={styles.wishlistButtonContainer}>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: dark ? COLORS.darkOverlay : COLORS.overlay }]} onPress={handleWishlistPress}>
              <Ionicons
                name={wishlistActive ? 'heart' : 'heart-outline'}
                size={SIZES.fontLg}
                color={wishlistActive ? COLORS.danger : dark ? COLORS.darkTitle : COLORS.title}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Cart Button */}
        {closebtn && (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.cartButtonContainer}
            onPress={handleCartPress}
          >
            <View
              style={[
                styles.cartButton,
                {
                  backgroundColor: cartActive ? COLORS.danger : COLORS.primary,
                },
              ]}
            >
              <Feather
                name={cartActive ? 'trash-2' : 'shopping-cart'}
                size={SIZES.font}
                color={dark ? COLORS.darkCard : COLORS.card}
              />
            </View>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    shadowOffset: { width: 2, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: SIZES.radius,
    elevation: 5,
    marginBottom: SIZES.margin,
  },
  cardTouchable: {
    borderRadius: SIZES.radius_lg,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: COLORS.overlay,
  },
  productImage: {
    height: undefined,
    width: '100%',
    aspectRatio: 1 / 1,
    borderRadius: SIZES.radius,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  infoContainer: {
    padding: SIZES.padding,
    paddingTop: 0,
    borderBottomLeftRadius: SIZES.radius_lg,
    borderBottomRightRadius: SIZES.radius_lg,
  },
  titleText: {
    ...FONTS.fontMedium,
    marginBottom: SIZES.margin / 2,
  },
  reviewText: {
    ...FONTS.fontRegular,
    fontSize: SIZES.fontXs,
    color: COLORS.textLight,
    marginBottom: SIZES.margin / 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: SIZES.margin / 2,
  },
  priceContainerCard4: {
    position: 'absolute',
    bottom: SIZES.padding,
    right: SIZES.padding,
    flexDirection: 'column',
  },
  priceText: {
    ...FONTS.fontSemiBold,
  },
  discountText: {
    ...FONTS.fontRegular,
    fontSize: SIZES.fontSm,
    textDecorationLine: 'line-through',
    marginRight: 5,
  },
  wishlistButtonContainer: {
    position: 'absolute',
    right: 5,
    top: 5,
  },
  iconButton: {
    height: 38,
    width: 38,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.overlay,
  },
  cartButtonContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  cartButton: {
    height: 35,
    width: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomRightRadius: SIZES.radius_lg,
    borderTopLeftRadius: SIZES.radius_lg,
  },
});

export default CardStyle1;