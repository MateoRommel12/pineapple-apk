import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HelpCircle } from 'react-native-feather';
import { theme } from '../theme';

interface SafeHeaderProps {
  title: string;
  rightComponent?: React.ReactNode;
  showHelpButton?: boolean;
  onHelpPress?: () => void;
}

export const SafeHeader: React.FC<SafeHeaderProps> = ({
  title,
  rightComponent,
  showHelpButton = false,
  onHelpPress,
}) => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <Text style={styles.title}>{title}</Text>
        </View>
        
        <View style={styles.rightSection}>
          {showHelpButton && (
            <TouchableOpacity 
              onPress={onHelpPress} 
              style={styles.helpButton}
              activeOpacity={0.7}
            >
              <HelpCircle width={24} height={24} color="#fff" />
            </TouchableOpacity>
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  helpButton: {
    padding: 4,
    marginRight: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
