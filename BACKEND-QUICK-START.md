# Backend Quick Start Guide

Fast track to getting the NestJS backend up and running.

---

## 📋 Prerequisites

- Node.js 20+ installed
- MongoDB (local or Atlas account)
- Google OAuth credentials
- Basic TypeScript knowledge

---

## 🚀 Step-by-Step Setup

### 1. Create NestJS Project

```bash
# Install NestJS CLI globally
npm install -g @nestjs/cli

# Create new project
nest new diet-tracker-backend

# Choose npm as package manager
# Navigate into project
cd diet-tracker-backend
```

### 2. Install Dependencies

```bash
# Core dependencies
npm install @nestjs/mongoose mongoose
npm install @nestjs/passport passport passport-jwt
npm install @nestjs/jwt
npm install @nestjs/config
npm install google-auth-library
npm install class-validator class-transformer
npm install uuid

# Dev dependencies
npm install -D @types/passport-jwt
npm install -D @types/uuid
```

### 3. Setup Environment Variables

Create `.env` file:

```env
# Server
NODE_ENV=development
PORT=3000

# MongoDB - Option A: Local
MONGODB_URI=mongodb://localhost:27017/diet-tracker

# MongoDB - Option B: Atlas (recommended)
# Get this from MongoDB Atlas dashboard
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/diet-tracker?retryWrites=true&w=majority

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
JWT_EXPIRATION=7d

# Google OAuth
# Get these from Google Cloud Console
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET

# CORS
FRONTEND_URL=http://localhost:5173
```

### 4. Setup MongoDB (Choose one)

#### Option A: Local MongoDB

```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Verify
mongosh  # Should connect successfully
```

#### Option B: MongoDB Atlas (Recommended)

```bash
# 1. Go to https://www.mongodb.com/cloud/atlas
# 2. Sign up for free account
# 3. Create a cluster (Free M0 tier)
# 4. Click "Connect"
# 5. Add your IP address to whitelist
# 6. Create database user
# 7. Copy connection string
# 8. Replace <username> and <password>
# 9. Add to .env file
```

### 5. Get Google OAuth Credentials

```bash
# 1. Go to https://console.cloud.google.com
# 2. Create new project or select existing
# 3. Enable "Google+ API"
# 4. Go to "Credentials"
# 5. Create OAuth 2.0 Client ID
# 6. Application type: Web application
# 7. Authorized JavaScript origins:
#    - http://localhost:5173 (dev)
#    - https://yourdomain.com (prod)
# 8. Authorized redirect URIs:
#    - http://localhost:5173 (dev)
# 9. Copy Client ID and Client Secret
# 10. Add to .env file
```

### 6. Project Structure Setup

Create the following structure:

```bash
mkdir -p src/{auth,users,foods,intake,data,common}
mkdir -p src/auth/{guards,strategies,dto}
mkdir -p src/users/{schemas,dto}
mkdir -p src/foods/{schemas,dto}
mkdir -p src/intake/{schemas,dto}
mkdir -p src/common/{decorators,filters,interceptors}
```

### 7. Update Main App Module

Edit `src/app.module.ts`:

```typescript
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

### 8. Configure CORS

Edit `src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Global prefix for all routes
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Backend running on http://localhost:${port}`);
}
bootstrap();
```

### 9. Generate Modules

```bash
# Auth module
nest g module auth
nest g controller auth
nest g service auth

# Users module
nest g module users
nest g controller users
nest g service users

# Foods module
nest g module foods
nest g controller foods
nest g service foods

# Intake module
nest g module intake
nest g controller intake
nest g service intake

# Data module
nest g module data
nest g controller data
nest g service data
```

### 10. Test the Setup

```bash
# Start development server
npm run start:dev

# Should see:
# [Nest] INFO  [NestFactory] Starting Nest application...
# [Nest] INFO  [InstanceLoader] AppModule dependencies initialized
# 🚀 Backend running on http://localhost:3000
```

Test basic health check:

```bash
# Open browser or use curl
curl http://localhost:3000

# Should return: {"message": "Hello World!"}
```

---

## 📦 Package.json Scripts

```json
{
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "build": "nest build",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  }
}
```

---

## 🔍 Verify Installation

### Check MongoDB Connection

Create a test endpoint:

```typescript
// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller()
export class AppController {
  constructor(@InjectConnection() private connection: Connection) {}

  @Get()
  getStatus() {
    return {
      status: 'OK',
      database: this.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    };
  }
}
```

Test:
```bash
curl http://localhost:3000
# Should return: {"status":"OK","database":"Connected"}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: MongoDB Connection Failed

**Error:** `MongooseError: Could not connect to MongoDB`

**Solution:**
```bash
# Check MongoDB is running
mongosh

# If using Atlas, check:
# 1. IP whitelist includes your IP
# 2. Username/password are correct
# 3. Connection string format is correct
```

### Issue 2: Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use different port in .env
PORT=3001
```

### Issue 3: Module Import Errors

**Error:** `Cannot find module '@nestjs/...'`

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: Google OAuth Issues

**Error:** `Invalid Google token`

**Solution:**
```bash
# Verify:
# 1. GOOGLE_CLIENT_ID matches frontend
# 2. Google Cloud Console OAuth app is configured
# 3. JavaScript origins include http://localhost:5173
```

---

## 📁 Final Directory Structure

```
diet-tracker-backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── guards/
│   │   ├── strategies/
│   │   └── dto/
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── schemas/
│   │   └── dto/
│   ├── foods/
│   ├── intake/
│   ├── data/
│   └── common/
├── .env
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## ✅ Checklist

Before moving to implementation:

- [ ] NestJS project created
- [ ] All dependencies installed
- [ ] `.env` file configured
- [ ] MongoDB connected (local or Atlas)
- [ ] Google OAuth credentials obtained
- [ ] CORS configured
- [ ] Server starts without errors
- [ ] Database connection verified
- [ ] All modules generated

---

## 🎯 Next Steps

1. **Follow main implementation plan**: `BACKEND-IMPLEMENTATION-PLAN.md`
2. **Implement schemas**: Start with User, Food, Intake schemas
3. **Build authentication**: Google OAuth + JWT
4. **Implement CRUD**: Foods, Intake modules
5. **Test endpoints**: Use Postman or cURL
6. **Frontend integration**: Update React app to use APIs

---

## 📚 Useful Commands

```bash
# Start development server with auto-reload
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Run linter
npm run lint

# Run tests
npm run test

# Generate new module
nest g module moduleName

# Generate new controller
nest g controller moduleName

# Generate new service
nest g service moduleName

# Generate complete resource (module + controller + service)
nest g resource resourceName
```

---

## 🔗 Resources

- **NestJS Docs:** https://docs.nestjs.com
- **Mongoose Docs:** https://mongoosejs.com/docs/
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Google OAuth:** https://developers.google.com/identity/protocols/oauth2
- **Passport.js:** http://www.passportjs.org/

---

**Estimated Setup Time:** 30-60 minutes  
**Next:** Implement Phase 1 from `BACKEND-IMPLEMENTATION-PLAN.md`

Good luck! 🚀
