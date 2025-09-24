import React from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "./context/ThemeContext";
import { theme } from './theme';
import { RootStackParamList } from "./types/navigation";

import PineappleLandingPage from "./screens/PineappleLandingPage"; // Import the landing page
import HomeScreen from "./screens/HomeScreen";
import HowItWorksScreen from "./screens/HowItWorksScreen";
import AboutScreen from "./screens/AboutScreen";
import AnalysisHistoryScreen from "./screens/AnalysisHistoryScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

function Navigation() {
  return (
    <Stack.Navigator
      initialRouteName="PineappleLandingPage" // Set the landing page as the initial route
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
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <ThemeProvider>
          <StatusBar 
            style="light" 
            backgroundColor={theme.colors.yellow[500]}
            translucent={false}
          />
          <Navigation />
        </ThemeProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}