import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ArrowRight, Clock, Calendar } from "react-native-feather";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

import PineappleUploader from "../components/PineappleUploader";
import { SafeHeader } from "../components/SafeHeader";
import { HelpModal } from "../components/HelpModal";

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface AnalysisRecord {
  id: string;
  date: string;
  imageUri: string;
  sweetness: number;
  confidence: number;
  category: string;
}

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [recentAnalyses, setRecentAnalyses] = React.useState<AnalysisRecord[]>([]);
  const [showHelpModal, setShowHelpModal] = React.useState(false);

  React.useEffect(() => {
    loadRecentAnalyses();

    // Add event listener for analysis updates
    const subscription = DeviceEventEmitter.addListener(
      'analysisHistoryUpdated',
      (updatedHistory) => {
        // Update the recent analyses with the first 3 items
        setRecentAnalyses(updatedHistory.slice(0, 3));
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.remove();
    };
  }, []);

  const loadRecentAnalyses = async () => {
    try {
      const historyKey = '@analysis_history';
      const historyData = await AsyncStorage.getItem(historyKey);
      if (historyData) {
        const allAnalyses = JSON.parse(historyData);
        // Only show the 3 most recent analyses
        setRecentAnalyses(allAnalyses.slice(0, 3));
      } else {
        // If no history data exists, set empty array
        setRecentAnalyses([]);
      }
    } catch (error) {
      console.error('Error loading recent analyses:', error);
      // On error, set empty array
      setRecentAnalyses([]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => null,
    });
  }, [navigation]);

  return (
    <View style={tw`flex-1 bg-white`}>
      <SafeHeader 
        title="PINE-AI-PLE"
        showHelpButton={true}
        onHelpPress={() => setShowHelpModal(true)}
      />
      
      <HelpModal 
        visible={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
      
      <ScrollView 
        contentContainerStyle={tw`p-5 pb-8`}
        showsVerticalScrollIndicator={false}
      >
        <View style={tw`items-center mb-6 pt-2.5`}>
          <View style={tw`flex-row justify-between items-center w-full mb-6 px-1`}>
            <Text style={tw`text-base font-semibold text-gray-800`}>
              Hello! 👋
            </Text>
          </View>
          <Text style={tw`text-2xl font-bold text-gray-800 text-center mb-1`}>
            Predict Pineapple Sweetness
          </Text>
          <Text style={tw`text-2xl font-bold text-yellow-500 text-center mb-4`}>
            Using AI
          </Text>
          <Text style={tw`text-sm text-gray-600 text-center mx-5 leading-5`}>
            Our advanced machine learning algorithm analyzes pineapple images to predict sweetness levels. Simply upload
            a photo of your pineapple and get instant results.
          </Text>
        </View>

        <View style={tw`mb-6 shadow-sm`}>
          <PineappleUploader />
        </View>

        <View style={tw`mb-6`}>
          <View style={tw`flex-row justify-between items-center mb-4`}>
            <Text style={tw`text-lg font-semibold text-gray-800`}>Recent Analyses</Text>
            <TouchableOpacity 
              style={tw`flex-row items-center`}
              onPress={() => navigation.navigate('AnalysisHistory')}
            >
              <Text style={tw`text-sm text-yellow-600 mr-1`}>View All</Text>
              <ArrowRight stroke={tw.color('yellow-600')} width={14} height={14} />
            </TouchableOpacity>
          </View>

          {recentAnalyses.length > 0 ? (
            <View style={tw`gap-3`}>
              {recentAnalyses.map((analysis) => (
                <View 
                  key={analysis.id}
                  style={tw`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden`}
                >
                  <View style={tw`flex-row`}>
                    <Image 
                      source={{ uri: analysis.imageUri }} 
                      style={tw`w-20 h-20`}
                      resizeMode="cover"
                    />
                    <View style={tw`flex-1 p-3`}>
                      <View style={tw`flex-row items-center mb-1`}>
                        <Calendar width={14} height={14} stroke="#4B5563" />
                        <Text style={tw`text-gray-600 text-xs ml-1`}>
                          {formatDate(analysis.date)}
                        </Text>
                      </View>
                      <Text style={tw`text-base font-medium text-gray-800 mb-1`}>
                        {analysis.category}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={tw`bg-gray-50 rounded-lg p-4 items-center`}>
              <Clock width={24} height={24} stroke="#9CA3AF" />
              <Text style={tw`text-gray-500 text-sm mt-2 text-center`}>
                No analyses yet.{'\n'}
                Start by analyzing a pineapple!
              </Text>
            </View>
          )}
        </View>

        <View style={tw`gap-3`}>
          <TouchableOpacity 
            style={tw`flex-row items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100`}
            onPress={() => navigation.navigate("HowItWorks")}
            activeOpacity={0.7}
          >
            <Text style={tw`text-base font-medium text-gray-800`}>How It Works</Text>
            <ArrowRight stroke={tw.color('yellow-600')} width={16} height={16} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={tw`flex-row items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100`}
            onPress={() => navigation.navigate("About")}
            activeOpacity={0.7}
          >
            <Text style={tw`text-base font-medium text-gray-800`}>About The Project</Text>
            <ArrowRight stroke={tw.color('yellow-600')} width={16} height={16} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

