/**
 * Offline Settings Component
 * 
 * This component provides settings for managing offline mode,
 * local database, and app preferences.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Switch, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  ScrollView,
  ActivityIndicator 
} from 'react-native';
import { apiService } from '../services/apiService';
import { databaseService } from '../services/databaseService';

interface DatabaseStats {
  total: number;
  pineapple_count: number;
  non_pineapple_count: number;
  avg_processing_time: number;
  first_analysis: string;
  last_analysis: string;
}

export const OfflineSettings: React.FC = () => {
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // Load offline mode setting
      const offlineMode = apiService.isOfflineModeEnabled();
      setIsOfflineMode(offlineMode);
      
      // Load database stats
      const stats = await apiService.getLocalStats();
      setDbStats(stats);
      
    } catch (error) {
      console.error('❌ Failed to load settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOfflineMode = async (enabled: boolean) => {
    try {
      await apiService.setOfflineMode(enabled);
      setIsOfflineMode(enabled);
      
      Alert.alert(
        'Offline Mode',
        enabled 
          ? 'Offline mode enabled. The app will use local analysis.' 
          : 'Online mode enabled. The app will try to connect to the backend.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Failed to toggle offline mode:', error);
      Alert.alert('Error', 'Failed to update offline mode setting');
    }
  };

  const testConnection = async () => {
    try {
      setIsTestingConnection(true);
      
      const result = await apiService.testConnection();
      
      Alert.alert(
        'Connection Test',
        result.success 
          ? `✅ ${result.message}` 
          : `❌ ${result.message}`,
        [{ text: 'OK' }]
      );
      
      // Refresh settings after connection test
      await loadSettings();
      
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      Alert.alert('Error', 'Connection test failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const clearLocalData = () => {
    Alert.alert(
      'Clear Local Data',
      'This will delete all locally stored analysis results. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.clearLocalHistory();
              Alert.alert('Success', 'Local data cleared successfully');
              await loadSettings(); // Refresh stats
            } catch (error) {
              console.error('❌ Failed to clear local data:', error);
              Alert.alert('Error', 'Failed to clear local data');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return 'Invalid date';
    }
  };

  const formatDuration = (milliseconds: number | null): string => {
    if (!milliseconds) return 'N/A';
    return `${Math.round(milliseconds)}ms`;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        
        {/* Connection Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection Status</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Offline Mode</Text>
              <Text style={styles.settingDescription}>
                {isOfflineMode 
                  ? 'App runs locally without backend connection'
                  : 'App connects to backend server when available'
                }
              </Text>
            </View>
            <Switch
              value={isOfflineMode}
              onValueChange={toggleOfflineMode}
              trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              thumbColor={isOfflineMode ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={testConnection}
            disabled={isTestingConnection}
          >
            {isTestingConnection ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Test Backend Connection</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Database Statistics */}
        {dbStats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Local Database Statistics</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{dbStats.total || 0}</Text>
                <Text style={styles.statLabel}>Total Analyses</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{dbStats.pineapple_count || 0}</Text>
                <Text style={styles.statLabel}>Pineapple Found</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{dbStats.non_pineapple_count || 0}</Text>
                <Text style={styles.statLabel}>No Pineapple</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatDuration(dbStats.avg_processing_time)}</Text>
                <Text style={styles.statLabel}>Avg Processing</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>First Analysis:</Text>
              <Text style={styles.infoValue}>{formatDate(dbStats.first_analysis)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Analysis:</Text>
              <Text style={styles.infoValue}>{formatDate(dbStats.last_analysis)}</Text>
            </View>
          </View>
        )}

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity 
            style={[styles.button, styles.dangerButton]} 
            onPress={clearLocalData}
          >
            <Text style={styles.buttonText}>Clear Local Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={loadSettings}
          >
            <Text style={styles.buttonText}>Refresh Statistics</Text>
          </TouchableOpacity>
        </View>

        {/* Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Offline Mode</Text>
          
          <Text style={styles.infoText}>
            • Offline mode allows the app to work without internet connection
          </Text>
          <Text style={styles.infoText}>
            • Analysis results are stored locally in SQLite database
          </Text>
          <Text style={styles.infoText}>
            • Offline analysis uses basic color detection algorithms
          </Text>
          <Text style={styles.infoText}>
            • For best accuracy, use online mode with backend connection
          </Text>
        </View>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default OfflineSettings;
