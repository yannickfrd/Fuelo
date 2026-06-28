import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Animated, { Keyframe, Easing } from 'react-native-reanimated';

import classes from './animated-icon.module.css';
const DURATION = 300;

export function AnimatedSplashOverlay() {
  return null;
}

const keyframe = new Keyframe({
  0: {
    transform: [{ scale: 0 }],
  },
  60: {
    transform: [{ scale: 1.2 }],
    easing: Easing.elastic(1.2),
  },
  100: {
    transform: [{ scale: 1 }],
    easing: Easing.elastic(1.2),
  },
});

const logoKeyframe = new Keyframe({
  0: {
    opacity: 0,
  },
  60: {
    transform: [{ scale: 1.2 }],
    opacity: 0,
    easing: Easing.elastic(1.2),
  },
  100: {
    transform: [{ scale: 1 }],
    opacity: 1,
    easing: Easing.elastic(1.2),
  },
});

const glowKeyframe = new Keyframe({
  0: {
    transform: [{ rotateZ: '-180deg' }, { scale: 0.8 }],
    opacity: 0,
  },
  [DURATION / 1000]: {
    transform: [{ rotateZ: '0deg' }, { scale: 1 }],
    opacity: 1,
    easing: Easing.elastic(0.7),
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

  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <Animated.View entering={glowKeyframe.duration(60 * 1000 * 4)} style={[styles.glow, { width: glowSize, height: glowSize }]}>
        <Image style={{ width: glowSize, height: glowSize }} source={require('@/assets/images/logo-glow.png')} tintColor="#2A6049" />
      </Animated.View>

      <Animated.View style={[styles.background, { width: size, height: size }]} entering={keyframe.duration(DURATION)}>
        <div className={classes.expoLogoBackground} />
      </Animated.View>

      <Animated.View style={styles.imageContainer} entering={logoKeyframe.duration(DURATION)}>
        <FueloDrop size={dropSize} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    zIndex: 1000,
    position: 'absolute',
    top: 128 / 2 + 138,
  },
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
  },

  background: {
    width: 128,
    height: 128,
    position: 'absolute',
  },
});
