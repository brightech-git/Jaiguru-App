import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Dimensions,
  useColorScheme
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');

const PrivacyPolicyPage = () => {
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
  };

  const handleExternalLink = (url) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  const policySections = [
    {
      title: "Information We Collect",
      icon: "person",
      content: "Personal identification details (name, email, phone number, etc.), device information and browsing history, location and IP address."
    },
    {
      title: "How We Use Your Data",
      icon: "data-usage",
      content: "To improve our services and personalize your experience, to communicate offers, promotions, or important updates, for analytics and security enhancement."
    },
    {
      title: "What We Don't Do",
      icon: "block",
      content: "We do not sell your personal information. We do not track your location without consent."
    },
    {
      title: "Data Sharing",
      icon: "share",
      content: "",
      subsections: [
        {
          title: "We Do Not Share With",
          content: "Unaffiliated third parties, social media platforms"
        },
        {
          title: "We May Share With",
          content: "Trusted service providers, legal authorities (when required)"
        }
      ]
    },
    {
      title: "Security Note",
      icon: "security",
      content: "Your data is encrypted and securely stored as per industry standards. We employ the latest security measures to protect your information."
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicColors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={dynamicColors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={[styles.title, { color: COLORS.white }]}>Privacy Policy</Text>
          <Text style={[styles.subtitle, { color: COLORS.white }]}>Last updated: {new Date().toLocaleDateString()}</Text>
        </LinearGradient>

        {/* Introduction */}
        <View style={[styles.introCard, { 
          backgroundColor: dynamicColors.cardBackground,
          shadowColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderLeftColor: dynamicColors.primary,
        }]}>
          <Text style={[styles.introText, { color: dynamicColors.text }]}>
            At BMG Jewellers, we value your privacy and are committed to protecting your personal information. 
            This policy outlines how we collect, use, and safeguard your data.
          </Text>
        </View>

        {/* Policy Sections */}
        {policySections.map((section, index) => (
          <View key={index} style={[styles.sectionCard, { 
            backgroundColor: dynamicColors.cardBackground,
            shadowColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          }]}>
            <View style={[styles.sectionHeader, { borderBottomColor: dynamicColors.border }]}>
              <View style={[styles.iconContainer, { backgroundColor: dynamicColors.primaryLight }]}>
                <Icon name={section.icon} size={24} color={dynamicColors.primary} />
              </View>
              <Text style={[styles.sectionTitle, { color: dynamicColors.primary }]}>{section.title}</Text>
            </View>
            <Text style={[styles.sectionContent, { color: dynamicColors.text }]}>{section.content}</Text>
            
            {section.subsections && section.subsections.map((subsection, subIndex) => (
              <View key={subIndex} style={styles.subsection}>
                <View style={styles.subsectionHeader}>
                  <View style={[styles.bulletPoint, { backgroundColor: dynamicColors.primary }]} />
                  <Text style={[styles.subsectionTitle, { color: dynamicColors.primary }]}>{subsection.title}</Text>
                </View>
                <Text style={[styles.subsectionContent, { color: dynamicColors.text }]}>{subsection.content}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Security Badge */}
        <View style={[styles.securityBadge, { 
          backgroundColor: dynamicColors.primaryLight,
          borderColor: dynamicColors.primary,
        }]}>
          <Icon name="verified-user" size={32} color={dynamicColors.primary} />
          <Text style={[styles.securityText, { color: dynamicColors.primary }]}>
            Your Data is Protected with 256-bit Encryption
          </Text>
        </View>

        {/* Additional Information */}
        <View style={[styles.additionalInfo, { 
          backgroundColor: dynamicColors.cardBackground,
          shadowColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        }]}>
          <Text style={[styles.infoTitle, { 
            color: dynamicColors.primary,
            borderBottomColor: dynamicColors.border,
          }]}>Additional Information</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Icon name="language" size={20} color={dynamicColors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoItemTitle, { color: dynamicColors.primary }]}>Website</Text>
              <TouchableOpacity onPress={() => handleExternalLink("https://bmgjewellers.com")}>
                <Text style={[styles.link, { color: dynamicColors.primary }]}>https://bmgjewellers.com</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Icon name="support-agent" size={20} color={dynamicColors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoItemTitle, { color: dynamicColors.primary }]}>Contact</Text>
              <Text style={[styles.infoItemContent, { color: dynamicColors.text }]}>
                For privacy-related questions, please contact our support team at Contact@bmgjewellers.in
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Icon name="update" size={20} color={dynamicColors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoItemTitle, { color: dynamicColors.primary }]}>Policy Updates</Text>
              <Text style={[styles.infoItemContent, { color: dynamicColors.text }]}>
                We may update this policy periodically. Please check back for changes.
              </Text>
            </View>
          </View>
        </View>

        {/* Consent Footer */}
        <LinearGradient
          colors={dynamicColors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.consentFooter}
        >
          <Icon name="done-all" size={24} color={COLORS.white} />
          <Text style={[styles.consentText, { color: COLORS.white }]}>
            By using our services, you consent to our privacy policy.
          </Text>
        </LinearGradient>

        {/* Copyright */}
        <View style={styles.copyright}>
          <Text style={[styles.copyrightText, { color: dynamicColors.textLight }]}>
            © {new Date().getFullYear()} BMG Jewellers. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SIZES.padding * 2,
  },
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
    shadowRadius: 6,
    elevation: 8,
  },
  title: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.heading.fontFamily,
    marginBottom: SIZES.margin / 2,
  },
  subtitle: {
    fontSize: SIZES.h5,
    fontFamily: FONTS.subheading.fontFamily,
    opacity: 0.9,
  },
  introCard: {
    borderRadius: SIZES.radius_lg,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.margin * 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderLeftWidth: 4,
  },
  introText: {
    fontSize: SIZES.h6,
    fontFamily: FONTS.subheading.fontFamily,
    lineHeight: SIZES.font * 1.5,
    textAlign: 'center',
  },
  sectionCard: {
    borderRadius: SIZES.radius_lg,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.margin,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin,
    borderBottomWidth: 1,
    paddingBottom: SIZES.padding / 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.margin / 2,
  },
  sectionTitle: {
    fontSize: SIZES.h5,
    fontFamily: FONTS.subheading.fontFamily,
    flex: 1,
  },
  sectionContent: {
    fontSize: SIZES.h6,
    fontFamily: FONTS.subheading.fontFamily,
    lineHeight: SIZES.font * 1.5,
    marginBottom: SIZES.margin / 2,
  },
  subsection: {
    marginTop: SIZES.margin,
  },
  subsectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin / 2,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SIZES.margin / 2,
  },
  subsectionTitle: {
    fontSize: SIZES.h5,
    fontFamily: FONTS.subheading.fontFamily,
  },
  subsectionContent: {
    fontSize: SIZES.h6,
    fontFamily: FONTS.subheading.fontFamily,
    lineHeight: SIZES.font * 1.5,
    paddingLeft: SIZES.padding,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.radius_lg,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.margin * 2,
    borderWidth: 1,
  },
  securityText: {
    fontSize: SIZES.h6,
    fontFamily: FONTS.subheading.fontFamily,
    marginLeft: SIZES.margin / 2,
    flex: 1,
  },
  additionalInfo: {
    borderRadius: SIZES.radius_lg,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.margin,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  infoTitle: {
    fontSize: SIZES.h5,
    fontFamily: FONTS.subheading.fontFamily,
    marginBottom: SIZES.margin,
    borderBottomWidth: 1,
    paddingBottom: SIZES.padding / 2,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: SIZES.margin,
  },
  infoIcon: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.margin / 2,
  },
  infoContent: {
    flex: 1,
  },
  infoItemTitle: {
    fontSize: SIZES.h5,
    fontFamily: FONTS.subheading.fontFamily,
    marginBottom: SIZES.margin / 2,
  },
  infoItemContent: {
    fontSize: SIZES.h6,
    fontFamily: FONTS.subheading.fontFamily,
    lineHeight: SIZES.font * 1.5,
  },
  link: {
    fontSize: SIZES.h6,
    fontFamily: FONTS.subheading.fontFamily,
    textDecorationLine: 'underline',
  },
  consentFooter: {
    borderRadius: SIZES.radius_lg,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  consentText: {
    fontSize: SIZES.font,
    fontFamily: FONTS.subheading.fontFamily,
    textAlign: 'center',
    marginLeft: SIZES.margin / 2,
  },
  copyright: {
    alignItems: 'center',
    marginTop: SIZES.margin * 2,
    paddingHorizontal: SIZES.padding,
  },
  copyrightText: {
    fontSize: SIZES.h6,
    fontFamily: FONTS.h3.fontFamily,
    textAlign: 'center',
  },
});

export default PrivacyPolicyPage;