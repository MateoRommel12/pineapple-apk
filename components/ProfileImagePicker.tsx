import React from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import tw from 'twrnc';

interface ProfileImagePickerProps {
  imageUri: string | null;
  onImageSelected: (uri: string) => void;
}

export default function ProfileImagePicker({ imageUri, onImageSelected }: ProfileImagePickerProps) {
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      onImageSelected(result.assets[0].uri);
    }
  };

  return (
    <TouchableOpacity onPress={pickImage} style={tw`items-center mb-5`}>
      {imageUri ? (
        <Image 
          source={{ uri: imageUri }} 
          style={tw`w-30 h-30 rounded-full border-4 border-yellow-500`}
        />
      ) : (
        <View style={tw`w-30 h-30 rounded-full bg-yellow-50 border-2 border-yellow-200 border-dashed justify-center items-center`}>
          <Text style={tw`text-yellow-600 text-sm font-medium text-center px-2.5`}>
            Add Profile Photo
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
} 