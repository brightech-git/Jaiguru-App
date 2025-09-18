import React, { useEffect, useState, useCallback } from 'react';
import { useTheme } from '@react-navigation/native';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import { FONTS, COLORS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import CustomInput from '../../components/Input/CustomInput';
import Button from '../../components/Button/Button';
import { Feather, FontAwesome } from '@expo/vector-icons';
import SocialBtn from '../../components/Socials/SocialBtn';
import { Checkbox } from 'react-native-paper';
import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { useDispatch, useSelector } from 'react-redux';
import { signup, resetAuth, verifyOtp } from '../../redux/reducer/SignUpReducer';
import { RootState, AppDispatch } from '../../redux/store';
import OTPTextInput from 'react-native-otp-textinput';
import { validateEmail, validatePhoneNumber, validatePassword } from '../../constants/utils';

type SignUpScreenProps = StackScreenProps<RootStackParamList, 'SignUp'>;

const SignUp = ({ navigation }: SignUpScreenProps) => {
  const theme = useTheme();
  const { colors }: { colors: any } = theme;

  const dispatch = useDispatch<AppDispatch>();
  const {
    isLoading,
    otpLoading,
    otpVerified
  } = useSelector((state: RootState) => state.signUp);

  const [isChecked, setIsChecked] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState('');
  const [formErrors, setFormErrors] = useState({
    username: '',
    contactNumber: '',
    email: '',
    password: '',
  });

  const [form, setForm] = useState({
    username: '',
    contactNumber: '',
    email: '',
    password: '',
  });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm({ ...form, [key]: value });
    // Clear error when user types
    if (formErrors[key]) {
      setFormErrors({ ...formErrors, [key]: '' });
    }
  };

  const validateForm = useCallback(() => {
    let isValid = true;
    const newErrors = {
      username: '',
      contactNumber: '',
      email: '',
      password: '',
    };

    if (!form.username.trim()) {
      newErrors.username = 'Name is required';
      isValid = false;
    }

    if (!form.contactNumber.trim()) {
      newErrors.contactNumber = 'Mobile number is required';
      isValid = false;
    } else if (!validatePhoneNumber(form.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid mobile number';
      isValid = false;
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(form.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (!validatePassword(form.password)) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  }, [form]);

  const handleSignup = useCallback(() => {
    if (!isChecked) {
      Alert.alert('Terms', 'You must agree to the terms before signing up.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    dispatch(signup(form))
      .unwrap()
      .then(() => {
        setShowOtpForm(true);
        Alert.alert('OTP Sent', 'An OTP has been sent to your mobile number');
      })
      .catch((error: any) => {
        if (error.alreadyExists) {
          Alert.alert('Account Exists', error.message || 'User already exists');
        } else {
          Alert.alert('Error', error.message || 'Something went wrong');
        }
      });
  }, [isChecked, validateForm, form, dispatch]);

  const handleVerifyOtp = useCallback(() => {
    if (!otp || otp.length < 6) {
      Alert.alert('Error', 'Please enter a valid OTP');
      return;
    }
    dispatch(verifyOtp({ contactNumber: form.contactNumber, otp }))
      .unwrap()
      .then(() => {
        Alert.alert('Success', 'Account verified successfully!', [
          {
            text: 'OK',
            onPress: navigateToSignIn,
          },
        ]);
      })
      .catch((error: any) => {
        Alert.alert('Invalid OTP', error.message || 'The OTP you entered is incorrect. Please try again.');
      });
  }, [otp, form.contactNumber, dispatch, navigateToSignIn]);

  const handleResendOtp = useCallback(() => {
    setOtp('');
    dispatch(signup(form))
      .unwrap()
      .then(() => {
        Alert.alert('OTP Sent', 'A new OTP has been sent to your mobile number');
      })
      .catch((error: any) => {
        if (error.alreadyExists) {
          Alert.alert('Account Exists', error.message || 'User already exists');
        } else {
          Alert.alert('Error', error.message || 'Something went wrong');
        }
      });
  }, [form, dispatch]);

  const navigateToSignIn = useCallback(() => {
    setShowOtpForm(false);
    setOtp('');
    dispatch(resetAuth());
    navigation.navigate('SignIn');
  }, [navigation, dispatch]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setShowOtpForm(false);
      setOtp('');
      dispatch(resetAuth());
    });
    return unsubscribe;
  }, [navigation, dispatch]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
          {/* Top Banner */}
          <View>
            <View style={styles.bannerCircle}>
              <Image
                style={styles.bannerImage}
                source={IMAGES.item5}
                resizeMode="cover"
              />
              <View style={styles.bannerOverlay} />
            </View>
            <View style={styles.bannerTextWrapper}>
              <Text style={styles.bannerTitle}>
                {showOtpForm ? 'Verify OTP' : 'Create your Account'}
              </Text>
            </View>
          </View>

          {/* Main Card */}
          <View style={[GlobalStyleSheet.container, { paddingTop: 0, marginTop: -200 }]}>
            <View style={[styles.cardWrapper, Platform.OS === 'ios' && { backgroundColor: colors.card }]}>
              <View style={styles.cardContent}>
                {showOtpForm ? (
                  <View style={styles.otpContainer}>
                    <Text style={styles.otpTitle(colors)}>Verify OTP</Text>
                    <Text style={styles.otpSubtitle(colors)}>
                      Enter the 6-digit code sent to{"\n"}
                      <Text style={styles.phoneNumberHighlight}>{form.contactNumber}</Text>
                    </Text>

                    <OTPTextInput
                      handleTextChange={setOtp}
                      inputCount={6}
                      keyboardType="number-pad"
                      tintColor={COLORS.primary}
                      offTintColor={colors.border}
                      textInputStyle={styles.otpBox(colors)}
                      autoFocus
                    />

                    <TouchableOpacity 
                      onPress={handleResendOtp} 
                      style={{ marginTop: 15 }}
                      disabled={otpLoading}
                    >
                      <Text style={styles.resendLink}>
                        Didn't receive OTP?{' '}
                        <Text style={styles.resendLinkUnderline}>Resend</Text>
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={styles.formTitle(colors)}>
                      Welcome Back! Please Enter{"\n"}Your Details
                    </Text>

                    <View style={styles.fieldWrapper}>
                      <Text style={styles.fieldLabel(colors)}>Name<Text style={styles.required}>*</Text></Text>
                      <CustomInput 
                        onChangeText={(val) => handleChange('username', val)} 
                        value={form.username}
                        error={formErrors.username}
                      />
                      {formErrors.username ? (
                        <Text style={styles.errorText}>{formErrors.username}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldWrapper}>
                      <Text style={styles.fieldLabel(colors)}>Mobile Number<Text style={styles.required}>*</Text></Text>
                      <CustomInput
                        onChangeText={(val) => handleChange('contactNumber', val)}
                        value={form.contactNumber}
                        keyboardType="phone-pad"
                        error={formErrors.contactNumber}
                      />
                      {formErrors.contactNumber ? (
                        <Text style={styles.errorText}>{formErrors.contactNumber}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldWrapper}>
                      <Text style={styles.fieldLabel(colors)}>Email Address<Text style={styles.required}>*</Text></Text>
                      <CustomInput
                        onChangeText={(val) => handleChange('email', val)}
                        value={form.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={formErrors.email}
                      />
                      {formErrors.email ? (
                        <Text style={styles.errorText}>{formErrors.email}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldWrapper}>
                      <Text style={styles.fieldLabel(colors)}>Password<Text style={styles.required}>*</Text></Text>
                      <CustomInput
                        type="password"
                        onChangeText={(val) => handleChange('password', val)}
                        value={form.password}
                        error={formErrors.password}
                      />
                      {formErrors.password ? (
                        <Text style={styles.errorText}>{formErrors.password}</Text>
                      ) : null}
                    </View>

                    <Checkbox.Item
                      onPress={() => setIsChecked(!isChecked)}
                      position="leading"
                      label="I agree to all Term, Privacy and Fees"
                      color={colors.title}
                      uncheckedColor={colors.textLight}
                      status={isChecked ? 'checked' : 'unchecked'}
                      style={styles.checkbox}
                      labelStyle={styles.checkboxLabel(colors)}
                    />
                  </>
                )}
              </View>
            </View>

            {/* Action Button */}
            <View style={styles.buttonContainer}>
              <Button
                title={
                  showOtpForm
                    ? otpLoading
                      ? 'Verifying...'
                      : 'Verify OTP'
                    : isLoading
                      ? 'Signing Up...'
                      : 'Sign Up'
                }
                btnRounded
                fullWidth
                disabled={showOtpForm ? otpLoading : isLoading}
                onPress={showOtpForm ? handleVerifyOtp : handleSignup}
                icon={
                  isLoading || otpLoading ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <Feather size={24} color={COLORS.primary} name="arrow-right" />
                  )
                }
                color={COLORS.primary}
              />
            </View>
          </View>

          {/* Social Sign In */}
          {!showOtpForm && (
            <View style={styles.socialContainer}>
              <View style={styles.socialDivider(colors)}>
                <View style={styles.dividerLine(colors)} />
                <Text style={styles.dividerText(colors)}>Or continue with</Text>
                <View style={styles.dividerLine(colors)} />
              </View>
              <View>
                <SocialBtn
                  icon={<Image style={styles.socialIcon} source={IMAGES.google2} />}
                  rounded
                  color={theme.dark ? '#000' : '#FFFFFF'}
                  text="Sign in with google"
                />
                <SocialBtn
                  icon={<FontAwesome name="apple" size={20} color={colors.title} />}
                  rounded
                  color={theme.dark ? '#000' : '#FFFFFF'}
                  text="Sign in with apple"
                />
              </View>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText(colors)}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={navigateToSignIn}>
              <Text style={styles.signInLink(colors)}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  bannerCircle: {
    width: 600,
    height: 500,
    backgroundColor: COLORS.primary,
    borderRadius: 250,
    marginLeft: -95,
    marginTop: -220,
    overflow: 'hidden',
  },
  bannerImage: {
    height: undefined,
    aspectRatio: 2.3 / 1.2,
    resizeMode: 'cover',
    width: '100%',
    marginTop: 220,
  },
  bannerOverlay: {
    width: 600,
    height: 500,
    backgroundColor: '#360F00',
    borderRadius: 250,
    position: 'absolute',
    opacity: 0.8,
  },
  bannerTextWrapper: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  bannerTitle: {
    ...FONTS.Marcellus,
    fontSize: 23,
    color: COLORS.card,
  },
  cardWrapper: {
    shadowColor: 'rgba(195, 123, 95, 0.20)',
    shadowOffset: { width: 2, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderRadius: 35,
    elevation: 5,
  },
  cardContent: {
    backgroundColor: COLORS.card,
    padding: 30,
    borderRadius: 40,
    paddingBottom: 40,
  },
  otpContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  otpTitle: (colors: any) => ({
    ...FONTS.Marcellus,
    fontSize: 22,
    color: colors.title,
    marginBottom: 8,
  }),
  otpSubtitle: (colors: any) => ({
    ...FONTS.fontRegular,
    fontSize: 14,
    color: colors.text,
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 20,
  }),
  phoneNumberHighlight: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  otpBox: (colors: any) => ({
    borderWidth: 1,
    borderRadius: 10,
    width: 45,
    height: 50,
    color: colors.title,
    fontSize: 18,
    backgroundColor: colors.background,
  }),
  resendLink: {
    color: COLORS.primary,
    fontSize: 14,
  },
  resendLinkUnderline: {
    textDecorationLine: 'underline',
  },
  formTitle: (colors: any) => ({
    ...FONTS.Marcellus,
    fontSize: 18,
    color: colors.title,
    lineHeight: 24,
    marginBottom: 10,
  }),
  fieldWrapper: {
    marginBottom: 8,
    marginTop: 15,
  },
  fieldLabel: (colors: any) => ({
    ...FONTS.fontRegular,
    fontSize: 15,
    color: colors.title,
    marginBottom: 5,
  }),
  required: {
    color: '#FF0000',
  },
  errorText: {
    ...FONTS.fontRegular,
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 5,
  },
  checkbox: {
    paddingHorizontal: 0,
    paddingVertical: 2,
    marginTop: 15,
  },
  checkboxLabel: (colors: any) => ({
    ...FONTS.fontRegular,
    fontSize: 15,
    color: colors.title,
  }),
  buttonContainer: {
    paddingHorizontal: 60,
    marginTop: -30,
  },
  socialContainer: {
    ...GlobalStyleSheet.container,
    paddingHorizontal: 20,
    flex: 1,
    paddingTop: 5,
  },
  socialDivider: (colors: any) => ({
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  }),
  dividerLine: (colors: any) => ({
    height: 1,
    flex: 1,
    backgroundColor: colors.title,
    opacity: 0.3,
  }),
  dividerText: (colors: any) => ({
    ...FONTS.fontMedium,
    color: colors.text,
    marginHorizontal: 15,
    fontSize: 13,
  }),
  socialIcon: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
    paddingBottom: Platform.select({ ios: 30, android: 10 }),
  },
  footerText: (colors: any) => ({
    ...FONTS.fontRegular,
    fontSize: 15,
    color: colors.title,
  }),
  signInLink: (colors: any) => ({
    ...FONTS.fontMedium,
    borderBottomWidth: 1,
    borderBottomColor: colors.title,
    color: colors.title,
  }),
});

export default SignUp;