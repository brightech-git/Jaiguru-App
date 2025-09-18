import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { GlobalStyleSheet } from '../constants/StyleSheet';
import { COLORS, FONTS } from '../constants/theme';
import { IMAGES } from '../constants/Images';
import { useTheme } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import Cardstyle2 from '../components/Card/Cardstyle2';

// Static data for this component
const People2Data = [
  {
    image: IMAGES.item45,
    title: "Dazzling Gold\nBracelet",
    price: "$80",
    discount: "$95",
    delivery: "Free delivery",
    marginTop: 10
  },
  {
    image: IMAGES.item44,
    title: "Dazzling Gold\nBracelet",
    price: "$80",
    discount: "$95",
    delivery: "Free delivery",
  },
  {
    image: IMAGES.item47,
    title: "Opal Statement\nNecklace",
    price: "$80",
    discount: "$95",
    delivery: "Free delivery",
    marginTop: 10
  },
  {
    image: IMAGES.item46,
    title: "Sparkling Silver\nNecklace",
    price: "$80",
    discount: "$95",
    delivery: "Free delivery",
  },
];

type GreatSavingsSectionProps = StackScreenProps<RootStackParamList, 'Home'>;

const GreatSavingsSection = ({ navigation }: GreatSavingsSectionProps) => {
  const theme = useTheme();
  const { colors } = theme;

  return (
    <View style={{ backgroundColor: colors.background, width: '100%' }}>
      <View style={[GlobalStyleSheet.container, { marginVertical: 5, marginTop: 0 }]}>
        <Text style={{ ...FONTS.Marcellus, fontSize: 20, color: colors.title }}>Great Saving On Everyday Essentials</Text>
        <Text style={{ ...FONTS.fontRegular, fontSize: 13, color: colors.title }}>Up to 60% off + up to $107 Cash BACK</Text>
        <View style={[GlobalStyleSheet.row, { marginTop: 20 }]}>
          {People2Data.map((data, index) => (
            <View style={[GlobalStyleSheet.col50, { marginBottom: 0 }]} key={index}>
              <Cardstyle2
                id=""
                image={data.image}
                title={data.title}
                price={data.price}
                discount={data.discount}
                delivery={data.delivery}
                onPress={() => navigation.navigate('ProductDetails')}
                marginTop={data.marginTop}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default GreatSavingsSection;