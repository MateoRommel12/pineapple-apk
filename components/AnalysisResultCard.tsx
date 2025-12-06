import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, Dimensions } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { theme } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// API Response format based on VISUALIZATION_INTEGRATION_GUIDE.md documentation
interface ApiDetection {
  sweetness?: string; // 'High', 'Medium', 'Low' - optional
  confidence: number;
  bbox?: number[]; // [x1, y1, x2, y2] - optional bounding box
  class?: string; // Detection class name
  class_id?: number; // Detection class ID
}

interface FeatureExplanations {
  eyes: string[];
  texture: string[];
  shape: string[];
}

interface ApiPredictionResponse {
  is_pineapple: boolean;
  prediction: string | null; // 'High', 'Medium', 'Low' or null
  sweetness_confidence: number | null;
  sweetness_confidence_percent?: number | null;
  probabilities: {
    High?: number;
    Medium?: number;
    Low?: number;
  } | null;
  probabilities_percent?: {
    High?: number;
    Medium?: number;
    Low?: number;
  } | null;
  visualization?: string | null; // Base64-encoded PNG image with data URI prefix
  feature_explanations?: FeatureExplanations | null;
  detections?: ApiDetection[];
}

// Legacy format support (for backward compatibility)
interface LegacySweetnessAnalysisResult {
  sweetness: number;
  confidence: number;
  category: string;
  sweetnessClass: string;
  displayTitle: string;
  colorIndicator: string;
  emoji: string;
  recommendation: string;
  characteristics: string[];
  qualityMetrics?: {
    ripeness: string;
    eatingExperience: string;
  };
  method: string;
  processingTime: number;
}

type AnalysisResult = ApiPredictionResponse | LegacySweetnessAnalysisResult;

interface AnalysisResultCardProps {
  result: AnalysisResult;
  onRetry?: () => void;
}

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({
  result,
  onRetry,
}) => {
  // Check if result is API format (has is_pineapple) or legacy format
  const isApiFormat = 'is_pineapple' in result;

  // Helper to convert prediction class to sweetness percentage
  const convertPredictionToSweetness = (prediction: string | null, probabilities: { High?: number; Medium?: number; Low?: number } | null): number => {
    if (!prediction) return 0;
    
    // Use probabilities if available for more accurate calculation
    if (probabilities) {
      const high = probabilities.High || 0;
      const medium = probabilities.Medium || 0;
      const low = probabilities.Low || 0;
      
      // Weighted average: High = 80-100, Medium = 50-80, Low = 0-50
      return (high * 90) + (medium * 65) + (low * 25);
    }
    
    // Fallback to class-based mapping
    switch (prediction) {
      case 'High': return 85;
      case 'Medium': return 65;
      case 'Low': return 35;
      default: return 0;
    }
  };

  // Get display values based on format
  const getDisplayValues = () => {
    if (isApiFormat) {
      const apiResult = result as ApiPredictionResponse;
      if (!apiResult.is_pineapple) {
        return {
          title: '❌ No Pineapple Detected',
          sweetness: 0,
          confidence: 0,
          prediction: null,
          probabilities: null,
          detections: null,
          visualization: null,
          featureExplanations: null,
        };
      }
      
      const sweetness = convertPredictionToSweetness(apiResult.prediction, apiResult.probabilities);
      return {
        title: '🍍 Pineapple Detected!',
        sweetness,
        confidence: apiResult.sweetness_confidence || 0,
        prediction: apiResult.prediction,
        probabilities: apiResult.probabilities_percent || apiResult.probabilities,
        detections: apiResult.detections,
        visualization: apiResult.visualization,
        featureExplanations: apiResult.feature_explanations,
      };
    } else {
      const legacyResult = result as LegacySweetnessAnalysisResult;
      return {
        title: legacyResult.displayTitle || '🍍 Analysis Complete',
        sweetness: legacyResult.sweetness,
        confidence: legacyResult.confidence,
        prediction: legacyResult.sweetnessClass,
        probabilities: null,
        detections: null,
        qualityMetrics: legacyResult.qualityMetrics,
        characteristics: legacyResult.characteristics,
      };
    }
  };

  const displayValues = getDisplayValues();

  const getRipenessText = (sweetness: number): string => {
    if (sweetness >= 70) return 'Ready to eat';
    if (sweetness >= 50) return 'Almost ready';
    return 'Needs more time';
  };

  const getEatingExperience = (sweetness: number): string => {
    if (sweetness >= 70) return 'Great';
    if (sweetness >= 50) return 'Good';
    return 'Needs improvement';
  };

  // Handle no pineapple case
  if (isApiFormat && !(result as ApiPredictionResponse).is_pineapple) {
    return (
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(100)} style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{displayValues.title}</Text>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Please take a photo of a real pineapple for sweetness analysis.
            </Text>
          </View>
          {onRetry && (
            <Pressable style={styles.actionButton} onPress={onRetry}>
              <Text style={styles.actionButtonText}>Try Another Photo</Text>
            </Pressable>
          )}
        </Animated.View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInUp.delay(100)} style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{displayValues.title}</Text>
            {displayValues.prediction && (
              <View style={[
                styles.badge,
                displayValues.prediction === 'High' && styles.badgeHigh,
                displayValues.prediction === 'Medium' && styles.badgeMedium,
                displayValues.prediction === 'Low' && styles.badgeLow,
              ]}>
                <Text style={[
                  styles.badgeText,
                  displayValues.prediction === 'High' && styles.badgeTextHigh,
                  displayValues.prediction === 'Medium' && styles.badgeTextMedium,
                  displayValues.prediction === 'Low' && styles.badgeTextLow,
                ]}>
                  {displayValues.prediction} Sweetness
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Visualization Image */}
        {isApiFormat && 'visualization' in displayValues && displayValues.visualization && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Visualization</Text>
            </View>
            <Image
              source={{ uri: displayValues.visualization }}
              style={styles.visualizationImage}
              resizeMode="contain"
              accessibilityLabel={`Pineapple detection visualization showing ${displayValues.prediction} sweetness`}
            />
          </View>
        )}

        {/* Feature Explanations */}
        {isApiFormat && 'featureExplanations' in displayValues && displayValues.featureExplanations && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>  
              <Text style={styles.sectionTitle}>
                Why {displayValues.prediction} Sweetness?
              </Text>
            </View>
            <View style={styles.detailsCard}>
              {/* Eyes Section */}
              {displayValues.featureExplanations.eyes && displayValues.featureExplanations.eyes.length > 0 && (
                <View style={styles.featureCard}>
                  <View style={styles.featureHeader}>
                    <Text style={styles.featureTitle}>Eyes</Text>
                  </View>
                  {displayValues.featureExplanations.eyes.map((explanation, index) => (
                    <View key={index} style={styles.featureRow}>
                      <Text style={styles.featureText}>{explanation}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Texture Section */}
              {displayValues.featureExplanations.texture && displayValues.featureExplanations.texture.length > 0 && (
                <View style={styles.featureCard}>
                  <View style={styles.featureHeader}>
                    <Text style={styles.featureTitle}>Texture</Text>
                  </View>
                  {displayValues.featureExplanations.texture.map((explanation, index) => (
                    <View key={index} style={styles.featureRow}>
                      <Text style={styles.featureText}>{explanation}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Shape Section */}
              {displayValues.featureExplanations.shape && displayValues.featureExplanations.shape.length > 0 && (
                <View style={styles.featureCard}>
                  <View style={styles.featureHeader}>
                    <Text style={styles.featureTitle}>Shape</Text>
                  </View>
                  {displayValues.featureExplanations.shape.map((explanation, index) => (
                    <View key={index} style={styles.featureRow}>
                      <Text style={styles.featureText}>{explanation}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Analysis Details - Legacy format or computed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>What This Means</Text>
          </View>
          <View style={styles.detailsCard}>
            {!isApiFormat && 'qualityMetrics' in displayValues && displayValues.qualityMetrics ? (
              <>
                <View style={styles.characteristicRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.characteristicText}>
                    <Text style={styles.boldText}>Ripeness:</Text> {displayValues.qualityMetrics.ripeness}
                  </Text>
                </View>
                <View style={styles.characteristicRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.characteristicText}>
                    <Text style={styles.boldText}>Eating Experience:</Text> {displayValues.qualityMetrics.eatingExperience}
                  </Text>
                </View>
              </>
            ) : isApiFormat ? (
              <>
                <View style={styles.characteristicRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.characteristicText}>
                    <Text style={styles.boldText}>Ripeness:</Text> {getRipenessText(displayValues.sweetness)}
                  </Text>
                </View>
                <View style={styles.characteristicRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.characteristicText}>
                    <Text style={styles.boldText}>Eating Experience:</Text> {getEatingExperience(displayValues.sweetness)}
                  </Text>
                </View>
              </>
            ) : (
              // Legacy characteristics
              'characteristics' in displayValues && displayValues.characteristics
                ? displayValues.characteristics
                    .filter((char: string) => {
                      const lower = char.toLowerCase();
                      return !lower.includes('confidence') && 
                             !lower.includes('method:') && 
                             !lower.includes('detection:') &&
                             !lower.includes('processing');
                    })
                    .slice(0, 3)
                    .map((characteristic: string, index: number) => (
                      <View key={index} style={styles.characteristicRow}>
                        <View style={styles.bullet} />
                        <Text style={styles.characteristicText}>{characteristic}</Text>
                      </View>
                    ))
                : null
            )}
          </View>
        </View>

        {/* Action Button */}
        {onRetry && (
          <Pressable 
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed
            ]} 
            onPress={onRetry}
          >
            <Text style={styles.actionButtonText}>Scan Again</Text>
          </Pressable>
        )}
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#F0F4F8',
  },
  titleContainer: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 4,
  },
  badgeHigh: {
    backgroundColor: '#D1FAE5',
  },
  badgeMedium: {
    backgroundColor: '#FEF3C7',
  },
  badgeLow: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  badgeTextHigh: {
    color: '#065F46',
  },
  badgeTextMedium: {
    color: '#92400E',
  },
  badgeTextLow: {
    color: '#991B1B',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    letterSpacing: -0.3,
  },
  detailsCard: {
    backgroundColor: '#FAFBFC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E8EDF3',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  characteristicRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
    marginTop: 7,
    marginRight: 14,
  },
  characteristicText: {
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 24,
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
    color: '#1A202C',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 20,
    borderRadius: 16,
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 15,
    color: '#DC2626',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
  visualizationImage: {
    width: SCREEN_WIDTH - 64,
    height: 400,
    borderRadius: 12,
    alignSelf: 'center',
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8EDF3',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    letterSpacing: -0.2,
  },
  featureRow: {
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 24,
    flex: 1,
  },
  actionButton: {
    backgroundColor: theme.colors.yellow[500],
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: theme.colors.yellow[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
}); 