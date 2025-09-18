// ImageSwper2.tsx
import React, { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, { 
  interpolate, 
  useAnimatedStyle, 
  useSharedValue, 
  useAnimatedScrollHandler 
} from 'react-native-reanimated';
import CardStyle1 from './Card/CardStyle1';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { addProductToWishList, removeProductFromWishList } from '../redux/reducer/wishListReducer';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface ProductItem {
  id: string | number;
  SNO?: string; // Added for wishlist compatibility
  image?: any;
  title?: string;
  price?: string;
  discount?: string;
  offer?: string;
  delivery?: string;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
  // more fields as needed
}

interface ImageSwper2Props {
  data: ProductItem[];
  onProductPress: (id: string | number) => void;
  favoriteIcon?: React.ReactNode;
}

const ImageSwper2 = ({ data, onProductPress, favoriteIcon }: ImageSwper2Props) => {
  const [newData] = useState([{ key: 'space-left' }, ...data, { key: 'space-right' }]);
  const { width } = useWindowDimensions();
  const SIZE = width * 0.6;
  const SPACER = (width - SIZE) / 2;
  const x = useSharedValue(0);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  
  // Get wishlist from Redux store
  const { wishList } = useSelector((state: any) => state.wishList);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      x.value = event.contentOffset.x;
    },
  });

  // Check if item is in wishlist
  const isInWishlist = (productId: string | number) => {
    return wishList.some((item: any) => item.SNO === productId || item.id === productId);
  };

  // Toggle wishlist status
  const toggleWishlist = (item: ProductItem) => {
    const productId = item.SNO || item.id;
    if (isInWishlist(productId)) {
      dispatch(removeProductFromWishList(productId));
    } else {
      dispatch(addProductToWishList({
        SNO: productId.toString(),
        SUBITEMNAME: item.title || '',
        GrandTotal: parseFloat(item.price || '0'),
        ImagePath: typeof item.image === 'string' ? item.image : '',
        // Add other necessary product fields
      }));
    }
  };

  return (
    <Animated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      bounces={false}
      scrollEventThrottle={16}
      snapToInterval={SIZE}
      decelerationRate="fast"
      onScroll={scrollHandler}
      contentContainerStyle={{ paddingVertical: 10 }}
    >
      {newData.map((item, index) => {
        if (item.key) {
          return <View key={`spacer-${index}`} style={{ width: SPACER }} />;
        }

        const style = useAnimatedStyle(() => {
          const scale = interpolate(
            x.value,
            [(index - 2) * SIZE, (index - 1) * SIZE, index * SIZE],
            [0.8, 1, 0.8]
          );
          return {
            transform: [{ scale }],
          };
        });

        const productId = item.SNO || item.id;
        const inWishlist = isInWishlist(productId);

        return (
          <View key={item.id} style={{ width: SIZE, alignItems: 'center' }}>
            <Animated.View style={[style, { overflow: 'hidden' }]}>
              <CardStyle1
                id={productId}
                image={item.image}
                title={item.title || ''}
                price={item.price || ''}
                discount={item.discount || ''}
                offer={item.offer || ''}
                delivery={item.delivery || ''}
                onPress={() => onProductPress(productId)}
                Cardstyle4
                onPress1={() => toggleWishlist(item)}
                wishlistActive={inWishlist}
                likebtn
                wishlistIcon={
                  <Feather 
                    name="heart" 
                    size={20} 
                    color={inWishlist ? COLORS.danger : COLORS.title} 
                    fill={inWishlist ? COLORS.danger : 'none'}
                  />
                }
              />
            </Animated.View>
          </View>
        );
      })}
    </Animated.ScrollView>
  );
};

export default ImageSwper2;