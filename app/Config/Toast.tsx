import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  StyleSheet,
  PanResponder,
  Easing,
  View,
  Dimensions,
} from 'react-native';

type ToastType = 'success' | 'error' | 'info' | 'warning';

type ToastConfig = {
  message: string;
  type?: ToastType;
  duration?: number;
  position?: 'top' | 'bottom';
};

type ToastProps = ToastConfig & {
  visible: boolean;
  onHide: () => void;
};

const ToastComponent: React.FC<ToastProps> = ({
  message,
  type = 'success',
  visible,
  duration = 2500,
  position = 'top',
  onHide,
}) => {
  const { width } = Dimensions.get('window');
  const slideAnim = useRef(new Animated.Value(position === 'top' ? -100 : 100))
    .current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.Value(0)).current;

  const toastColors = {
    success: '#4CAF50',
    error: '#F44336',
    info: '#2196F3',
    warning: '#FF9800',
  };

  const renderIcon = () => {
    const size = 18;
    switch (type) {
      case 'success':
        return <Text style={{ fontSize: size }}>✅</Text>;
      case 'error':
        return <Text style={{ fontSize: size }}>❌</Text>;
      case 'info':
        return <Text style={{ fontSize: size }}>ℹ️</Text>;
      case 'warning':
        return <Text style={{ fontSize: size }}>⚠️</Text>;
      default:
        return null;
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5,
      onPanResponderMove: (_, gesture) => {
        const swipeDirection = position === 'top' ? gesture.dy : -gesture.dy;
        if (swipeDirection < 0) {
          pan.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        const swipeThreshold = 40;
        const swipeDirection = position === 'top' ? gesture.dy : -gesture.dy;

        if (swipeDirection < -swipeThreshold) {
          hideToast();
        } else {
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: position === 'top' ? -100 : 100,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
  };

  useEffect(() => {
    if (visible) {
      pan.setValue(0);

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.back(1)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(hideToast, duration);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.toast,
        {
          backgroundColor: toastColors[type],
          width: width - 40,
          [position]: 50,
          opacity: opacityAnim,
          transform: [
            { translateY: Animated.add(slideAnim, pan) },
            {
              scale: pan.interpolate({
                inputRange: [-50, 0, 50],
                outputRange: [0.95, 1, 0.95],
                extrapolate: 'clamp',
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.iconContainer}>{renderIcon()}</View>
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

// Global toast control
let toastHideTimeout: NodeJS.Timeout;
let setToastConfig: React.Dispatch<
  React.SetStateAction<ToastConfig & { visible: boolean }>
>;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toastConfig, setToastConfigState] = useState<
    ToastConfig & { visible: boolean }
  >({
    visible: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    setToastConfig = setToastConfigState;
  }, []);

  return (
    <>
      {children}
      <ToastComponent
        {...toastConfig}
        onHide={() =>
          setToastConfigState((prev) => ({ ...prev, visible: false }))
        }
      />
    </>
  );
};

export const showToast = (config: ToastConfig) => {
  if (toastHideTimeout) clearTimeout(toastHideTimeout);

  setToastConfig({
    ...config,
    visible: true,
  });

  toastHideTimeout = setTimeout(() => {
    setToastConfig((prev) => ({ ...prev, visible: false }));
  }, config.duration || 2500);
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1000,
  },
  iconContainer: {
    marginRight: 10,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});

export default ToastComponent;
