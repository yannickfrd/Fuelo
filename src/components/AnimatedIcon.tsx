import { Image } from 'expo-image';
import { useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const INITIAL_SCALE_FACTOR = Dimensions.get('screen').height / 90;
const DURATION = 600;

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const splashKeyframe = new Keyframe({
    0: {
      transform: [{ scale: INITIAL_SCALE_FACTOR }],
      opacity: 1,
    },
    20: {
      opacity: 1,
    },
    70: {
      opacity: 0,
      easing: Easing.elastic(0.7),
    },
    100: {
      opacity: 0,
      transform: [{ scale: 1 }],
      easing: Easing.elastic(0.7),
    },
  });

  return (
    <Animated.View
      entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={styles.backgroundSolidColor}
    />
  );
}

const keyframe = new Keyframe({
  0: {
    transform: [{ scale: INITIAL_SCALE_FACTOR }],
  },
  100: {
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const logoKeyframe = new Keyframe({
  0: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
  },
  40: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
    easing: Easing.elastic(0.7),
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const glowKeyframe = new Keyframe({
  0: {
    transform: [{ rotateZ: '0deg' }],
  },
  100: {
    transform: [{ rotateZ: '7200deg' }],
  },
});

function FueloDrop({ size }: { size: number }) {
  const r = size / 2;
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: '#ffffff',
        borderTopLeftRadius: r,
        borderTopRightRadius: r,
        borderBottomLeftRadius: r,
        borderBottomRightRadius: 0,
        transform: [{ rotate: '225deg' }],
      }}
    />
  );
}

export function AnimatedIcon({ size = 128 }: { size?: number }) {
  const glowSize = size * 1.57;
  const dropSize = size * 0.33;
  const bgRadius = size * 0.31;

  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <Animated.View entering={glowKeyframe.duration(60 * 1000 * 4)} style={[styles.glow, { width: glowSize, height: glowSize }]}>
        <Image style={{ width: glowSize, height: glowSize }} source={require('@/assets/images/logo-glow.png')} tintColor="#2A6049" />
      </Animated.View>

      <Animated.View entering={keyframe.duration(DURATION)} style={[styles.background, { width: size, height: size, borderRadius: bgRadius }]} />
      <Animated.View style={styles.imageContainer} entering={logoKeyframe.duration(DURATION)}>
        <FueloDrop size={dropSize} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: 201,
    height: 201,
    position: 'absolute',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
    zIndex: 100,
  },

  background: {
    borderRadius: 40,
    experimental_backgroundImage: `linear-gradient(180deg, #3D7A62, #2A6049)`,
    width: 128,
    height: 128,
    position: 'absolute',
  },
  backgroundSolidColor: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
    zIndex: 1000,
  },
});
