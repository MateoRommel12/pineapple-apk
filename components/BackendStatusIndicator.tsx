import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { apiService } from '../services/apiService';
import { theme } from '../theme';

interface BackendStatusIndicatorProps {
  onStatusChange?: (isConnected: boolean) => void;
}

export default function BackendStatusIndicator({ onStatusChange }: BackendStatusIndicatorProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkBackendStatus = async () => {
    setIsChecking(true);
    try {
      const connectionTest = await apiService.testConnection();
      setIsConnected(connectionTest.success);
      setLastCheck(new Date());
      
      if (onStatusChange) {
        onStatusChange(connectionTest.success);
      }

      if (!connectionTest.success) {
        console.warn('Backend connection failed:', connectionTest.message);
      }
    } catch (error) {
      setIsConnected(false);
      if (onStatusChange) {
        onStatusChange(false);
      }
      console.error('Backend status check error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const showConnectionDetails = () => {
    const config = apiService.getConfig();
    Alert.alert(
      'Backend Connection',
      `Server: ${config.baseUrl}\nStatus: ${isConnected ? 'Connected' : 'Disconnected'}\nLast Check: ${lastCheck ? lastCheck.toLocaleTimeString() : 'Never'}`,
      [
        { text: 'Check Again', onPress: checkBackendStatus },
        { text: 'OK' }
      ]
    );
  };

  useEffect(() => {
    // Check status on mount
    checkBackendStatus();
    
    // Set up periodic checks every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (isChecking) return theme.colors?.yellow?.[500] || '#F59E0B';
    if (isConnected === null) return theme.colors?.textMuted || '#9CA3AF';
    return isConnected ? (theme.colors?.green?.[500] || '#10B981') : (theme.colors?.red?.[500] || '#EF4444');
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking...';
    if (isConnected === null) return 'Unknown';
    return isConnected ? 'Connected' : 'Disconnected';
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { borderColor: getStatusColor() }]} 
      onPress={showConnectionDetails}
      activeOpacity={0.7}
    >
      <View style={[styles.indicator, { backgroundColor: getStatusColor() }]} />
      <View style={styles.textContainer}>
        <Text style={styles.label}>Backend</Text>
        <Text style={[styles.status, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: theme.colors?.textMuted || '#6B7280',
    fontWeight: '500',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
});