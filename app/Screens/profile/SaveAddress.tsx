import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@react-navigation/native';
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS } from '../../constants/theme';
import Button from '../../components/Button/Button';
import { ScrollView } from 'react-native-gesture-handler';
import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { useAddress } from '../../Context/AddressContext';
import { Address } from '../../types';

type SaveAddressScreenProps = StackScreenProps<RootStackParamList, 'SaveAddress'>;

const SaveAddress = ({ navigation, route }: SaveAddressScreenProps) => {
  const theme = useTheme();
  const { colors }: { colors: any } = theme;
  const { addresses, loading, getAddresses, deleteAddress } = useAddress();
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null); // Track which address is being deleted
  const [initialLoading, setInitialLoading] = useState(true); // Only for initial load

  // Track if coming from Checkout
  const fromCheckout = route.params?.fromCheckout || false;

  // Memoize fetchAddresses to prevent re-creation
  const fetchAddresses = useCallback(async () => {
    try {
      await getAddresses();
    } catch (error) {
      Alert.alert('Error', 'Failed to load addresses. Please try again.');
      console.error('Error fetching addresses:', error);
    } finally {
      setRefreshing(false);
      setInitialLoading(false);
    }
  }, [getAddresses]);

  // Combine useEffect hooks for initialization and focus handling
  useEffect(() => {
    // Initial fetch
    fetchAddresses();

    // Handle route params for selectedAddressId
    if (route.params?.selectedAddressId) {
      setSelectedAddress(route.params.selectedAddressId);
    }

    // Set up focus listener
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAddresses();
    });

    return unsubscribe;
  }, [fetchAddresses, navigation, route.params?.selectedAddressId]);

  // Set default selected address when addresses change
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      setSelectedAddress(defaultAddress?.id || addresses[0].id);
    }
  }, [addresses, selectedAddress]);

  const getAddressIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'home':
        return IMAGES.home;
      case 'office':
        return IMAGES.map;
      case 'shop':
        return IMAGES.shop;
      default:
        return IMAGES.home;
    }
  };

  const formatAddress = (address: Address) => {
    return `${address.addressLine}, ${address.locality}, ${address.city}, ${address.state} - ${address.pincode}`;
  };

  const handleEditAddress = (address: Address) => {
    navigation.navigate('SavedAddresses', {
      address,
      isEditing: true,
      fromCheckout,
    });
  };

  const handleDeleteAddress = async (addressId: number) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            setDeleteLoadingId(addressId);
            await deleteAddress(addressId);
            if (selectedAddress === addressId) {
              const remainingAddresses = addresses.filter((a) => a.id !== addressId);
              setSelectedAddress(remainingAddresses.length > 0 ? remainingAddresses[0].id : null);
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to delete address. Please try again.');
          } finally {
            setDeleteLoadingId(null);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAddresses();
  }, [fetchAddresses]);

  const handleSaveAddress = () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select an address');
      return;
    }
    if (fromCheckout) {
      navigation.navigate('Checkout', {
        selectedAddressId: selectedAddress,
        products: route.params?.products || [],
        fromCheckout: true,
      });
    } else {
      navigation.goBack();
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
        <Header title="Delivery Address" leftIcon="back" onPressLeft={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
      <Header
        title="Delivery Address"
        leftIcon="back"
        onPressLeft={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 150 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={[GlobalStyleSheet.container, { paddingTop: 10 }]}>
          {addresses.length > 0 ? (
            addresses.map((address) => (
              <View
                key={address.id}
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  paddingBottom: 15,
                  marginTop: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() => setSelectedAddress(address.id)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <View
                      style={[
                        {
                          shadowColor: 'rgba(195,135,95,0.30)',
                          shadowOffset: { width: -5, height: 15 },
                          shadowOpacity: 0.1,
                          shadowRadius: 5,
                        },
                        Platform.OS === 'ios' && {
                          backgroundColor: colors.card,
                          borderRadius: 10,
                        },
                      ]}
                    >
                      <View
                        style={{
                          height: 40,
                          width: 40,
                          borderRadius: 10,
                          backgroundColor: colors.card,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Image
                          style={{
                            height: 20,
                            width: 20,
                            tintColor: COLORS.primary,
                            resizeMode: 'contain',
                          }}
                          source={getAddressIcon(address.name)}
                        />
                      </View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          ...FONTS.fontMedium,
                          fontSize: 16,
                          color: colors.title,
                        }}
                      >
                        {address.name}
                      </Text>
                      <Text
                        style={{
                          ...FONTS.fontRegular,
                          fontSize: 14,
                          color: colors.title,
                        }}
                      >
                        {formatAddress(address)}
                      </Text>
                      {address.alternatePhone && (
                        <Text
                          style={{
                            ...FONTS.fontRegular,
                            fontSize: 12,
                            color: colors.text,
                            marginTop: 4,
                          }}
                        >
                          Alternate Phone: {address.alternatePhone}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View
                    style={[
                      {
                        shadowColor: 'rgba(195, 123, 95, 0.20)',
                        shadowOffset: { width: 2, height: 15 },
                        shadowOpacity: 0.1,
                        shadowRadius: 5,
                      },
                      Platform.OS === 'ios' && {
                        backgroundColor: colors.card,
                        borderRadius: 50,
                      },
                    ]}
                  >
                    <View
                      style={[
                        {
                          borderWidth: 1,
                          width: 24,
                          height: 24,
                          borderRadius: 50,
                          borderColor: theme.colors.card,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: theme.colors.card,
                        },
                        selectedAddress === address.id && {
                          backgroundColor: COLORS.primary,
                          borderColor: COLORS.primary,
                        },
                      ]}
                    >
                      <View
                        style={[
                          {
                            width: 14,
                            height: 14,
                            backgroundColor: theme.colors.background,
                            borderRadius: 50,
                          },
                          selectedAddress === address.id && {
                            backgroundColor: theme.colors.card,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Action Buttons */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    marginTop: 10,
                    gap: 10,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => handleEditAddress(address)}
                    style={{
                      backgroundColor: colors.card,
                      paddingVertical: 8,
                      paddingHorizontal: 15,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text
                      style={{
                        ...FONTS.fontRegular,
                        color: colors.title,
                      }}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteAddress(address.id)}
                    style={{
                      backgroundColor: colors.card,
                      paddingVertical: 8,
                      paddingHorizontal: 15,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    disabled={deleteLoadingId === address.id}
                  >
                    {deleteLoadingId === address.id ? (
                      <ActivityIndicator size="small" color={COLORS.danger} />
                    ) : (
                      <Text
                        style={{
                          ...FONTS.fontRegular,
                          color: COLORS.danger,
                        }}
                      >
                        Delete
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 30,
              }}
            >
              <Text
                style={{
                  ...FONTS.fontRegular,
                  color: colors.title,
                  marginBottom: 20,
                }}
              >
                No addresses found
              </Text>
              <Button
                title="Add New Address"
                onPress={() => navigation.navigate('SavedAddresses', { fromCheckout })}
                color={COLORS.primary}
                btnRounded
                small
              />
            </View>
          )}

          {/* Add Address Button */}
          {addresses.length > 0 && (
            <View
              style={[
                {
                  shadowColor: 'rgba(195,135,95,0.30)',
                  shadowOffset: { width: -5, height: 15 },
                  shadowOpacity: 0.1,
                  shadowRadius: 5,
                },
                Platform.OS === 'ios' && {
                  backgroundColor: colors.card,
                  borderRadius: 10,
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => navigation.navigate('SavedAddresses', { fromCheckout })}
                activeOpacity={0.7}
                style={{
                  height: 48,
                  width: '100%',
                  borderWidth: 1,
                  borderColor: theme.dark ? COLORS.white : colors.border,
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 10,
                  backgroundColor: colors.card,
                  marginTop: 30,
                }}
              >
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Image
                    style={{
                      height: 20,
                      width: 20,
                      resizeMode: 'contain',
                      tintColor: colors.title,
                    }}
                    source={IMAGES.plus}
                  />
                  <Text
                    style={{
                      ...FONTS.fontMedium,
                      fontSize: 14,
                      color: colors.title,
                    }}
                  >
                    Add New Address
                  </Text>
                </View>
                <Image
                  style={{
                    height: 16,
                    width: 16,
                    resizeMode: 'contain',
                    tintColor: colors.title,
                  }}
                  source={IMAGES.rightarrow}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Save Button */}
      {addresses.length > 0 && (
        <View
          style={[
            {
              position: 'absolute',
              bottom: 0,
              width: '100%',
              shadowColor: 'rgba(195, 123, 95, 0.25)',
              shadowOffset: { width: 2, height: -20 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
            },
            Platform.OS === 'ios' && {
              backgroundColor: colors.card,
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
              bottom: 30,
            },
          ]}
        >
          <View
            style={{
              height: 88,
              backgroundColor: colors.card,
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
            }}
          >
            <View
              style={[GlobalStyleSheet.container, { paddingHorizontal: 10, marginTop: 15, paddingTop: 0 }]}
            >
              <Button
                title="Save Address"
                btnRounded
                onPress={handleSaveAddress}
                color={COLORS.primary}
                disabled={!selectedAddress || deleteLoadingId !== null}
              />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default SaveAddress;