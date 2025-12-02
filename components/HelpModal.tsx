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
  const sweetnessLevels = [
    {
      range: '75-100%',
      level: 'High Sweetness',
      description: 'Excellent sweetness level. Perfect for eating fresh.',
      color: '#22C55E',
    },
    {
      range: '60-74%',
      level: 'Medium Sweetness',
      description: 'Good sweetness level. Great for most uses.',
      color: '#3B82F6',
    },
    {
      range: '0-59%',
      level: 'Low Sweetness',
      description: 'Moderate sweetness. Best for cooking or wait a few days.',
      color: '#F59E0B',
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
            <Text style={styles.title}>Sweetness Guide</Text>
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
            {/* Sweetness Levels Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sweetness Levels</Text>
              <Text style={styles.sectionDescription}>
                Understanding what each sweetness percentage means:
              </Text>
              
              {sweetnessLevels.map((level, index) => (
                <View key={index} style={styles.levelCard}>
                  <View style={styles.levelHeader}>
                    <View style={[styles.colorIndicator, { backgroundColor: level.color }]} />
                    <View style={styles.levelInfo}>
                      <Text style={styles.levelRange}>{level.range}</Text>
                      <Text style={styles.levelName}>{level.level}</Text>
                    </View>
                  </View>
                  <Text style={styles.levelDescription}>{level.description}</Text>
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
  levelCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  levelInfo: {
    flex: 1,
  },
  levelRange: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  levelName: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  levelDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginLeft: 24,
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

