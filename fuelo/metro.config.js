const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Required for drizzle-orm: enables ESM package exports resolution
config.resolver.unstable_enablePackageExports = true;

// react-native-gifted-charts ships ESM dist files — include it and its core dependency
// in Babel transformation so Metro can handle the `export` syntax
config.transformer.transformIgnorePatterns = [
  'node_modules/(?!(react-native-gifted-charts|gifted-charts-core)/)',
];

// react-native-gifted-charts uses ESM dist files — disable package exports resolution
// for it so Metro falls back to the `main` field (dist/index.js)
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('react-native-gifted-charts') ||
      moduleName.startsWith('gifted-charts-core')) {
    return context.resolveRequest(
      { ...context, unstable_enablePackageExports: false },
      moduleName,
      platform,
    );
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
