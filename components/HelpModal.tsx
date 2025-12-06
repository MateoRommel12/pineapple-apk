import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { X } from 'react-native-feather';
import { theme } from '../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ visible, onClose }) => {
  const featureExplanations = [
    {
      name: 'Eyes',
      icon: '👁️',
      sweetnessType: 'High',
      description: 'The eyes (scales) on the pineapple surface are analyzed to determine ripeness and sweetness.',
      details: [
        'Well-developed and prominent eyes indicate high sweetness',
        'Clear, distinct eye patterns suggest good ripeness',
        'Golden/yellow coloration in eyes shows optimal sweetness',
        'Eyes that are flat or sunken may indicate lower sweetness',
      ],
      color: '#3B82F6',
    },
    {
      name: 'Texture',
      icon: '🖐️',
      sweetnessType: 'Medium',
      description: 'The surface texture and skin appearance provide clues about the pineapple\'s sweetness level.',
      details: [
        'Smooth, firm texture indicates good ripeness and sweetness',
        'Rich golden-yellow skin color suggests high sweetness',
        'Slight give when pressed indicates optimal ripeness',
        'Rough or hard texture may indicate lower sweetness',
      ],
      color: '#F59E0B',
    },
    {
      name: 'Shape',
      icon: '📐',
      sweetnessType: 'Low',
      description: 'The overall shape and form of the pineapple help determine its quality and sweetness potential.',
      details: [
        'Full, rounded shape indicates good development and sweetness',
        'Uniform size and symmetry suggest quality fruit',
        'Plump appearance shows optimal ripeness',
        'Irregular or flat shape may indicate lower sweetness',
      ],
      color: '#22C55E',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View 
          style={styles.modalContainer}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Why Sweetness?</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X width={24} height={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            bounces={true}
            scrollEventThrottle={16}
          >
            {/* Feature Explanations Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How We Determine Sweetness</Text>
              <Text style={styles.sectionDescription}>
                Our AI analyzes three key features of the pineapple to predict its sweetness level. Here's what each feature means:
              </Text>
              
              {featureExplanations.map((feature, index) => (
                <View key={index} style={styles.featureCard}>
                  <View style={styles.featureHeader}>
                    <Text style={styles.featureIcon}>{feature.icon}</Text>
                    <View style={styles.featureInfo}>
                      <Text style={styles.featureName}>{feature.name}</Text>
                      <View style={[
                        styles.sweetnessBadge,
                        feature.sweetnessType === 'High' && styles.badgeHigh,
                        feature.sweetnessType === 'Medium' && styles.badgeMedium,
                        feature.sweetnessType === 'Low' && styles.badgeLow,
                      ]}>
                        <Text style={[
                          styles.sweetnessBadgeText,
                          feature.sweetnessType === 'High' && styles.badgeTextHigh,
                          feature.sweetnessType === 'Medium' && styles.badgeTextMedium,
                          feature.sweetnessType === 'Low' && styles.badgeTextLow,
                        ]}>
                          {feature.sweetnessType} Sweetness Example
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                  <View style={styles.detailsContainer}>
                    {feature.details.map((detail, detailIndex) => (
                      <View key={detailIndex} style={styles.detailRow}>
                        <View style={[styles.detailBullet, { backgroundColor: feature.color }]} />
                        <Text style={styles.detailText}>{detail}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            {/* Quality Metrics Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What This Means</Text>
              <Text style={styles.sectionDescription}>
                Quality metrics help you understand the pineapple better:
              </Text>

              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Ripeness</Text>
                <Text style={styles.metricDescription}>
                  Indicates how ready the pineapple is to eat. Values include "Ready", "Good", or "Wait".
                </Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Eating Experience</Text>
                <Text style={styles.metricDescription}>
                  Describes the expected taste and texture quality. Values include "Great", "Good", or "Bad".
                </Text>
              </View>

            </View>
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxHeight: SCREEN_HEIGHT * 0.8,
    height: SCREEN_HEIGHT * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  featureCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureInfo: {
    flex: 1,
  },
  featureName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  sweetnessBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
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
  sweetnessBadgeText: {
    fontSize: 12,
    fontWeight: '600',
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
  featureDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  detailBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: 10,
  },
  detailText: {
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 20,
    flex: 1,
  },
  metricCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  metricDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});


