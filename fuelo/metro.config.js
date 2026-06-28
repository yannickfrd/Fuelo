const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Required for drizzle-orm: enables ESM package exports resolution
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
