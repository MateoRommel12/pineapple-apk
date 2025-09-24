/**
 * Type definitions for react-native-sqlite-storage
 * 
 * This file provides TypeScript declarations for the SQLite library
 * to resolve import errors and provide type safety.
 */

declare module 'react-native-sqlite-storage' {
  export interface SQLiteDatabase {
    executeSql(sql: string, params?: any[]): Promise<SQLiteResult[]>;
    close(): Promise<void>;
    transaction(scope: (tx: SQLiteTransaction) => void): Promise<void>;
  }

  export interface SQLiteTransaction {
    executeSql(sql: string, params?: any[], success?: (tx: SQLiteTransaction, result: SQLiteResult) => void, error?: (tx: SQLiteTransaction, error: SQLiteError) => void): void;
  }

  export interface SQLiteResult {
    rowsAffected: number;
    insertId?: number;
    rows: {
      length: number;
      item(index: number): any;
      raw(): any[];
    };
  }

  export interface SQLiteError {
    code: number;
    message: string;
  }

  export interface DatabaseConfig {
    name: string;
    location?: string;
    createFromLocation?: string;
  }

  export interface SQLiteStatic {
    DEBUG: boolean;
    enablePromise(enabled: boolean): void;
    openDatabase(config: DatabaseConfig): Promise<SQLiteDatabase>;
    deleteDatabase(config: DatabaseConfig): Promise<void>;
  }

  const SQLite: SQLiteStatic;
  export default SQLite;
}
