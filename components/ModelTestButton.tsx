import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Play, Activity } from 'react-native-feather';
import { runManualModelTest } from '../tests/modelIntegration.test';
import { theme } from '../theme';

export default function ModelTestButton() {
  const [isTesting, setIsTesting] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<any>(null);

  const handleTest = async () => {
    setIsTesting(true);
    
    try {
      const result = await runManualModelTest();
      setLastTestResult(result);
      
      if (result.success) {
        Alert.alert(
          '✅ Model Test Passed!',
          `Models are working correctly.\n\nYOLOv8: ${result.modelStatus?.yoloModel ? 'Loaded' : 'Fallback'}\nMobileNetV2: ${result.modelStatus?.sweetnessModel ? 'Loaded' : 'Fallback'}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '❌ Model Test Failed',
          `Error: ${result.error}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        '❌ Test Error', 
        error.message || 'Unknown error occurred',
        [{ text: 'OK' }]
      );
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.testButton, isTesting && styles.testButtonDisabled]}
        onPress={handleTest}
        disabled={isTesting}
      >
        {isTesting ? (
          <Activity width={20} height={20} color="white" />
        ) : (
          <Play width={20} height={20} color="white" />
        )}
        <Text style={styles.buttonText}>
          {isTesting ? 'Testing Models...' : 'Test AI Models'}
        </Text>
      </TouchableOpacity>
      
      {lastTestResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Last Test Result:</Text>
          <Text style={[
            styles.resultText, 
            { color: lastTestResult.success ? theme.colors.green[600] : theme.colors.red[600] }
          ]}>
            {lastTestResult.success ? '✅ Success' : '❌ Failed'}
          </Text>
          {lastTestResult.success && (
            <View style={styles.modelStatusContainer}>
              <Text style={styles.modelStatusText}>
                YOLOv8: {lastTestResult.modelStatus.yoloModel ? '✅ Your Model' : '⚠️ Fallback'}
              </Text>
              <Text style={styles.modelStatusText}>
                MobileNetV2: {lastTestResult.modelStatus.sweetnessModel ? '✅ Your Model' : '⚠️ Fallback'}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.yellow[600],
    padding: 12,
    borderRadius: 8,
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: theme.colors.muted,
    borderRadius: 8,
  },
  resultTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  modelStatusContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 8,
  },
  modelStatusText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 2,
  },
}); 