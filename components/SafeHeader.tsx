import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'react-native-feather';
import { theme } from '../theme';

interface SafeHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

export const SafeHeader: React.FC<SafeHeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  rightComponent,
}) => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
              <ArrowLeft width={24} height={24} color="#fff" />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>{title}</Text>
        </View>
        
        <View style={styles.rightSection}>
          {rightComponent}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.yellow[500],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8, // Space between back button and title
  },
  backButton: {
    padding: 8,
    marginLeft: -8, // Adjust for better visual alignment
  },
});
