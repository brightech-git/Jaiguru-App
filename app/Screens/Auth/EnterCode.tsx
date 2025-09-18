import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import Button from '../../components/Button/Button';
import { Feather } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { resetPassword, forgotPassword } from '../../Services/ForgotService';

type EnterCodeScreenProps = StackScreenProps<RootStackParamList, 'EnterCode'>;

const EnterCode = ({ navigation, route }: EnterCodeScreenProps) => {
  const theme = useTheme();
  const { colors }: { colors: any } = theme;

  const { contactNumber } = route.params || {};
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [timer, setTimer] = useState(30); // countdown in seconds
  const [canResend, setCanResend] = useState(false);

  const inputs = useRef<TextInput[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timer > 0) {
      setCanResend(false);
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleOtpChange = (text: string, index: number) => {
    if (/^\d?$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      if (text && index < 5) {
        inputs.current[index + 1].focus();
      }
      if (!text && index > 0) {
        inputs.current[index - 1].focus();
      }
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      Alert.alert('Error', 'Please enter the full OTP code.');
      return;
    }
    if (!newPassword) {
      Alert.alert('Error', 'Please enter a new password.');
      return;
    }

    try {
      setLoading(true);
      const res = await resetPassword(contactNumber, otpCode, newPassword);
      setLoading(false);

      if (res?.message || res?.status === 200) {
        Alert.alert('Success', 'Password has been reset successfully!');
        navigation.navigate('SignIn');
      } else {
        Alert.alert('Error', res?.error || res?.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Unable to verify OTP. Try again later.');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      setLoading(true);
      const res = await forgotPassword(contactNumber);
      setLoading(false);

      if (res?.message || res?.status === 200) {
        Alert.alert('Success', 'OTP has been resent successfully!');
        setTimer(30); // restart timer
      } else {
        Alert.alert('Error', res?.error || res?.message || 'Unable to resend OTP.');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Something went wrong while resending OTP.');
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View>
          <View
            style={{
              width: 600,
              height: 500,
              backgroundColor: COLORS.primary,
              borderRadius: 250,
              marginLeft: -95,
              marginTop: -220,
              overflow: 'hidden',
            }}
          >
            <Image
              style={{
                height: undefined,
                aspectRatio: 2.3 / 1.2,
                resizeMode: 'contain',
                width: '100%',
                marginTop: 220,
              }}
              source={IMAGES.item7}
            />
            <View
              style={{
                width: 600,
                height: 500,
                backgroundColor: '#360F00',
                borderRadius: 250,
                position: 'absolute',
                opacity: 0.8,
              }}
            />
          </View>
          <View style={{ position: 'absolute', top: 30, left: 20 }}>
            <Text
              style={{
                ...FONTS.Marcellus,
                fontSize: 28,
                color: COLORS.white,
              }}
            >
              Enter One Time{'\n'}Password (OTP)
            </Text>
          </View>
        </View>

        <View
          style={[
            GlobalStyleSheet.container,
            { paddingTop: 0, marginTop: -150, flex: 1 },
          ]}
        >
          <View
            style={[
              {
                shadowColor: 'rgba(195, 123, 95, 0.20)',
                shadowOffset: { width: 2, height: 20 },
                shadowOpacity: 0.1,
                shadowRadius: 5,
              },
              Platform.OS === 'ios' && {
                backgroundColor: colors.card,
                borderRadius: 35,
              },
            ]}
          >
            <View
              style={{
                backgroundColor: colors.card,
                padding: 30,
                borderRadius: 40,
                paddingBottom: 50,
              }}
            >
              <Text
                style={{
                  ...FONTS.Marcellus,
                  fontSize: 20,
                  color: colors.title,
                  lineHeight: 28,
                }}
              >
                An authentication code has been sent to{'\n'}
                <Text style={{ color: '#C37B5F' }}>{contactNumber}</Text>
              </Text>

              {/* OTP Boxes */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 20,
                }}
              >
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(el) => (inputs.current[index] = el!)}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    style={{
                      borderBottomWidth: 2,
                      borderColor: COLORS.primary,
                      textAlign: 'center',
                      fontSize: 20,
                      padding: 10,
                      width: 45,
                      color: colors.title,
                      backgroundColor: '#f8f8f8',
                      borderRadius: 8,
                    }}
                  />
                ))}
              </View>

              {/* New Password */}
              <View style={{ marginTop: 30 }}>
                <Text
                  style={{
                    ...FONTS.fontRegular,
                    fontSize: 15,
                    color: colors.title,
                    paddingLeft: 5,
                    marginBottom: 8,
                  }}
                >
                  New Password<Text style={{ color: '#FF0000' }}>*</Text>
                </Text>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder="Enter new password"
                  placeholderTextColor="#999"
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    color: colors.title,
                  }}
                />
              </View>

              {/* Resend */}
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {canResend ? (
                  <TouchableOpacity onPress={handleResend}>
                    <Text
                      style={{
                        ...FONTS.fontMedium,
                        borderBottomWidth: 1,
                        borderBottomColor: COLORS.danger,
                        color: COLORS.danger,
                      }}
                    >
                      Resend OTP
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text
                    style={{
                      ...FONTS.fontRegular,
                      fontSize: 14,
                      color: '#999',
                    }}
                  >
                    Resend available in {timer}s
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 55, marginTop: -30 }}>
            <Button
              title={loading ? 'Verifying...' : 'Verify'}
              btnRounded
              fullWidth
              disabled={loading}
              onPress={handleVerifyOTP}
              icon={
                <Feather
                  size={24}
                  color={COLORS.primary}
                  name={'arrow-right'}
                />
              }
              color={COLORS.primary}
            />
          </View>
        </View>

        <View style={{ paddingBottom: 15 }}>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                ...FONTS.fontRegular,
                fontSize: 15,
                color: colors.title,
              }}
            >
              Back To{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text
                style={{
                  ...FONTS.fontMedium,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.title,
                  color: colors.title,
                }}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EnterCode;
