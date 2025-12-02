import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from './context/ThemeContext';
import HomeScreen from './screens/HomeScreen';
import HowItWorksScreen from './screens/HowItWorksScreen';
import AboutScreen from './screens/AboutScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#f59e0b',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: '🍍 PINE-AI-PLE' }} 
          />
          <Stack.Screen 
            name="HowItWorks" 
            component={HowItWorksScreen} 
            options={{ title: 'How It Works' }} 
          />
          <Stack.Screen 
            name="About" 
            component={AboutScreen} 
            options={{ title: 'About' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
} 