import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert, DeviceEventEmitter } from 'react-native';
import { Calendar, Trash2 } from 'react-native-feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import { useNavigation } from "@react-navigation/native";
import { SafeHeader } from "../components/SafeHeader";

interface AnalysisRecord {
  id: string;
  date: string;
  imageUri: string;
  sweetness: number;
  confidence: number;
  category: string;
}

export default function AnalysisHistoryScreen() {
  const navigation = useNavigation();
  const [analyses, setAnalyses] = React.useState<AnalysisRecord[]>([]);

  React.useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      const historyKey = '@analysis_history';
      const historyData = await AsyncStorage.getItem(historyKey);
      if (historyData) {
        const allAnalyses = JSON.parse(historyData);
        setAnalyses(allAnalyses);
      }
    } catch (error) {
      console.error('Error loading analyses:', error);
    }
  };

  const clearHistory = async () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear all analysis history? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@analysis_history');
              setAnalyses([]);
              DeviceEventEmitter.emit('analysisHistoryUpdated', []);
              Alert.alert("Success", "Analysis history has been cleared.");
            } catch (error) {
              console.error('Error clearing history:', error);
              Alert.alert("Error", "Failed to clear history. Please try again.");
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <SafeHeader 
        title="Analysis History" 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={
          analyses.length > 0 ? (
            <TouchableOpacity 
              onPress={clearHistory}
              style={tw`flex-row items-center bg-red-50 px-3 py-1.5 rounded-full`}
            >
              <Trash2 width={16} height={16} color="#EF4444" />
              <Text style={tw`text-red-500 text-sm font-medium ml-1`}>Clear</Text>
            </TouchableOpacity>
          ) : null
        }
      />
      <ScrollView contentContainerStyle={tw`p-4`}>
        {analyses.length > 0 ? (
          <View style={tw`gap-4`}>
            {analyses.map((analysis) => (
              <View 
                key={analysis.id}
                style={tw`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden`}
              >
                <View style={tw`flex-row`}>
                  <Image 
                    source={{ uri: analysis.imageUri }} 
                    style={tw`w-24 h-24`}
                    resizeMode="cover"
                  />
                  <View style={tw`flex-1 p-4`}>
                    <View style={tw`flex-row items-center mb-2`}>
                      <Calendar width={14} height={14} stroke="#4B5563" />
                      <Text style={tw`text-gray-600 text-xs ml-1`}>
                        {formatDate(analysis.date)}
                      </Text>
                    </View>
                    <Text style={tw`text-lg font-medium text-gray-800 mb-1`}>
                      {analysis.category}
                    </Text>
                    <Text style={tw`text-sm text-gray-600 mb-1`}>
                      Sweetness: {analysis.sweetness ? analysis.sweetness.toFixed(1) : 'N/A'}/100
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={tw`bg-gray-50 rounded-lg p-6 items-center`}>
            <Text style={tw`text-gray-500 text-base text-center`}>
              No analysis history yet.{'\n'}
              Start by analyzing a pineapple!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
} 