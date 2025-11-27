import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Image, 
  Dimensions, 
  Animated, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PineappleLandingPage'>;

const PineappleLandingPage: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Start the looping rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleGetStarted = async () => {
    try {
      // Mark that the user has completed the first run
      await AsyncStorage.setItem('@first_run_completed', 'true');
      console.log('First run completed flag saved to AsyncStorage');
      // Navigate to the HomeScreen
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error saving first run status:', error);
      // Still navigate even if there's an error
      navigation.navigate('Home');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#ffeaa7', '#fdcb6e', '#f39c12']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Background decorative elements */}
        <Animated.View style={[styles.decorCircle, styles.decorCircle1, {
          transform: [{ rotate: spin }]
        }]} />
        <Animated.View style={[styles.decorCircle, styles.decorCircle2, {
          transform: [{ rotate: spin }]
        }]} />
        
        <View style={styles.content}>
          {/* Logo and app name */}
          <Animated.View style={[styles.logoContainer, {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }]}>
            <Animated.Image 
              source={require('../assets/adaptive-icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>PINE-AI-PLE</Text>
          </Animated.View>
          
          {/* Main content */}
          <Animated.View style={[styles.textContainer, {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }]}>
            <Text style={styles.title}>Detect Sweetness Instantly</Text>
            <Text style={styles.subtitle}>
              Using Machine Learning and image processing to help you pick the Sweetest pineapple every time.
              Never buy an Not-Sweet pineapple again!
            </Text>
          </Animated.View>
          
          {/* Buttons */}
          <Animated.View style={[styles.buttonContainer, {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }]}>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
              <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 500,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorCircle1: {
    width: width * 0.8,
    height: width * 0.8,
    top: -width * 0.4,
    right: -width * 0.2,
  },
  decorCircle2: {
    width: width * 1.2,
    height: width * 1.2,
    bottom: -width * 0.6,
    left: -width * 0.3,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#00b894',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 5,
  },
});

export default PineappleLandingPage;