import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen() {
  const { isDarkMode } = useTheme();

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }
    ]}>
      <Text style={[
        styles.title,
        { color: isDarkMode ? '#ffffff' : '#000000' }
      ]}>
        Welcome to Pineapple Sweetness Predictor
      </Text>
      <Text style={[
        styles.subtitle,
        { color: isDarkMode ? '#cccccc' : '#666666' }
      ]}>
        Upload a photo of your pineapple to predict its sweetness
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 