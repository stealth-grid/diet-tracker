# Diet Tracker - Data Format Documentation

This document describes the JSON format used for data export/import in the Diet Tracker application.

## Export File Structure

The exported JSON file contains all user data with the following structure:

```json
{
  "version": "1.0",
  "exportDate": "2025-11-06T10:30:00.000Z",
  "foods": [...],
  "intakeEntries": [...],
  "goals": {...}
}
```

## Top-Level Fields

### version
- **Type**: `string`
- **Description**: Format version number for compatibility checking
- **Current Version**: `"1.0"`

### exportDate
- **Type**: `string` (ISO 8601 datetime)
- **Description**: Timestamp when the export was created
- **Example**: `"2025-11-06T10:30:00.000Z"`

### foods
- **Type**: `Array<FoodItem>`
- **Description**: Array of all food items (both custom and pre-populated)

### intakeEntries
- **Type**: `Array<IntakeEntry>`
- **Description**: Array of all food intake records

### goals
- **Type**: `DailyGoals`
- **Description**: User's daily nutrition goals

---

## Data Type Definitions

### FoodItem

Represents a food item in the database.

```typescript
{
  "id": string,
  "name": string,
  "proteinPer100g": number,
  "caloriesPer100g": number,
  "category": string | undefined,
  "isCustom": boolean
}
```

**Fields:**
- `id`: Unique identifier for the food item
- `name`: Display name of the food
- `proteinPer100g`: Protein content in grams per 100g
- `caloriesPer100g`: Caloric content in kcal per 100g
- `category`: Optional category (e.g., "grains", "protein", "vegetables")
- `isCustom`: `true` for user-added items, `false` for pre-populated items

**Example:**
```json
{
  "id": "chicken-breast-cooked",
  "name": "Chicken Breast (cooked, skinless)",
  "proteinPer100g": 31,
  "caloriesPer100g": 165,
  "category": "protein",
  "isCustom": false
}
```

### IntakeEntry

Represents a food intake record for a specific date and time.

```typescript
{
  "id": string,
  "foodId": string,
  "foodName": string,
  "quantity": number,
  "protein": number,
  "calories": number,
  "date": string,
  "timestamp": number
}
```

**Fields:**
- `id`: Unique identifier for the intake entry
- `foodId`: Reference to the food item's ID
- `foodName`: Denormalized food name for easy display
- `quantity`: Amount consumed in grams
- `protein`: Calculated protein content in grams
- `calories`: Calculated caloric content in kcal
- `date`: Date in YYYY-MM-DD format
- `timestamp`: Unix timestamp (milliseconds since epoch)

**Example:**
```json
{
  "id": "1699267200000-0.123456",
  "foodId": "chicken-breast-cooked",
  "foodName": "Chicken Breast (cooked, skinless)",
  "quantity": 150,
  "protein": 46.5,
  "calories": 247.5,
  "date": "2025-11-06",
  "timestamp": 1699267200000
}
```

### DailyGoals

Represents the user's daily nutrition goals.

```typescript
{
  "calorieGoal": number,
  "proteinGoal": number
}
```

**Fields:**
- `calorieGoal`: Daily calorie target in kcal
- `proteinGoal`: Daily protein target in grams

**Example:**
```json
{
  "calorieGoal": 2500,
  "proteinGoal": 120
}
```

---

## Complete Example

Here's a complete example of an exported file:

```json
{
  "version": "1.0",
  "exportDate": "2025-11-06T10:30:00.000Z",
  "foods": [
    {
      "id": "rice-white-cooked",
      "name": "White Rice (cooked)",
      "proteinPer100g": 2.7,
      "caloriesPer100g": 130,
      "category": "grains",
      "isCustom": false
    },
    {
      "id": "custom-1699267200000-0.789",
      "name": "Grilled Veggie Sandwich",
      "proteinPer100g": 8,
      "caloriesPer100g": 180,
      "category": "custom",
      "isCustom": true
    }
  ],
  "intakeEntries": [
    {
      "id": "1699267200000-0.123456",
      "foodId": "rice-white-cooked",
      "foodName": "White Rice (cooked)",
      "quantity": 200,
      "protein": 5.4,
      "calories": 260,
      "date": "2025-11-06",
      "timestamp": 1699267200000
    },
    {
      "id": "1699270800000-0.654321",
      "foodId": "custom-1699267200000-0.789",
      "foodName": "Grilled Veggie Sandwich",
      "quantity": 120,
      "protein": 9.6,
      "calories": 216,
      "date": "2025-11-06",
      "timestamp": 1699270800000
    }
  ],
  "goals": {
    "calorieGoal": 2500,
    "proteinGoal": 120
  }
}
```

---

## Import Validation

When importing data, the application validates:

### Required Fields
All required fields must be present with correct types:
- Top-level: `foods` (array), `intakeEntries` (array), `goals` (object)
- FoodItem: `id`, `name`, `proteinPer100g`, `caloriesPer100g`, `isCustom`
- IntakeEntry: `id`, `foodId`, `foodName`, `quantity`, `protein`, `calories`, `date`, `timestamp`
- DailyGoals: `calorieGoal`, `proteinGoal`

### Data Types
- Strings: Non-empty strings
- Numbers: Valid numbers (not NaN, not Infinity)
- Booleans: true or false
- Arrays: Must be arrays, not objects
- Dates: Valid date strings in YYYY-MM-DD format
- Timestamps: Valid Unix timestamps (positive numbers)

### Version Checking
- If `version` field is missing, a warning is shown but import continues
- Future versions may enforce compatibility checks

---

## Import Modes

### Merge Mode (Default)
- Adds new items to existing data
- Skips items with duplicate IDs
- Keeps all existing data intact
- Updates goals (goals are always replaced)

**Use Case**: Importing additional data or restoring from partial backup

### Replace Mode
- Deletes ALL existing data
- Imports all data from file
- ⚠️ **Warning**: This is irreversible!

**Use Case**: Complete restore from backup, starting fresh

---

## Best Practices

### Creating Backups
1. Export regularly (weekly or after significant changes)
2. Name files with dates: `diet-tracker-backup-2025-11-06.json`
3. Store backups in multiple locations (cloud, external drive)
4. Test restoration occasionally

### Sharing Data
1. You can share food databases with others
2. Remove personal intake data if desired
3. Manually edit the JSON file before sharing
4. Always validate after manual edits

### Manual Editing
If you need to manually edit the JSON:
1. Use a proper JSON editor or validator
2. Maintain the structure exactly
3. Ensure all IDs are unique
4. Keep timestamps as numbers (not strings)
5. Validate before importing

### Troubleshooting

**Import Failed - Invalid JSON**
- Check if the file is a valid JSON format
- Use a JSON validator online
- Ensure no syntax errors (commas, brackets, quotes)

**Import Failed - Validation Errors**
- Check the error message for specific issues
- Ensure all required fields are present
- Verify data types match the specification

**Duplicate ID Warning**
- In merge mode, items with existing IDs are skipped
- This is normal and prevents duplicates
- Use replace mode if you want to overwrite

**Version Warning**
- Import will continue but may have compatibility issues
- Update the app to the latest version
- Re-export from the latest version

---

## File Format Conventions

- Encoding: UTF-8
- Indentation: 2 spaces (for readability)
- File Extension: `.json`
- MIME Type: `application/json`
- Max File Size: No hard limit, but recommended < 10MB

---

## Privacy & Security

- All data stays on your device (browser localStorage)
- Export files are plain text JSON (not encrypted)
- Don't share files containing personal information
- Store backups securely
- Files contain only nutritional data, no personal identifiers

---

## Version History

### Version 1.0 (Current)
- Initial data format
- Support for foods, intake entries, and goals
- Basic validation
- Merge and replace import modes

### Future Versions
Planned improvements:
- Data encryption for exports
- Compression for large exports
- Incremental backups
- Sync between devices

---

**Last Updated**: November 6, 2025
