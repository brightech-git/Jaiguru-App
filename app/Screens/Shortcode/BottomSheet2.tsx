import { View, Text } from 'react-native';
import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback } from 'react';
import { useTheme } from '@react-navigation/native';
import RBSheet from 'react-native-raw-bottom-sheet';
import FilterSheet2 from '../../components/BottomSheet/FilterSheet';
import GenderSheet2 from '../../components/BottomSheet/GenderSheet';
import LanguageoptionSheet from '../../components/BottomSheet/LanguageoptionSheet';
import ShortSheet2 from '../../components/BottomSheet/ShortShreet';

type Props = {
  height?: string;
  onFiltersChange?: (filters: any) => void;
  initialFilters?: any;
  currentFilters?: any;
};

const BottomSheet2 = forwardRef(({ height, onFiltersChange, initialFilters }: Props, ref) => {
  const theme = useTheme();
  const { colors }: { colors: any } = theme;

  const rbsheetRef = useRef<any>();
  const [sheetType, setSheetType] = useState<string>('');
  const [key, setKey] = useState(0); // Add key to force reset FilterSheet

  useImperativeHandle(ref, () => ({
    openSheet: async (value: string) => {
      await setSheetType(value);
      if (value === 'filter') {
        setKey(prev => prev + 1); // Change key to reset FilterSheet
      }
      await rbsheetRef.current.open();
    },
    closeSheet: () => {
      rbsheetRef.current.close();
    },
  }));

  const handleFiltersChange = useCallback((filters: any) => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
    rbsheetRef.current.close();
  }, [onFiltersChange]);

  return (
    <RBSheet
      ref={rbsheetRef}
      closeOnDragDown={true}
      height={
        sheetType === 'gender'
          ? 150
          : sheetType === 'short'
          ? 150
          : sheetType === 'filter'
          ? 600
          : sheetType === 'Language'
          ? 300
          : 200
      }
      openDuration={100}
      customStyles={{
        container: {
          backgroundColor: colors.background,
          borderTopRightRadius: 25,
          borderTopLeftRadius: 25,
          paddingTop: 15,
        },
        draggableIcon: {
          marginTop: 10,
          marginBottom: 0,
          height: 5,
          width: 92,
          backgroundColor: theme.dark ? 'rgba(255,255,255,0.30)' : 'rgba(0, 0, 0, 0.30)',
        },
      }}
    >
      {sheetType === 'gender' && <GenderSheet genderRef={rbsheetRef} />}
      {sheetType === 'short' && <ShortSheet ShortRef={rbsheetRef} />}
      {sheetType === 'filter' && (
        <FilterSheet 
          key={`filter-${key}`} // Key forces remount when changed
          sheetRef={rbsheetRef} 
          onFiltersChange={handleFiltersChange} 
          initialFilters={initialFilters}
        />
      )}
      {sheetType === 'Language' && (
        <LanguageSheet setLanguage={onFiltersChange} sheetRef={rbsheetRef} />
      )}
    </RBSheet>
  );
});

const ShortSheet = ({ ShortRef }: { ShortRef: any }) => {
  return (
    <View>
      <ShortSheet2 shortRef={ShortRef} />
    </View>
  );
};

const GenderSheet = ({ genderRef }: { genderRef: any }) => {
  return (
    <View>
      <GenderSheet2 genderRef={genderRef} />
    </View>
  );
};

const FilterSheet = ({ sheetRef, onFiltersChange, initialFilters }: { sheetRef: any; onFiltersChange?: (filters: any) => void; initialFilters?: any }) => {
  return (
    <View>
      <FilterSheet2 sheetRef={sheetRef} onFiltersChange={onFiltersChange} initialFilters={initialFilters} />
    </View>
  );
};

const LanguageSheet = ({ moresheet, setLanguage, sheetRef }: { moresheet?: any; sheetRef: any; setLanguage?: any }) => {
  return (
    <View>
      <LanguageoptionSheet setLanguage={setLanguage} moresheet={moresheet} sheetRef={sheetRef} />
    </View>
  );
};

export default BottomSheet2;