import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { COLORS, FONTS, SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

const RingsPage = ({ navigation }) => {
  const { colors, dark } = useTheme();
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    // Animate on component mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Sample ring images with item and subitem names
  const ringImages = [
    {
      id: 1,
      itemName: 'Rings',
      subItemName: 'WEDDING RINGS',
      image: require('../assets/image1/ring3.webp'),
      description: 'Symbolize eternal love with our exquisite wedding bands',
    },
    {
      id: 2,
      itemName: 'Rings',
      subItemName: 'ENGAGEMENT RINGS',
      image: require('../assets/image1/ring4.webp'),
      description: 'Sparkling diamonds for the perfect proposal',
    },
    {
      id: 3,
      itemName: 'Rings',
      subItemName: 'COUPLE RINGS',
      image: require('../assets/image1/ring2.webp'),
      description: 'Matching sets to celebrate your connection',
    },
  ];

  const handleImagePress = (itemName: string, subItemName: string) => {
    // Navigate to Products page with parameters
    navigation.navigate('Products', {
      itemName,
      subItemName,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: dark ? COLORS.darkBackground : COLORS.background }]}>
      {/* Animated Header */}
      <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
        <Text style={[styles.header, { color: dark ? COLORS.darkTitle : COLORS.title }]}>
          Explore Our Rings
        </Text>
      </Animated.View>
      
      {/* Content - Images */}
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* First row with two images */}
        <View style={styles.row}>
          <Animated.View 
            style={[
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              styles.animationWrapper
            ]}
          >
            <TouchableOpacity
              style={[styles.imageContainer, styles.halfWidth, { backgroundColor: dark ? COLORS.darkCard : COLORS.card }]}
              onPress={() => handleImagePress(ringImages[0].itemName, ringImages[0].subItemName)}
              activeOpacity={0.9}
            >
              <Image
                source={ringImages[0].image}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={[styles.imageOverlay, { backgroundColor: dark ? COLORS.darkOverlay : COLORS.overlay }]}>
                <Text style={[styles.imageText, { color: COLORS.white }]}>
                  {ringImages[0].subItemName}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
          
          <Animated.View 
            style={[
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              styles.animationWrapper
            ]}
          >
            <TouchableOpacity
              style={[styles.imageContainer, styles.halfWidth, styles.secondImage, { backgroundColor: dark ? COLORS.darkCard : COLORS.card }]}
              onPress={() => handleImagePress(ringImages[1].itemName, ringImages[1].subItemName)}
              activeOpacity={0.9}
            >
              <Image
                source={ringImages[1].image}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={[styles.imageOverlay, { backgroundColor: dark ? COLORS.darkOverlay : COLORS.overlay }]}>
                <Text style={[styles.imageText, { color: COLORS.white }]}>
                  {ringImages[1].subItemName}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
        
        {/* Second row with one centered image */}
        <View style={styles.row}>
          <Animated.View 
            style={[
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              styles.animationWrapper
            ]}
          >
            <TouchableOpacity
              style={[styles.imageContainer, styles.fullWidth, { backgroundColor: dark ? COLORS.darkCard : COLORS.card }]}
              onPress={() => handleImagePress(ringImages[2].itemName, ringImages[2].subItemName)}
              activeOpacity={0.9}
            >
              <Image
                source={ringImages[2].image}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={[styles.imageOverlay, { backgroundColor: dark ? COLORS.darkOverlay : COLORS.overlay }]}>
                <Text style={[styles.imageText, { color: COLORS.white }]}>
                  {ringImages[2].subItemName}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginBottom: SIZES.margin / 2,
  },
  headerContainer: {
    padding: SIZES.padding,
    alignItems: 'center',
    paddingTop: SIZES.padding * 1.5,
  },
  header: {
    fontSize: SIZES.h4,
    color: COLORS.title,
    // fontWeight: '600',
    letterSpacing: 1,
    ...FONTS.h3,
  },
  content: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.margin,
  },
  animationWrapper: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius_lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: SIZES.radius,
    elevation: 4,
    overflow: 'hidden',
  },
  halfWidth: {
    width: (width - SIZES.padding * 2 - SIZES.margin) / 2,
  },
  secondImage: {
    marginLeft: SIZES.margin,
  },
  fullWidth: {
    width: width - SIZES.padding * 2,
  },
  image: {
    width: '100%',
    height: 200,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.overlay,
    padding: SIZES.padding,
    alignItems: 'center',
  },
  imageText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    ...FONTS.fontBold,
  },
});

export default RingsPage;