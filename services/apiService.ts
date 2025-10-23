import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleApiError, NetworkError, BackendError, logError } from '../utils/errorHandler';
import { API_CONFIG } from '../config/apiConfig';
import { databaseService, AnalysisRecord } from './databaseService';

// Configuration for the backend API
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

// Default configuration - using centralized config
const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: API_CONFIG.BASE_URL, // From apiConfig.ts
  timeout: API_CONFIG.REQUEST_TIMEOUT, // From apiConfig.ts
};

// Storage key for API configuration
const API_CONFIG_KEY = '@pineapple_api_config';

// Backend response interfaces
export interface BackendDetectionResult {
  bbox: number[]; // [x1, y1, x2, y2]
  confidence: number;
  class: string;
  class_id: number;
}

export interface BackendPredictionResponse {
  id: number;
  timestamp: string;
  image_path: string;
  is_pineapple: boolean;
  detection_confidence: number;
  detection_threshold: number;
  confidence_threshold: number;
  detections: BackendDetectionResult[];
  total_detections: number;
  all_detections: BackendDetectionResult[];
  debug_info: any;
  prediction: string | null; // 'High', 'Medium', 'Low' or null if no pineapple
  confidence: number | null; // Sweetness confidence
  probabilities: {
    High?: number;
    Medium?: number;
    Low?: number;
  } | null;
}

export interface BackendHealthResponse {
  status: string;
  mode: string;
  detection_method: string;
  detector_path: string;
  classifier_path: string;
  class_names: string[];
  tf_version: string;
  server_time: string;
}

export interface BackendHistoryItem {
  id: number;
  timestamp: string;
  image_path: string;
  is_pineapple: boolean;
  detection_confidence: number;
  bounding_boxes: BackendDetectionResult[] | null;
  prediction: string | null;
  confidence: number | null;
}

// Transform backend response to match app's expected format
export interface TransformedAnalysisResult {
  isPineapple: boolean;
  detectionConfidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  sweetness: {
    sweetness: number; // 0-100 scale
    confidence: number;
    category: string;
    sweetnessClass: string;
    displayTitle: string;
    colorIndicator: string;
    emoji: string;
    recommendation: string;
    characteristics: string[];
    qualityMetrics: {
      ripeness: string;
      eatingExperience: string;
      bestUse: string;
    };
    method: string;
    processingTime: number;
  } | null;
  status: 'success' | 'no_pineapple' | 'error';
  message: string;
  processingTime: number;
}

class ApiService {
  private config: ApiConfig = DEFAULT_CONFIG;
  private isInitialized = false;

  /**
   * Initialize the API service by loading saved configuration
   */
  async initialize(): Promise<void> {
    try {
      const savedConfig = await AsyncStorage.getItem(API_CONFIG_KEY);
      if (savedConfig) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) };
      }
      this.isInitialized = true;
      console.log('🌐 API Service initialized with baseUrl:', this.config.baseUrl);
    } catch (error) {
      console.warn('⚠️ Failed to load API config, using defaults:', error);
      this.isInitialized = true;
    }
  }

  /**
   * Update API configuration and save to storage
   */
  async updateConfig(newConfig: Partial<ApiConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    try {
      await AsyncStorage.setItem(API_CONFIG_KEY, JSON.stringify(this.config));
      console.log('✅ API config updated:', this.config);
    } catch (error) {
      console.error('❌ Failed to save API config:', error);
    }
  }

  /**
   * Get current API configuration
   */
  getConfig(): ApiConfig {
    return { ...this.config };
  }

  /**
   * Check if the backend server is available
   */
  async checkHealth(): Promise<BackendHealthResponse | null> {
    try {
      console.log('🏥 Checking backend health...');
      
      // Use longer timeout specifically for health checks during cold starts
      const originalTimeout = this.config.timeout;
      this.config.timeout = API_CONFIG.TEST_TIMEOUT; // Use the longer test timeout
      
      try {
        const response = await this.makeRequest('/health', {
          method: 'GET',
        });

        if (response.ok) {
          const data: BackendHealthResponse = await response.json();
          console.log('✅ Backend is healthy:', data.status);
          return data;
        } else {
          console.error('❌ Backend health check failed:', response.status, response.statusText);
          return null;
        }
      } finally {
        // Restore original timeout
        this.config.timeout = originalTimeout;
      }
    } catch (error) {
      console.error('❌ Backend health check error:', error);
      return null;
    }
  }

  /**
   * Test basic connectivity with /test endpoint
   */
  async testConnectivity(): Promise<boolean> {
    try {
      console.log('🔍 Testing basic connectivity...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TEST_TIMEOUT);
      
      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PineappleApp/1.0',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('✅ Basic connectivity test passed');
        return true;
      } else if (response.status === 502) {
        console.log('⚠️ Server returning 502 - likely cold start');
        return false;
      }
      
      return response.status < 500;
    } catch (error) {
      console.log('❌ Connectivity test failed:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Warm up the server with proper cold start handling
   */
  async warmUpServer(): Promise<boolean> {
    console.log('🔥 Warming up Render.com server (may take 30-60 seconds)...');
    
    const maxWarmupTime = API_CONFIG.WARMUP_TIMEOUT; // Use config value
    const checkInterval = 2000; // Check every 2 seconds (faster)
    const startTime = Date.now();
    
    let testPassed = false;
    let healthPassed = false;
    let predictionReady = false;
    
    while (Date.now() - startTime < maxWarmupTime) {
      try {
        // Step 1: Test basic connectivity
        if (!testPassed) {
          console.log('🔄 Step 1: Testing connectivity...');
          testPassed = await this.testConnectivity();
          if (testPassed) {
            console.log('✅ Step 1 complete: Basic connectivity established');
          }
        }
        
        // Step 2: Check health endpoint
        if (testPassed && !healthPassed) {
          console.log('🔄 Step 2: Checking server health...');
          try {
            const healthController = new AbortController();
            const healthTimeoutId = setTimeout(() => healthController.abort(), API_CONFIG.TEST_TIMEOUT);
            
            const healthResponse = await fetch(`${this.config.baseUrl}/health`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'PineappleApp/1.0',
              },
              signal: healthController.signal,
            });
            
            clearTimeout(healthTimeoutId);
            
            if (healthResponse.ok) {
              console.log('✅ Step 2 complete: Server health OK');
              healthPassed = true;
            } else if (healthResponse.status === 502) {
              console.log('⚠️ Still getting 502 - server warming up...');
            }
          } catch (error) {
            console.log('🔄 Health check still failing...');
          }
        }
        
        // Step 3: Test prediction endpoint readiness
        if (testPassed && healthPassed && !predictionReady) {
          console.log('🔄 Step 3: Testing prediction readiness...');
          try {
            // Create a minimal test request
            const testFormData = new FormData();
            testFormData.append('file', 'test'); // Minimal test data
            
            const predictionController = new AbortController();
            const predictionTimeoutId = setTimeout(() => predictionController.abort(), API_CONFIG.TEST_TIMEOUT);
            
            const predictionResponse = await fetch(`${this.config.baseUrl}/predict`, {
              method: 'POST',
              headers: {
                'User-Agent': 'PineappleApp/1.0',
              },
              body: testFormData,
              signal: predictionController.signal,
            });
            
            clearTimeout(predictionTimeoutId);
            
            // Accept various response codes that indicate the endpoint is ready
            if (predictionResponse.status === 422 || predictionResponse.status === 200 || predictionResponse.status === 400) {
              console.log('🎉 Server fully warmed up and ready!');
              predictionReady = true;
              return true;
            } else if (predictionResponse.status === 502) {
              console.log('⚠️ Prediction endpoint still cold...');
            }
          } catch (error) {
            console.log('🔄 Prediction endpoint not ready yet...');
          }
        }
        
        // If we have basic connectivity and health, we can proceed
        if (testPassed && healthPassed && !predictionReady) {
          console.log('✅ Server is responsive, proceeding with analysis...');
          return true;
        }
        
      } catch (error) {
        console.log('🔄 Warmup step failed, continuing...');
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    console.warn('⏰ Server warmup timed out - proceeding anyway');
    return testPassed || healthPassed;
  }

  /**
   * Analyze a pineapple image using the backend API
   */
  async analyzePineapple(imageUri: string): Promise<TransformedAnalysisResult> {
    const startTime = Date.now();

    try {
      console.log('🔍 Starting backend pineapple analysis...', imageUri);
      console.log('🍍 Sending image to backend for analysis...');
      console.log(`📸 Image URI: ${imageUri}`);

      // Check network connectivity first
      console.log('🔍 Checking network connectivity...');
      const connectivityCheck = await this.checkNetworkConnectivity();
      if (!connectivityCheck.connected) {
        throw new NetworkError(
          `Network connectivity failed: ${connectivityCheck.error}`,
          'CONNECTIVITY_FAILED'
        );
      }
      console.log('✅ Network connectivity check passed');
      console.log('✅ Network connectivity confirmed');

      // Test connectivity first, then warm up if needed
      console.log('🔍 Testing server connectivity before analysis...');
      
      // Try a quick connectivity test first
      let isConnected = false;
      try {
        isConnected = await this.testConnectivity();
      } catch (error) {
        console.log('⚠️ Quick connectivity test failed, proceeding with warmup...');
      }
      
      if (!isConnected) {
        console.log('⚠️ Server not responding - attempting warm-up...');
        const warmedUp = await this.warmUpServer();
        if (!warmedUp) {
          // Even if warmup fails, try to proceed with the analysis
          console.log('⚠️ Warmup failed, but attempting analysis anyway...');
        } else {
          console.log('✅ Server warmed up successfully');
        }
      } else {
        console.log('✅ Server is ready for analysis');
      }

      // Create FormData for Gradio API
      const formData = new FormData();
      
      // Extract filename from URI or create a default one
      const filename = imageUri.split('/').pop() || 'pineapple.jpg';
      console.log(`📁 Filename: ${filename}`);
      
      // Docker API expects the image as a file upload
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: filename,
      } as any);
      
      console.log('📋 FormData contents:', formData);
      console.log('📋 Image URI type:', typeof imageUri);
      console.log('📋 Image URI length:', imageUri.length);
      console.log('📋 FormData field name: file');
      console.log('📋 Image file info:', {
        filename,
        type: 'image/jpeg',
        uri: imageUri.substring(0, 50) + '...'
      });
      
      console.log('📤 FormData prepared, sending to backend...');
      console.log('🧪 To test with curl, use:');
      console.log(`curl -X POST ${this.config.baseUrl}/predict -F "file=@your_image.jpg"`);

      // Use progressive timeout strategy for image uploads
      const originalTimeout = this.config.timeout;
      
      // Retry logic with progressive timeout and delay
      const maxRetries = API_CONFIG.MAX_RETRIES;
      let lastResponse: Response | null = null;
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`📤 Attempt ${attempt}/${maxRetries}: Sending to backend...`);
          
          // Progressive timeout: start with shorter timeout, increase with each retry
          const progressiveTimeout = API_CONFIG.PROGRESSIVE_TIMEOUT ? 
            Math.min(30000 + (attempt * 15000), API_CONFIG.UPLOAD_TIMEOUT) : 
            API_CONFIG.UPLOAD_TIMEOUT;
          
          this.config.timeout = progressiveTimeout;
          console.log(`⏱️ Using timeout: ${progressiveTimeout}ms for attempt ${attempt}`);
          
          const response = await this.makeRequest('/predict', {
            method: 'POST',
            body: formData,
            // Don't set Content-Type for FormData - let browser set it with boundary
          });
          
          lastResponse = response;
          
          if (response.ok) {
            // Success! Break out of retry loop
            console.log('✅ Upload successful on attempt', attempt);
            break;
          } else if ((response.status === 500 || response.status === 502) && attempt < maxRetries) {
            // Server error (500 = model loading, 502 = cold start), retry after delay
            const errorType = response.status === 502 ? 'cold start' : 'model loading';
            const retryDelay = API_CONFIG.PROGRESSIVE_DELAY ? 
              Math.min(API_CONFIG.RETRY_DELAY * attempt, API_CONFIG.MAX_RETRY_DELAY) : 
              API_CONFIG.RETRY_DELAY;
            
            console.log(`⚠️ Server error (${response.status} - ${errorType}) on attempt ${attempt}, retrying in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          } else {
            // Other error or final attempt, throw error
            throw new BackendError(
              `Backend error: ${response.statusText}`,
              'BACKEND_ERROR',
              response.status
            );
          }
        } catch (error) {
          lastError = error as Error;
          
          // Check if this is a timeout or network error that we can retry
          const isRetryableError = error instanceof Error && (
            error.message.includes('timeout') ||
            error.message.includes('Aborted') ||
            error.message.includes('Network request failed')
          );
          
          if (attempt < maxRetries && isRetryableError) {
            const retryDelay = API_CONFIG.PROGRESSIVE_DELAY ? 
              Math.min(API_CONFIG.RETRY_DELAY * attempt, API_CONFIG.MAX_RETRY_DELAY) : 
              API_CONFIG.RETRY_DELAY;
            
            console.log(`⚠️ Request failed on attempt ${attempt}: ${error.message}`);
            console.log(`🔄 Retrying in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          } else {
            // Log detailed error information
            console.error('🚨 Error details:', {
              message: error instanceof Error ? error.message : 'Unknown error',
              name: error instanceof Error ? error.name : 'Unknown',
              stack: error instanceof Error ? error.stack : 'No stack trace'
            });
            throw error;
          }
        }
      }
      
      // Restore original timeout
      this.config.timeout = originalTimeout;

      if (!lastResponse?.ok) {
        // Create more detailed error message
        const errorDetails = {
          attempts: maxRetries,
          lastStatus: lastResponse?.status,
          lastStatusText: lastResponse?.statusText,
          lastError: lastError?.message,
          timeout: this.config.timeout
        };
        
        console.error('🚨 All retry attempts failed:', errorDetails);
        
        throw new BackendError(
          `Backend server is not available. Please check that the server is running.`,
          'BACKEND_ERROR',
          lastResponse?.status || 500
        );
      }
      
      const response = lastResponse;

      const data: BackendPredictionResponse = await response.json();
      console.log('✅ Backend analysis complete:', data);
      console.log('🔍 Key fields:', {
        is_pineapple: data.is_pineapple,
        confidence: data.detection_confidence,
        total_detections: data.total_detections
      });

      // Transform the response to match app expectations
      const result = this.transformBackendResponse(data, Date.now() - startTime);
      console.log('🔄 Transformed result:', {
        isPineapple: result.isPineapple,
        status: result.status,
        message: result.message
      });

      // Save analysis to local database
      try {
        await this.saveAnalysisToDatabase(result, imageUri, Date.now() - startTime);
      } catch (dbError) {
        console.warn('⚠️ Failed to save to local database:', dbError);
        // Don't fail the entire operation if database save fails
      }

      return result;

    } catch (error) {
      logError(error, 'Backend Analysis');
      const apiError = handleApiError(error);
      
      return {
        isPineapple: false,
        detectionConfidence: 0,
        sweetness: null,
        status: 'error',
        message: apiError.message,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Save analysis result to local database
   */
  private async saveAnalysisToDatabase(
    result: TransformedAnalysisResult, 
    imageUri: string, 
    processingTime: number
  ): Promise<void> {
    try {
      console.log('💾 Saving analysis to local database...');

      const analysisRecord: Omit<AnalysisRecord, 'id'> = {
        timestamp: new Date().toISOString(),
        imagePath: imageUri,
        isPineapple: result.isPineapple,
        detectionConfidence: result.detectionConfidence,
        sweetness: result.sweetness?.sweetness || undefined,
        sweetnessConfidence: result.sweetness?.confidence || undefined,
        sweetnessCategory: result.sweetness?.category || undefined,
        boundingBox: result.boundingBox ? JSON.stringify(result.boundingBox) : undefined,
        processingTime: processingTime,
        method: result.sweetness?.method || 'backend_analysis'
      };

      await databaseService.saveAnalysis(analysisRecord);
      console.log('✅ Analysis saved to local database');
    } catch (error) {
      console.error('❌ Failed to save analysis to database:', error);
      throw error;
    }
  }

  /**
   * Get analysis history from local database
   */
  async getLocalHistory(limit: number = 50): Promise<AnalysisRecord[]> {
    try {
      console.log('📋 Fetching analysis history from local database...');
      const history = await databaseService.getAnalysisHistory(limit);
      console.log(`✅ Retrieved ${history.length} local analysis records`);
      return history;
    } catch (error) {
      console.error('❌ Failed to fetch local history:', error);
      return [];
    }
  }

  /**
   * Get analysis history from the backend
   */
  async getHistory(limit: number = 50): Promise<BackendHistoryItem[]> {
    try {
      console.log('📋 Fetching analysis history...');
      
      const response = await this.makeRequest(`/history?limit=${limit}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status} ${response.statusText}`);
      }

      const data: BackendHistoryItem[] = await response.json();
      console.log(`✅ Retrieved ${data.length} history items`);
      return data;

    } catch (error) {
      console.error('❌ Failed to fetch history:', error);
      return [];
    }
  }

  /**
   * Transform backend response to app-expected format
   */
  private transformBackendResponse(data: BackendPredictionResponse, processingTime: number): TransformedAnalysisResult {
    // Convert detection results
    let boundingBox: { x: number; y: number; width: number; height: number } | undefined;
    
    if (data.detections && data.detections.length > 0) {
      const detection = data.detections[0]; // Use the first/best detection
      const [x1, y1, x2, y2] = detection.bbox;
      boundingBox = {
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1,
      };
    }

    // Convert sweetness analysis if pineapple was detected
    let sweetness = null;
    if (data.is_pineapple && data.prediction && data.confidence !== null) {
      // Convert class prediction to sweetness percentage
      const sweetnessPercentage = this.convertClassToSweetness(data.prediction, data.probabilities);
      
      sweetness = {
        sweetness: sweetnessPercentage,
        confidence: data.confidence,
        category: this.getSweetnessCategory(sweetnessPercentage),
        sweetnessClass: data.prediction,
        displayTitle: this.getDisplayTitle(sweetnessPercentage),
        colorIndicator: this.getColorIndicator(sweetnessPercentage),
        emoji: '🍍',
        recommendation: this.getRecommendation(sweetnessPercentage),
        characteristics: [
          `Sweetness: ${sweetnessPercentage}%`,
          `Confidence: ${(data.confidence * 100).toFixed(0)}%`,
          `Method: Backend Analysis`,
          'Detection: Pineapple'
        ],
        qualityMetrics: {
          ripeness: sweetnessPercentage >= 70 ? 'Ready' : sweetnessPercentage >= 50 ? 'Good' : 'Wait',
          eatingExperience: sweetnessPercentage >= 70 ? 'Great' : sweetnessPercentage >= 50 ? 'Good' : 'OK',
          bestUse: sweetnessPercentage >= 60 ? 'Eat fresh' : 'Cook with it'
        },
        method: 'backend_analysis',
        processingTime: processingTime,
      };
    }

    return {
      isPineapple: data.is_pineapple,
      detectionConfidence: data.detection_confidence,
      boundingBox,
      sweetness,
      status: data.is_pineapple ? 'success' : 'no_pineapple',
      message: data.is_pineapple ? 'Analysis completed successfully' : 'No pineapple detected in the image',
      processingTime,
    };
  }

  /**
   * Convert class prediction to sweetness percentage
   */
  private convertClassToSweetness(prediction: string, probabilities: { High?: number; Medium?: number; Low?: number } | null): number {
    if (probabilities) {
      // Use weighted average based on probabilities
      const high = (probabilities.High || 0) * 95;    // High = 95% sweetness
      const medium = (probabilities.Medium || 0) * 65; // Medium = 65% sweetness
      const low = (probabilities.Low || 0) * 25;       // Low = 25% sweetness
      return Math.round(high + medium + low);
    }

    // Fallback to simple mapping
    switch (prediction.toLowerCase()) {
      case 'high':
        return 85;
      case 'medium':
        return 65;
      case 'low':
        return 35;
      default:
        return 50;
    }
  }

  /**
   * Get sweetness category from percentage
   */
  private getSweetnessCategory(sweetness: number): string {
    if (sweetness >= 80) return 'High Sweetness';
    if (sweetness >= 60) return 'Medium Sweetness';
    if (sweetness >= 40) return 'Low Sweetness';
    return 'Very Low Sweetness';
  }

  /**
   * Get display title based on sweetness
   */
  private getDisplayTitle(sweetness: number): string {
    if (sweetness >= 75) return 'High';
    if (sweetness >= 60) return 'Medium';
    if (sweetness >= 45) return 'Low';
    return 'Very Low';
  }

  /**
   * Get color indicator based on sweetness
   */
  private getColorIndicator(sweetness: number): string {
    if (sweetness >= 75) return '#22C55E'; // Green
    if (sweetness >= 60) return '#3B82F6'; // Blue
    if (sweetness >= 45) return '#F59E0B'; // Amber
    return '#6B7280'; // Gray
  }

  /**
   * Get recommendation based on sweetness
   */
  private getRecommendation(sweetness: number): string {
    if (sweetness >= 75) return 'Perfect for eating';
    if (sweetness >= 60) return 'Great for most uses';
    if (sweetness >= 45) return 'Best for cooking';
    return 'Wait a few days';
  }

  /**
   * Make HTTP request with proper error handling and timeout
   */
  private async makeRequest(endpoint: string, options: RequestInit): Promise<Response> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const url = `${this.config.baseUrl}${endpoint}`;
    
    // Debug logging
    console.log(`🌐 Making request to: ${url}`);
    console.log(`🔧 Request method: ${options.method || 'GET'}`);
    console.log(`⏱️ Timeout: ${this.config.timeout}ms`);
    
    // Create timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`⏰ Request timeout after ${this.config.timeout}ms - aborting...`);
      controller.abort();
    }, this.config.timeout);

    try {
      // Log the request details
      console.log('📋 Request details:', {
        url,
        method: options.method,
        hasBody: !!options.body,
        isFormData: options.body instanceof FormData,
        timeout: this.config.timeout
      });

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PineappleApp/1.0',
          'Cache-Control': 'no-cache',
          // Only set Content-Type if not FormData - let React Native handle FormData headers
          ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
          ...options.headers,
        },
      });
      
      console.log(`✅ Response status: ${response.status} ${response.statusText}`);
      console.log(`📊 Response headers:`, response.headers);

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      console.error('🚨 Network request failed:', error);
      console.error('🔍 Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        url,
        method: options.method
      });
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError(
          `Request timeout after ${this.config.timeout}ms`,
          'TIMEOUT'
        );
      }
      
      // Enhanced error information for network failures
      if (error instanceof Error && error.message.includes('Network request failed')) {
        throw new NetworkError(
          `Network connection failed. Please check:\n1. Backend server is running on ${this.config.baseUrl}\n2. Device is connected to the same network\n3. Firewall allows connections to port 8000\n4. Try testing ${this.config.baseUrl}/health in a browser`,
          'NETWORK_FAILED'
        );
      }
      
      throw error;
    }
  }

  /**
   * Check network connectivity and test basic connection
   */
  async checkNetworkConnectivity(): Promise<{ connected: boolean; error?: string }> {
    try {
      // Test a simple fetch to a known endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PineappleApp/1.0',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('✅ Network connectivity check passed');
        return { connected: true };
      } else {
        return { 
          connected: false, 
          error: `Server responded with status ${response.status}` 
        };
      }
    } catch (error) {
      console.error('❌ Network connectivity check failed:', error);
      return { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Unknown network error' 
      };
    }
  }

  /**
   * Test connection to the backend
   */
  async testConnection(): Promise<{ success: boolean; message: string; latency?: number }> {
    const startTime = Date.now();
    
    try {
      const health = await this.checkHealth();
      const latency = Date.now() - startTime;
      
      if (health) {
        return {
          success: true,
          message: `Connected successfully (${latency}ms)`,
          latency,
        };
      } else {
        return {
          success: false,
          message: 'Backend is not responding properly',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;