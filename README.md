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

### ⚙️ Goals Setting
- Set daily calorie and protein targets
- Visual progress tracking with color indicators
- Persistent storage of goals

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
│   ├── intake/          # Food intake tracking components
│   ├── database/        # Food database management
│   ├── goals/           # Goals setting dialog
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── utils.ts         # Utility functions
│   └── storage.ts       # LocalStorage helpers
├── data/
│   └── initialFoods.ts  # Pre-populated food database
├── types/
│   └── index.ts         # TypeScript interfaces
├── App.tsx              # Main app component
└── main.tsx             # Entry point
```

## Data Storage

All data is stored locally in your browser using LocalStorage:
- **Food Items**: Custom and pre-populated food database
- **Intake Entries**: All food intake records with dates
- **Goals**: Daily calorie and protein targets

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
2. Set your daily calorie goal
3. Set your daily protein goal
4. Goals are saved automatically

### Viewing History
- Use the date selector to view past days
- See all entries for that day
- View daily totals and progress

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
