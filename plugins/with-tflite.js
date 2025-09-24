const { withAndroidManifest, withXcodeProject } = require('@expo/config-plugins');

const withTensorFlowLite = (config) => {
  // Android configuration
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    
    // Add permissions for ML operations if needed
    if (!androidManifest.manifest.application) {
      androidManifest.manifest.application = [{}];
    }
    
    return config;
  });

  // iOS configuration
  config = withXcodeProject(config, (config) => {
    // Add any iOS-specific configurations here if needed
    return config;
  });

  return config;
};

module.exports = withTensorFlowLite;
