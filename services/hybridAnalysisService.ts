import { apiService, TransformedAnalysisResult } from './apiService';
import { localAnalysisService, LocalAnalysisResult } from './localAnalysisService';
import { databaseService, AnalysisRecord } from './databaseService';

export interface HybridAnalysisResult {
  isPineapple: boolean;
  detectionConfidence: number;
  sweetness: {
    sweetness: number;
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
  source: 'backend' | 'local' | 'cached';
}

class HybridAnalysisService {
  private isInitialized = false;

  /**
   * Initialize the hybrid analysis service
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔄 Initializing hybrid analysis service...');
      
      // Initialize both services
      await Promise.all([
        apiService.initialize(),
        localAnalysisService.initialize()
      ]);
      
      this.isInitialized = true;
      console.log('✅ Hybrid analysis service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize hybrid analysis service:', error);
      throw error;
    }
  }

  /**
   * Analyze pineapple image with automatic fallback
   */
  async analyzePineapple(imageUri: string): Promise<HybridAnalysisResult> {
    const startTime = Date.now();

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log('🍍 Starting hybrid pineapple analysis...');
      console.log(`📸 Image URI: ${imageUri}`);

      // Try backend analysis first
      try {
        console.log('🌐 Attempting backend analysis...');
        const backendResult = await apiService.analyzePineapple(imageUri);
        
        const hybridResult: HybridAnalysisResult = {
          ...backendResult,
          source: 'backend',
          processingTime: Date.now() - startTime
        };

        console.log('✅ Backend analysis completed successfully');
        return hybridResult;

      } catch (backendError) {
        console.warn('⚠️ Backend analysis failed, falling back to local analysis:', backendError);
        
        // Fallback to local analysis
        try {
          console.log('🔧 Attempting local analysis...');
          const localResult = await localAnalysisService.analyzePineapple(imageUri);
          
          const hybridResult: HybridAnalysisResult = {
            ...localResult,
            source: 'local',
            processingTime: Date.now() - startTime
          };

          console.log('✅ Local analysis completed successfully');
          return hybridResult;

        } catch (localError) {
          console.error('❌ Both backend and local analysis failed:', localError);
          
          // Return error result
          return {
            isPineapple: false,
            detectionConfidence: 0,
            sweetness: null,
            status: 'error',
            message: 'Analysis failed. Both backend and local analysis are unavailable.',
            processingTime: Date.now() - startTime,
            source: 'local'
          };
        }
      }

    } catch (error) {
      console.error('❌ Hybrid analysis failed:', error);
      
      return {
        isPineapple: false,
        detectionConfidence: 0,
        sweetness: null,
        status: 'error',
        message: 'Analysis service initialization failed',
        processingTime: Date.now() - startTime,
        source: 'local'
      };
    }
  }

  /**
   * Get analysis history (from local database)
   */
  async getHistory(limit: number = 50): Promise<AnalysisRecord[]> {
    try {
      console.log('📋 Fetching analysis history...');
      const history = await databaseService.getAnalysisHistory(limit);
      console.log(`✅ Retrieved ${history.length} analysis records`);
      return history;
    } catch (error) {
      console.error('❌ Failed to fetch analysis history:', error);
      return [];
    }
  }

  /**
   * Get analysis statistics
   */
  async getStats(): Promise<{
    totalAnalyses: number;
    pineappleDetections: number;
    averageProcessingTime: number;
    lastAnalysis?: string;
    backendAnalyses: number;
    localAnalyses: number;
  }> {
    try {
      const stats = await databaseService.getStats();
      
      // Get method breakdown
      const methodStats = await this.getMethodBreakdown();
      
      return {
        ...stats,
        backendAnalyses: methodStats.backend,
        localAnalyses: methodStats.local
      };
    } catch (error) {
      console.error('❌ Failed to fetch analysis statistics:', error);
      return {
        totalAnalyses: 0,
        pineappleDetections: 0,
        averageProcessingTime: 0,
        backendAnalyses: 0,
        localAnalyses: 0
      };
    }
  }

  /**
   * Get method breakdown from database
   */
  private async getMethodBreakdown(): Promise<{ backend: number; local: number }> {
    try {
      // This would require a more complex query, for now return mock data
      // In a real implementation, you'd query the database for method counts
      return {
        backend: 0, // Would count rows where method = 'backend_analysis'
        local: 0    // Would count rows where method = 'local_analysis'
      };
    } catch (error) {
      return { backend: 0, local: 0 };
    }
  }

  /**
   * Test backend connectivity
   */
  async testBackendConnectivity(): Promise<{
    connected: boolean;
    message: string;
    latency?: number;
  }> {
    try {
      console.log('🔍 Testing backend connectivity...');
      const result = await apiService.testConnection();
      
      return {
        connected: result.success,
        message: result.message,
        latency: result.latency
      };
    } catch (error) {
      return {
        connected: false,
        message: `Backend test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Clear analysis history
   */
  async clearHistory(): Promise<void> {
    try {
      console.log('🗑️ Clearing analysis history...');
      await databaseService.clearHistory();
      console.log('✅ Analysis history cleared');
    } catch (error) {
      console.error('❌ Failed to clear analysis history:', error);
      throw error;
    }
  }

  /**
   * Get a specific analysis by ID
   */
  async getAnalysisById(id: number): Promise<AnalysisRecord | null> {
    try {
      return await databaseService.getAnalysisById(id);
    } catch (error) {
      console.error('❌ Failed to fetch analysis by ID:', error);
      return null;
    }
  }

  /**
   * Delete a specific analysis
   */
  async deleteAnalysis(id: number): Promise<boolean> {
    try {
      return await databaseService.deleteAnalysis(id);
    } catch (error) {
      console.error('❌ Failed to delete analysis:', error);
      return false;
    }
  }

  /**
   * Check if backend is available
   */
  async isBackendAvailable(): Promise<boolean> {
    try {
      const connectivity = await this.testBackendConnectivity();
      return connectivity.connected;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get service status
   */
  async getServiceStatus(): Promise<{
    hybrid: boolean;
    backend: boolean;
    local: boolean;
    database: boolean;
  }> {
    try {
      const [backendAvailable, dbStats] = await Promise.all([
        this.isBackendAvailable(),
        databaseService.getStats().catch(() => ({ totalAnalyses: 0 }))
      ]);

      return {
        hybrid: this.isInitialized,
        backend: backendAvailable,
        local: this.isInitialized, // Local service is always available if initialized
        database: dbStats.totalAnalyses >= 0 // Simple check if database is working
      };
    } catch (error) {
      return {
        hybrid: false,
        backend: false,
        local: false,
        database: false
      };
    }
  }
}

// Export singleton instance
export const hybridAnalysisService = new HybridAnalysisService();
export default hybridAnalysisService;