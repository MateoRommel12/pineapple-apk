# Local Model Cleanup Guide

## Files That Can Be Safely Deleted

Now that you've integrated the backend API, these local model files are no longer needed:

### Core Model Files (Safe to Delete)
- ✅ `lib/mlService.ts` - Local TensorFlow.js ML service
- ✅ `lib/MobileNetV2TFLiteService.ts` - Local TensorFlow Lite service
- ✅ `enhanced_fallback_classifier.ts` - Fallback classification logic

### Components Using Old Models
- ❌ `components/PineappleUploader.tsx` - **NEEDS UPDATE** - Still uses `mlService`
- ❌ `tests/modelIntegration.test.js` - **NEEDS UPDATE** - Still uses `mlService`

### Model Assets (Can Delete to Save Space)
- `assets/models/pineapple_detector/` - YOLOv8 model files (~50MB)
- `assets/models/sweetness_classifier/` - TensorFlow Lite models (~10MB)

## Step-by-Step Cleanup Process

### 1. Update Remaining Components

First, update components still using the old models:

```bash
# These files need to be updated to use apiService instead of mlService
```

### 2. Remove Dependencies (Optional)

After cleanup, you can remove TensorFlow dependencies to reduce app size:

```json
// In package.json, these can be removed:
"@tensorflow/tfjs": "^4.22.0",
"@tensorflow/tfjs-backend-webgl": "^4.22.0", 
"@tensorflow/tfjs-react-native": "^1.0.0",
"react-native-fast-tflite": "^1.6.1"
```

### 3. Delete Model Files

```bash
# Remove model directories
rm -rf assets/models/pineapple_detector/
rm -rf assets/models/sweetness_classifier/

# Remove service files
rm lib/mlService.ts
rm lib/MobileNetV2TFLiteService.ts
rm enhanced_fallback_classifier.ts
```

### 4. Update Metro Config

Remove TensorFlow Lite extensions from `metro.config.js`:

```js
// Remove these lines:
config.resolver.assetExts.push('bin');
config.resolver.assetExts.push('tflite');
```

## Benefits of Cleanup

✅ **Reduced App Size**: Remove ~60MB of model files
✅ **Simplified Dependencies**: Remove heavy TensorFlow dependencies  
✅ **Faster Builds**: Less assets to bundle
✅ **Centralized Processing**: All ML work happens on backend
✅ **Easier Updates**: Update models on server without app updates

## Risks to Consider

⚠️ **No Offline Support**: App won't work without internet
⚠️ **Backend Dependency**: App requires backend server to be running
⚠️ **Network Latency**: Analysis requires network round-trip

## Recommendation

**For Production**: Keep the backend-only approach - it's more scalable
**For Development**: You might want to keep one working model service as backup

Choose based on your needs:
- **Backend-only**: Delete everything for production app
- **Hybrid**: Keep as backup but don't use in main flow
