
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Platform, DeviceEventEmitter, Alert, Share } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { Camera, Upload, X, CheckCircle, Zap } from "react-native-feather"
import AsyncStorage from '@react-native-async-storage/async-storage'

import { theme } from "../theme"
import { apiService, TransformedAnalysisResult } from "../services/apiService"
import { AnalysisResultCard } from "./AnalysisResultCard"

export default function PineappleUploader() {
  const [image, setImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  const [result, setResult] = useState<TransformedAnalysisResult | null>(null)
  const [isBackendReady, setIsBackendReady] = useState(false)
  const [analysisStage, setAnalysisStage] = useState<string>('')


  useEffect(() => {
    initializeBackend()
  }, [])

  const initializeBackend = async () => {
    try {
      setAnalysisStage('Connecting...')
      
      // Initialize API service and check backend health
      await apiService.initialize()
      const connectionTest = await apiService.testConnection()
      
      setIsBackendReady(connectionTest.success)
      setAnalysisStage('')
      
      if (connectionTest.success) {
        console.log('✅ Backend connection established successfully')
      } else {
        console.warn('⚠️ Backend connection failed:', connectionTest.message)
        setAnalysisStage('Backend unavailable - check connection')
        setTimeout(() => setAnalysisStage(''), 5000)
      }
      
    } catch (error) {
      console.error('❌ Backend initialization failed:', error)
      setAnalysisStage('Backend connection failed')
      setIsBackendReady(false)
      setTimeout(() => setAnalysisStage(''), 3000)
    }
  }

  const analyzePineappleImage = async (imageUri: string): Promise<TransformedAnalysisResult> => {
    try {
      if (!isBackendReady) {
        // Try to reconnect before failing
        setAnalysisStage('Checking connection...')
        await initializeBackend()
        
        if (!isBackendReady) {
          throw new Error('Server is not available. Please check that the server is running.')
        }
      }

      console.log('🔍 Starting backend pineapple analysis...', imageUri)

      // Send image to backend for analysis
      setAnalysisStage('Analyzing...')
      const result = await apiService.analyzePineapple(imageUri)

      return result

    } catch (error) {
      console.error('Error in analyzePineappleImage:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to analyze image')
    }
  }

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== "granted") {
      Alert.alert("Permission Required", "Sorry, we need camera roll permissions to make this work!")
      return
    }

    // Launch image picker with optimized settings
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6, // Reduce quality for faster processing
      allowsEditing: false, // Don't crop - need full pineapple for detection
    })

    if (!result.canceled && result.assets[0].uri) {
      setImage(result.assets[0].uri)
      setResult(null)
    }
  }

  const takePhoto = async () => {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync()

    if (status !== "granted") {
      Alert.alert("Permission Required", "Sorry, we need camera permissions to make this work!")
      return
    }

    // Launch camera with optimized settings for faster processing
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.5, // Lower quality for faster processing
      allowsEditing: false, // Don't crop - need full pineapple for detection
    })

    if (!result.canceled && result.assets[0].uri) {
      setImage(result.assets[0].uri)
      setResult(null)
    }
  }

  const saveToHistory = async (analysisResult: TransformedAnalysisResult, imageUri: string) => {
    try {
      if (!analysisResult.sweetness) return;

      const historyKey = '@analysis_history';
      
      // Get existing history
      const existingHistory = await AsyncStorage.getItem(historyKey);
      const history = existingHistory ? JSON.parse(existingHistory) : [];

      // Create new analysis entry
      const newAnalysis = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        imageUri,
        sweetness: analysisResult.sweetness.sweetness,
        confidence: analysisResult.sweetness.confidence,
        category: analysisResult.sweetness.category,
        sweetnessClass: analysisResult.sweetness.sweetnessClass,
        displayTitle: analysisResult.sweetness.displayTitle,
        isPineapple: analysisResult.isPineapple,
        processingTime: analysisResult.processingTime,
      };

      // Add new analysis to the beginning of the array
      const updatedHistory = [newAnalysis, ...history].slice(0, 20);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(historyKey, JSON.stringify(updatedHistory));
      console.log('Successfully saved to history');

      // Emit event to update the HomeScreen
      DeviceEventEmitter.emit('analysisHistoryUpdated', updatedHistory);
      
    } catch (error) {
      console.error('Error saving to history:', error)
    }
  };

  const analyzeImage = async () => {
    if (!image) return

    setIsAnalyzing(true)
    setAnalysisStage('Initializing analysis...')
    try {
      const analysisResult = await analyzePineappleImage(image)
      setResult(analysisResult)
      
      if (analysisResult.isPineapple && analysisResult.sweetness) {
        await saveToHistory(analysisResult, image)
      }
    } catch (error) {
      console.error('Error analyzing image:', error)
      Alert.alert('Analysis Error', error instanceof Error ? error.message : 'Failed to analyze image')
    } finally {
      setIsAnalyzing(false)
      setAnalysisStage('')
    }
  }

  const resetUploader = () => {
    setImage(null)
    setResult(null)
  }


  return (
    <View style={styles.container}>
      {!image ? (
        <View style={styles.uploadContainer}>
          <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
            <Camera width={32} height={32} color={theme.colors.yellow[500]} />
            <Text style={styles.uploadText}>Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Upload width={32} height={32} color={theme.colors.yellow[500]} />
            <Text style={styles.uploadText}>Upload Image</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.imageAnalysisContainer}>
          <View style={styles.previewContainer}>
            <Image source={{ uri: image }} style={styles.preview} />
            
            {/* Cancel button to remove image */}
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={resetUploader}
              disabled={isAnalyzing}
            >
              <X width={20} height={20} color="white" />
            </TouchableOpacity>
            
            {isAnalyzing && (
              <View style={styles.analysisOverlay}>
                <ActivityIndicator size="large" color="white" />
                <Text style={styles.analysisText}>{analysisStage}</Text>
              </View>
            )}
          </View>
          
          {!result && !isAnalyzing && (
            <TouchableOpacity
              style={[styles.analyzeButton, isAnalyzing && styles.analyzingButton]}
              onPress={analyzeImage}
              disabled={isAnalyzing}
            >
              <Upload width={20} height={20} color="white" />
              <Text style={styles.analyzeText}>🤖 Analyze with Backend</Text>
            </TouchableOpacity>
          )}
          
          {result && (
            <>
              {result.status === 'no_pineapple' ? (
                <View style={styles.notPineappleContainer}>
                  <X width={64} height={64} color={theme.colors.red[500]} />
                  <Text style={styles.notPineappleTitle}>No Pineapple Detected</Text>
                  <Text style={styles.notPineappleText}>
                    Please take a photo of a real pineapple for sweetness analysis.
                  </Text>
                  <Text style={styles.confidenceText}>
                    Processing time: {result.processingTime}ms
                  </Text>
                  <TouchableOpacity style={styles.resetButton} onPress={resetUploader}>
                    <Text style={styles.resetText}>📸 Try Another Photo</Text>
                  </TouchableOpacity>
                </View>
              ) : result.status === 'error' ? (
                <View style={styles.errorContainer}>
                  <X width={64} height={64} color={theme.colors.red[500]} />
                  <Text style={styles.errorTitle}>Analysis Error</Text>
                  <Text style={styles.errorText}>{result.message}</Text>
                  <TouchableOpacity style={styles.resetButton} onPress={resetUploader}>
                    <Text style={styles.resetText}>📸 Try Again</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                result.sweetness && (
                  <AnalysisResultCard
                    result={result.sweetness}
                    onRetry={resetUploader}
                  />
                )
              )}
            </>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  uploadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 40,
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: theme.colors.yellow[200],
    borderRadius: 12,
    borderStyle: 'dashed',
    minWidth: 120,
  },
  uploadText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  imageAnalysisContainer: {
    width: '100%',
  },
  previewContainer: {
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  cancelButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.9)', // red-500 with transparency
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  analysisOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysisText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.yellow[500],
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
    shadowColor: theme.colors.yellow[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  analyzingButton: {
    opacity: 0.6,
  },
  analyzeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  notPineappleContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.muted,
    borderRadius: 12,
    marginTop: 15,
  },
  notPineappleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.red[600],
    marginTop: 12,
    marginBottom: 8,
  },
  notPineappleText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.muted,
    borderRadius: 12,
    marginTop: 15,
    borderWidth: 1,
    borderColor: theme.colors.red[500],
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.red[600],
    marginTop: 12,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.red[500],
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  confidenceText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: theme.colors.yellow[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  resetText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
}); 