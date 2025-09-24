import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import tw from 'twrnc';
import { useNavigation } from "@react-navigation/native";
import { SafeHeader } from "../components/SafeHeader";

export default function AboutScreen() {
  const navigation = useNavigation();

  return (
    <View style={tw`flex-1 bg-white`}>
      <SafeHeader 
        title="About The Project" 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView style={tw`flex-1`}>
        <View style={tw`p-5`}>

        <View style={tw`mb-8`}>
          <Text style={tw`text-base text-gray-600 leading-6 mb-4`}>
            The Pineapple Sweetness Predictor is an innovative mobile application that uses artificial intelligence 
            to help consumers select the perfect pineapple. Our mission is to take the guesswork out of choosing 
            sweet, ripe pineapples.
          </Text>

          <Text style={tw`text-base text-gray-600 leading-6`}>
            Developed by a team of passionate engineers and fruit experts, this app combines computer vision 
            technology with machine learning to analyze pineapple characteristics that indicate sweetness and ripeness.
          </Text>
        </View>

        <View style={tw`mb-8`}>
          <Text style={tw`text-lg font-semibold text-gray-800 mb-3`}>Technology</Text>
          <View style={tw`bg-yellow-50 rounded-xl p-4`}>
            <Text style={tw`text-base text-gray-700 leading-6 mb-2`}>Built with:</Text>
            <Text style={tw`text-base text-gray-600 leading-6 mb-1`}>• React Native</Text>
            <Text style={tw`text-base text-gray-600 leading-6 mb-1`}>• TensorFlow</Text>
            <Text style={tw`text-base text-gray-600 leading-6`}>• Custom ML Models</Text>
          </View>
        </View>

        <View style={tw`mb-8`}>
          <Text style={tw`text-lg font-semibold text-gray-800 mb-3`}>The Team</Text>
          <Text style={tw`text-base text-gray-600 leading-6 mb-4`}>
            Our team consists of dedicated professionals with expertise in:
          </Text>
          <View style={tw`ml-4`}>
            <Text style={tw`text-base text-gray-600 leading-6 mb-2`}>• Machine Learning</Text>
            <Text style={tw`text-base text-gray-600 leading-6 mb-2`}>• Mobile Development</Text>
            <Text style={tw`text-base text-gray-600 leading-6 mb-2`}>• Agricultural Science</Text>
            <Text style={tw`text-base text-gray-600 leading-6`}>• UX Design</Text>
          </View>
        </View>

        <View style={tw`mb-8`}>
          <Text style={tw`text-lg font-semibold text-gray-800 mb-3`}>Contact Us</Text>
          <TouchableOpacity 
            style={tw`bg-yellow-500 rounded-lg p-4 items-center`}
            onPress={() => Linking.openURL('mailto:support@pineappleapp.com')}
          >
            <Text style={tw`text-white font-semibold`}>Email Support</Text>
          </TouchableOpacity>
        </View>

        <Text style={tw`text-sm text-gray-500 text-center mt-4`}>
          Version 1.0.0
        </Text>
      </View>
      </ScrollView>
    </View>
  );
}

