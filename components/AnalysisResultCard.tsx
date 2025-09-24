import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
// Define the interface locally since mlService is not available
interface SweetnessAnalysisResult {
  sweetness: number;
  confidence: number;
  category: string;
  sweetnessClass: string;
  displayTitle: string;
  colorIndicator: string;
  emoji: string;
  recommendation: string;
  characteristics: string[];
  qualityMetrics: {
    ripeness: string;
    eatingExperience: string;
    bestUse: string;
  };
  method: string;
  processingTime: number;
}

interface AnalysisResultCardProps {
  result: SweetnessAnalysisResult;
  onRetry?: () => void;
}

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({
  result,
  onRetry,
}) => {
  const getSweetnessColor = () => {
    const { sweetness } = result;
    if (sweetness >= 85) return '#16A34A'; // Green
    if (sweetness >= 70) return '#16A34A'; // Green
    if (sweetness >= 55) return '#D97706'; // Orange
    if (sweetness >= 40) return '#DC2626'; // Red
    return '#6B7280'; // Gray
  };

  return (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInUp.delay(100)} style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{result.displayTitle}</Text>
        </View>

        {/* Sweetness Score */}
        <View style={styles.scoreSection}>
          <Text style={[styles.scoreNumber, { color: getSweetnessColor() }]}>
            {result.sweetness ? result.sweetness.toFixed(0) : 'N/A'}
          </Text>
          <Text style={styles.scoreLabel}>Sweetness Score</Text>
        </View>

        {/* Recommendation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendation</Text>
          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationText}>{result.recommendation}</Text>
          </View>
        </View>

        {/* Analysis Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analysis Details</Text>
          <View style={styles.detailsCard}>
            {result.characteristics.slice(0, 3).map((characteristic, index) => (
              <View key={index} style={styles.characteristicRow}>
                <View style={styles.bullet} />
                <Text style={styles.characteristicText}>{characteristic}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Button */}
        {onRetry && (
          <Pressable style={styles.actionButton} onPress={onRetry}>
            <Text style={styles.actionButtonText}>Analyze Another</Text>
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
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  scoreNumber: {
    fontSize: 56,
    fontWeight: '800',
    lineHeight: 64,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  recommendationCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
  },
  recommendationText: {
    fontSize: 16,
    color: '#92400E',
    lineHeight: 24,
    fontWeight: '500',
  },
  detailsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  characteristicRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6B7280',
    marginTop: 8,
    marginRight: 12,
  },
  characteristicText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    flex: 1,
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 