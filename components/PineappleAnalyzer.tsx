import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { apiService, TransformedAnalysisResult } from '../services/apiService';
import { theme } from '../theme';

interface PineappleAnalyzerProps {
  imageUri: string;
}

interface AnalysisResult {
  isPineapple: boolean;
  detectionConfidence: number;
  sweetnessLevel: string;
  sweetnessScore: number;
  confidence: number;
  category: string;
  recommendation: string;
  characteristics: string[];
}

export default function PineappleAnalyzer({ imageUri }: PineappleAnalyzerProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    analyzeImage();
  }, [imageUri]);

  const analyzeImage = async () => {
    try {
      setAnalyzing(true);
      setError(null);

      // Initialize API service if needed
      await apiService.initialize();

      // Send image to backend for analysis
      const backendResult: TransformedAnalysisResult = await apiService.analyzePineapple(imageUri);
      
      if (backendResult.status === 'error') {
        throw new Error(backendResult.message);
      }

      if (backendResult.status === 'no_pineapple') {
        setError('No pineapple detected in the image. Please try a different photo.');
        return;
      }

      // Transform backend result to component format
      if (backendResult.sweetness) {
        setResult({
          isPineapple: backendResult.isPineapple,
          detectionConfidence: backendResult.detectionConfidence,
          sweetnessLevel: backendResult.sweetness.category,
          sweetnessScore: backendResult.sweetness.sweetness,
          confidence: backendResult.sweetness.confidence,
          category: backendResult.sweetness.sweetnessClass,
          recommendation: backendResult.sweetness.recommendation,
          characteristics: backendResult.sweetness.characteristics,
        });
      } else {
        throw new Error('No sweetness analysis available');
      }
    } catch (err) {
      setError(`Analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (analyzing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors?.yellow?.[500] || '#F59E0B'} />
        <Text style={styles.loadingText}>Analyzing pineapple...</Text>
      </View>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      
      <View style={styles.resultContainer}>
        <Text style={styles.title}>Analysis Results</Text>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.label}>Detection Confidence:</Text>
          <Text style={styles.value}>{(result.detectionConfidence * 100).toFixed(1)}%</Text>
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.label}>Sweetness Score:</Text>
          <Text style={styles.value}>{result.sweetnessScore.toFixed(1)}%</Text>
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.label}>Analysis Confidence:</Text>
          <Text style={styles.value}>{(result.confidence * 100).toFixed(1)}%</Text>
        </View>
        
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Sweetness Category</Text>
          <Text style={styles.resultValue}>{result.sweetnessLevel}</Text>
        </View>
        
        <View style={styles.characteristicsBox}>
          <Text style={styles.resultTitle}>Analysis Details</Text>
          {result.characteristics.map((characteristic, index) => (
            <Text key={index} style={styles.characteristicText}>• {characteristic}</Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    ...theme.shadows.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.text,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: theme.colors?.textMuted || '#6B7280',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  resultBox: {
    backgroundColor: theme.colors.yellow[50],
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  resultTitle: {
    fontSize: 14,
    color: theme.colors?.textMuted || '#6B7280',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.yellow[700],
  },
  errorText: {
    color: theme.colors.yellow[700],
    textAlign: 'center',
    marginTop: 16,
  },
  loadingText: {
    color: theme.colors?.textMuted || '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  characteristicsBox: {
    backgroundColor: theme.colors.yellow[50],
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  characteristicText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 4,
  },
}); 