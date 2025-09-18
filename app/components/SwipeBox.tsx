import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  Image,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { COLORS, FONTS } from '../constants/theme';
import { IMAGES } from '../constants/Images';

const SCREEN_WIDTH = Dimensions.get('window').width;

// ✅ Helper: Capitalize first letter of a sentence
const capitalizeSentence = (text: string) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export default class SwipeBox extends Component<any> {
  rightSwipe = (progress: any, dragX: any) => {
    const scale = dragX.interpolate({
      inputRange: [45, 90],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        onPress={() => {
          this.close();
          this.props.handleDelete();
        }}
        activeOpacity={0.6}>
        <View
          style={[
            styles.deleteBox,
            {
              backgroundColor: this.props.theme.dark
                ? COLORS.white
                : COLORS.primary,
            },
          ]}>
          <Animated.View>
            <Image
              style={[
                styles.deleteIcon,
                {
                  tintColor: this.props.theme.dark
                    ? COLORS.primary
                    : COLORS.white,
                },
              ]}
              source={IMAGES.delete}
            />
          </Animated.View>
        </View>
      </TouchableOpacity>
    );
  };

  updateRef = (ref: any) => {
    this._swipeableRow = ref;
  };

  close = () => {
    this._swipeableRow.close();
  };

  render() {
    const { colors, data } = this.props;

    return (
      <View style={styles.container}>
        <Swipeable
          ref={this.updateRef}
          friction={2}
          renderRightActions={this.rightSwipe}>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Image style={styles.avatar} source={data.image} />
            <View>
              <Text style={styles.title}>
                {capitalizeSentence(data.title)}
              </Text>
              <Text style={styles.message}>
                {capitalizeSentence(data.message)}
              </Text>
              <Text style={styles.date}>
                {data.date}
              </Text>
            </View>
          </View>
        </Swipeable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 120,
    width: SCREEN_WIDTH,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    marginHorizontal: -15,
    paddingHorizontal: 30,
    paddingBottom: 10,
    paddingTop: 10,
    marginRight: 5,
  },
  avatar: {
    height: 80,
    width: 100,
    borderRadius: 10,
  },
  title: {
    ...FONTS.fontMedium,
    fontSize: 18,
    color: COLORS.primary,
  },
  message: {
    ...FONTS.fontMedium,
    fontSize: 18,
    color: COLORS.title,
  },
  date: {
    ...FONTS.fontRegular,
    fontSize: 13,
    color: COLORS.label,
  },
  deleteBox: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 80,
    right: 0,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  deleteIcon: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
  },
});
