import React from 'react';
import { useTheme } from '@react-navigation/native';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import LikeBtn from '../LikeBtn';
import { IMAGES } from '../../constants/Images';

type Props = {
  id: string;
  title: string;
  color?: any;
  price: string;
  image?: any;
  offer?: string;
  btntitel?: any;
  CardStyle4?: boolean;
  removebtn?: boolean;
  discount?: string;
  grid?: boolean;
  review?: string;
  status?: string;
  likeBtn?: boolean;
  onPress?: () => void;
  CardStyle5?: boolean;
  success?: boolean;
  onPress1?: () => void;
  onPress2?: () => void;
};

const CardStyle3 = ({
  onPress1,
  onPress2,
  id,
  title,
  CardStyle4,
  price,
  discount,
  image,
  btntitel,
  onPress,
  removebtn,
  grid,
  review,
  status,
  likeBtn,
  offer,
  CardStyle5,
  success,
}: Props) => {
  const theme = useTheme();
  const { colors } = theme;

  const getImageUrl = (): string => {
    const BASE_IMAGE_URL = 'https://app.bmgjewellers.com/uploads/';
    let imageUrl = '';

    if (!image) return 'https://yourdomain.com/default-image.png';

    if (typeof image === 'string') {
      if (image.startsWith('http')) return image;

      try {
        const parsed = JSON.parse(image);
        if (Array.isArray(parsed) && parsed.length > 0) {
          imageUrl = parsed[0];
        } else {
          imageUrl = image;
        }
      } catch {
        imageUrl = image;
      }
    } else if (Array.isArray(image) && image.length > 0) {
      imageUrl = image[0];
    } else if (typeof image === 'object' && image?.uri) {
      imageUrl = image.uri;
    }

    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = BASE_IMAGE_URL + imageUrl.replace(/^\/+/, '');
    }

    return imageUrl || 'https://yourdomain.com/default-image.png';
  };

  const getStatusColor = (status: string | undefined): string => {
    if (!status) return theme.dark ? COLORS.darkPlaceholder : COLORS.placeholder;
    
    switch (status.toUpperCase()) {
      case 'PENDING':
      case 'PROCESSING':
        return COLORS.warning;
      case 'SHIPPED':
      case 'IN_DELIVERY':
        return COLORS.success;
      case 'DELIVERED':
      case 'COMPLETED':
        return COLORS.primary;
      case 'CANCELLED':
        return COLORS.danger;
      default:
        return theme.dark ? COLORS.darkPlaceholder : COLORS.placeholder;
    }
  };

  return (
    <View
      style={[
        {
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 2, height: 20 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          marginTop: SIZES.margin,
        },
        Platform.OS === 'ios' && {
          backgroundColor: theme.dark ? COLORS.darkCard : COLORS.card,
          borderRadius: SIZES.radius,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: theme.dark ? COLORS.darkCard : COLORS.card,
          borderRadius: SIZES.radius,
        }}
        onPress={onPress}
      >
        <Image
          style={{
            width: 150,
            aspectRatio: 1 / 1,
            resizeMode: 'contain',
          }}
          source={{ uri: getImageUrl() }}
        />

        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={onPress}>
            <Text
              numberOfLines={1}
              style={{
                ...FONTS.marcellus,
                fontSize: SIZES.h5,
                color: theme.dark ? COLORS.darkTitle : COLORS.title,
                flex: 1,
              }}
            >
              {title}
            </Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              marginTop: SIZES.margin / 2,
            }}
          >
            <Text
              style={{
                ...FONTS.marcellus,
                fontSize: SIZES.h5,
                color: theme.dark ? COLORS.darkTitle : COLORS.title,
              }}
            >
              {price}
            </Text>
            {discount && (
              <Text
                style={{
                  ...FONTS.fontRegular,
                  fontSize: SIZES.fontSm,
                  textDecorationLine: 'line-through',
                  color: theme.dark ? COLORS.darkPlaceholder : COLORS.placeholder,
                }}
              >
                {discount}
              </Text>
            )}
            {(grid || CardStyle4) && (
              <Text
                style={{
                  ...FONTS.fontRegular,
                  fontSize: SIZES.fontSm,
                  color: theme.dark ? COLORS.darkPlaceholder : COLORS.placeholder,
                }}
              >
                {review}
              </Text>
            )}
          </View>

          {grid && (
            <Text
              style={{
                ...FONTS.fontRegular,
                fontSize: SIZES.fontSm,
                color: getStatusColor(status),
              }}
            >
              {status || '(2K Review)'}
            </Text>
          )}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: SIZES.margin / 2,
            }}
          >
            {grid ? (
              <Text
                style={{
                  ...FONTS.fontMedium,
                  fontSize: SIZES.fontSm,
                  color: COLORS.danger,
                }}
              >
                {offer}
              </Text>
            ) : CardStyle5 ? (
              <Text
                style={{
                  ...FONTS.fontMedium,
                  fontSize: SIZES.fontSm,
                  color: success ? COLORS.success : COLORS.danger,
                }}
              >
                {offer}
              </Text>
            ) : (
              <TouchableOpacity activeOpacity={0.5} onPress={onPress1}>
                <Text
                  style={{
                    ...FONTS.fontMedium,
                    fontSize: SIZES.fontSm,
                    color: COLORS.danger,
                  }}
                >
                  Remove From Wishlist
                </Text>
              </TouchableOpacity>
            )}

            {!removebtn && (
              <TouchableOpacity
                activeOpacity={0.5}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  position: 'absolute',
                  right: 0,
                  bottom: Platform.OS === 'web' ? -49 : -49,
                  backgroundColor: COLORS.primary,
                  borderBottomRightRadius: SIZES.radius,
                  borderTopLeftRadius: SIZES.radius,
                  height: 45,
                  width: 45,
                  justifyContent: 'center',
                }}
                onPress={onPress2}
              >
                <Image
                  style={{
                    height: 24,
                    width: 24,
                    resizeMode: 'contain',
                    tintColor: theme.dark ? COLORS.darkCard : COLORS.card,
                  }}
                  source={IMAGES.shopping}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {likeBtn && (
          <TouchableOpacity style={{ position: 'absolute', top: 0, left: 0 }}>
            <LikeBtn onPress={onPress1} id={id} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default CardStyle3;