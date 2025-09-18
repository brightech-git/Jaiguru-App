import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../constants/StyleSheet';
import { FONTS } from '../constants/theme';
import Cardstyle2 from '../components/Card/Cardstyle2';
import { IMAGES } from '../constants/Images';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';

const PeopleData = [
  {
    image: IMAGES.item41,
    title: "Sterling Silver\nRing",
    price: "$80",
    discount: "$95",
    delivery: "Free delivery",
  },
  {
    image: IMAGES.item42,
    title: "Sapphire Stud\nEarrings",
    price: "$80",
    discount: "$95",
    delivery: "Free delivery",
    marginTop: 10
  },
  {
    image: IMAGES.item43,
    title: "Sterling Gold\nRing",
    price: "$80",
    discount: "$95",
    delivery: "Free delivery",
  },
  {
    image: IMAGES.item13,
    title: "Sapphire Stud\nEarrings",
    price: "$80",
    discount: "$95",
    delivery: "Free delivery",
    marginTop: 10
  }
];

type PeopleAlsoViewedProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

const PeopleAlsoViewed = ({ navigation }: PeopleAlsoViewedProps) => {
  const theme = useTheme();
  const { colors } = theme;

  return (
    <View style={{ backgroundColor: colors.background, width: '100%' }}>
      <View style={[GlobalStyleSheet.container, { marginBottom: 20 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ ...FONTS.Marcellus, fontSize: 20, color: colors.title }}>People Also Viewed</Text>
          <TouchableOpacity>
            <Text style={{ ...FONTS.fontRegular, fontSize: 13, color: colors.title }}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={[GlobalStyleSheet.row, { marginTop: 20 }]}>
          {PeopleData.map((data, index) => (
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

export default PeopleAlsoViewed;