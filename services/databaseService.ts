import * as SQLite from 'expo-sqlite';

// Database interface
export interface AnalysisRecord {
  id: number;
  timestamp: string;
  imagePath: string;
  isPineapple: boolean;
  detectionConfidence: number;
  sweetness?: number;
  sweetnessConfidence?: number;
  sweetnessCategory?: string;
  boundingBox?: string; // JSON string
  processingTime: number;
  method: string; // 'backend_analysis' or 'local_analysis'
}

export interface DatabaseResult {
  insertId?: number;
  rowsAffected: number;
  rows?: any[];
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  /**
   * Initialize the database
   */
  async initialize(): Promise<void> {
    try {
      console.log('🗄️ Initializing SQLite database...');
      
      // Open the database (creates if it doesn't exist)
      this.db = await SQLite.openDatabaseAsync('pineapple_analysis.db');
      
      // Create tables
      await this.createTables();
      
      this.isInitialized = true;
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Create database tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    console.log('📋 Creating database tables...');

    // Create analysis_history table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS analysis_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        image_path TEXT NOT NULL,
        is_pineapple BOOLEAN NOT NULL,
        detection_confidence REAL NOT NULL,
        sweetness REAL,
        sweetness_confidence REAL,
        sweetness_category TEXT,
        bounding_box TEXT,
        processing_time INTEGER NOT NULL,
        method TEXT NOT NULL DEFAULT 'backend_analysis'
      );
    `);

    // Create user_settings table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    console.log('✅ Database tables created successfully');
  }

  /**
   * Save analysis result to database
   */
  async saveAnalysis(analysis: Omit<AnalysisRecord, 'id'>): Promise<number> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.db) throw new Error('Database not initialized');

    try {
      console.log('💾 Saving analysis to database...');

      const result = await this.db.runAsync(
        `INSERT INTO analysis_history (
          timestamp, image_path, is_pineapple, detection_confidence,
          sweetness, sweetness_confidence, sweetness_category, bounding_box,
          processing_time, method
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          analysis.timestamp,
          analysis.imagePath,
          analysis.isPineapple ? 1 : 0,
          analysis.detectionConfidence,
          analysis.sweetness || null,
          analysis.sweetnessConfidence || null,
          analysis.sweetnessCategory || null,
          analysis.boundingBox || null,
          analysis.processingTime,
          analysis.method
        ]
      );

      console.log(`✅ Analysis saved with ID: ${result.lastInsertRowId}`);
      return result.lastInsertRowId as number;
    } catch (error) {
      console.error('❌ Failed to save analysis:', error);
      throw error;
    }
  }

  /**
   * Get analysis history
   */
  async getAnalysisHistory(limit: number = 50): Promise<AnalysisRecord[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.db) throw new Error('Database not initialized');

    try {
      console.log(`📋 Fetching analysis history (limit: ${limit})...`);

      const result = await this.db.getAllAsync(
        `SELECT * FROM analysis_history 
         ORDER BY timestamp DESC 
         LIMIT ?`,
        [limit]
      );

      // Convert database rows to AnalysisRecord format
      const records: AnalysisRecord[] = result.map((row: any) => ({
        id: row.id,
        timestamp: row.timestamp,
        imagePath: row.image_path,
        isPineapple: Boolean(row.is_pineapple),
        detectionConfidence: row.detection_confidence,
        sweetness: row.sweetness,
        sweetnessConfidence: row.sweetness_confidence,
        sweetnessCategory: row.sweetness_category,
        boundingBox: row.bounding_box,
        processingTime: row.processing_time,
        method: row.method
      }));

      console.log(`✅ Retrieved ${records.length} analysis records`);
      return records;
    } catch (error) {
      console.error('❌ Failed to fetch analysis history:', error);
      throw error;
    }
  }

  /**
   * Get a specific analysis by ID
   */
  async getAnalysisById(id: number): Promise<AnalysisRecord | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.db) throw new Error('Database not initialized');

    try {
      console.log(`🔍 Fetching analysis with ID: ${id}...`);

      const result = await this.db.getFirstAsync(
        `SELECT * FROM analysis_history WHERE id = ?`,
        [id]
      );

      if (!result) {
        console.log('❌ Analysis not found');
        return null;
      }

      const record: AnalysisRecord = {
        id: (result as any).id,
        timestamp: (result as any).timestamp,
        imagePath: (result as any).image_path,
        isPineapple: Boolean((result as any).is_pineapple),
        detectionConfidence: (result as any).detection_confidence,
        sweetness: (result as any).sweetness,
        sweetnessConfidence: (result as any).sweetness_confidence,
        sweetnessCategory: (result as any).sweetness_category,
        boundingBox: (result as any).bounding_box,
        processingTime: (result as any).processing_time,
        method: (result as any).method
      };

      console.log('✅ Analysis retrieved successfully');
      return record;
    } catch (error) {
      console.error('❌ Failed to fetch analysis:', error);
      throw error;
    }
  }

  /**
   * Delete analysis record
   */
  async deleteAnalysis(id: number): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.db) throw new Error('Database not initialized');

    try {
      console.log(`🗑️ Deleting analysis with ID: ${id}...`);

      const result = await this.db.runAsync(
        `DELETE FROM analysis_history WHERE id = ?`,
        [id]
      );

      const deleted = result.changes > 0;
      console.log(`${deleted ? '✅' : '❌'} Analysis ${deleted ? 'deleted' : 'not found'}`);
      return deleted;
    } catch (error) {
      console.error('❌ Failed to delete analysis:', error);
      throw error;
    }
  }

  /**
   * Clear all analysis history
   */
  async clearHistory(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.db) throw new Error('Database not initialized');

    try {
      console.log('🗑️ Clearing all analysis history...');

      await this.db.runAsync('DELETE FROM analysis_history');
      
      console.log('✅ Analysis history cleared');
    } catch (error) {
      console.error('❌ Failed to clear history:', error);
      throw error;
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
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.db) throw new Error('Database not initialized');

    try {
      console.log('📊 Fetching database statistics...');

      const [totalResult, pineappleResult, avgTimeResult, lastResult] = await Promise.all([
        this.db.getFirstAsync('SELECT COUNT(*) as count FROM analysis_history'),
        this.db.getFirstAsync('SELECT COUNT(*) as count FROM analysis_history WHERE is_pineapple = 1'),
        this.db.getFirstAsync('SELECT AVG(processing_time) as avg_time FROM analysis_history'),
        this.db.getFirstAsync('SELECT timestamp FROM analysis_history ORDER BY timestamp DESC LIMIT 1')
      ]);

      const stats = {
        totalAnalyses: (totalResult as any)?.count || 0,
        pineappleDetections: (pineappleResult as any)?.count || 0,
        averageProcessingTime: (avgTimeResult as any)?.avg_time || 0,
        lastAnalysis: (lastResult as any)?.timestamp
      };

      console.log('✅ Database statistics retrieved:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Failed to fetch database statistics:', error);
      throw error;
    }
  }

  /**
   * Save user setting
   */
  async saveSetting(key: string, value: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.db) throw new Error('Database not initialized');

    try {
      console.log(`⚙️ Saving setting: ${key} = ${value}`);

      await this.db.runAsync(
        `INSERT OR REPLACE INTO user_settings (key, value, updated_at) 
         VALUES (?, ?, ?)`,
        [key, value, new Date().toISOString()]
      );

      console.log('✅ Setting saved successfully');
    } catch (error) {
      console.error('❌ Failed to save setting:', error);
      throw error;
    }
  }

  /**
   * Get user setting
   */
  async getSetting(key: string): Promise<string | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.db) throw new Error('Database not initialized');

    try {
      console.log(`⚙️ Getting setting: ${key}`);

      const result = await this.db.getFirstAsync(
        `SELECT value FROM user_settings WHERE key = ?`,
        [key]
      );

      return (result as any)?.value || null;
    } catch (error) {
      console.error('❌ Failed to get setting:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
      console.log('🔒 Database connection closed');
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
export default databaseService;