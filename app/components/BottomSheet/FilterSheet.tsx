import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Animated, TextInput } from 'react-native';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS } from '../../constants/theme';
import { useTheme } from '@react-navigation/native';
import Button from '../Button/Button';
import { ScrollView } from 'react-native-gesture-handler';
import { IMAGES } from '../../constants/Images';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  sheetRef: any;
  onFiltersChange?: (filters: any) => void;
  initialFilters?: any;
};

const FilterSheet2 = ({ sheetRef, onFiltersChange, initialFilters }: Props) => {
  const theme = useTheme();
  const { colors }: { colors: any } = theme;
  const [fadeAnim] = useState(new Animated.Value(0));

  // Filter options data with proper typing
  const filterOptions = {
    gender: ["Men", "Women", "Kids"],
    occasion: ["DAILY_WEAR", "WEDDING", "TRADITIONAL"],
    colorAccent: ["Gold", "Silver", "Rose Gold"],
    materialFinish: ["GOLDCOATED", "SILVERCOATED"],
    size: ["2", "2.2", "2.4", "2.6", "2.8", "2.10"],
  };

  // State management with initial filters
  const [filters, setFilters] = useState({
    gender: initialFilters?.gender || null as string | null,
    occasion: initialFilters?.occasion || null as string | null,
    colorAccent: initialFilters?.colorAccent || null as string | null,
    materialFinish: initialFilters?.materialFinish || null as string | null,
    sizeName: initialFilters?.sizeName || null as string | null,
    minGrandTotal: initialFilters?.minGrandTotal || '' as string,
    maxGrandTotal: initialFilters?.maxGrandTotal || '' as string,
  });

  // Reset filters and animation when sheet opens
  useEffect(() => {
    const resetFilters = () => {
      setFilters({
        gender: initialFilters?.gender || null,
        occasion: initialFilters?.occasion || null,
        colorAccent: initialFilters?.colorAccent || null,
        materialFinish: initialFilters?.materialFinish || null,
        sizeName: initialFilters?.sizeName || null,
        minGrandTotal: initialFilters?.minGrandTotal || '',
        maxGrandTotal: initialFilters?.maxGrandTotal || '',
      });
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    };

    // Check if the sheetRef has the onOpen method (react-native-bottom-sheet)
    if (sheetRef.current?.onOpen) {
      const subscription = sheetRef.current.onOpen(resetFilters);
      return () => subscription?.();
    }

    // Alternative: Reset when component mounts (if using conditional rendering)
    resetFilters();
  }, [sheetRef, initialFilters]);

  const handleFilterChange = useCallback(
    (key: keyof typeof filters, value: string | null) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handlePriceChange = useCallback(
    (key: 'minGrandTotal' | 'maxGrandTotal', value: string) => {
      // Allow only numbers
      if (/^\d*$/.test(value)) {
        setFilters((prev) => ({ ...prev, [key]: value }));
      }
    },
    []
  );

  const handleApplyFilters = useCallback(() => {
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([key, value]) => {
        if (['minGrandTotal', 'maxGrandTotal'].includes(key)) {
          return value !== '' && !isNaN(parseFloat(value as string));
        }
        return value !== null;
      }).map(([key, value]) => {
        if (['minGrandTotal', 'maxGrandTotal'].includes(key)) {
          return [key, parseFloat(value as string)];
        }
        return [key, value];
      })
    );
    
    onFiltersChange?.(activeFilters);
    sheetRef.current?.close();
  }, [filters, onFiltersChange]);

  const handleResetFilters = useCallback(() => {
    setFilters({
      gender: null,
      occasion: null,
      colorAccent: null,
      materialFinish: null,
      sizeName: null,
      minGrandTotal: '',
      maxGrandTotal: '',
    });
    onFiltersChange?.({
      gender: null,
      occasion: null,
      colorAccent: null,
      materialFinish: null,
      sizeName: null,
      minGrandTotal: 0,
      maxGrandTotal: 10000000000,
    });
  }, [onFiltersChange]);

  const renderFilterOptions = useCallback(
    (data: string[], activeValue: string | null, filterKey: keyof typeof filters) => (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
        {data.map((item, index) => (
          <Animated.View
            key={index}
            style={{
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              }],
            }}
          >
            <TouchableOpacity
              onPress={() => handleFilterChange(filterKey, activeValue === item ? null : item)}
              style={[{
                backgroundColor: colors.card,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20,
                paddingHorizontal: 15,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: colors.border,
              }, activeValue === item && {
                backgroundColor: COLORS.primary,
                borderColor: COLORS.primary,
              }]}
            >
              <Text style={[{
                ...FONTS.fontMedium,
                fontSize: 13,
                color: colors.title,
              }, activeValue === item && {
                color: COLORS.white,
              }]}>
                {item}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    ),
    [colors, fadeAnim, handleFilterChange]
  );

  return (
    <LinearGradient
      colors={[colors.background, colors.background + 'CC']}
      style={[GlobalStyleSheet.container, { paddingTop: 0 }]}
    >
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingBottom: 15,
        marginHorizontal: -15,
        paddingHorizontal: 15,
        marginBottom: 10,
      }}>
        <Text style={[FONTS.Marcellus, { color: colors.title, fontSize: 20 }]}>Filters</Text>
        <TouchableOpacity
          style={{
            height: 38,
            width: 38,
            backgroundColor: colors.card,
            borderRadius: 38,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: theme.dark ? "#000" : "rgba(195, 123, 95, 0.20)",
            shadowOffset: { width: 3, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
          }}
          onPress={() => sheetRef.current?.close()}
        >
          <Image
            style={{ width: 18, height: 18, resizeMode: 'contain', tintColor: colors.title }}
            source={IMAGES.close}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Gender Filter */}
        <Animated.View style={{ opacity: fadeAnim, marginTop: 10 }}>
          <Text style={{ ...FONTS.fontMedium, fontSize: 18, color: colors.title }}>Gender</Text>
          {renderFilterOptions(filterOptions.gender, filters.gender, 'gender')}
        </Animated.View>

        {/* Occasion Filter */}
        <Animated.View style={{ opacity: fadeAnim, marginTop: 15 }}>
          <Text style={{ ...FONTS.fontMedium, fontSize: 18, color: colors.title }}>Occasion</Text>
          {renderFilterOptions(filterOptions.occasion, filters.occasion, 'occasion')}
        </Animated.View>

        {/* Color Accent Filter */}
        <Animated.View style={{ opacity: fadeAnim, marginTop: 15 }}>
          <Text style={{ ...FONTS.fontMedium, fontSize: 18, color: colors.title }}>Color Accent</Text>
          {renderFilterOptions(filterOptions.colorAccent, filters.colorAccent, 'colorAccent')}
        </Animated.View>

        {/* Material Finish Filter */}
        <Animated.View style={{ opacity: fadeAnim, marginTop: 15 }}>
          <Text style={{ ...FONTS.fontMedium, fontSize: 18, color: colors.title }}>Material Finish</Text>
          {renderFilterOptions(filterOptions.materialFinish, filters.materialFinish, 'materialFinish')}
        </Animated.View>

        {/* Size Filter */}
        <Animated.View style={{ opacity: fadeAnim, marginTop: 15 }}>
          <Text style={{ ...FONTS.fontMedium, fontSize: 18, color: colors.title }}>Size</Text>
          {renderFilterOptions(filterOptions.size, filters.sizeName, 'sizeName')}
        </Animated.View>

        {/* Price Range Filter */}
        <Animated.View style={{ opacity: fadeAnim, marginTop: 15 }}>
          <Text style={{ ...FONTS.fontMedium, fontSize: 18, color: colors.title }}>Price Range</Text>
          <View style={{ flexDirection: 'row', marginTop: 10, gap: 10 }}>
            <TextInput
              placeholder="Min Price"
              value={filters.minGrandTotal}
              onChangeText={(value) => handlePriceChange('minGrandTotal', value)}
              keyboardType="numeric"
              style={{
                flex: 1,
                height: 40,
                backgroundColor: colors.card,
                borderRadius: 8,
                paddingHorizontal: 12,
                color: colors.title,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />
            <TextInput
              placeholder="Max Price"
              value={filters.maxGrandTotal}
              onChangeText={(value) => handlePriceChange('maxGrandTotal', value)}
              keyboardType="numeric"
              style={{
                flex: 1,
                height: 40,
                backgroundColor: colors.card,
                borderRadius: 8,
                paddingHorizontal: 12,
                color: colors.title,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 10, paddingRight: 10, marginTop: 20, marginBottom: 130 }}>
          <View style={{ width: '50%' }}>
            <Button
              onPress={handleResetFilters}
              title="Reset"
              text={COLORS.title}
              color={COLORS.card}
              btnRounded
            />
          </View>
          <View style={{ width: '50%' }}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primary + 'CC']}
              style={{ borderRadius: 10 }}
            >
              <Button
                onPress={handleApplyFilters}
                title="Apply"
                text={COLORS.white}
                color="transparent"
                btnRounded
              />
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default FilterSheet2;