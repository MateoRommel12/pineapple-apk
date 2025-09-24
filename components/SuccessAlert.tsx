import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Check } from 'react-native-feather';
import { theme } from '../theme';

interface SuccessAlertProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

export default function SuccessAlert({ visible, message, onClose }: SuccessAlertProps) {
  const [animation] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000), // Show for 2 seconds
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onClose();
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.alert,
            {
              opacity: animation,
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Check stroke="#fff" width={24} height={24} />
          </View>
          <Text style={styles.message}>{message}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alert: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 280,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.green[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
}); 