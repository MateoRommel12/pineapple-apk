# SQLite Database Implementation for Pineapple Analysis App

This document explains the SQLite database implementation that enables offline functionality for your pineapple analysis app.

## Overview

The app now includes a complete SQLite database system that allows it to work offline without requiring a backend connection. When users install the app, it automatically creates a local SQLite database to store analysis results and app settings.

## Features

### 🗄️ **Local Database Storage**
- SQLite database created automatically on first app launch
- Stores analysis results, app settings, and migration history
- Persistent storage that survives app updates

### 📱 **Offline Mode**
- Automatic detection of backend availability
- Falls back to offline analysis when backend is unavailable
- Manual offline mode toggle for users

### 🔄 **Automatic Migration System**
- Database schema updates handled automatically
- Preserves existing user data during updates
- Version tracking for future compatibility

### 📊 **Local Analysis**
- Basic pineapple detection using color analysis
- Sweetness estimation based on image characteristics
- Results stored locally for offline access

## Installation & Setup

### 1. Install Dependencies

The SQLite dependency has been added to your `package.json`:

```bash
npm install react-native-sqlite-storage
```

### 2. Android Configuration

For Android, you may need to add permissions to your `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

### 3. Initialize Database in App

Wrap your main app component with the `DatabaseInitializer`:

```tsx
import { DatabaseInitializer } from './components/DatabaseInitializer';

export default function App() {
  return (
    <DatabaseInitializer>
      {/* Your existing app components */}
      <YourMainApp />
    </DatabaseInitializer>
  );
}
```

## Database Schema

### Analysis Results Table
```sql
CREATE TABLE analysis_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_uri TEXT NOT NULL,
  image_filename TEXT,
  is_pineapple INTEGER NOT NULL DEFAULT 0,
  detection_confidence REAL NOT NULL DEFAULT 0,
  bounding_box_x REAL,
  bounding_box_y REAL,
  bounding_box_width REAL,
  bounding_box_height REAL,
  sweetness_percentage REAL,
  sweetness_confidence REAL,
  sweetness_category TEXT,
  sweetness_class TEXT,
  display_title TEXT,
  color_indicator TEXT,
  recommendation TEXT,
  characteristics TEXT, -- JSON string
  quality_metrics TEXT, -- JSON string
  processing_time INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'success',
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### App Settings Table
```sql
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Migrations Table
```sql
CREATE TABLE migrations (
  version INTEGER PRIMARY KEY,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Usage Examples

### Basic Usage

The API service automatically handles offline/online mode switching:

```typescript
import { apiService } from './services/apiService';

// Analyze a pineapple image (works online or offline)
const result = await apiService.analyzePineapple(imageUri);

// Get analysis history (from backend or local database)
const history = await apiService.getHistory(50);

// Check if app is in offline mode
const isOffline = apiService.isOfflineModeEnabled();
```

### Manual Offline Mode Control

```typescript
// Enable offline mode manually
await apiService.setOfflineMode(true);

// Test backend connection
const connectionTest = await apiService.testConnection();

// Get local database statistics
const stats = await apiService.getLocalStats();
```

### Database Management

```typescript
import { databaseService } from './services/databaseService';

// Get all analysis results
const results = await databaseService.getAllAnalysisResults(50);

// Get results by pineapple detection
const pineappleResults = await databaseService.getAnalysisResultsByPineapple(true);

// Clear all local data
await databaseService.clearAllAnalysisResults();

// Get database statistics
const stats = await databaseService.getDatabaseStats();
```

### Offline Analysis

```typescript
import { offlineAnalysisService } from './services/offlineAnalysisService';

// Perform offline analysis
const result = await offlineAnalysisService.analyzePineapple(imageUri);

// Get offline history
const history = await offlineAnalysisService.getOfflineHistory(50);

// Clear offline data
await offlineAnalysisService.clearOfflineHistory();
```

## Components

### DatabaseInitializer
Handles database initialization on app startup with loading screen.

```tsx
<DatabaseInitializer onInitialized={(success, error) => {
  if (success) {
    console.log('Database initialized successfully');
  } else {
    console.error('Database initialization failed:', error);
  }
}}>
  <YourApp />
</DatabaseInitializer>
```

### OfflineSettings
Settings screen for managing offline mode and database.

```tsx
import { OfflineSettings } from './components/OfflineSettings';

// Use in your settings screen
<OfflineSettings />
```

## Migration System

The migration system automatically handles database schema updates:

### Adding New Migrations

Add new migrations to `services/migrationService.ts`:

```typescript
{
  version: 2,
  name: 'Add user preferences table',
  up: async () => {
    const db = databaseService.getDatabase();
    if (!db) throw new Error('Database not available');
    
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
}
```

### Migration Management

```typescript
import { migrationService } from './services/migrationService';

// Check if migrations are needed
const needsMigration = await migrationService.needsMigration();

// Get pending migrations
const pending = await migrationService.getPendingMigrations();

// Get migration history
const history = await migrationService.getMigrationHistory();

// Backup database
const backup = await migrationService.backupDatabase();
```

## File Structure

```
services/
├── databaseService.ts          # Main database operations
├── migrationService.ts         # Database migration system
├── offlineAnalysisService.ts   # Offline analysis functionality
└── apiService.ts              # Updated with offline support

components/
├── DatabaseInitializer.tsx     # Database initialization component
└── OfflineSettings.tsx        # Settings for offline mode
```

## Benefits

### For Users
- ✅ App works without internet connection
- ✅ Faster analysis (no network delays)
- ✅ Data privacy (everything stored locally)
- ✅ Works on any Android device

### For Developers
- ✅ Reduced server costs
- ✅ Better user experience
- ✅ Scalable architecture
- ✅ Easy to maintain and update

## Troubleshooting

### Database Issues
```typescript
// Check if database is ready
if (databaseService.isReady()) {
  console.log('Database is ready');
} else {
  console.log('Database not initialized');
}

// Test database connection
try {
  const stats = await databaseService.getDatabaseStats();
  console.log('Database working:', stats);
} catch (error) {
  console.error('Database error:', error);
}
```

### Common Issues

1. **Database not initializing**: Check that `DatabaseInitializer` wraps your app
2. **Migration errors**: Ensure migrations are properly defined
3. **Permission errors**: Check Android permissions for storage access
4. **Performance issues**: Use database indexes for better query performance

## Future Enhancements

- [ ] TensorFlow Lite integration for better offline analysis
- [ ] Cloud sync when online
- [ ] Data export/import functionality
- [ ] Advanced image preprocessing
- [ ] Batch analysis capabilities

## Support

For issues or questions about the SQLite implementation:
1. Check the console logs for detailed error messages
2. Verify database initialization is successful
3. Test with simple database operations first
4. Check Android permissions and storage access

The implementation is designed to be robust and handle edge cases gracefully, falling back to offline mode when needed.
