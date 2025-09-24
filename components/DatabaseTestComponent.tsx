/**
 * Database Initializer Component
 * 
 * This component handles the initialization of the SQLite database
 * when the app starts. It should be used early in the app lifecycle.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { databaseService } from '../services/databaseService';
import { apiService } from '../services/apiService';

interface DatabaseInitializerProps {
  children: React.ReactNode;
  onInitialized?: (success: boolean, error?: string) => void;
}

interface InitializationState {
  isInitializing: boolean;
  isInitialized: boolean;
  error: string | null;
  progress: string;
}

export const DatabaseInitializer: React.FC<DatabaseInitializerProps> = ({ 
  children, 
  onInitialized 
}) => {
  const [state, setState] = useState<InitializationState>({
    isInitializing: true,
    isInitialized: false,
    error: null,
    progress: 'Starting initialization...'
  });

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      setState(prev => ({ ...prev, progress: 'Initializing services...' }));
      
      // Initialize both services in parallel for faster startup
      await Promise.all([
        databaseService.initialize(),
        apiService.initialize()
      ]);
      
      console.log('✅ Services initialized');
      
      setState(prev => ({ 
        ...prev, 
        isInitializing: false,
        isInitialized: true,
        progress: 'Initialization complete!'
      }));
      
      onInitialized?.(true);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Database initialization failed:', error);
      
      setState(prev => ({
        ...prev,
        isInitializing: false,
        isInitialized: false,
        error: errorMessage,
        progress: 'Initialization failed'
      }));
      
      onInitialized?.(false, errorMessage);
    }
  };

  // Show loading screen while initializing
  if (state.isInitializing) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.title}>Initializing App</Text>
          <Text style={styles.progress}>{state.progress}</Text>
          
          <View style={styles.steps}>
            <Text style={styles.step}>📱 Setting up local database</Text>
            <Text style={styles.step}>🔗 Connecting to services</Text>
            <Text style={styles.step}>✅ Ready to analyze pineapples!</Text>
          </View>
        </View>
      </View>
    );
  }

  // Show error screen if initialization failed
  if (state.error) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.title}>Initialization Failed</Text>
          <Text style={styles.errorMessage}>{state.error}</Text>
          <Text style={styles.retryText}>
            Please restart the app to try again.
          </Text>
        </View>
      </View>
    );
  }

  // Show app content when initialization is complete
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  progress: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 30,
    textAlign: 'center',
  },
  steps: {
    alignItems: 'flex-start',
  },
  step: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 8,
    textAlign: 'left',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  errorMessage: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  retryText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default DatabaseInitializer;
