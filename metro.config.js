const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable network requests to local development server
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Allow HTTP requests for development
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

module.exports = config; 