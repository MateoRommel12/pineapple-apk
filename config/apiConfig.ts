/**
 * API Configuration for Backend Integration
 * 
 * This file contains configuration settings for connecting to the Flask backend.
 * Currently configured for production deployment on Hugging Face Spaces.
 */

// Network configuration
export const API_CONFIG = {
  // Production configuration
  // Using deployed backend on Hugging Face Spaces (Gradio)
  BASE_URL: 'https://matts-12-backend-pineapple-server.hf.space', // Hugging Face Spaces Gradio API endpoint
  // Alternative configurations for local development:
   //BASE_URL: 'http://192.168.0.128:8000', // Local development server
  // BASE_URL: 'http://10.0.2.2:8000',      // Android Emulator
  // BASE_URL: 'http://localhost:8000',     // localhost
  // BASE_URL: 'http://127.0.0.1:8000',     // loopback
  
  // Timeout settings (optimized for Render.com cold starts)
  REQUEST_TIMEOUT: 30000,  // 30 seconds for regular requests
  UPLOAD_TIMEOUT: 120000,  // 120 seconds for image uploads (increased for cold starts)
  TEST_TIMEOUT: 45000,     // 45 seconds for connectivity tests (increased for cold starts)
  WARMUP_TIMEOUT: 90000,   // 90 seconds for server warmup
  PROGRESSIVE_TIMEOUT: true, // Enable progressive timeout strategy
  
  // Retry configuration
  MAX_RETRIES: 5,        // Increased retries for better reliability
  RETRY_DELAY: 2000,     // 2 seconds between retries
  PROGRESSIVE_DELAY: true, // Increase delay with each retry
  MAX_RETRY_DELAY: 10000, // Maximum 10 seconds between retries
  
  // Image upload settings (optimized for speed and reliability)
  MAX_IMAGE_SIZE: 1024 * 1024, // 1MB (smaller = faster upload, less timeout risk)
  SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Speed optimization settings
  COMPRESS_IMAGES: true,
  COMPRESSION_QUALITY: 0.6, // Lower quality for faster uploads
  RESIZE_IMAGES: true,      // Enable image resizing
  MAX_DIMENSION: 1024,      // Max width/height in pixels
  
  // Endpoints (Docker/Flask format)
  ENDPOINTS: {
    TEST: '/health',      // Docker health endpoint
    HEALTH: '/health',    // Docker health endpoint
    PREDICT: '/predict',  // Docker prediction endpoint
    HISTORY: '/history',  // Docker history endpoint
  },
};

// Development helpers
export const DEV_CONFIG = {
  // Enable debug logging
  DEBUG_LOGS: __DEV__,
  
  // Mock backend responses (for testing when backend is unavailable)
  USE_MOCK_RESPONSES: false,
  
  // Auto-detect local IP (experimental - may not work on all devices)
  AUTO_DETECT_IP: false,
};

// Common IP addresses for local development
export const COMMON_LOCAL_IPS = [
  '192.168.1.100',  // Common router range
  '192.168.0.100',  // Common router range
  '10.0.0.100',     // Common router range
  '172.16.0.100',   // Common router range
  'localhost:8000', // Localhost (won't work on physical devices)
];

/**
 * Helper function to validate if a URL is reachable
 */
export const validateApiUrl = async (baseUrl: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Helper function to get the current API base URL with protocol
 */
export const getApiBaseUrl = (): string => {
  // Ensure the URL has the correct protocol
  let url = API_CONFIG.BASE_URL;
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `http://${url}`;
  }
  
  return url;
};

/**
 * Helper function to build full API URLs
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Export default configuration
export default API_CONFIG;