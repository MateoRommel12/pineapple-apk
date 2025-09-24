# Backend Integration Guide

This guide explains how to use your React Native Expo app with the Flask backend for pineapple analysis.

## 🚀 Quick Start

### 1. Start the Backend Server

1. Navigate to the PineappleServer directory:
   ```bash
   cd C:\Capstone-Proj\PineappleServer
   ```

2. Run the backend server:
   ```bash
   python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
   ```
   
   Or use the batch file:
   ```bash
   run_backend.bat
   ```

### 2. Configure the App

1. Find your computer's IP address:
   - **Windows**: Run `ipconfig` in Command Prompt
   - **Mac/Linux**: Run `ifconfig` in Terminal
   
2. Update the IP address in `config/apiConfig.ts`:
   ```typescript
   BASE_URL: 'http://YOUR_IP_ADDRESS:8000'
   ```
   
   Example: `'http://192.168.1.100:8000'`

### 3. Run the React Native App

```bash
npm run android
# or
npm run ios
```

## 📱 Features

### Backend Status Indicator
- Green dot: Connected to backend
- Red dot: Backend unavailable
- Yellow dot: Checking connection
- Tap the indicator for connection details

### Image Analysis
- Upload or take photos of pineapples
- Real-time analysis using your trained AI models
- Detailed sweetness predictions and recommendations

### Error Handling
- Automatic retry for network issues
- User-friendly error messages
- Graceful fallbacks when backend is unavailable

## 🔧 Configuration

### API Configuration (`config/apiConfig.ts`)
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://192.168.0.128:8000', // Update this!
  REQUEST_TIMEOUT: 30000,
  UPLOAD_TIMEOUT: 60000,
  MAX_RETRIES: 3,
  // ... other settings
};
```

### Network Requirements
- Both devices must be on the same WiFi network
- Backend server must be accessible from the mobile device
- HTTP traffic is allowed (configured in app.json)

## 🛠️ Troubleshooting

### Common Issues

1. **"Unable to connect to server"**
   - Verify backend is running: `http://YOUR_IP:8000/health`
   - Check IP address in configuration
   - Ensure both devices are on same network
   - Check firewall settings

2. **"Request timeout"**
   - Backend may be processing slowly
   - Check backend logs for errors
   - Increase timeout in configuration

3. **"Backend is not responding properly"**
   - Backend health endpoint may be failing
   - Check backend server logs
   - Restart the backend server

### Testing Connection

1. **Test in browser**:
   ```
   http://YOUR_IP:8000/health
   ```
   Should return JSON status information.

2. **Use backend status indicator**:
   - Tap the status indicator in the app
   - Select "Check Again" to test connection

3. **Check backend logs**:
   - Look for request logs in the backend terminal
   - Check for any Python errors

### Network Configuration

1. **Windows Firewall**:
   ```bash
   # Allow Python through firewall
   netsh advfirewall firewall add rule name="Python Server" dir=in action=allow protocol=TCP localport=8000
   ```

2. **Router/WiFi Issues**:
   - Try connecting from a browser on another device
   - Check if router blocks inter-device communication
   - Some guest networks may block device-to-device communication

## 📊 API Endpoints

### Health Check
```
GET /health
```
Returns server status and configuration.

### Image Analysis
```
POST /predict
Content-Type: multipart/form-data
Body: image file
```
Returns pineapple detection and sweetness analysis.

### Analysis History
```
GET /history?limit=50
```
Returns previous analysis results.

## 🔄 Migration from Local Models

The app has been updated to use the backend API instead of local TensorFlow models:

- **Before**: Local TensorFlow.js and TFLite models
- **After**: Backend Flask API with your trained models
- **Benefits**: Better performance, easier model updates, centralized processing

### Key Changes Made

1. **New API Service** (`services/apiService.ts`):
   - Handles all backend communication
   - Automatic error handling and retries
   - Configuration management

2. **Updated Components**:
   - `PineappleAnalyzer`: Now uses backend API
   - `BackendStatusIndicator`: Shows connection status
   - Enhanced error messages and user feedback

3. **Network Configuration**:
   - HTTP traffic enabled for development
   - CORS configured in backend
   - Timeout and retry logic

## 🎯 Production Considerations

### Security
- Use HTTPS in production
- Implement authentication if needed
- Validate and sanitize all inputs

### Performance
- Consider image compression before upload
- Implement caching for frequently analyzed images
- Monitor backend resource usage

### Deployment
- Deploy backend to cloud service (AWS, Heroku, etc.)
- Update BASE_URL to production endpoint
- Configure proper SSL certificates

## 📝 Development Tips

1. **Keep backend running** during development
2. **Check logs** in both frontend and backend
3. **Use status indicator** to verify connection
4. **Test with different image sizes** and formats
5. **Monitor network requests** in development tools

## 🆘 Support

If you encounter issues:

1. Check the status indicator in the app
2. Verify backend is running and accessible
3. Review configuration settings
4. Check network connectivity
5. Look at backend server logs for errors

The integration provides a seamless experience between your React Native app and the powerful Flask backend with your trained AI models!
