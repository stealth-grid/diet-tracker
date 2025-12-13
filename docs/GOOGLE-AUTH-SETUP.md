# Google Authentication Setup Guide

This guide will help you set up Google Sign-In for the Diet Tracker app using Google Identity Services.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** dropdown at the top
3. Click **NEW PROJECT**
4. Enter project details:
   - Project name: `Diet Tracker` (or any name you prefer)
   - Organization: Leave as default or select your organization
5. Click **CREATE**
6. Wait for the project to be created (takes a few seconds)
7. Make sure your new project is selected in the dropdown

## Step 2: Enable Google+ API (Optional but recommended)

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click on it and click **ENABLE**
4. This helps with better profile information retrieval

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (unless you have a Google Workspace)
3. Click **CREATE**
4. Fill in the required fields:
   - **App name**: `Diet Tracker`
   - **User support email**: Your email address
   - **App logo**: (Optional) Upload a logo if you have one
   - **Application home page**: Can leave empty for development
   - **Authorized domains**: Leave empty for development
   - **Developer contact information**: Your email address
5. Click **SAVE AND CONTINUE**
6. On **Scopes** screen:
   - Click **ADD OR REMOVE SCOPES**
   - Select these scopes:
     - `userinfo.email`
     - `userinfo.profile`
     - `openid`
   - Or just use the default scopes (they should be pre-selected)
   - Click **UPDATE** then **SAVE AND CONTINUE**
7. On **Test users** screen (for development):
   - Click **ADD USERS**
   - Add your Google account email
   - Click **ADD** then **SAVE AND CONTINUE**
8. Review and click **BACK TO DASHBOARD**

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** at the top
3. Select **OAuth client ID**
4. Configure the OAuth client:
   - **Application type**: Select **Web application**
   - **Name**: `Diet Tracker Web Client`
   - **Authorized JavaScript origins**:
     - Click **+ ADD URI**
     - Add: `http://localhost:5173` (for development)
     - For production, add your production URL (e.g., `https://yourdomain.com`)
   - **Authorized redirect URIs**: Leave empty (not needed for Google Sign-In button)
5. Click **CREATE**
6. A dialog will appear with your credentials
7. **IMPORTANT**: Copy the **Client ID** - you'll need this!
   - It looks like: `123456789-abcdefghijk.apps.googleusercontent.com`
8. Click **OK**

## Step 5: Configure Environment Variables

1. In your project root, create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and add your Client ID:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```

3. **Important**: 
   - Never commit the `.env` file to version control (it's already in `.gitignore`)
   - The Client ID is safe to expose in client-side code
   - Keep your Client Secret private (but we don't need it for this implementation)

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173`
3. You should see the login page with a Google Sign-In button
4. Click the button and sign in with your Google account
5. After successful authentication, you'll be redirected to the app
6. Your profile picture should appear in the top-right corner

## Troubleshooting

### "Error 401: invalid_client"
- Check that your `VITE_GOOGLE_CLIENT_ID` is correct in `.env`
- Make sure you're using the Client ID (not Client Secret)
- Restart your development server after changing `.env`

### "Error 403: access_denied" or "This app isn't verified"
- For development, make sure your email is added to Test Users in OAuth consent screen
- This is normal for apps in testing mode
- Click "Continue" or "Advanced" > "Go to Diet Tracker (unsafe)" during development
- For production, you'll need to verify your app with Google

### "Error 400: redirect_uri_mismatch"
- Make sure `http://localhost:5173` is added to Authorized JavaScript origins
- Do not add a trailing slash
- If using a different port, update the origin accordingly

### Google Sign-In button not appearing
- Check browser console for errors
- Make sure your `.env` file is in the project root
- Verify VITE_GOOGLE_CLIENT_ID starts with `VITE_`
- Restart your development server

### "Configuration Error" message
- This means `VITE_GOOGLE_CLIENT_ID` is not set
- Check that your `.env` file exists and has the correct variable name
- Restart the dev server after creating `.env`

## Publishing Your App (Production)

When you're ready to deploy:

### 1. Update OAuth Settings
1. In Google Cloud Console > Credentials
2. Edit your OAuth client
3. Add your production domain to **Authorized JavaScript origins**:
   - Example: `https://yourdomain.com`
4. Remove or keep localhost for testing

### 2. Verify Your App (Optional)
For public use without warnings:
1. Go to **OAuth consent screen**
2. Click **PUBLISH APP**
3. Submit for verification (required if you have > 100 users)
4. This process can take several days/weeks

### 3. Update Environment Variables
- Make sure your production environment has the correct `VITE_GOOGLE_CLIENT_ID`
- You can use the same Client ID for development and production

## Security Notes

1. **Client ID**: Safe to expose in client-side code. It identifies your app.

2. **Client Secret**: If you see this, **DO NOT** use it in client-side code. We don't need it for Google Identity Services.

3. **Data Storage**: User data is stored in browser localStorage. Consider:
   - Adding a backend for multi-device sync
   - Using a database for persistent storage
   - Implementing proper data encryption

4. **Token Validation**: Currently tokens are only decoded on client-side. For production:
   - Consider validating tokens on a backend server
   - Set up proper session management
   - Implement token refresh if needed

## How It Works

1. **Google Identity Services**: We use Google's official JavaScript library
2. **JWT Token**: Google returns a JWT (JSON Web Token) after successful sign-in
3. **User Data**: We decode the JWT to get user profile information
4. **LocalStorage**: User data is stored locally for session persistence
5. **No Backend Needed**: This is a pure client-side implementation

## Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 Overview](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are correct
3. Ensure OAuth consent screen is properly configured
4. Make sure your email is added to test users (for development)
5. Check that authorized origins include your domain

## What's Next?

Once authentication is working:
- Users can sign in with one click
- Their data is isolated per browser
- Profile picture and name are displayed
- Consider adding backend integration for cloud storage
- Implement data synchronization across devices
