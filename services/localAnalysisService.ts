import { databaseService, AnalysisRecord } from './databaseService';

// Local analysis interfaces
export interface LocalAnalysisResult {
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
}

class LocalAnalysisService {
  private isInitialized = false;

  /**
   * Initialize the local analysis service
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔧 Initializing local analysis service...');
      
      // Initialize database
      await databaseService.initialize();
      
      this.isInitialized = true;
      console.log('✅ Local analysis service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize local analysis service:', error);
      throw error;
    }
  }

  /**
   * Perform local pineapple analysis (mock implementation)
   * This can be replaced with actual local ML models later
   */
  async analyzePineapple(imageUri: string): Promise<LocalAnalysisResult> {
    const startTime = Date.now();

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log('🍍 Performing local pineapple analysis...');
      console.log(`📸 Image URI: ${imageUri}`);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock analysis - replace with actual local ML model
      const mockResult = this.performMockAnalysis();

      // Save to local database
      try {
        await this.saveAnalysisToDatabase(mockResult, imageUri, Date.now() - startTime);
      } catch (dbError) {
        console.warn('⚠️ Failed to save to local database:', dbError);
      }

      console.log('✅ Local analysis completed');
      return mockResult;

    } catch (error) {
      console.error('❌ Local analysis failed:', error);
      
      return {
        isPineapple: false,
        detectionConfidence: 0,
        sweetness: null,
        status: 'error',
        message: 'Local analysis failed',
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Mock analysis implementation
   * Replace this with actual local ML model inference
   */
  private performMockAnalysis(): LocalAnalysisResult {
    // Generate random but realistic results
    const isPineapple = Math.random() > 0.3; // 70% chance of detecting pineapple
    const detectionConfidence = isPineapple ? 0.7 + Math.random() * 0.3 : Math.random() * 0.5;
    
    let sweetness = null;
    
    if (isPineapple) {
      const sweetnessLevel = Math.random() * 100;
      const sweetnessCategory = this.getSweetnessCategory(sweetnessLevel);
      
      sweetness = {
        sweetness: Math.round(sweetnessLevel),
        confidence: 0.6 + Math.random() * 0.3,
        category: sweetnessCategory,
        sweetnessClass: this.getSweetnessClass(sweetnessLevel),
        displayTitle: this.getDisplayTitle(sweetnessLevel),
        colorIndicator: this.getColorIndicator(sweetnessLevel),
        emoji: '🍍',
        recommendation: this.getRecommendation(sweetnessLevel),
        characteristics: [
          `Sweetness: ${Math.round(sweetnessLevel)}%`,
          `Confidence: ${Math.round((0.6 + Math.random() * 0.3) * 100)}%`,
          `Method: Local Analysis`,
          'Detection: Pineapple'
        ],
        qualityMetrics: {
          ripeness: sweetnessLevel >= 70 ? 'Ready' : sweetnessLevel >= 50 ? 'Good' : 'Wait',
          eatingExperience: sweetnessLevel >= 70 ? 'Great' : sweetnessLevel >= 50 ? 'Good' : 'OK',
          bestUse: sweetnessLevel >= 60 ? 'Eat fresh' : 'Cook with it'
        },
        method: 'local_analysis',
        processingTime: 1000 + Math.random() * 500,
      };
    }

    return {
      isPineapple,
      detectionConfidence,
      sweetness,
      status: isPineapple ? 'success' : 'no_pineapple',
      message: isPineapple ? 'Local analysis completed successfully' : 'No pineapple detected in the image',
      processingTime: 1000 + Math.random() * 500,
    };
  }

  /**
   * Save analysis result to local database
   */
  private async saveAnalysisToDatabase(
    result: LocalAnalysisResult,
    imageUri: string,
    processingTime: number
  ): Promise<void> {
    try {
      console.log('💾 Saving local analysis to database...');

      const analysisRecord: Omit<AnalysisRecord, 'id'> = {
        timestamp: new Date().toISOString(),
        imagePath: imageUri,
        isPineapple: result.isPineapple,
        detectionConfidence: result.detectionConfidence,
        sweetness: result.sweetness?.sweetness || undefined,
        sweetnessConfidence: result.sweetness?.confidence || undefined,
        sweetnessCategory: result.sweetness?.category || undefined,
        boundingBox: undefined, // Local analysis doesn't provide bounding box yet
        processingTime: processingTime,
        method: 'local_analysis'
      };

      await databaseService.saveAnalysis(analysisRecord);
      console.log('✅ Local analysis saved to database');
    } catch (error) {
      console.error('❌ Failed to save local analysis to database:', error);
      throw error;
    }
  }

  /**
   * Get analysis history from local database
   */
  async getHistory(limit: number = 50): Promise<AnalysisRecord[]> {
    try {
      console.log('📋 Fetching local analysis history...');
      const history = await databaseService.getAnalysisHistory(limit);
      console.log(`✅ Retrieved ${history.length} local analysis records`);
      return history;
    } catch (error) {
      console.error('❌ Failed to fetch local analysis history:', error);
      return [];
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    totalAnalyses: number;
    pineappleDetections: number;
    averageProcessingTime: number;
    lastAnalysis?: string;
  }> {
    try {
      return await databaseService.getStats();
    } catch (error) {
      console.error('❌ Failed to fetch local analysis stats:', error);
      return {
        totalAnalyses: 0,
        pineappleDetections: 0,
        averageProcessingTime: 0
      };
    }
  }

  /**
   * Clear analysis history
   */
  async clearHistory(): Promise<void> {
    try {
      console.log('🗑️ Clearing local analysis history...');
      await databaseService.clearHistory();
      console.log('✅ Local analysis history cleared');
    } catch (error) {
      console.error('❌ Failed to clear local analysis history:', error);
      throw error;
    }
  }

  // Helper methods for sweetness analysis
  private getSweetnessCategory(sweetness: number): string {
    if (sweetness >= 80) return 'High Sweetness';
    if (sweetness >= 60) return 'Medium Sweetness';
    if (sweetness >= 40) return 'Low Sweetness';
    return 'Very Low Sweetness';
  }

  private getSweetnessClass(sweetness: number): string {
    if (sweetness >= 70) return 'High';
    if (sweetness >= 50) return 'Medium';
    return 'Low';
  }

  private getDisplayTitle(sweetness: number): string {
    if (sweetness >= 75) return 'Sweet & Ready';
    if (sweetness >= 60) return 'Good Sweetness';
    if (sweetness >= 45) return 'Moderate';
    return 'Not Ripe';
  }

  private getColorIndicator(sweetness: number): string {
    if (sweetness >= 75) return '#22C55E'; // Green
    if (sweetness >= 60) return '#3B82F6'; // Blue
    if (sweetness >= 45) return '#F59E0B'; // Amber
    return '#6B7280'; // Gray
  }

  private getRecommendation(sweetness: number): string {
    if (sweetness >= 75) return 'Perfect for eating';
    if (sweetness >= 60) return 'Great for most uses';
    if (sweetness >= 45) return 'Best for cooking';
    return 'Wait a few days';
  }
}

// Export singleton instance
export const localAnalysisService = new LocalAnalysisService();
export default localAnalysisService;