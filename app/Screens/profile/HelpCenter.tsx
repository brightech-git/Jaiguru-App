import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');
const SUPPORT_NUMBER = '919514333601'; // ✅ Add your WhatsApp support number (with country code)

function HelpCenterPage() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Dynamic colors based on theme
  const dynamicColors = {
    background: isDark ? COLORS.darkBackground : COLORS.background,
    cardBackground: isDark ? COLORS.darkCard : COLORS.card,
    text: isDark ? COLORS.darkText : COLORS.text,
    textLight: isDark ? COLORS.darkTextLight : COLORS.textLight,
    title: isDark ? COLORS.darkTitle : COLORS.title,
    border: isDark ? COLORS.darkBorder : COLORS.borderColor,
    primary: COLORS.primary,
    primaryLight: COLORS.primaryLight,
    gradientPrimary: [COLORS.primary, COLORS.secondary],
    gradientSecondary: [COLORS.primaryLight, COLORS.primary],
  };

  const handlePhoneCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleOpenMap = () => {
    const address =
      'M/s. BMG Jewellers Pvt Ltd, 160, Melamasi St, Madurai-625001';
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const handleWhatsApp = (message) => {
    const url = `https://wa.me/${SUPPORT_NUMBER}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      alert('Make sure WhatsApp is installed');
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicColors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <LinearGradient
          colors={dynamicColors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={[styles.title, { color: COLORS.white }]}>Help Center</Text>
          <Text style={[styles.subtitle, { color: COLORS.white }]}>We're here to help you</Text>
        </LinearGradient>

        {/* Contact Cards */}
        <View style={styles.cardsContainer}>
          {/* Phone Numbers Card */}
          <View style={[styles.card, { 
            backgroundColor: dynamicColors.cardBackground,
            shadowColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: dynamicColors.primaryLight }]}>
                <Icon name='phone' size={24} color={dynamicColors.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: dynamicColors.primary }]}>Phone Numbers</Text>
            </View>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handlePhoneCall('919514333601')}
            >
              <Text style={[styles.contactText, { color: dynamicColors.text }]}>+91-95143 33601</Text>
              <Icon name='call' size={20} color={dynamicColors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handlePhoneCall('919514333609')}
            >
              <Text style={[styles.contactText, { color: dynamicColors.text }]}>+91-95143 33609</Text>
              <Icon name='call' size={20} color={dynamicColors.primary} />
            </TouchableOpacity>
          </View>

          {/* Email Card */}
          <View style={[styles.card, { 
            backgroundColor: dynamicColors.cardBackground,
            shadowColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: dynamicColors.primaryLight }]}>
                <Icon name='email' size={24} color={dynamicColors.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: dynamicColors.primary }]}>Email Address</Text>
            </View>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleEmail('Contact@bmgjewellers.in')}
            >
              <Text style={[styles.contactText, { color: dynamicColors.text }]}>Contact@bmgjewellers.in</Text>
              <Icon name='mail-outline' size={20} color={dynamicColors.primary} />
            </TouchableOpacity>
          </View>

          {/* Office Address Card */}
          <View style={[styles.card, { 
            backgroundColor: dynamicColors.cardBackground,
            shadowColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: dynamicColors.primaryLight }]}>
                <Icon name='location-on' size={24} color={dynamicColors.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: dynamicColors.primary }]}>Office Address</Text>
            </View>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={handleOpenMap}
            >
              <View style={styles.addressContainer}>
                <Text style={[styles.contactText, { color: dynamicColors.text }]}>
                  M/s. BMG Jewellers Pvt Ltd
                </Text>
                <Text style={[styles.contactText, { color: dynamicColors.text }]}>
                  160, Melamasi St, Madurai-625001
                </Text>
              </View>
              <Icon name='place' size={20} color={dynamicColors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Hours */}
        <View style={[styles.hoursContainer, { 
          backgroundColor: dynamicColors.cardBackground,
          shadowColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        }]}>
          <Text style={[styles.hoursTitle, { color: dynamicColors.primary }]}>Customer Support Hours</Text>
          <View style={[styles.hoursRow, { borderBottomColor: dynamicColors.border }]}>
            <Text style={[styles.hoursDay, { color: dynamicColors.text }]}>Monday - Saturday</Text>
            <Text style={[styles.hoursTime, { color: dynamicColors.primary }]}>10:00 AM - 6:00 PM</Text>
          </View>
          <View style={[styles.hoursRow, { borderBottomColor: dynamicColors.border }]}>
            <Text style={[styles.hoursDay, { color: dynamicColors.text }]}>Sunday</Text>
            <Text style={[styles.hoursTime, { color: dynamicColors.primary }]}>11:00 AM - 4:00 PM</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={[styles.actionsContainer, { 
          backgroundColor: dynamicColors.cardBackground,
          shadowColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        }]}>
          <Text style={[styles.actionsTitle, { color: dynamicColors.primary }]}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: dynamicColors.primaryLight }]}
              onPress={() =>
                handleWhatsApp('Hello! I need help via Live Chat.')
              }
            >
              <Icon name='chat' size={24} color={dynamicColors.primary} />
              <Text style={[styles.actionText, { color: dynamicColors.primary }]}>Live Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: dynamicColors.primaryLight }]}
              onPress={() => handleWhatsApp('I would like to see the FAQs.')}
            >
              <Icon name='help-outline' size={24} color={dynamicColors.primary} />
              <Text style={[styles.actionText, { color: dynamicColors.primary }]}>FAQs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: dynamicColors.primaryLight }]}
              onPress={() => handlePhoneCall('919514333601')}
            >
              <Icon name='description' size={24} color={dynamicColors.primary} />
              <Text style={[styles.actionText, { color: dynamicColors.primary }]}>Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { paddingBottom: SIZES.padding * 2 },
  header: {
    padding: SIZES.padding,
    paddingTop: SIZES.padding * 2,
    paddingBottom: SIZES.padding * 2.5,
    borderBottomLeftRadius: SIZES.radius_lg,
    borderBottomRightRadius: SIZES.radius_lg,
    alignItems: 'center',
    marginBottom: SIZES.margin * 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8
  },
  title: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.heading.fontFamily,
    marginBottom: SIZES.margin / 2
  },
  subtitle: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.subheading.fontFamily,
    opacity: 0.9
  },
  cardsContainer: {
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.margin * 2
  },
  card: {
    borderRadius: SIZES.radius_lg,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 4
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin,
    borderBottomWidth: 1,
    paddingBottom: SIZES.padding / 2
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.margin / 2
  },
  cardTitle: {
    fontSize: SIZES.h5,
    fontFamily: FONTS.subheading.fontFamily,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.padding / 1.5,
    borderBottomWidth: 1,
  },
  contactText: {
    fontSize: SIZES.h5,
    fontFamily: FONTS.subheading.fontFamily,
    flex: 1,
    marginRight: SIZES.margin / 2
  },
  addressContainer: { flex: 1 },
  hoursContainer: {
    borderRadius: SIZES.radius_lg,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.margin * 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 4
  },
  hoursTitle: {
    fontSize: SIZES.h5,
    fontFamily: FONTS.subheading.fontFamily,
    marginBottom: SIZES.margin,
    textAlign: 'center'
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.padding / 2,
    borderBottomWidth: 1,
  },
  hoursDay: {
    fontSize: SIZES.h5,
    fontFamily: FONTS.subheading.fontFamily,
  },
  hoursTime: { 
    fontSize: SIZES.font, 
    fontFamily: FONTS.subheading.fontFamily,
  },
  actionsContainer: {
    borderRadius: SIZES.radius_lg,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 4
  },
  actionsTitle: {
    fontSize: SIZES.h5,
    fontFamily: FONTS.subheading.fontFamily,
    marginBottom: SIZES.margin,
    textAlign: 'center'
  },
  actionsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around' 
  },
  actionButton: {
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    width: width * 0.25
  },
  actionText: {
    fontSize: SIZES.h5,
    fontFamily: FONTS.subheading.fontFamily,
    marginTop: SIZES.margin / 2,
    textAlign: 'center'
  }
});

export default HelpCenterPage;