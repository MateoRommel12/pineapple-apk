import * as ImageManipulator from 'expo-image-manipulator';

interface ProcessedResult {
  colorScore: number;
  textureScore: number;
  ripeness: number;
}

export async function processPineappleImage(imageUri: string): Promise<ProcessedResult> {
  try {
    // Resize image for processing
    const resizedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    // TODO: Implement actual image processing logic here
    // For now, return mock data
    return {
      colorScore: 0.85,
      textureScore: 0.75,
      ripeness: 0.8
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
}

export function getRipenessLevel(ripeness: number): string {
  if (ripeness >= 0.9) return 'Perfectly Ripe';
  if (ripeness >= 0.7) return 'Ripe';
  if (ripeness >= 0.5) return 'Almost Ripe';
  if (ripeness >= 0.3) return 'Not Quite Ripe';
  return 'Not Ripe';
}

export function getSweetnessEstimate(ripeness: number): string {
  if (ripeness >= 0.9) return 'Very Sweet';
  if (ripeness >= 0.7) return 'Sweet';
  if (ripeness >= 0.5) return 'Moderately Sweet';
  if (ripeness >= 0.3) return 'Slightly Sweet';
  return 'Not Sweet';
} 