import React from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  useColorScheme,
  Text,
} from "react-native";
import { COLORS, FONTS, SIZES } from "../../constants/theme";

const TermsConditionsPage = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Dynamic colors from theme
  const dynamicColors = {
    background: isDark ? COLORS.darkBackground : COLORS.background,
    cardBackground: isDark ? COLORS.darkCard : COLORS.card,
    text: isDark ? COLORS.darkText : COLORS.text,
    textLight: isDark ? COLORS.darkTextLight : COLORS.textLight,
    title: isDark ? COLORS.darkTitle : COLORS.title,
    border: isDark ? COLORS.darkBorder : COLORS.borderColor,
    primary: COLORS.primary,
    primaryLight: COLORS.primaryLight,
  };

  const termsData = [
    {
      title: "1. Product Representation",
      content: [
        "Images are for reference only. Minor variations in color or finish may occur.",
        "All products are handcrafted, so slight irregularities are natural.",
        "For exact details, contact us before ordering.",
      ],
    },
    {
      title: "2. Pricing",
      subtitle: "Currency & Taxes",
      content: ["All prices are in INR and inclusive of GST"],
      subsections: [
        {
          title: "Price Changes",
          content: [
            "Prices may change without prior notice",
            "Final amount charged will be as displayed at checkout.",
          ],
        },
      ],
    },
    {
      title: "3. Payments",
      content: [
        "We accept:",
        "• Online Payments",
        "• UPI",
        "• Debit/Credit Cards",
        "• Net Banking",
        "• Cash on Delivery (Selected PIN codes only)",
        "• ₹50 COD fee may apply",
      ],
    },
    {
      title: "4. Product Use & Care",
      content: [
        "Handle gold-polished jewellery with care. Avoid water & chemicals.",
        "Store in a dry pouch when not in use.",
        "No guarantee for polish durability; depends on usage.",
        "Ask us for maintenance tips to extend product life.",
      ],
    },
    {
      title: "5. Limitation of Liability",
      content: [
        "We are not liable for:",
        "• Shipping delays or damage",
        "• Force majeure events",
        "• Improper use or care",
      ],
    },
    {
      title: "6. Intellectual Property",
      content: [
        "All content is © and the property of our brand. No part may be:",
        "• Copied or redistributed without permission",
        "• Used commercially",
        "• Altered or modified",
      ],
    },
    {
      title: "7. Governing Law",
      content: [
        "These terms are governed by Indian law.",
        "Disputes will be settled in Madurai, Tamil Nadu.",
        "Contact us before placing orders if you have any questions.",
      ],
    },
  ];

  return (
    <View
      style={[styles.container, { backgroundColor: dynamicColors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: dynamicColors.title }]}>
            Terms & Conditions
          </Text>
          <View
            style={[
              styles.titleUnderline,
              { backgroundColor: dynamicColors.primary },
            ]}
          />
        </View>

        {/* Content */}
        <View
          style={[
            styles.contentContainer,
            {
              backgroundColor: dynamicColors.cardBackground,
              shadowColor: isDark ? COLORS.white : COLORS.shadow,
            },
          ]}
        >
          {termsData.map((section, index) => (
            <View
              key={index}
              style={[
                styles.section,
                { borderLeftColor: dynamicColors.primaryLight },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: dynamicColors.primary }]}>
                {section.title}
              </Text>

              {section.subtitle && (
                <Text style={[styles.subtitle, { color: dynamicColors.text }]}>
                  {section.subtitle}
                </Text>
              )}

              {section.content.map((point, pointIndex) => (
                <View key={pointIndex} style={styles.pointContainer}>
                  <View
                    style={[
                      styles.bullet,
                      { backgroundColor: dynamicColors.primary },
                    ]}
                  />
                  <Text
                    style={[styles.pointText, { color: dynamicColors.textLight }]}
                  >
                    {point}
                  </Text>
                </View>
              ))}

              {section.subsections &&
                section.subsections.map((subsection, subIndex) => (
                  <View key={subIndex} style={styles.subsection}>
                    <Text
                      style={[styles.subsectionTitle, { color: dynamicColors.text }]}
                    >
                      {subsection.title}
                    </Text>
                    {subsection.content.map((point, pointIndex) => (
                      <View key={pointIndex} style={styles.pointContainer}>
                        <View
                          style={[
                            styles.bullet,
                            { backgroundColor: dynamicColors.primary },
                          ]}
                        />
                        <Text
                          style={[styles.pointText, { color: dynamicColors.textLight }]}
                        >
                          {point}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
            </View>
          ))}

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: dynamicColors.border }]}>
            <Text style={[styles.footerText, { color: dynamicColors.textLight }]}>
              Last Updated: 23 August 2025
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  scrollView: { 
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
  },
  header: {
    alignItems: "center",
    marginBottom: SIZES.margin * 2,
  },
  title: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.heading.fontFamily,
    // fontWeight: '700',
    textAlign: 'center',
  },
  titleUnderline: {
    width: 80,
    height: 4,
    borderRadius: 2,
    marginTop: SIZES.margin / 2,
  },
  contentContainer: {
    borderRadius: SIZES.radius_lg,
    padding: SIZES.padding,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  section: {
    marginBottom: SIZES.margin * 1.5,
    borderLeftWidth: 3,
    paddingLeft: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.subheading.fontFamily,
    // fontWeight: '700',
    marginBottom: SIZES.margin / 2,
  },
  subtitle: {
    fontSize: SIZES.h6,
    fontFamily: FONTS.subheading.fontFamily,
    fontWeight: '500',
    marginBottom: SIZES.margin / 2,
  },
  subsection: {
    marginLeft: SIZES.margin,
    marginTop: SIZES.margin,
  },
  subsectionTitle: {
    fontSize: SIZES.h5,
    fontFamily: FONTS.subheading.fontFamily,
    fontWeight: '500',
    marginBottom: SIZES.margin / 2,
  },
  pointContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SIZES.margin / 2,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SIZES.margin / 2,
    marginTop: SIZES.margin / 2,
  },
  pointText: {
    fontSize: SIZES.h6,
    fontFamily: FONTS.subheading.fontFamily,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: SIZES.padding,
    alignItems: "center",
    marginTop: SIZES.margin,
  },
  footerText: {
    fontSize: SIZES.h6,
    fontFamily: FONTS.heading.fontFamily,
  },
});

export default TermsConditionsPage;