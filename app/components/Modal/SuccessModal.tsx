import React, { useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useTheme, useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const SuccessModal = () => {
  const { colors }: { colors: any } = useTheme();
  const navigation = useNavigation<any>();

  // Auto navigate after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Home'); // change 'Home' to your actual home screen name
    }, 2000);

    return () => clearTimeout(timer); // cleanup
  }, [navigation]);

  const handleOkPress = () => {
    navigation.navigate('Home'); // manual navigation
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          alignItems: 'center',
          paddingHorizontal: 30,
          paddingVertical: 20,
          paddingBottom: 30,
          backgroundColor: colors.card,
          width: 320,
          borderRadius: SIZES.radius,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 5,
        }}
      >
        {/* Success Icon */}
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 15,
            marginTop: 10,
          }}
        >
          <View
            style={{
              height: 80,
              width: 80,
              opacity: 0.2,
              backgroundColor: COLORS.success,
              borderRadius: 80,
            }}
          />
          <View
            style={{
              height: 65,
              width: 65,
              backgroundColor: COLORS.success,
              borderRadius: 65,
              position: 'absolute',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FeatherIcon size={32} color={COLORS.white} name="check" />
          </View>
        </View>

        {/* Text */}
        <Text style={{ ...FONTS.h5, color: colors.title, marginBottom: 10 }}>
          Congratulations!
        </Text>
        <Text
          style={{ ...FONTS.font, color: colors.text, textAlign: 'center', marginBottom: 20 }}
        >
          Your Order Successfully Placed
        </Text>

        {/* OK Button */}
        <TouchableOpacity
          onPress={handleOkPress}
          style={{
            backgroundColor: COLORS.success,
            paddingVertical: 10,
            paddingHorizontal: 30,
            borderRadius: SIZES.radius,
          }}
        >
          <Text style={{ ...FONTS.font, color: COLORS.white }}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SuccessModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)', // transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
});
