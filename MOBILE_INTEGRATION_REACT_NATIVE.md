# 📱 React Native Integration Guide - YOLOv8 Only

Complete guide for integrating YOLOv8 pineapple detection into React Native apps.

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install axios react-native-image-picker
# or
yarn add axios react-native-image-picker
```

### Step 2: Create API Service

**services/PineappleApiService.js**:
```javascript
import axios from 'axios';

const API_BASE_URL = 'https://your-server.com'; // Replace with your server URL

class PineappleApiService {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Predict pineapple detection and sweetness from image
   * @param {string} imageUri - Local file URI or base64 image
   * @returns {Promise<Object>} Prediction response
   */
  async predict(imageUri) {
    try {
      // Create form data
      const formData = new FormData();
      
      // Extract filename from URI
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      
      formData.append('file', {
        uri: imageUri,
        name: filename,
        type: type,
      });

      const response = await this.client.post('/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new PineappleApiService();
```

### Step 3: Create Main Component

**components/PineappleAnalyzer.js**:
```javascript
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import PineappleApiService from '../services/PineappleApiService';

const PineappleAnalyzer = () => {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
        return;
      }
      if (response.assets && response.assets[0]) {
        setImageUri(response.assets[0].uri);
        setResult(null);
        setError(null);
      }
    });
  };

  const analyzeImage = async () => {
    if (!imageUri) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await PineappleApiService.predict(imageUri);

      if (response.success) {
        setResult(response.data);
      } else {
        setError(response.error || 'Analysis failed');
        Alert.alert('Error', response.error || 'Failed to analyze image');
      }
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    const { is_pineapple, prediction, sweetness_confidence, probabilities, detections } = result;

    if (!is_pineapple) {
      return (
        <View style={styles.resultContainer}>
          <Text style={styles.errorText}>❌ No pineapple detected</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.resultContainer}>
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>🍍 Pineapple Detected!</Text>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Sweetness:</Text>
            <Text style={styles.resultValue}>{prediction || 'Unknown'}</Text>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Confidence:</Text>
            <Text style={styles.resultValue}>
              {(sweetness_confidence * 100).toFixed(1)}%
            </Text>
          </View>

          {probabilities && (
            <View style={styles.probabilitiesContainer}>
              <Text style={styles.probabilitiesTitle}>Probabilities:</Text>
              {Object.entries(probabilities).map(([key, value]) => (
                <View key={key} style={styles.probabilityRow}>
                  <Text style={styles.probabilityLabel}>{key}:</Text>
                  <View style={styles.probabilityBarContainer}>
                    <View
                      style={[
                        styles.probabilityBar,
                        { width: `${value * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.probabilityValue}>
                    {(value * 100).toFixed(1)}%
                  </Text>
                </View>
              ))}
            </View>
          )}

          {detections && detections.length > 0 && (
            <View style={styles.detectionsContainer}>
              <Text style={styles.detectionsTitle}>
                Detections: {detections.length}
              </Text>
              {detections.map((detection, index) => (
                <View key={index} style={styles.detectionItem}>
                  <Text style={styles.detectionText}>
                    {detection.sweetness} ({(detection.confidence * 100).toFixed(1)}%)
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍍 Pineapple Sweetness Analyzer</Text>

      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.selectButton]}
          onPress={selectImage}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Select Image</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.analyzeButton, loading && styles.buttonDisabled]}
          onPress={analyzeImage}
          disabled={loading || !imageUri}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Analyze</Text>
          )}
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      {renderResult()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ddd',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectButton: {
    backgroundColor: '#4CAF50',
  },
  analyzeButton: {
    backgroundColor: '#2196F3',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    flex: 1,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginTop: 10,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 16,
    color: '#666',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  probabilitiesContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  probabilitiesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  probabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  probabilityLabel: {
    width: 80,
    fontSize: 14,
    color: '#666',
  },
  probabilityBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#eee',
    borderRadius: 10,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  probabilityBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  probabilityValue: {
    width: 50,
    fontSize: 14,
    textAlign: 'right',
    color: '#333',
  },
  detectionsContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detectionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  detectionItem: {
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    marginBottom: 5,
  },
  detectionText: {
    fontSize: 14,
    color: '#333',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
});

export default PineappleAnalyzer;
```

### Step 4: Use in App.js

**App.js**:
```javascript
import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import PineappleAnalyzer from './components/PineappleAnalyzer';

const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <PineappleAnalyzer />
      </SafeAreaView>
    </>
  );
};

export default App;
```

## 📸 Camera Integration

For camera capture, use `react-native-image-picker` with camera option:

```javascript
import { launchCamera } from 'react-native-image-picker';

const captureImage = () => {
  const options = {
    mediaType: 'photo',
    quality: 0.8,
    maxWidth: 1024,
    maxHeight: 1024,
  };

  launchCamera(options, (response) => {
    if (response.assets && response.assets[0]) {
      setImageUri(response.assets[0].uri);
    }
  });
};
```

## 🎨 Drawing Bounding Boxes

To draw bounding boxes on detected pineapples:

```javascript
import { Canvas, Rect, Skia } from '@shopify/react-native-skia';

const drawBoundingBoxes = (detections, imageWidth, imageHeight) => {
  return detections.map((detection, index) => {
    const [x1, y1, x2, y2] = detection.bbox;
    return (
      <Rect
        key={index}
        x={x1}
        y={y1}
        width={x2 - x1}
        height={y2 - y1}
        color="green"
        style="stroke"
        strokeWidth={3}
      />
    );
  });
};
```

## 🔧 Configuration

### Android Permissions

**android/app/src/main/AndroidManifest.xml**:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### iOS Permissions

**ios/YourApp/Info.plist**:
```xml
<key>NSCameraUsageDescription</key>
<string>We need access to your camera to capture pineapple images</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photo library to select pineapple images</string>
```

## 🚀 Testing

1. Start your FastAPI server
2. Update `API_BASE_URL` in `PineappleApiService.js`
3. Run the app:
   ```bash
   npm run android
   # or
   npm run ios
   ```

## 💡 Tips

1. **Image Compression**: Compress images before sending to reduce upload time
2. **Caching**: Cache results for same images using `react-native-async-storage`
3. **Error Handling**: Handle network errors gracefully
4. **Loading States**: Show loading indicators during analysis
5. **Offline Mode**: Consider using on-device inference for offline capability

## 📦 Additional Packages

```bash
# For state management
npm install @reduxjs/toolkit react-redux

# For caching
npm install @react-native-async-storage/async-storage

# For drawing bounding boxes
npm install @shopify/react-native-skia

# For better image handling
npm install react-native-fast-image
```

