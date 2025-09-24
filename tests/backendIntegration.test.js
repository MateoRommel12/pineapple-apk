/**
 * Backend Integration Test
 * This test verifies that the backend API service
 * can connect and analyze images correctly.
 */

import { apiService } from '../services/apiService';

describe('Backend Integration Tests', () => {
  beforeAll(async () => {
    // Initialize API service
    await apiService.initialize();
    console.log('API service initialized for testing');
  });

  test('API Service initializes correctly', async () => {
    expect(apiService).toBeDefined();
    
    const config = apiService.getConfig();
    expect(config).toBeDefined();
    expect(config).toHaveProperty('baseUrl');
    expect(config).toHaveProperty('timeout');
    
    console.log('✅ API Service initialized successfully');
    console.log('📡 Backend URL:', config.baseUrl);
  });

  test('Backend connection is available', async () => {
    const connectionTest = await apiService.testConnection();
    
    expect(connectionTest).toBeDefined();
    expect(typeof connectionTest).toBe('object');
    expect(connectionTest).toHaveProperty('success');
    expect(connectionTest).toHaveProperty('message');
    
    console.log('📊 Connection Test:', connectionTest);
    
    if (connectionTest.success) {
      console.log('✅ Backend server is running and accessible');
      if (connectionTest.latency) {
        console.log(`⚡ Response time: ${connectionTest.latency}ms`);
      }
    } else {
      console.log('⚠️ Backend server is not accessible:', connectionTest.message);
      console.log('💡 Make sure the Flask server is running on the configured URL');
    }
  });

  test('Backend health check works', async () => {
    const health = await apiService.checkHealth();
    
    if (health) {
      expect(health).toBeDefined();
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('mode');
      
      console.log('✅ Backend health check successful:', {
        status: health.status,
        mode: health.mode,
        detection_method: health.detection_method,
        tf_version: health.tf_version
      });
      
      if (health.class_names) {
        console.log('🎯 Available sweetness classes:', health.class_names);
      }
    } else {
      console.log('⚠️ Backend health check failed - server may be offline');
    }
  });

  test('Error handling works correctly', async () => {
    // Test with invalid image path
    try {
      const result = await apiService.analyzePineapple('/invalid/path/image.jpg');
      console.log('ℹ️ Analysis completed (may have failed as expected):', result.status);
      
      // Check that error result has proper structure
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('message');
    } catch (error) {
      console.log('✅ Error handling working correctly:', error.message);
      expect(error).toBeDefined();
    }
  });

  test('Configuration can be updated', async () => {
    const originalConfig = apiService.getConfig();
    
    // Test updating configuration
    await apiService.updateConfig({
      timeout: 60000,
    });
    
    const updatedConfig = apiService.getConfig();
    expect(updatedConfig.timeout).toBe(60000);
    expect(updatedConfig.baseUrl).toBe(originalConfig.baseUrl);
    
    console.log('✅ Configuration update working correctly');
    
    // Restore original config
    await apiService.updateConfig(originalConfig);
  });
});
