# API Reference Guide

Quick reference for all Diet Tracker backend API endpoints.

**Base URL:** `http://localhost:3000` (development)  
**Authentication:** Bearer JWT token in `Authorization` header

---

## 🔐 Authentication Endpoints

### POST /auth/google
Exchange Google ID token for backend JWT.

**Request:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..." // Google JWT
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "id": "103849372019384729384",
    "email": "user@example.com",
    "name": "John Doe",
    "picture": "https://lh3.googleusercontent.com/...",
    "preferences": {
      "calorieGoal": 2000,
      "proteinGoal": 50,
      "dietPreference": "non-vegetarian",
      "preferredFoodIds": []
    }
  }
}
```

### GET /auth/me
Get current authenticated user profile.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "id": "103849372019384729384",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://...",
  "preferences": {...}
}
```

---

## 👤 User Endpoints

### PATCH /users/preferences
Update user preferences (goals, diet preference, preferred foods).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "calorieGoal": 2500,
  "proteinGoal": 60,
  "dietPreference": "vegetarian",
  "preferredFoodIds": ["food-uuid-1", "food-uuid-2"]
}
```

**Response:**
```json
{
  "id": "103849372019384729384",
  "email": "user@example.com",
  "preferences": {
    "calorieGoal": 2500,
    "proteinGoal": 60,
    "dietPreference": "vegetarian",
    "preferredFoodIds": ["food-uuid-1", "food-uuid-2"]
  }
}
```

### DELETE /users/account
Permanently delete user account and all associated data.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## 🍽️ Foods Endpoints

### GET /foods
Get all foods (pre-populated + user's custom foods).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `dietPreference` (optional): Filter by diet type
  - `vegetarian` - Only veg foods
  - `eggetarian` - Veg + egg foods
  - `non-vegetarian` - All foods

**Example:**
```
GET /foods?dietPreference=vegetarian
```

**Response:**
```json
[
  {
    "id": "uuid-1",
    "name": "Chicken Breast",
    "proteinPer100g": 31,
    "caloriesPer100g": 165,
    "foodType": "non-veg",
    "category": "Meat",
    "isCustom": false,
    "userId": null
  },
  {
    "id": "uuid-2",
    "name": "My Custom Food",
    "proteinPer100g": 20,
    "caloriesPer100g": 200,
    "foodType": "veg",
    "isCustom": true,
    "userId": "103849372019384729384"
  }
]
```

### POST /foods
Create a custom food item.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "My Special Protein Shake",
  "proteinPer100g": 25,
  "caloriesPer100g": 120,
  "foodType": "veg",
  "category": "Beverages"
}
```

**Response:**
```json
{
  "id": "generated-uuid",
  "name": "My Special Protein Shake",
  "proteinPer100g": 25,
  "caloriesPer100g": 120,
  "foodType": "veg",
  "category": "Beverages",
  "isCustom": true,
  "userId": "103849372019384729384",
  "createdAt": "2025-11-07T10:30:00.000Z"
}
```

### GET /foods/:id
Get a single food item by ID.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Chicken Breast",
  "proteinPer100g": 31,
  "caloriesPer100g": 165,
  "foodType": "non-veg",
  "isCustom": false
}
```

### PATCH /foods/:id
Update a custom food item (only if owned by user).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "Updated Food Name",
  "proteinPer100g": 30
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Updated Food Name",
  "proteinPer100g": 30,
  "caloriesPer100g": 120,
  "updatedAt": "2025-11-07T11:00:00.000Z"
}
```

**Error (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "You can only update your own foods"
}
```

### DELETE /foods/:id
Delete a custom food item (soft delete).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true
}
```

---

## 📊 Intake Endpoints

### GET /intake
Get intake entries with filtering options.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `date` (optional): Get entries for specific date (YYYY-MM-DD)
- `startDate` (optional): Start of date range
- `endDate` (optional): End of date range

**Examples:**
```
GET /intake?date=2025-11-07
GET /intake?startDate=2025-11-01&endDate=2025-11-07
GET /intake  // Returns all entries
```

**Response:**
```json
[
  {
    "id": "intake-uuid-1",
    "userId": "103849372019384729384",
    "foodId": "food-uuid",
    "foodName": "Chicken Breast",
    "foodType": "non-veg",
    "quantity": 200,
    "protein": 62,
    "calories": 330,
    "date": "2025-11-07",
    "timestamp": 1699354800000,
    "createdAt": "2025-11-07T10:00:00.000Z"
  }
]
```

### POST /intake
Add a new intake entry.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "foodId": "food-uuid",
  "foodName": "Chicken Breast",
  "foodType": "non-veg",
  "quantity": 200,
  "protein": 62,
  "calories": 330,
  "date": "2025-11-07"
}
```

**Response:**
```json
{
  "id": "generated-uuid",
  "userId": "103849372019384729384",
  "foodId": "food-uuid",
  "foodName": "Chicken Breast",
  "foodType": "non-veg",
  "quantity": 200,
  "protein": 62,
  "calories": 330,
  "date": "2025-11-07",
  "timestamp": 1699354800000,
  "createdAt": "2025-11-07T10:00:00.000Z"
}
```

### GET /intake/:id
Get a single intake entry.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "id": "intake-uuid",
  "foodName": "Chicken Breast",
  "quantity": 200,
  "protein": 62,
  "calories": 330,
  "date": "2025-11-07"
}
```

### PATCH /intake/:id
Update an intake entry.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "quantity": 250,
  "protein": 77.5,
  "calories": 412.5
}
```

**Response:**
```json
{
  "id": "intake-uuid",
  "quantity": 250,
  "protein": 77.5,
  "calories": 412.5,
  "updatedAt": "2025-11-07T11:30:00.000Z"
}
```

### DELETE /intake/:id
Delete an intake entry.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true
}
```

### GET /intake/stats/daily
Get daily summary statistics.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format

**Example:**
```
GET /intake/stats/daily?date=2025-11-07
```

**Response:**
```json
{
  "date": "2025-11-07",
  "totalCalories": 2150,
  "totalProtein": 98.5,
  "entries": [
    {
      "id": "uuid-1",
      "foodName": "Chicken Breast",
      "quantity": 200,
      "protein": 62,
      "calories": 330,
      "timestamp": 1699354800000
    },
    {
      "id": "uuid-2",
      "foodName": "Rice",
      "quantity": 300,
      "protein": 21,
      "calories": 390,
      "timestamp": 1699368000000
    }
  ]
}
```

### GET /intake/stats/history
Get historical intake statistics.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `days` (optional, default: 30): Number of days to fetch

**Example:**
```
GET /intake/stats/history?days=7
```

**Response:**
```json
[
  {
    "date": "2025-11-07",
    "totalCalories": 2150,
    "totalProtein": 98.5,
    "entryCount": 5
  },
  {
    "date": "2025-11-06",
    "totalCalories": 1980,
    "totalProtein": 85,
    "entryCount": 4
  }
]
```

---

## 📥 Import/Export Endpoints

### GET /data/export
Export all user data as JSON.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** (File download)
```json
{
  "version": "2.0",
  "exportDate": "2025-11-07T12:00:00.000Z",
  "user": {
    "email": "user@example.com",
    "name": "John Doe"
  },
  "preferences": {
    "calorieGoal": 2000,
    "proteinGoal": 50,
    "dietPreference": "non-vegetarian"
  },
  "foods": [...],
  "intakes": [...]
}
```

### POST /data/import
Import data from JSON file.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Query Parameters:**
- `mode`: Either "merge" or "replace"
  - `merge`: Add new items, keep existing
  - `replace`: Delete existing, import new

**Request:** (Form data)
```
file: [JSON file]
```

**Response:**
```json
{
  "success": true,
  "imported": {
    "foods": 15,
    "intakes": 230,
    "preferences": true
  },
  "warnings": []
}
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "proteinPer100g",
      "message": "must be a positive number"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You can only update your own foods"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Food not found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## 📝 Data Types

### FoodType
```typescript
type FoodType = 'veg' | 'egg' | 'non-veg';
```

### DietPreference
```typescript
type DietPreference = 'vegetarian' | 'eggetarian' | 'non-vegetarian';
```

### Date Format
All dates use **YYYY-MM-DD** format (e.g., "2025-11-07")

### Timestamps
Unix timestamps in milliseconds (e.g., 1699354800000)

---

## 🔧 Development Testing

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:3000/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken": "YOUR_GOOGLE_TOKEN"}'
```

**Get Foods:**
```bash
curl http://localhost:3000/foods \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Add Intake:**
```bash
curl -X POST http://localhost:3000/intake \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "foodId": "uuid",
    "foodName": "Chicken",
    "foodType": "non-veg",
    "quantity": 200,
    "protein": 62,
    "calories": 330,
    "date": "2025-11-07"
  }'
```

### Using Postman

1. Create collection "Diet Tracker API"
2. Set base URL variable: `{{baseUrl}} = http://localhost:3000`
3. Create environment with `{{token}}` variable
4. Use `Bearer {{token}}` for authentication

---

## 🚀 Rate Limits (Future)

Planned rate limits:
- **Auth endpoints:** 5 requests per minute
- **Read endpoints:** 100 requests per minute
- **Write endpoints:** 30 requests per minute

---

## 📱 Mobile App Considerations

When building mobile app, same endpoints apply:
- Store JWT securely (Keychain/Keystore)
- Implement token refresh logic
- Handle offline mode with local cache
- Sync on reconnection

---

**Last Updated:** 2025-11-07  
**API Version:** 1.0  
**Backend Framework:** NestJS 10.x
