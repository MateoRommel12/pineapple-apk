import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from 'react-native';
import { ThemeProvider } from "./context/ThemeContext";
import { theme } from './theme';
import { RootStackParamList } from "./types/navigation";

import PineappleLandingPage from "./screens/PineappleLandingPage"; // Import the landing page
import HomeScreen from "./screens/HomeScreen";
import HowItWorksScreen from "./screens/HowItWorksScreen";
import AboutScreen from "./screens/AboutScreen";
import AnalysisHistoryScreen from "./screens/AnalysisHistoryScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

function Navigation({ initialRoute }: { initialRoute: keyof RootStackParamList }) {
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.yellow[500],
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        animation: 'slide_from_right', // Add animation for screen transitions
      }}
    >
      <Stack.Screen 
        name="PineappleLandingPage" 
        component={PineappleLandingPage} 
        options={{ headerShown: false }} // Hide the header for the landing page
      />
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          headerShown: false, // Hide default header, use custom SafeHeader
        }} 
      />
      <Stack.Screen 
        name="HowItWorks" 
        component={HowItWorksScreen}
        options={{ 
          headerShown: false, // Use custom SafeHeader
        }}
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen}
        options={{ 
          headerShown: false, // Use custom SafeHeader
        }}
      />
      <Stack.Screen
        name="AnalysisHistory"
        component={AnalysisHistoryScreen}
        options={{
          headerShown: false, // Use custom SafeHeader
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const firstRunFlag = await AsyncStorage.getItem('@first_run_completed');
        console.log('First run flag:', firstRunFlag);
        
        if (!firstRunFlag) {
          // First time launch - show landing page
          // Clean up any existing analysis history for fresh install
          await AsyncStorage.removeItem('@analysis_history');
          setInitialRoute('PineappleLandingPage');
          console.log('Setting initial route to: PineappleLandingPage');
        } else {
          // Not first launch - go directly to Home
          setInitialRoute('Home');
          console.log('Setting initial route to: Home');
        }
      } catch (error) {
        console.error('Error checking first launch:', error);
        // On error, default to landing page
        setInitialRoute('PineappleLandingPage');
      } finally {
        setIsLoading(false);
      }
    };

    checkFirstLaunch();
  }, []);

  // Show loading screen while checking AsyncStorage
  if (isLoading || initialRoute === null) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.yellow[500] }}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <ThemeProvider>
          <StatusBar 
            style="light" 
            backgroundColor={theme.colors.yellow[500]}
            translucent={false}
          />
          <Navigation initialRoute={initialRoute} />
        </ThemeProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}