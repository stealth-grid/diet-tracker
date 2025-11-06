# Diet Tracker

A minimal and clean diet tracking application built with React, TypeScript, Vite, and shadcn/ui.

## Features

### 🍽️ Track Intake
- **Date Selection**: View and track intake for any date
- **Add Food Entries**: Quick food entry with auto-calculated nutrition
- **Daily Summary**: Visual progress bars for calories and protein goals
- **Intake History**: View all entries with timestamps
- **Edit/Delete**: Manage your intake entries easily

### 📊 Food Database
- **Pre-populated Database**: 50+ common Indian food items
- **Search Functionality**: Quick search across all foods
- **Add Custom Foods**: Add your own food items with nutritional info
- **Manage Foods**: Edit and delete custom food items

### 🍽️ Meal Planner
- **Smart Meal Suggestions**: AI-powered meal plan generator
- **Meets Your Goals**: Automatically calculates meals to hit your daily targets
- **Balanced Distribution**: Breaks down into Breakfast, Lunch, Dinner, and Snacks
- **Calorie Breakdown**: See exact calories and protein for each food item
- **Multiple Variations**: Generate new plans with one click
- **Category-Based**: Suggests appropriate foods for each meal time
- **Portion Sizes**: Recommends realistic quantities (20g-500g)
- **Diet-Aware**: Respects your dietary preference (veg/egg/non-veg)

### 🥗 Diet Preference & Food Indicators (NEW!)
- **Indian Food Standard**: Color-coded indicators on all food items
  - 🟢 **Green** = Vegetarian
  - 🟤 **Amber** = Contains Egg (Eggetarian)
  - 🔴 **Red** = Non-Vegetarian
- **Smart Filtering**: 
  - Vegetarian mode shows only veg foods
  - Eggetarian mode shows veg + egg
  - Non-vegetarian mode shows all foods
- **Visual Consistency**: Indicators appear throughout the app (food list, intake log, meal planner, dropdowns)
- **Custom Food Support**: Set diet type when adding custom foods
- **Persistent Preference**: Your choice is saved and applied everywhere

### ⚙️ Settings
- **Daily Goals**: Set calorie and protein targets
- **Diet Preference**: Choose vegetarian, eggetarian, or non-vegetarian
- **Data Management**: Import/export your complete data
- **Visual Progress**: Color-coded progress bars
- **Persistent Storage**: All settings saved locally

## Tech Stack

- **Frontend**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS v3
- **Icons**: Lucide React
- **Storage**: LocalStorage

## Getting Started

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

1. Clone or navigate to the project directory:
```bash
cd diet-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── intake/              # Food intake tracking components
│   ├── database/            # Food database management
│   ├── planner/             # Meal planner component
│   ├── settings/            # Settings dialog (goals, diet, data)
│   └── ui/                  # shadcn/ui components
│       └── food-type-indicator.tsx  # Food type visual indicator
├── lib/
│   ├── utils.ts             # Utility functions
│   ├── storage.ts           # LocalStorage helpers
│   └── dataManagement.ts    # Import/export functionality
├── data/
│   └── initialFoods.ts      # Pre-populated food database (51 items)
├── types/
│   └── index.ts             # TypeScript interfaces (FoodType, DietPreference, etc.)
├── App.tsx                  # Main app component
└── main.tsx                 # Entry point
```

## Data Storage

All data is stored locally in your browser using LocalStorage:
- **Food Items**: Custom and pre-populated food database (with food type: veg/egg/non-veg)
- **Intake Entries**: All food intake records with dates and food type indicators
- **Goals**: Daily calorie and protein targets
- **Diet Preference**: Your chosen dietary restriction (vegetarian/eggetarian/non-vegetarian)

**Data Portability**: 
- Export your data anytime as a JSON file (includes all settings and preferences)
- Import data on a different device or browser
- Share your food database with others
- Keep backups for safety
- Backward compatible with older exports

## Pre-populated Foods

The app comes with 50+ common foods including:
- **Grains & Cereals**: Rice, Roti, Bread, Idli, Dosa, etc.
- **Lentils & Legumes**: Various Dals, Rajma, Chickpeas, etc.
- **Dairy**: Milk, Paneer, Curd, Ghee, etc.
- **Meat & Poultry**: Chicken, Egg, Fish, Mutton, Prawns
- **Vegetables**: Potato, Spinach, Broccoli, etc.
- **Fruits**: Banana, Apple, Mango, Orange, etc.
- **Nuts & Seeds**: Almonds, Peanuts, Peanuts (soaked), Cashews, Chia Seeds, etc.

All nutritional values are per 100g serving.

## Features in Detail

### Adding Food Intake
1. Click "Add Food" button
2. Select food from dropdown (searchable)
3. Enter quantity in grams
4. See auto-calculated nutrition
5. Add to today's intake

### Adding Custom Foods

**Method 1: From Food Database Tab**
1. Go to Food Database tab
2. Click "Add New Food"
3. Enter food name, protein, and calories per 100g
4. Optionally add a category
5. Food is immediately available for tracking

**Method 2: From Track Intake (Quick Add)**
1. Click "Add Food" button on Track Intake tab
2. If food is not in the list, click "Can't find your food? Add new food item"
3. You'll be automatically switched to Food Database tab
4. The Add Food dialog will open
5. After adding, return to Track Intake to log it

### Setting Goals
1. Click the settings icon in the header
2. Go to the "Goals" tab
3. Set your daily calorie goal
4. Set your daily protein goal
5. Click "Save Goals"

### Backup & Restore Data
The app includes powerful data management features to backup and restore your data:

#### Export Data (Backup)
1. Click the settings icon in the header
2. Go to the "Data Management" tab
3. Click "Download Backup"
4. A JSON file will be downloaded with all your data:
   - All food items (custom and pre-populated)
   - All intake records
   - Your goals
   - Export date and version info

#### Import Data (Restore)
1. Click the settings icon in the header
2. Go to the "Data Management" tab
3. Choose import mode:
   - **Merge**: Add new items to existing data (keeps everything, no duplicates)
   - **Replace**: Delete all existing data and import new (⚠️ Use with caution)
4. Click "Choose File to Import"
5. Select your previously exported JSON file
6. Data will be validated and imported

**Import Validation**: The app validates all imported data to ensure:
- ✅ Correct JSON structure
- ✅ Valid food items
- ✅ Valid intake entries
- ✅ Valid goals
- ✅ Proper data types

**Safety Features**:
- Automatic validation before import
- Clear error messages if validation fails
- Warning messages for non-critical issues
- Duplicate prevention in merge mode

### Viewing History
- Use the date selector to view past days
- See all entries for that day
- View daily totals and progress

### Using Meal Planner
1. Go to the "Meal Planner" tab
2. View the automatically generated meal plan based on your goals
3. See suggested meals broken down into:
   - **Breakfast** (25% of calories, 20% of protein)
   - **Lunch** (35% of calories, 35% of protein)
   - **Dinner** (30% of calories, 35% of protein)
   - **Snacks** (10% of calories, 10% of protein)
4. Each food item shows:
   - Food name
   - Quantity in grams
   - Calories
   - Protein content
5. Click "Generate New Plan" to see different combinations
6. Use the suggestions to plan your day or log intake from the plan

## Design Philosophy

- **Minimal & Clean**: Focused, distraction-free interface
- **Fast Data Entry**: Quick and easy food logging
- **Visual Feedback**: Progress bars with color indicators
- **Mobile Responsive**: Works great on all devices

## Future Enhancements

Potential features for future versions:
- Export data to CSV
- Charts and trends analysis
- Meal planning
- Multiple serving size units
- Macro breakdown (carbs, fats)
- Dark mode
- PWA for offline use
- Barcode scanner

## License

All rights reserved © 2025

## Development

This project uses:
- ESLint for code linting
- TypeScript for type safety
- Vite for fast development and building
- Tailwind CSS for styling

To modify the design or add features, explore the components in the `src/components` directory.
