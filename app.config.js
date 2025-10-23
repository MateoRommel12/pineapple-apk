export default {
  name: 'PINE-AI-PLE',
  slug: 'pineapple-sweetness',
  version: '1.0.0',
  icon: './assets/PINEAIPLE.png', // Your app icon (should be 1024x1024px ideally)
  extra: {
    eas: {
      projectId: "69bed69b-fcb8-49ff-a268-060998058186"
    }
  },
  android: {
    package: 'com.mel.pineapplesweetness',
    adaptiveIcon: {
      foregroundImage: './assets/PINEAIPLE.png', // Your logo as the foreground
      backgroundColor: '#FFFFFF' // Change this to match your logo background
    }
  },
  plugins: []
} 