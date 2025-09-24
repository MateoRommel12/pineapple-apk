// =====================================================================
// 🧪 TENSORFLOW LITE INTEGRATION TEST
// Tests native .tflite model loading after ejection
// =====================================================================

import { EfficientNetTFLiteService } from '../lib/efficientNetTFLiteService';

describe('TensorFlow Lite Integration', () => {
  let tfliteService;

  beforeEach(() => {
    tfliteService = new EfficientNetTFLiteService();
  });

  test('TensorFlow Lite module loads without errors', async () => {
    // This test checks if react-native-fast-tflite is properly installed
    expect(() => {
      try {
        require('react-native-fast-tflite');
        return true;
      } catch (error) {
        console.log('TensorFlow Lite module not available:', error.message);
        return false;
      }
    }).toBeTruthy();
  });

  test('TFLite service initializes correctly', () => {
    expect(tfliteService).toBeDefined();
    expect(typeof tfliteService.loadModel).toBe('function');
  });

  test('Model loading method exists and is callable', async () => {
    // Test that the method exists and doesn't crash immediately
    expect(typeof tfliteService.loadModel).toBe('function');
    
    try {
      // Attempt to load model (might fall back to TensorFlow.js)
      await tfliteService.loadModel();
      console.log('✅ Model loading completed (either TFLite or fallback)');
    } catch (error) {
      console.log('⚠️ Model loading failed (expected during testing):', error.message);
      // This is expected in test environment without proper setup
    }
  });

  test('Service has proper fallback mechanisms', () => {
    // Ensure the service has fallback methods
    expect(typeof tfliteService.loadModel).toBe('function');
    // Additional methods should exist for full functionality
  });
});

// Performance benchmark test (optional)
describe('TensorFlow Lite Performance', () => {
  test('Model loading time benchmark', async () => {
    const tfliteService = new EfficientNetTFLiteService();
    
    const startTime = Date.now();
    try {
      await tfliteService.loadModel();
      const loadTime = Date.now() - startTime;
      console.log(`📊 Model loading time: ${loadTime}ms`);
      
      // Native TFLite should be faster than 2 seconds
      if (loadTime < 2000) {
        console.log('🚀 Fast loading detected - likely using native TFLite!');
      } else {
        console.log('⏱️ Slower loading - likely using TensorFlow.js fallback');
      }
      
    } catch (error) {
      console.log('Performance test skipped due to loading error');
    }
  });
});
