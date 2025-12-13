# Backend Implementation Plan: NestJS + MongoDB + Google SSO

## 📋 Overview

Migrate from client-side localStorage to a robust backend system with:
- **Backend Framework:** NestJS (Node.js)
- **Database:** MongoDB (with Mongoose ODM)
- **Authentication:** Google OAuth 2.0 (SSO)
- **API Security:** JWT tokens + Google OAuth validation

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  - Google Sign-In Button                                    │
│  - Store JWT token in localStorage                          │
│  - Send JWT in Authorization header                         │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTPS/REST API
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                  NestJS Backend                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Auth Module (Google OAuth + JWT)                    │   │
│  │  - Verify Google ID Token                           │   │
│  │  - Generate JWT access token                        │   │
│  │  - JWT Guard for protected routes                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Users Module                                         │   │
│  │  - User profile management                          │   │
│  │  - User preferences (goals, diet preference)        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Foods Module                                         │   │
│  │  - Pre-populated foods (shared)                     │   │
│  │  - User custom foods                                │   │
│  │  - CRUD operations                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Intake Module                                        │   │
│  │  - Daily food intake tracking                       │   │
│  │  - Date-based queries                               │   │
│  │  - Statistics and history                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Meal Planner Module                                  │   │
│  │  - Preferred foods management                       │   │
│  │  - Meal plan generation                             │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────┘
                 │ Mongoose ODM
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Database                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    users     │  │    foods     │  │   intakes    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema Design

### **1. Users Collection**

```typescript
// users.schema.ts
{
  _id: ObjectId,
  googleId: string,           // Unique Google user ID
  email: string,              // User email
  name: string,               // Display name
  picture: string,            // Profile picture URL
  
  // User Preferences
  preferences: {
    calorieGoal: number,      // Daily calorie target
    proteinGoal: number,      // Daily protein target (g)
    dietPreference: string,   // 'vegetarian' | 'eggetarian' | 'non-vegetarian'
    preferredFoodIds: string[] // Array of food IDs for meal planner
  },
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date
}

// Indexes:
// - googleId: unique
// - email: unique
```

### **2. Foods Collection**

```typescript
// foods.schema.ts
{
  _id: ObjectId,
  id: string,                 // UUID or custom ID
  name: string,               // Food name
  proteinPer100g: number,     // Protein content
  caloriesPer100g: number,    // Calorie content
  foodType: string,           // 'veg' | 'egg' | 'non-veg'
  category: string,           // Optional: 'grains', 'dairy', etc.
  
  // Ownership
  isCustom: boolean,          // true = user-created, false = pre-populated
  userId: string | null,      // null for pre-populated, googleId for custom
  
  // Metadata
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
// - userId + name: compound (for user's custom foods)
// - isCustom + foodType: compound (for filtering)
// - id: unique
```

### **3. Intakes Collection**

```typescript
// intakes.schema.ts
{
  _id: ObjectId,
  id: string,                 // UUID
  
  // User Reference
  userId: string,             // Google ID (indexed)
  
  // Food Details
  foodId: string,             // Reference to food
  foodName: string,           // Denormalized for quick access
  foodType: string,           // Denormalized
  
  // Consumption Details
  quantity: number,           // In grams
  protein: number,            // Calculated protein
  calories: number,           // Calculated calories
  
  // Timing
  date: string,               // 'YYYY-MM-DD' format
  timestamp: number,          // Unix timestamp
  
  // Metadata
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
// - userId + date: compound (for daily queries)
// - userId + timestamp: compound (for history)
// - foodId: single (for food deletion cascading)
```

---

## 🔐 Authentication Flow

### **1. Initial Login (Frontend)**

```typescript
// Frontend flow
1. User clicks "Sign in with Google"
2. Google Sign-In popup appears
3. User authenticates with Google
4. Google returns ID token (JWT)
5. Frontend sends ID token to backend: POST /auth/google
```

### **2. Backend Token Exchange**

```typescript
// Backend: POST /auth/google
{
  "idToken": "google-jwt-token-here"
}

// Backend Process:
1. Verify Google ID token with Google's public keys
2. Extract user info (googleId, email, name, picture)
3. Find or create user in MongoDB
4. Generate backend JWT token (contains userId)
5. Return JWT token to frontend

// Response:
{
  "accessToken": "backend-jwt-token",
  "user": {
    "id": "googleId",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://...",
    "preferences": {...}
  }
}
```

### **3. Authenticated API Requests**

```typescript
// Frontend stores JWT in localStorage
localStorage.setItem('access_token', response.accessToken);

// All subsequent requests include JWT
fetch('/api/foods', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Backend validates JWT on every request using JwtAuthGuard
```

---

## 📡 API Endpoints Design

### **Auth Module**

```typescript
POST   /auth/google
  Body: { idToken: string }
  Response: { accessToken: string, user: UserDto }
  Description: Exchange Google ID token for backend JWT

GET    /auth/me
  Auth: Required
  Response: UserDto
  Description: Get current user profile

POST   /auth/logout
  Auth: Required
  Response: { success: boolean }
  Description: Invalidate session (if using refresh tokens)
```

### **Users Module**

```typescript
GET    /users/profile
  Auth: Required
  Response: UserDto
  Description: Get user profile and preferences

PATCH  /users/preferences
  Auth: Required
  Body: { calorieGoal?, proteinGoal?, dietPreference?, preferredFoodIds? }
  Response: UserDto
  Description: Update user preferences

DELETE /users/account
  Auth: Required
  Response: { success: boolean }
  Description: Delete user account and all data
```

### **Foods Module**

```typescript
GET    /foods
  Auth: Required
  Query: ?dietPreference=vegetarian&includeCustom=true
  Response: FoodDto[]
  Description: Get pre-populated + user's custom foods

POST   /foods
  Auth: Required
  Body: { name, proteinPer100g, caloriesPer100g, foodType, category }
  Response: FoodDto
  Description: Create custom food

GET    /foods/:id
  Auth: Required
  Response: FoodDto
  Description: Get single food item

PATCH  /foods/:id
  Auth: Required
  Body: { name?, proteinPer100g?, caloriesPer100g?, foodType? }
  Response: FoodDto
  Description: Update custom food (only if owned by user)

DELETE /foods/:id
  Auth: Required
  Response: { success: boolean }
  Description: Delete custom food (only if owned by user)
```

### **Intake Module**

```typescript
GET    /intake
  Auth: Required
  Query: ?date=2025-11-07&startDate=2025-11-01&endDate=2025-11-07
  Response: IntakeDto[]
  Description: Get intake entries (by date or date range)

POST   /intake
  Auth: Required
  Body: { foodId, quantity, date }
  Response: IntakeDto
  Description: Add food intake entry

GET    /intake/:id
  Auth: Required
  Response: IntakeDto
  Description: Get single intake entry

PATCH  /intake/:id
  Auth: Required
  Body: { quantity?, date? }
  Response: IntakeDto
  Description: Update intake entry

DELETE /intake/:id
  Auth: Required
  Response: { success: boolean }
  Description: Delete intake entry

GET    /intake/stats/daily
  Auth: Required
  Query: ?date=2025-11-07
  Response: { totalCalories: number, totalProtein: number, entries: IntakeDto[] }
  Description: Get daily summary

GET    /intake/stats/history
  Auth: Required
  Query: ?days=30
  Response: DailySummaryDto[]
  Description: Get historical data for charts
```

### **Import/Export Module**

```typescript
GET    /data/export
  Auth: Required
  Response: ExportDataDto (JSON file download)
  Description: Export all user data

POST   /data/import
  Auth: Required
  Body: FormData (JSON file)
  Query: ?mode=merge|replace
  Response: { success: boolean, imported: { foods: number, intakes: number } }
  Description: Import data from file
```

---

## 🏢 NestJS Project Structure

```
diet-tracker-backend/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   │
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── google.strategy.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   └── dto/
│   │       ├── google-login.dto.ts
│   │       └── auth-response.dto.ts
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── schemas/
│   │   │   └── user.schema.ts
│   │   └── dto/
│   │       ├── user.dto.ts
│   │       └── update-preferences.dto.ts
│   │
│   ├── foods/
│   │   ├── foods.module.ts
│   │   ├── foods.controller.ts
│   │   ├── foods.service.ts
│   │   ├── schemas/
│   │   │   └── food.schema.ts
│   │   └── dto/
│   │       ├── food.dto.ts
│   │       └── create-food.dto.ts
│   │
│   ├── intake/
│   │   ├── intake.module.ts
│   │   ├── intake.controller.ts
│   │   ├── intake.service.ts
│   │   ├── schemas/
│   │   │   └── intake.schema.ts
│   │   └── dto/
│   │       ├── intake.dto.ts
│   │       ├── create-intake.dto.ts
│   │       └── daily-stats.dto.ts
│   │
│   ├── data/
│   │   ├── data.module.ts
│   │   ├── data.controller.ts
│   │   ├── data.service.ts
│   │   └── dto/
│   │       └── export-data.dto.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   │   └── current-user.decorator.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   └── interceptors/
│   │       └── logging.interceptor.ts
│   │
│   └── config/
│       ├── database.config.ts
│       └── jwt.config.ts
│
├── .env
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔧 Implementation Steps

### **Phase 1: Project Setup (Day 1)**

#### **1.1 Initialize NestJS Project**

```bash
# Create new NestJS project
npm i -g @nestjs/cli
nest new diet-tracker-backend
cd diet-tracker-backend

# Install dependencies
npm install @nestjs/mongoose mongoose
npm install @nestjs/passport passport passport-jwt
npm install @nestjs/jwt
npm install google-auth-library
npm install @nestjs/config
npm install class-validator class-transformer
npm install bcrypt uuid

# Dev dependencies
npm install -D @types/passport-jwt
npm install -D @types/bcrypt
```

#### **1.2 Setup MongoDB**

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
brew install mongodb-community
brew services start mongodb-community

# MongoDB URI
MONGODB_URI=mongodb://localhost:27017/diet-tracker
```

**Option B: MongoDB Atlas (Recommended)**
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Add to .env file
```

#### **1.3 Configure Environment Variables**

```env
# .env file
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/diet-tracker

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRATION=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# CORS
FRONTEND_URL=http://localhost:5173
```

---

### **Phase 2: Database & Core Setup (Day 1-2)**

#### **2.1 Setup MongoDB Connection**

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
  ],
})
export class AppModule {}
```

#### **2.2 Create User Schema**

```typescript
// src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  googleId: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  picture: string;

  @Prop({
    type: {
      calorieGoal: { type: Number, default: 2000 },
      proteinGoal: { type: Number, default: 50 },
      dietPreference: { 
        type: String, 
        enum: ['vegetarian', 'eggetarian', 'non-vegetarian'],
        default: 'non-vegetarian'
      },
      preferredFoodIds: { type: [String], default: [] },
    },
    default: {},
  })
  preferences: {
    calorieGoal: number;
    proteinGoal: number;
    dietPreference: string;
    preferredFoodIds: string[];
  };

  @Prop()
  lastLoginAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ googleId: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
```

#### **2.3 Create Food Schema**

```typescript
// src/foods/schemas/food.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Food extends Document {
  @Prop({ required: true, unique: true })
  id: string; // UUID

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  proteinPer100g: number;

  @Prop({ required: true })
  caloriesPer100g: number;

  @Prop({ 
    required: true,
    enum: ['veg', 'egg', 'non-veg']
  })
  foodType: string;

  @Prop()
  category: string;

  @Prop({ required: true, default: false })
  isCustom: boolean;

  @Prop({ default: null })
  userId: string; // null for pre-populated, googleId for custom

  @Prop({ default: false })
  isDeleted: boolean; // Soft delete flag
}

export const FoodSchema = SchemaFactory.createForClass(Food);

// Indexes
FoodSchema.index({ userId: 1, name: 1 });
FoodSchema.index({ isCustom: 1, foodType: 1 });
FoodSchema.index({ id: 1 }, { unique: true });
```

#### **2.4 Create Intake Schema**

```typescript
// src/intake/schemas/intake.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Intake extends Document {
  @Prop({ required: true, unique: true })
  id: string; // UUID

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  foodId: string;

  @Prop({ required: true })
  foodName: string;

  @Prop({ required: true })
  foodType: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  protein: number;

  @Prop({ required: true })
  calories: number;

  @Prop({ required: true, index: true })
  date: string; // YYYY-MM-DD

  @Prop({ required: true })
  timestamp: number;
}

export const IntakeSchema = SchemaFactory.createForClass(Intake);

// Compound indexes for efficient queries
IntakeSchema.index({ userId: 1, date: 1 });
IntakeSchema.index({ userId: 1, timestamp: -1 });
IntakeSchema.index({ foodId: 1 });
```

---

### **Phase 3: Authentication Module (Day 2-3)**

#### **3.1 Create Auth Module**

```bash
nest generate module auth
nest generate controller auth
nest generate service auth
```

#### **3.2 Implement Google Token Verification**

```typescript
// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async googleLogin(idToken: string) {
    try {
      // Verify Google ID token
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      // Find or create user
      let user = await this.userModel.findOne({ googleId: payload.sub });

      if (!user) {
        user = await this.userModel.create({
          googleId: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          lastLoginAt: new Date(),
        });
      } else {
        // Update last login
        user.lastLoginAt = new Date();
        await user.save();
      }

      // Generate JWT token
      const accessToken = this.jwtService.sign({
        sub: user.googleId,
        email: user.email,
      });

      return {
        accessToken,
        user: {
          id: user.googleId,
          email: user.email,
          name: user.name,
          picture: user.picture,
          preferences: user.preferences,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async validateUser(googleId: string) {
    return this.userModel.findOne({ googleId });
  }
}
```

#### **3.3 Create JWT Strategy**

```typescript
// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateUser(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException();
    }

    return user; // Attached to request.user
  }
}
```

#### **3.4 Create JWT Auth Guard**

```typescript
// src/auth/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

#### **3.5 Create Current User Decorator**

```typescript
// src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

#### **3.6 Auth Controller**

```typescript
// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GoogleLoginDto } from './dto/google-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('google')
  async googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.googleLogin(dto.idToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return {
      id: user.googleId,
      email: user.email,
      name: user.name,
      picture: user.picture,
      preferences: user.preferences,
    };
  }
}
```

---

### **Phase 4: Implement Modules (Day 3-5)**

#### **4.1 Foods Module**

```bash
nest generate module foods
nest generate controller foods
nest generate service foods
```

```typescript
// src/foods/foods.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Food } from './schemas/food.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FoodsService {
  constructor(@InjectModel(Food.name) private foodModel: Model<Food>) {}

  async findAll(userId: string, dietPreference?: string) {
    const query: any = {
      $or: [
        { isCustom: false, isDeleted: false }, // Pre-populated foods
        { userId, isDeleted: false },          // User's custom foods
      ],
    };

    // Filter by diet preference if provided
    if (dietPreference) {
      const allowedTypes = this.getAllowedFoodTypes(dietPreference);
      query.foodType = { $in: allowedTypes };
    }

    return this.foodModel.find(query).exec();
  }

  async create(userId: string, createFoodDto: any) {
    const food = new this.foodModel({
      id: uuidv4(),
      ...createFoodDto,
      isCustom: true,
      userId,
    });

    return food.save();
  }

  async update(userId: string, foodId: string, updateFoodDto: any) {
    const food = await this.foodModel.findOne({ id: foodId });

    if (!food) {
      throw new NotFoundException('Food not found');
    }

    if (food.userId !== userId) {
      throw new ForbiddenException('You can only update your own foods');
    }

    Object.assign(food, updateFoodDto);
    return food.save();
  }

  async delete(userId: string, foodId: string) {
    const food = await this.foodModel.findOne({ id: foodId });

    if (!food) {
      throw new NotFoundException('Food not found');
    }

    if (food.userId !== userId) {
      throw new ForbiddenException('You can only delete your own foods');
    }

    // Soft delete
    food.isDeleted = true;
    await food.save();

    return { success: true };
  }

  private getAllowedFoodTypes(dietPreference: string): string[] {
    switch (dietPreference) {
      case 'vegetarian':
        return ['veg'];
      case 'eggetarian':
        return ['veg', 'egg'];
      case 'non-vegetarian':
        return ['veg', 'egg', 'non-veg'];
      default:
        return ['veg', 'egg', 'non-veg'];
    }
  }
}
```

#### **4.2 Intake Module**

```typescript
// src/intake/intake.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Intake } from './schemas/intake.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class IntakeService {
  constructor(@InjectModel(Intake.name) private intakeModel: Model<Intake>) {}

  async findByDate(userId: string, date: string) {
    return this.intakeModel.find({ userId, date }).sort({ timestamp: -1 }).exec();
  }

  async findByDateRange(userId: string, startDate: string, endDate: string) {
    return this.intakeModel
      .find({
        userId,
        date: { $gte: startDate, $lte: endDate },
      })
      .sort({ timestamp: -1 })
      .exec();
  }

  async create(userId: string, createIntakeDto: any) {
    const intake = new this.intakeModel({
      id: uuidv4(),
      userId,
      ...createIntakeDto,
      timestamp: Date.now(),
    });

    return intake.save();
  }

  async update(userId: string, intakeId: string, updateIntakeDto: any) {
    const intake = await this.intakeModel.findOne({ id: intakeId, userId });

    if (!intake) {
      throw new NotFoundException('Intake entry not found');
    }

    Object.assign(intake, updateIntakeDto);
    return intake.save();
  }

  async delete(userId: string, intakeId: string) {
    const result = await this.intakeModel.deleteOne({ id: intakeId, userId });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Intake entry not found');
    }

    return { success: true };
  }

  async getDailyStats(userId: string, date: string) {
    const entries = await this.findByDate(userId, date);
    
    const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);
    const totalProtein = entries.reduce((sum, e) => sum + e.protein, 0);

    return {
      date,
      totalCalories,
      totalProtein,
      entries,
    };
  }
}
```

---

### **Phase 5: Frontend Integration (Day 6-7)**

#### **5.1 Create API Service Layer**

```typescript
// frontend/src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  // Auth
  async googleLogin(idToken: string) {
    return this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  // Foods
  async getFoods(dietPreference?: string) {
    const query = dietPreference ? `?dietPreference=${dietPreference}` : '';
    return this.request(`/foods${query}`);
  }

  async createFood(food: any) {
    return this.request('/foods', {
      method: 'POST',
      body: JSON.stringify(food),
    });
  }

  async updateFood(foodId: string, updates: any) {
    return this.request(`/foods/${foodId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteFood(foodId: string) {
    return this.request(`/foods/${foodId}`, {
      method: 'DELETE',
    });
  }

  // Intake
  async getIntakeByDate(date: string) {
    return this.request(`/intake?date=${date}`);
  }

  async createIntake(intake: any) {
    return this.request('/intake', {
      method: 'POST',
      body: JSON.stringify(intake),
    });
  }

  async updateIntake(intakeId: string, updates: any) {
    return this.request(`/intake/${intakeId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteIntake(intakeId: string) {
    return this.request(`/intake/${intakeId}`, {
      method: 'DELETE',
    });
  }

  async getDailyStats(date: string) {
    return this.request(`/intake/stats/daily?date=${date}`);
  }

  // User Preferences
  async updatePreferences(preferences: any) {
    return this.request('/users/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  }
}

export const api = new ApiClient();
```

#### **5.2 Update Auth Context**

```typescript
// frontend/src/contexts/AuthContext.tsx
const handleCredentialResponse = async (response: { credential: string }) => {
  try {
    // Exchange Google token for backend JWT
    const result = await api.googleLogin(response.credential);
    
    // Store backend JWT
    localStorage.setItem('access_token', result.accessToken);
    
    // Set user
    setUser(result.user);
  } catch (error) {
    console.error('Error processing Google sign-in:', error);
    throw error;
  }
};

const signOut = () => {
  // Clear tokens
  localStorage.removeItem('access_token');
  localStorage.removeItem(USER_STORAGE_KEY);
  
  setUser(null);
  
  if (window.google?.accounts?.id) {
    window.google.accounts.id.disableAutoSelect();
  }
};
```

#### **5.3 Update Storage Layer**

```typescript
// frontend/src/lib/storage.ts (now using API)
export const getFoods = async (userId: string): Promise<FoodItem[]> => {
  return api.getFoods();
};

export const addFood = async (userId: string, food: FoodItem): Promise<void> => {
  await api.createFood(food);
};

export const deleteFood = async (userId: string, foodId: string): Promise<void> => {
  await api.deleteFood(foodId);
};

// Similar for other functions...
```

---

### **Phase 6: Data Migration (Day 8)**

#### **6.1 Create Migration Script**

```typescript
// frontend/src/utils/migrateToBackend.ts
export async function migrateLocalDataToBackend(userId: string) {
  try {
    // 1. Get all data from localStorage
    const foods = getLocalFoods(userId);
    const intakes = getLocalIntakes(userId);
    const preferences = getLocalPreferences(userId);

    // 2. Upload to backend
    for (const food of foods) {
      if (food.isCustom) {
        await api.createFood(food);
      }
    }

    for (const intake of intakes) {
      await api.createIntake(intake);
    }

    await api.updatePreferences(preferences);

    // 3. Clear localStorage after successful migration
    clearUserData(userId);

    return { success: true };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error };
  }
}
```

#### **6.2 Seed Pre-populated Foods**

```typescript
// backend/src/database/seeders/foods.seeder.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Food } from '../../foods/schemas/food.schema';
import { initialFoods } from './data/initial-foods';

@Injectable()
export class FoodsSeeder {
  constructor(@InjectModel(Food.name) private foodModel: Model<Food>) {}

  async seed() {
    const count = await this.foodModel.countDocuments({ isCustom: false });
    
    if (count === 0) {
      await this.foodModel.insertMany(
        initialFoods.map(food => ({
          ...food,
          isCustom: false,
          userId: null,
        }))
      );
      
      console.log(`Seeded ${initialFoods.length} pre-populated foods`);
    }
  }
}
```

---

### **Phase 7: Testing & Deployment (Day 9-10)**

#### **7.1 Testing Checklist**

```
Backend Testing:
□ Auth: Google token verification
□ Auth: JWT generation and validation
□ Foods: CRUD operations
□ Foods: Permission checks (can't edit others' foods)
□ Intake: CRUD operations
□ Intake: Date-based queries
□ Intake: Daily statistics
□ User: Preferences update

Frontend Testing:
□ Google login flow
□ Token storage and refresh
□ Foods list loading
□ Create custom food
□ Edit/delete custom food
□ Add intake entry
□ Daily summary calculation
□ Preferences update
□ Data migration from localStorage
```

#### **7.2 Deployment**

**Backend Deployment (Railway/Heroku/DigitalOcean):**
```bash
# Build
npm run build

# Set environment variables on hosting platform
# Deploy

# MongoDB Atlas is already cloud-hosted
```

**Frontend Deployment (Vercel/Netlify):**
```bash
# Update .env
VITE_API_URL=https://your-backend-url.com

# Build
npm run build

# Deploy
```

---

## 📊 Migration Strategy

### **Option 1: Automatic Migration (Recommended)**

```typescript
// On first login after backend is deployed
if (hasLocalData() && !hasMigratedFlag()) {
  const confirm = window.confirm(
    'We found local data. Would you like to migrate it to the cloud?'
  );
  
  if (confirm) {
    await migrateLocalDataToBackend(user.id);
    setMigratedFlag();
    alert('Migration successful!');
  }
}
```

### **Option 2: Manual Export/Import**

```
1. User exports data as JSON from old version
2. Updates to new version
3. Signs in
4. Imports JSON file through settings
```

---

## 🔒 Security Considerations

### **Implemented:**
- ✅ Google OAuth for authentication
- ✅ JWT tokens for API access
- ✅ User-scoped database queries
- ✅ Permission checks on mutations
- ✅ CORS configuration
- ✅ Helmet.js for security headers

### **Recommended Additions:**
- [ ] Rate limiting (express-rate-limit)
- [ ] Request validation (class-validator)
- [ ] SQL injection prevention (Mongoose handles this)
- [ ] XSS protection (sanitize inputs)
- [ ] HTTPS only in production
- [ ] Refresh token rotation
- [ ] API versioning (/v1/)

---

## 📈 Performance Optimization

### **Database:**
- Proper indexes on user queries
- Compound indexes for date-based queries
- Pagination for large datasets
- Aggregation pipelines for statistics

### **API:**
- Response caching for foods list
- Connection pooling (MongoDB default)
- Compression middleware
- CDN for static assets

---

## 🔮 Future Enhancements

### **Phase 8: Advanced Features**
- [ ] WebSocket for real-time updates
- [ ] Push notifications
- [ ] Photo upload for meals
- [ ] Barcode scanning integration
- [ ] Social features (share meals)
- [ ] Analytics dashboard
- [ ] Export to PDF/CSV
- [ ] Mobile app (React Native)

---

## 📝 Summary

### **Tech Stack:**
- **Backend:** NestJS + TypeScript
- **Database:** MongoDB + Mongoose
- **Authentication:** Google OAuth 2.0 + JWT
- **Frontend:** React (existing)

### **Timeline:**
- **Week 1:** Backend setup, auth, core modules
- **Week 2:** Frontend integration, testing, deployment

### **Estimated Effort:**
- Backend: 30-40 hours
- Frontend integration: 10-15 hours
- Testing & deployment: 5-10 hours
- **Total: 45-65 hours**

---

## 🎯 Next Steps

1. ✅ Review this plan
2. ✅ Set up MongoDB Atlas account
3. ✅ Get Google OAuth credentials for backend
4. ⬜ Create NestJS project
5. ⬜ Implement Phase 1-3
6. ⬜ Test authentication flow
7. ⬜ Implement remaining modules
8. ⬜ Frontend integration
9. ⬜ Deploy to staging
10. ⬜ Production deployment

---

**Questions or need clarification on any section? Let me know and I'll expand on it!** 🚀
