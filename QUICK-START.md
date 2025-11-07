# Quick Start Guide - Google Sign-In Setup

Get Google Sign-In working in under 5 minutes!

## Prerequisites

- Google account
- Node.js installed
- Project dependencies installed (`npm install`)

## Setup Steps

### 1. Create Google Cloud Project (1 minute)

1. Go to https://console.cloud.google.com/
2. Click **NEW PROJECT**
3. Name: "Diet Tracker"
4. Click **CREATE**

### 2. Configure OAuth Consent Screen (2 minutes)

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type → **CREATE**
3. Fill in:
   - App name: "Diet Tracker"
   - User support email: (your email)
   - Developer contact: (your email)
4. Click **SAVE AND CONTINUE** three times (accept defaults)
5. Click **BACK TO DASHBOARD**

### 3. Create OAuth Client ID (1 minute)

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Application type: **Web application**
4. Name: "Diet Tracker Web"
5. **Authorized JavaScript origins**:
   - Click **+ ADD URI**
   - Add: `http://localhost:5173`
6. Click **CREATE**
7. **COPY YOUR CLIENT ID** (looks like: `123456-abc.apps.googleusercontent.com`)

### 4. Configure Environment Variable (30 seconds)

1. In your project root:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and paste your Client ID:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   ```

### 5. Start the App

```bash
npm run dev
```

Open http://localhost:5173 and sign in!

## Done! 🎉

You should now see:
- Login page with Google Sign-In button
- Click to sign in with your Google account
- See your profile in the header
- Access all app features

## Troubleshooting

**"This app isn't verified" warning?**
- For development, click "Advanced" → "Go to Diet Tracker (unsafe)"
- Or add your email to Test Users in OAuth consent screen

**Can't see the sign-in button?**
- Make sure you restarted the dev server after creating `.env`
- Check browser console for errors
- Verify `.env` file is in project root (same level as `package.json`)

**"Error 401: invalid_client"?**
- Double-check your Client ID in `.env`
- Make sure there are no extra spaces
- Restart dev server

**Need More Help?**

See the detailed guide: [GOOGLE-AUTH-SETUP.md](./GOOGLE-AUTH-SETUP.md)

## What's Different from Firebase?

This implementation uses **Google Identity Services** directly:
- ✅ No Firebase needed
- ✅ Simpler setup (just 1 environment variable!)
- ✅ Official Google authentication library
- ✅ Lighter and faster
- ✅ Direct integration with Google accounts

Your data is still stored locally in your browser's localStorage.
