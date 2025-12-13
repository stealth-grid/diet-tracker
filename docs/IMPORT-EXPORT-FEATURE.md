# Import/Export Feature - Complete Documentation

## Overview

The Diet Tracker now includes comprehensive data management features allowing users to backup, restore, and transfer their data using JSON files.

## Features

### ✅ Export Data (Backup)
- Download all data as a single JSON file
- Includes:
  - All food items (custom + pre-populated)
  - All intake records with dates and timestamps
  - Daily goals
  - Version info and export date
- File naming: `diet-tracker-backup-YYYY-MM-DD.json`
- Instant download, no server required

### ✅ Import Data (Restore)
- Upload previously exported JSON files
- Two modes:
  - **Merge Mode**: Add new items, keep existing data
  - **Replace Mode**: Delete all, import fresh
- Comprehensive validation
- Clear success/error messages
- Real-time feedback

### ✅ Data Validation
Validates all imported data:
- JSON structure correctness
- Required field presence
- Data type accuracy
- Field value validity
- Version compatibility (with warnings)

### ✅ Safety Features
- Duplicate prevention in merge mode
- Detailed error messages
- Warning for non-critical issues
- Confirmation for destructive operations
- File format validation

---

## User Interface

### Settings Dialog Structure

The new Settings Dialog has two tabs:

#### Tab 1: Goals
- Daily calorie goal input
- Daily protein goal input
- Save button
- Success confirmation

#### Tab 2: Data Management
**Export Section:**
- Description of what gets exported
- "Download Backup" button
- Success message after export

**Import Section:**
- Import mode selector (Merge/Replace)
- Mode description
- "Choose File to Import" button
- Status messages (success/error/warning)
- Safety note about file sources

### Visual Feedback

**Success (Green)**
- ✅ Goals saved
- ✅ Data exported
- ✅ Data imported successfully

**Error (Red)**
- ❌ Invalid JSON format
- ❌ Validation failed
- ❌ File read error

**Warning (Yellow)**
- ⚠️ Missing version info
- ⚠️ Non-critical validation issues

---

## Technical Implementation

### File Structure

```typescript
interface ExportData {
  version: string;        // "1.0"
  exportDate: string;     // ISO 8601
  foods: FoodItem[];
  intakeEntries: IntakeEntry[];
  goals: DailyGoals;
}
```

### Validation Process

1. **Structure Validation**
   - Check if data is a valid object
   - Verify all required arrays and objects exist

2. **Type Validation**
   - Validate each food item structure
   - Validate each intake entry structure
   - Validate goals structure

3. **Field Validation**
   - Check data types (string, number, boolean)
   - Verify required fields are present
   - Validate value ranges (positive numbers)

4. **Business Logic Validation**
   - Date format validation (YYYY-MM-DD)
   - Timestamp validity (positive numbers)
   - ID uniqueness check

### Import Modes

#### Merge Mode
```typescript
// Pseudo-code
existingData = loadFromStorage()
newData = importFile
mergedFoods = existingFoods + newFoods.filter(notDuplicate)
mergedEntries = existingEntries + newEntries.filter(notDuplicate)
goals = newGoals // Always replaced
```

#### Replace Mode
```typescript
// Pseudo-code
clearAllStorage()
saveFoods(newFoods)
saveEntries(newEntries)
saveGoals(newGoals)
```

### Error Handling

**File Read Errors:**
```
- File is not readable
- File is empty
- Permission denied
```

**JSON Parse Errors:**
```
- Invalid JSON syntax
- Unexpected tokens
- Incomplete structure
```

**Validation Errors:**
```
- Missing required fields
- Invalid data types
- Out of range values
- Malformed structures
```

---

## Use Cases

### 1. Regular Backup
**Scenario**: User wants to backup their data weekly

**Steps:**
1. Open Settings → Data Management
2. Click "Download Backup"
3. Save file to cloud storage/external drive
4. Repeat weekly or after significant changes

**Benefits:**
- Protection against data loss
- Version history
- Peace of mind

### 2. Device Transfer
**Scenario**: User switches to a new device/browser

**Steps:**
1. Old Device: Export data
2. Transfer file (email, cloud, USB)
3. New Device: Import data (Merge or Replace mode)
4. Verify data is correct

**Benefits:**
- No data loss during migration
- Seamless transition
- Works across different browsers

### 3. Data Sharing
**Scenario**: User wants to share custom food database with family

**Steps:**
1. Export data
2. Manually edit JSON to keep only foods
3. Remove personal intake entries
4. Share file with others
5. They import in Merge mode

**Benefits:**
- Collaborative food databases
- Share recipes and measurements
- Consistent tracking across family

### 4. Recovery from Mistakes
**Scenario**: User accidentally deleted important data

**Steps:**
1. Keep regular backups
2. If mistake happens, stop using app
3. Import last backup in Replace mode
4. Verify data restored

**Benefits:**
- Undo major mistakes
- Quick recovery
- Minimal data loss

### 5. Testing and Development
**Scenario**: Developer wants to test with sample data

**Steps:**
1. Create sample data file
2. Import in Replace mode
3. Test features
4. Export results
5. Import clean slate for next test

**Benefits:**
- Reproducible testing
- Reset to known state
- Debug with specific data

---

## Best Practices

### For Users

**Regular Backups:**
- Export weekly or after major changes
- Name files with dates
- Store in multiple locations
- Test restore occasionally

**Safe Importing:**
- Only import files you trust
- Use Merge mode by default
- Use Replace mode only when needed
- Verify data after import

**File Management:**
- Keep organized backup folder
- Delete old backups (keep last 3-4)
- Document any manual edits
- Validate manually edited files

### For Developers

**Data Integrity:**
- Always validate before import
- Use TypeScript types strictly
- Handle all error cases
- Provide clear feedback

**User Experience:**
- Show progress indicators
- Provide clear error messages
- Confirm destructive actions
- Auto-close after success

**Performance:**
- Handle large files efficiently
- Don't block UI during operations
- Use async operations
- Clean up resources (URLs, file handles)

---

## Troubleshooting

### Export Issues

**Problem**: Download doesn't start
**Solution**: Check browser download settings, try again

**Problem**: File is empty
**Solution**: Check if data exists, try refreshing page

**Problem**: File won't open
**Solution**: File might be corrupted, try exporting again

### Import Issues

**Problem**: "Invalid JSON format"
**Solution**: File might be corrupted or manually edited incorrectly

**Problem**: "Validation failed"
**Solution**: Check specific error message, fix data structure

**Problem**: "File read error"
**Solution**: Check file permissions, try selecting file again

**Problem**: Data imported but not showing
**Solution**: Refresh the page, check import mode used

### General Issues

**Problem**: Lost data after import
**Solution**: Import last backup in Replace mode

**Problem**: Duplicate entries after import
**Solution**: Use Merge mode, it prevents duplicates

**Problem**: Can't find exported file
**Solution**: Check browser's download folder

---

## Future Enhancements

### Planned Features
1. **Encrypted Exports** - Password-protected backups
2. **Selective Export** - Choose what to export
3. **Auto-Backup** - Scheduled automatic backups
4. **Cloud Sync** - Sync across devices automatically
5. **Import History** - Track all imports/exports
6. **Incremental Backup** - Only export changes
7. **Compression** - Smaller file sizes
8. **Multiple File Formats** - CSV, Excel support

### Under Consideration
- Direct sharing links (time-limited)
- Backup to cloud storage (Google Drive, Dropbox)
- Version control for backups
- Merge conflict resolution UI
- Backup verification tool

---

## API Reference

### Export Functions

```typescript
// Get all data as ExportData object
exportData(): ExportData

// Download data as JSON file
downloadDataAsJSON(): void
```

### Import Functions

```typescript
// Read and parse JSON file
readJSONFile(file: File): Promise<unknown>

// Validate data structure
validateImportData(data: unknown): ValidationResult

// Import data with mode
importData(data: ExportData, mode: "merge" | "replace"): void
```

### Validation Functions

```typescript
// Validate complete data structure
validateImportData(data: unknown): ValidationResult

// Validate individual item types
isValidFoodItem(item: unknown): boolean
isValidIntakeEntry(item: unknown): boolean
isValidGoals(item: unknown): boolean
```

---

## Security Considerations

### Data Privacy
- All data remains local (localStorage)
- No server uploads
- No tracking or analytics
- User has full control

### File Security
- Files are plain JSON (not encrypted)
- Don't share files with sensitive info
- Store backups securely
- Be cautious with public sharing

### Import Safety
- Only import trusted files
- Validate all inputs
- Prevent XSS through data
- Sanitize user inputs

---

## Testing

### Manual Test Cases

**Export:**
- [ ] Export with empty data
- [ ] Export with full data
- [ ] Export with only custom foods
- [ ] Export after deleting items
- [ ] Multiple exports in succession

**Import (Merge):**
- [ ] Import into empty storage
- [ ] Import with some duplicates
- [ ] Import with all duplicates
- [ ] Import with no duplicates
- [ ] Import after manual edit

**Import (Replace):**
- [ ] Replace all data
- [ ] Replace with empty file
- [ ] Replace after export
- [ ] Replace multiple times

**Validation:**
- [ ] Invalid JSON syntax
- [ ] Missing required fields
- [ ] Wrong data types
- [ ] Corrupted data
- [ ] Empty arrays
- [ ] Missing version

---

## Changelog

### Version 1.0 (Current)
- Initial release
- Export all data as JSON
- Import with Merge/Replace modes
- Comprehensive validation
- Error handling and user feedback
- Documentation and guides

---

**Documentation Version**: 1.0
**Last Updated**: November 6, 2025
**Feature Status**: ✅ Production Ready
