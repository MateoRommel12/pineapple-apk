# 🎨 Visualization Features Integration Guide

Complete guide for integrating the new visualization and feature explanation features into your mobile app.

## 📋 Overview

The API now returns:
- **`visualization`**: Base64-encoded PNG image with bounding boxes, labels, and feature highlights
- **`feature_explanations`**: JSON object explaining why the model predicted High/Medium/Low based on eyes, texture, and shape

## 🔄 Updated API Response

```json
{
  "is_pineapple": true,
  "detection_confidence": 0.95,
  "detection_confidence_percent": 95.0,
  "prediction": "High",
  "sweetness": "High",
  "sweetness_confidence": 0.95,
  "sweetness_confidence_percent": 95.0,
  "probabilities": {
    "High": 0.95,
    "Medium": 0.03,
    "Low": 0.02
  },
  "probabilities_percent": {
    "High": 95.0,
    "Medium": 3.0,
    "Low": 2.0
  },
  "visualization": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "feature_explanations": {
    "eyes": [
      "• Eyes are well-developed and prominent",
      "• Clear, distinct eye patterns",
      "• Eyes show golden/yellow coloration"
    ],
    "texture": [
      "• Smooth, firm texture",
      "• Rich golden-yellow skin color",
      "• Slight give when pressed (ripe)"
    ],
    "shape": [
      "• Full, rounded shape",
      "• Uniform size and symmetry",
      "• Plump appearance"
    ]
  },
  "detections": [...],
  "message": "Pineapple detected with 95.00% confidence. Sweetness level: High (95.00% confidence)"
}
```

---

## 📱 React Native Integration

### Step 1: Update API Service

**services/PineappleApiService.js**:
```javascript
import axios from 'axios';

const API_BASE_URL = 'https://your-server.com';

class PineappleApiService {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 30000,
    });
  }

  async predict(imageUri) {
    try {
      const formData = new FormData();
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
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
      };
    }
  }
}

export default new PineappleApiService();
```

### Step 2: Create Visualization Component

**components/PineappleVisualization.js**:
```javascript
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const PineappleVisualization = ({ result }) => {
  if (!result || !result.visualization) {
    return null;
  }

  // Extract base64 data from data URI
  const base64Data = result.visualization.split(',')[1];
  const imageUri = `data:image/png;base64,${base64Data}`;

  return (
    <ScrollView style={styles.container}>
      {/* Visualized Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.visualizedImage}
          resizeMode="contain"
        />
      </View>

      {/* Feature Explanations */}
      {result.feature_explanations && (
        <View style={styles.explanationsContainer}>
          <Text style={styles.sectionTitle}>Why {result.prediction} Sweetness?</Text>

          {/* Eyes Section */}
          {result.feature_explanations.eyes && (
            <View style={styles.featureSection}>
              <Text style={styles.featureTitle}>👁️ Eyes</Text>
              {result.feature_explanations.eyes.map((explanation, index) => (
                <Text key={index} style={styles.featureText}>
                  {explanation}
                </Text>
              ))}
            </View>
          )}

          {/* Texture Section */}
          {result.feature_explanations.texture && (
            <View style={styles.featureSection}>
              <Text style={styles.featureTitle}>🖐️ Texture</Text>
              {result.feature_explanations.texture.map((explanation, index) => (
                <Text key={index} style={styles.featureText}>
                  {explanation}
                </Text>
              ))}
            </View>
          )}

          {/* Shape Section */}
          {result.feature_explanations.shape && (
            <View style={styles.featureSection}>
              <Text style={styles.featureTitle}>📐 Shape</Text>
              {result.feature_explanations.shape.map((explanation, index) => (
                <Text key={index} style={styles.featureText}>
                  {explanation}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Probabilities */}
      {result.probabilities_percent && (
        <View style={styles.probabilitiesContainer}>
          <Text style={styles.sectionTitle}>Confidence Breakdown</Text>
          {Object.entries(result.probabilities_percent).map(([key, value]) => (
            <View key={key} style={styles.probabilityRow}>
              <Text style={styles.probabilityLabel}>{key}:</Text>
              <View style={styles.probabilityBarContainer}>
                <View
                  style={[
                    styles.probabilityBar,
                    {
                      width: `${value}%`,
                      backgroundColor:
                        key === 'High' ? '#4CAF50' :
                        key === 'Medium' ? '#FF9800' : '#F44336',
                    },
                  ]}
                />
              </View>
              <Text style={styles.probabilityValue}>{value.toFixed(1)}%</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
  },
  visualizedImage: {
    width: '100%',
    height: 400,
    borderRadius: 8,
  },
  explanationsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  featureSection: {
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2196F3',
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
  probabilitiesContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
  },
  probabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  probabilityLabel: {
    width: 80,
    fontSize: 14,
    color: '#666',
  },
  probabilityBarContainer: {
    flex: 1,
    height: 24,
    backgroundColor: '#eee',
    borderRadius: 12,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  probabilityBar: {
    height: '100%',
    borderRadius: 12,
  },
  probabilityValue: {
    width: 50,
    fontSize: 14,
    textAlign: 'right',
    color: '#333',
    fontWeight: 'bold',
  },
});

export default PineappleVisualization;
```

### Step 3: Update Main Component

**components/PineappleAnalyzer.js**:
```javascript
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import PineappleApiService from '../services/PineappleApiService';
import PineappleVisualization from './PineappleVisualization';

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍍 Pineapple Sweetness Analyzer</Text>

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

      {result && <PineappleVisualization result={result} />}
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
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
});

export default PineappleAnalyzer;
```

---

## 🤖 Android Integration (Kotlin)

### Step 1: Update Data Models

**models/PredictionResponse.kt**:
```kotlin
import com.google.gson.annotations.SerializedName

data class PredictionResponse(
    @SerializedName("is_pineapple") val isPineapple: Boolean,
    @SerializedName("detection_confidence") val detectionConfidence: Double,
    @SerializedName("detection_confidence_percent") val detectionConfidencePercent: Double,
    @SerializedName("prediction") val prediction: String?,
    @SerializedName("sweetness") val sweetness: String?,
    @SerializedName("sweetness_confidence") val sweetnessConfidence: Double,
    @SerializedName("sweetness_confidence_percent") val sweetnessConfidencePercent: Double,
    @SerializedName("probabilities") val probabilities: Map<String, Double>,
    @SerializedName("probabilities_percent") val probabilitiesPercent: Map<String, Double>,
    @SerializedName("visualization") val visualization: String?, // Base64 image
    @SerializedName("feature_explanations") val featureExplanations: FeatureExplanations?,
    @SerializedName("detections") val detections: List<Detection>,
    @SerializedName("message") val message: String
)

data class FeatureExplanations(
    @SerializedName("eyes") val eyes: List<String>,
    @SerializedName("texture") val texture: List<String>,
    @SerializedName("shape") val shape: List<String>
)

data class Detection(
    @SerializedName("bbox") val bbox: List<Double>,
    @SerializedName("confidence") val confidence: Double,
    @SerializedName("class_id") val classId: Int,
    @SerializedName("class") val className: String,
    @SerializedName("sweetness") val sweetness: String
)
```

### Step 2: Display Visualization Image

**MainActivity.kt**:
```kotlin
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Bundle
import android.util.Base64
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : AppCompatActivity() {
    
    private lateinit var visualizationImageView: ImageView
    private lateinit var predictionTextView: TextView
    private lateinit var explanationsRecyclerView: RecyclerView
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        visualizationImageView = findViewById(R.id.visualizationImageView)
        predictionTextView = findViewById(R.id.predictionTextView)
        explanationsRecyclerView = findViewById(R.id.explanationsRecyclerView)
        
        // After getting result from API
        displayVisualization(result)
    }
    
    private fun displayVisualization(result: PredictionResponse) {
        // Display prediction
        val predictionText = "Prediction: ${result.prediction} (${result.sweetnessConfidencePercent.toInt()}%)"
        predictionTextView.text = predictionText
        
        // Display visualization image
        result.visualization?.let { base64Image ->
            val bitmap = decodeBase64Image(base64Image)
            bitmap?.let {
                visualizationImageView.setImageBitmap(it)
            }
        }
        
        // Display feature explanations
        result.featureExplanations?.let { explanations ->
            val adapter = FeatureExplanationsAdapter(explanations)
            explanationsRecyclerView.layoutManager = LinearLayoutManager(this)
            explanationsRecyclerView.adapter = adapter
        }
    }
    
    private fun decodeBase64Image(base64String: String): Bitmap? {
        return try {
            // Remove data URI prefix if present
            val base64Data = if (base64String.contains(",")) {
                base64String.split(",")[1]
            } else {
                base64String
            }
            
            val decodedBytes = Base64.decode(base64Data, Base64.DEFAULT)
            BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
```

### Step 3: Create Feature Explanations Adapter

**adapters/FeatureExplanationsAdapter.kt**:
```kotlin
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class FeatureExplanationsAdapter(
    private val explanations: FeatureExplanations
) : RecyclerView.Adapter<FeatureExplanationsAdapter.ViewHolder>() {
    
    private val items = listOf(
        FeatureItem("👁️ Eyes", explanations.eyes),
        FeatureItem("🖐️ Texture", explanations.texture),
        FeatureItem("📐 Shape", explanations.shape)
    )
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_feature_explanation, parent, false)
        return ViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = items[position]
        holder.bind(item)
    }
    
    override fun getItemCount() = items.size
    
    class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val titleTextView: TextView = itemView.findViewById(R.id.titleTextView)
        private val explanationsTextView: TextView = itemView.findViewById(R.id.explanationsTextView)
        
        fun bind(item: FeatureItem) {
            titleTextView.text = item.title
            explanationsTextView.text = item.explanations.joinToString("\n")
        }
    }
    
    data class FeatureItem(val title: String, val explanations: List<String>)
}
```

### Step 4: Layout Files

**res/layout/activity_main.xml**:
```xml
<?xml version="1.0" encoding="utf-8"?>
<ScrollView xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:padding="16dp">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical">

        <TextView
            android:id="@+id/predictionTextView"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:textSize="20sp"
            android:textStyle="bold"
            android:padding="16dp"
            android:background="#E3F2FD"
            android:text="Prediction: High (95%)" />

        <ImageView
            android:id="@+id/visualizationImageView"
            android:layout_width="match_parent"
            android:layout_height="400dp"
            android:scaleType="fitCenter"
            android:background="#fff"
            android:padding="8dp"
            android:layout_marginTop="16dp" />

        <TextView
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="Why this prediction?"
            android:textSize="18sp"
            android:textStyle="bold"
            android:padding="16dp"
            android:layout_marginTop="16dp" />

        <androidx.recyclerview.widget.RecyclerView
            android:id="@+id/explanationsRecyclerView"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="8dp" />

    </LinearLayout>
</ScrollView>
```

**res/layout/item_feature_explanation.xml**:
```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical"
    android:padding="16dp"
    android:background="#fff"
    android:layout_marginBottom="8dp">

    <TextView
        android:id="@+id/titleTextView"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:textSize="16sp"
        android:textStyle="bold"
        android:textColor="#2196F3"
        android:layout_marginBottom="8dp" />

    <TextView
        android:id="@+id/explanationsTextView"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:textSize="14sp"
        android:textColor="#666"
        android:lineSpacingExtra="4dp" />

</LinearLayout>
```

---

## 🍎 iOS Integration (Swift)

### Step 1: Update Data Models

**Models/PredictionResponse.swift**:
```swift
import Foundation

struct PredictionResponse: Codable {
    let isPineapple: Bool
    let detectionConfidence: Double
    let detectionConfidencePercent: Double
    let prediction: String?
    let sweetness: String?
    let sweetnessConfidence: Double
    let sweetnessConfidencePercent: Double
    let probabilities: [String: Double]
    let probabilitiesPercent: [String: Double]
    let visualization: String? // Base64 image
    let featureExplanations: FeatureExplanations?
    let detections: [Detection]
    let message: String
    
    enum CodingKeys: String, CodingKey {
        case isPineapple = "is_pineapple"
        case detectionConfidence = "detection_confidence"
        case detectionConfidencePercent = "detection_confidence_percent"
        case prediction
        case sweetness
        case sweetnessConfidence = "sweetness_confidence"
        case sweetnessConfidencePercent = "sweetness_confidence_percent"
        case probabilities
        case probabilitiesPercent = "probabilities_percent"
        case visualization
        case featureExplanations = "feature_explanations"
        case detections
        case message
    }
}

struct FeatureExplanations: Codable {
    let eyes: [String]
    let texture: [String]
    let shape: [String]
}

struct Detection: Codable {
    let bbox: [Double]
    let confidence: Double
    let classId: Int
    let className: String
    let sweetness: String
    
    enum CodingKeys: String, CodingKey {
        case bbox
        case confidence
        case classId = "class_id"
        case className = "class"
        case sweetness
    }
}
```

### Step 2: Display Visualization

**ViewController.swift**:
```swift
import UIKit

class ViewController: UIViewController {
    
    @IBOutlet weak var visualizationImageView: UIImageView!
    @IBOutlet weak var predictionLabel: UILabel!
    @IBOutlet weak var explanationsTableView: UITableView!
    
    private var featureExplanations: FeatureExplanations?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupTableView()
    }
    
    private func setupTableView() {
        explanationsTableView.delegate = self
        explanationsTableView.dataSource = self
        explanationsTableView.register(
            FeatureExplanationCell.self,
            forCellReuseIdentifier: "FeatureExplanationCell"
        )
    }
    
    func displayVisualization(_ result: PredictionResponse) {
        // Display prediction
        let predictionText = "Prediction: \(result.prediction ?? "Unknown") (\(Int(result.sweetnessConfidencePercent))%)"
        predictionLabel.text = predictionText
        
        // Display visualization image
        if let base64Image = result.visualization {
            visualizationImageView.image = decodeBase64Image(base64Image)
        }
        
        // Display feature explanations
        featureExplanations = result.featureExplanations
        explanationsTableView.reloadData()
    }
    
    private func decodeBase64Image(_ base64String: String) -> UIImage? {
        // Remove data URI prefix if present
        let base64Data = base64String.contains(",") ?
            String(base64String.split(separator: ",")[1]) :
            base64String
        
        guard let data = Data(base64Encoded: base64Data) else {
            return nil
        }
        
        return UIImage(data: data)
    }
}

extension ViewController: UITableViewDelegate, UITableViewDataSource {
    func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return 3 // Eyes, Texture, Shape
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(
            withIdentifier: "FeatureExplanationCell",
            for: indexPath
        ) as! FeatureExplanationCell
        
        guard let explanations = featureExplanations else {
            return cell
        }
        
        switch indexPath.row {
        case 0:
            cell.configure(title: "👁️ Eyes", explanations: explanations.eyes)
        case 1:
            cell.configure(title: "🖐️ Texture", explanations: explanations.texture)
        case 2:
            cell.configure(title: "📐 Shape", explanations: explanations.shape)
        default:
            break
        }
        
        return cell
    }
}

class FeatureExplanationCell: UITableViewCell {
    private let titleLabel = UILabel()
    private let explanationsLabel = UILabel()
    
    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        setupUI()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupUI() {
        titleLabel.font = .boldSystemFont(ofSize: 16)
        titleLabel.textColor = .systemBlue
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        
        explanationsLabel.font = .systemFont(ofSize: 14)
        explanationsLabel.textColor = .gray
        explanationsLabel.numberOfLines = 0
        explanationsLabel.translatesAutoresizingMaskIntoConstraints = false
        
        contentView.addSubview(titleLabel)
        contentView.addSubview(explanationsLabel)
        
        NSLayoutConstraint.activate([
            titleLabel.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 16),
            titleLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            titleLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            
            explanationsLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 8),
            explanationsLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            explanationsLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            explanationsLabel.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -16)
        ])
    }
    
    func configure(title: String, explanations: [String]) {
        titleLabel.text = title
        explanationsLabel.text = explanations.joined(separator: "\n")
    }
}
```

---

## 🦋 Flutter Integration

### Step 1: Update Models

**models/prediction_response.dart**:
```dart
class PredictionResponse {
  final bool isPineapple;
  final double detectionConfidence;
  final double detectionConfidencePercent;
  final String? prediction;
  final String? sweetness;
  final double sweetnessConfidence;
  final double sweetnessConfidencePercent;
  final Map<String, double> probabilities;
  final Map<String, double> probabilitiesPercent;
  final String? visualization; // Base64 image
  final FeatureExplanations? featureExplanations;
  final List<Detection> detections;
  final String message;

  PredictionResponse({
    required this.isPineapple,
    required this.detectionConfidence,
    required this.detectionConfidencePercent,
    this.prediction,
    this.sweetness,
    required this.sweetnessConfidence,
    required this.sweetnessConfidencePercent,
    required this.probabilities,
    required this.probabilitiesPercent,
    this.visualization,
    this.featureExplanations,
    required this.detections,
    required this.message,
  });

  factory PredictionResponse.fromJson(Map<String, dynamic> json) {
    return PredictionResponse(
      isPineapple: json['is_pineapple'] ?? false,
      detectionConfidence: (json['detection_confidence'] ?? 0.0).toDouble(),
      detectionConfidencePercent: (json['detection_confidence_percent'] ?? 0.0).toDouble(),
      prediction: json['prediction'],
      sweetness: json['sweetness'],
      sweetnessConfidence: (json['sweetness_confidence'] ?? 0.0).toDouble(),
      sweetnessConfidencePercent: (json['sweetness_confidence_percent'] ?? 0.0).toDouble(),
      probabilities: Map<String, double>.from(json['probabilities'] ?? {}),
      probabilitiesPercent: Map<String, double>.from(json['probabilities_percent'] ?? {}),
      visualization: json['visualization'],
      featureExplanations: json['feature_explanations'] != null
          ? FeatureExplanations.fromJson(json['feature_explanations'])
          : null,
      detections: (json['detections'] ?? [])
          .map((d) => Detection.fromJson(d))
          .toList(),
      message: json['message'] ?? '',
    );
  }
}

class FeatureExplanations {
  final List<String> eyes;
  final List<String> texture;
  final List<String> shape;

  FeatureExplanations({
    required this.eyes,
    required this.texture,
    required this.shape,
  });

  factory FeatureExplanations.fromJson(Map<String, dynamic> json) {
    return FeatureExplanations(
      eyes: List<String>.from(json['eyes'] ?? []),
      texture: List<String>.from(json['texture'] ?? []),
      shape: List<String>.from(json['shape'] ?? []),
    );
  }
}

class Detection {
  final List<double> bbox;
  final double confidence;
  final int classId;
  final String className;
  final String sweetness;

  Detection({
    required this.bbox,
    required this.confidence,
    required this.classId,
    required this.className,
    required this.sweetness,
  });

  factory Detection.fromJson(Map<String, dynamic> json) {
    return Detection(
      bbox: List<double>.from(json['bbox'] ?? []),
      confidence: (json['confidence'] ?? 0.0).toDouble(),
      classId: json['class_id'] ?? 0,
      className: json['class'] ?? '',
      sweetness: json['sweetness'] ?? '',
    );
  }
}
```

### Step 2: Display Visualization Widget

**widgets/pineapple_visualization.dart**:
```dart
import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/prediction_response.dart';

class PineappleVisualization extends StatelessWidget {
  final PredictionResponse result;

  const PineappleVisualization({Key? key, required this.result}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Prediction Header
          Container(
            width: double.infinity,
            padding: EdgeInsets.all(16),
            color: Colors.blue.shade50,
            child: Text(
              'Prediction: ${result.prediction ?? "Unknown"} (${result.sweetnessConfidencePercent.toInt()}%)',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),

          SizedBox(height: 16),

          // Visualization Image
          if (result.visualization != null)
            Container(
              width: double.infinity,
              height: 400,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.memory(
                  _decodeBase64Image(result.visualization!),
                  fit: BoxFit.contain,
                ),
              ),
            ),

          SizedBox(height: 24),

          // Feature Explanations
          if (result.featureExplanations != null) ...[
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                'Why ${result.prediction} Sweetness?',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            SizedBox(height: 16),
            _buildFeatureSection(
              '👁️ Eyes',
              result.featureExplanations!.eyes,
            ),
            _buildFeatureSection(
              '🖐️ Texture',
              result.featureExplanations!.texture,
            ),
            _buildFeatureSection(
              '📐 Shape',
              result.featureExplanations!.shape,
            ),
          ],

          SizedBox(height: 24),

          // Probabilities
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              'Confidence Breakdown',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          SizedBox(height: 16),
          ...result.probabilitiesPercent.entries.map((entry) {
            return Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${entry.key}:'),
                  SizedBox(height: 4),
                  LinearProgressIndicator(
                    value: entry.value / 100,
                    backgroundColor: Colors.grey.shade200,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      entry.key == 'High'
                          ? Colors.green
                          : entry.key == 'Medium'
                              ? Colors.orange
                              : Colors.red,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text('${entry.value.toStringAsFixed(1)}%'),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildFeatureSection(String title, List<String> explanations) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.shade200,
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.blue,
            ),
          ),
          SizedBox(height: 8),
          ...explanations.map((explanation) => Padding(
                padding: EdgeInsets.only(bottom: 4),
                child: Text(
                  explanation,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade700,
                  ),
                ),
              )),
        ],
      ),
    );
  }

  Uint8List _decodeBase64Image(String base64String) {
    // Remove data URI prefix if present
    final base64Data = base64String.contains(',')
        ? base64String.split(',')[1]
        : base64String;

    return base64Decode(base64Data);
  }
}
```

---

## 💡 Best Practices

### 1. **Image Caching**
Cache the visualization image to avoid re-downloading:
```javascript
// React Native example
import AsyncStorage from '@react-native-async-storage/async-storage';

const cacheVisualization = async (imageUri, base64Image) => {
  await AsyncStorage.setItem(`vis_${imageUri}`, base64Image);
};

const getCachedVisualization = async (imageUri) => {
  return await AsyncStorage.getItem(`vis_${imageUri}`);
};
```

### 2. **Error Handling**
Always handle cases where visualization might be null:
```javascript
{result?.visualization ? (
  <Image source={{ uri: result.visualization }} />
) : (
  <Text>Visualization not available</Text>
)}
```

### 3. **Performance Optimization**
- Use image compression before upload
- Lazy load feature explanations
- Use RecyclerView/ListView for long explanation lists

### 4. **Accessibility**
Add accessibility labels for screen readers:
```javascript
<Image
  source={{ uri: visualization }}
  accessibilityLabel={`Pineapple detection visualization showing ${prediction} sweetness`}
/>
```

---

## 🧪 Testing

### Test the Visualization Endpoint

```bash
# Using curl
curl -X POST "https://your-server.com/predict" \
  -F "file=@pineapple.jpg" \
  | jq '.visualization' | head -c 100

# Should return base64 string starting with "data:image/png;base64,..."
```

### Verify Base64 Decoding

```javascript
// Test in browser console
const base64 = "data:image/png;base64,iVBORw0KGgo...";
const img = document.createElement('img');
img.src = base64;
document.body.appendChild(img);
```

---

## 📚 Additional Resources

- [React Native Image Component](https://reactnative.dev/docs/image)
- [Android Bitmap Documentation](https://developer.android.com/reference/android/graphics/Bitmap)
- [iOS UIImage Documentation](https://developer.apple.com/documentation/uikit/uiimage)
- [Flutter Image Widget](https://api.flutter.dev/flutter/widgets/Image-class.html)

---

## 🆘 Troubleshooting

### Issue: Base64 image not displaying

**Solution**: Ensure you're handling the data URI prefix correctly:
```javascript
// Remove "data:image/png;base64," prefix if present
const base64Data = visualization.includes(',') 
  ? visualization.split(',')[1] 
  : visualization;
```

### Issue: Image too large causing memory issues

**Solution**: Resize or compress the image before displaying:
```javascript
// React Native
import ImageResizer from 'react-native-image-resizer';

const resizedImage = await ImageResizer.createResizedImage(
  imageUri,
  800, // maxWidth
  800, // maxHeight
  'PNG',
  80 // quality
);
```

### Issue: Feature explanations not showing

**Solution**: Check if the response includes the field:
```javascript
if (result.feature_explanations) {
  // Display explanations
} else {
  console.warn('Feature explanations not available');
}
```

---

## ✅ Checklist

- [ ] API returns `visualization` field in response
- [ ] Base64 image decoding works correctly
- [ ] Visualization image displays properly
- [ ] Feature explanations are shown
- [ ] Error handling for missing visualization
- [ ] Image caching implemented
- [ ] Accessibility labels added
- [ ] Performance optimized (lazy loading, compression)

---

Happy coding! 🚀

