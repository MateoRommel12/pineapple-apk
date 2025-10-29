import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import tw from 'twrnc';
import { Info } from "react-native-feather"
import { TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native";

import { theme } from "../theme"
import { SafeHeader } from "../components/SafeHeader"

export default function HowItWorksScreen() {
  const navigation = useNavigation();

  return (
    <View style={tw`flex-1 bg-white`}>
      <SafeHeader 
        title="How It Works" 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={tw`p-5`}>

        <View style={tw`mb-8`}>
          <Text style={tw`text-lg font-semibold text-gray-800 mb-2`}>1. Take or Upload a Photo</Text>
          <Text style={tw`text-base text-gray-600 leading-6`}>
            • Using your device's camera or photo library, capture or select a clear image of a pineapple. Make sure the 
            pineapple is well-lit and the entire fruit is visible in the frame.
          </Text>
          <Text style={tw`text-base text-gray-600 leading-6`}>
            • Take a photo of a single pineapple, not a bunch of pineapples.
          </Text>
        </View>

        <View style={tw`mb-8`}>
          <Text style={tw`text-lg font-semibold text-gray-800 mb-2`}>2. AI Analysis</Text>
          <Text style={tw`text-base text-gray-600 leading-6`}>
            Our advanced machine learning model analyzes various aspects of the pineapple:
          </Text>
          <View style={tw`mt-3 ml-4`}>
            <Text style={tw`text-base text-gray-600 leading-6 mb-2`}>• Color patterns and intensity</Text>
            <Text style={tw`text-base text-gray-600 leading-6 mb-2`}>• Texture and surface characteristics</Text>
            <Text style={tw`text-base text-gray-600 leading-6 mb-2`}>• Size and shape proportions</Text>
          </View>
        </View>

        <View style={tw`mb-8`}>
          <Text style={tw`text-lg font-semibold text-gray-800 mb-2`}>3. Get Results</Text>
          <Text style={tw`text-base text-gray-600 leading-6`}>
            Within seconds, receive detailed analysis results including:
          </Text>
          <View style={tw`mt-3 ml-4`}>
            <Text style={tw`text-base text-gray-600 leading-6 mb-2`}>• Ripeness score</Text>
            <Text style={tw`text-base text-gray-600 leading-6 mb-2`}>• Sweetness prediction</Text>
            <Text style={tw`text-base text-gray-600 leading-6 mb-2`}>• Quality assessment</Text>
          </View>
        </View>

        <View style={tw`bg-yellow-50 rounded-xl p-4 mb-6`}>
          <Text style={tw`text-sm text-yellow-800 leading-5`}>
            Note: The accuracy of predictions may vary based on image quality and lighting conditions. For best results, 
            ensure good lighting and clear visibility of the pineapple.
          </Text>
        </View>

        <View style={tw`bg-yellow-50 rounded-xl p-4 mb-6`}>
          <View style={tw`flex-row items-center mb-2`}>
            <Info stroke={theme.colors.yellow[500]} width={20} height={20} />
            <Text style={tw`text-sm text-yellow-800 leading-5 ml-2`}>Accuracy Information</Text>
          </View>
          <Text style={tw`text-base text-gray-600 leading-6`}>
            • Our prediction model has been trained on over thousands of real pineapple samples with verified sweetness levels. The
            current model achieves 85% accuracy in predicting sweetness categories.
          </Text>
          <Text style={tw`text-base text-gray-600 leading-6`}>
            • The accuracy of predictions may vary based on image quality and lighting conditions. For best results,
            ensure good lighting and clear visibility of the pineapple.
          </Text>
        </View>

        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`flex-1 mr-2`}>
            <View style={tw`h-2 bg-gray-200 rounded-full overflow-hidden`}>
              <View style={tw`h-2 bg-yellow-500 rounded-full`}></View>
            </View>
          </View>
          <Text style={tw`text-sm text-gray-600`}>High Sweetness</Text>
          <Text style={tw`text-sm text-gray-600`}>80%</Text>
        </View>

        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`flex-1 mr-2`}>
            <View style={tw`h-2 bg-gray-200 rounded-full overflow-hidden`}>
              <View style={tw`h-2 bg-yellow-500 rounded-full`}></View>
            </View>
          </View>
          <Text style={tw`text-sm text-gray-600`}>Medium Sweetness</Text>
          <Text style={tw`text-sm text-gray-600`}>60%</Text>
        </View>

        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`flex-1 mr-2`}>
            <View style={tw`h-2 bg-gray-200 rounded-full overflow-hidden`}>
              <View style={tw`h-2 bg-yellow-500 rounded-full`}></View>
            </View>
          </View>
          <Text style={tw`text-sm text-gray-600`}>Low Sweetness</Text>
          <Text style={tw`text-sm text-gray-600`}>40%</Text>
        </View>

        <TouchableOpacity style={tw`bg-yellow-50 rounded-xl p-4 mt-6`}>
          <Text style={tw`text-sm text-yellow-800 leading-5`}>Learn more about our technology</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

