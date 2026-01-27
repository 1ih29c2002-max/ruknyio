# OAuth Integration Testing Guide

## Overview
دليل شامل لاختبار تكامل OAuth مع Google و LinkedIn في تطبيق Rukny.io

## Architecture Flow

### Google OAuth Flow
```
User clicks "Login with Google"
    ↓
Frontend redirects to: /auth/google
    ↓
Backend (NestJS) redirects to: Google OAuth consent page
    ↓
User approves permissions
    ↓
Google redirects to: /auth/google/callback
    ↓
Backend processes user data + generates one-time code
    ↓
Backend redirects to: /auth/callback?code=xxx
    ↓
Frontend exchanges code for access_token: POST /auth/oauth/exchange
    ↓
Backend returns: { access_token, user }
    ↓
Frontend saves token + checks user.profileCompleted
    ↓
If profileCompleted = false → redirect to /complete-profile
If profileCompleted = true → redirect to /
```

### LinkedIn OAuth Flow
```
Same as Google OAuth but with different provider
LinkedIn URLs: /auth/linkedin → /auth/linkedin/callback
```

## Testing Page

### Access
Navigate to: `http://192.168.0.162:3000/oauth-test`

### Features
1. **Configuration Display**
   - Shows current API_URL
   - Shows OAuth endpoints
   - Shows callback URL

2. **Authentication Status**
   - Shows if user is logged in
   - Displays user data (ID, email, name, username, role)
   - Shows profile completion status

3. **Test Buttons**
   - Google OAuth test button
   - LinkedIn OAuth test button
   - Refresh user data button
   - Logout button

4. **localStorage Checker**
   - Verifies if `access_token` exists
   - Verifies if `user` data exists

5. **Event Logs**
   - Real-time logging of all actions
   - Color-coded (info, success, error)
   - Timestamped entries

## Manual Testing Steps

### 1. Google OAuth Test

#### Step 1: Start OAuth Flow
1. Open `http://192.168.0.162:3000/oauth-test`
2. Click "Test Google OAuth" button
3. **Expected:** Redirect to Google login page

#### Step 2: Google Consent
1. Select your Google account
2. Review requested permissions:
   - Email address
   - Basic profile info
3. Click "Continue" or "Allow"
4. **Expected:** Redirect to `/auth/callback?code=xxx`

#### Step 3: Code Exchange
1. Callback page should show loading spinner
2. **Check Console Logs:**
   ```
   🔍 OAuth callback page loaded
   🔄 Exchanging OAuth code...
   📡 Exchange response status: 200
   ✅ OAuth exchange successful
   💾 Saving user session...
   ```

#### Step 4A: New User (Profile Incomplete)
1. **Expected:** Redirect to `/complete-profile?token=xxx`
2. Fill in profile form:
   - Full name
   - Username (check availability)
   - Birthdate (13+ years)
   - Country
3. Submit form
4. **Expected:** Redirect to home page (`/`)

#### Step 4B: Returning User (Profile Complete)
1. **Expected:** Redirect to home page (`/`)
2. User data should be in localStorage
3. Token should be saved

#### Step 5: Verify Session
1. Go back to `/oauth-test`
2. **Expected:** 
   - Authentication Status shows "مسجل دخول"
   - User data displayed correctly
   - Profile completed badge shows "✓ مكتمل"

### 2. LinkedIn OAuth Test

Follow same steps as Google OAuth but:
- Use "Test LinkedIn OAuth" button
- LinkedIn login page instead of Google
- Different consent screen styling

### 3. Token Persistence Test

#### Test A: Page Refresh
1. Login via OAuth
2. Refresh the page (F5)
3. **Expected:** User stays logged in

#### Test B: New Tab
1. Login via OAuth
2. Open new tab: `http://192.168.0.162:3000/oauth-test`
3. **Expected:** User is logged in in new tab

#### Test C: Browser Restart
1. Login via OAuth
2. Close browser completely
3. Reopen browser and go to `/oauth-test`
4. **Expected:** User is logged in (token persists)

### 4. Logout Test

1. Login via OAuth
2. Click "تسجيل خروج" button on `/oauth-test`
3. **Expected:**
   - Token removed from localStorage
   - User data cleared
   - Authentication status shows "غير مسجل دخول"
   - Redirect to home page

### 5. Error Scenarios

#### Test A: User Cancels OAuth
1. Click "Test Google OAuth"
2. On Google consent page, click "Cancel"
3. **Expected:** Redirect to `/auth/callback?error=access_denied`
4. Error page shows: "فشل تسجيل الدخول"

#### Test B: Invalid Code
1. Manually navigate to: `/auth/callback?code=invalid123`
2. **Expected:** Error page shows: "فشل المصادقة"

#### Test C: Missing Code
1. Manually navigate to: `/auth/callback`
2. **Expected:** Error page shows: "رابط غير صالح"

## Console Logging

All OAuth operations log to browser console with emoji prefixes:

- 🔍 = Detection/Discovery
- 🔄 = Processing/Exchange
- 📡 = Network Request
- ✅ = Success
- ⚠️ = Warning
- ❌ = Error
- 💾 = Data Storage
- 🚀 = Start of operation

### Example Console Output (Successful Flow)
```
🔍 OAuth callback page loaded { code: true, provider: 'google', error: null }
🚀 Starting OAuth callback... { provider: 'google' }
🔄 Exchanging OAuth code... { provider: 'google', codeLength: 32 }
📡 Exchange response status: 200
✅ OAuth exchange successful { userId: '123', profileCompleted: false }
💾 Saving user session... { userId: '123', profileCompleted: false }
⚠️ Profile incomplete, redirecting to complete-profile...
```

## Backend Requirements

### Environment Variables (.env)

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/api/auth/google/callback"

# LinkedIn OAuth
LINKEDIN_CLIENT_ID="your-client-id"
LINKEDIN_CLIENT_SECRET="your-client-secret"
LINKEDIN_CALLBACK_URL="http://localhost:3001/api/auth/linkedin/callback"
LINKEDIN_SCOPES="openid,profile,email"

# Frontend URL (for redirect)
FRONTEND_URL="http://192.168.0.162:3000"
```

### OAuth Provider Setup

#### Google Cloud Console
1. Go to: https://console.cloud.google.com/
2. Create project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. **Authorized redirect URIs:**
   - `http://localhost:3001/api/auth/google/callback`
   - `http://192.168.0.162:3001/api/auth/google/callback`

#### LinkedIn Developer Portal
1. Go to: https://www.linkedin.com/developers/
2. Create app or select existing
3. Go to "Auth" tab
4. **Authorized redirect URLs:**
   - `http://localhost:3001/api/auth/linkedin/callback`
   - `http://192.168.0.162:3001/api/auth/linkedin/callback`
5. **OAuth 2.0 scopes:**
   - `openid`
   - `profile`
   - `email`

## API Endpoints

### OAuth Endpoints

#### 1. Start Google OAuth
```
GET /auth/google
Response: 302 Redirect to Google
```

#### 2. Google Callback
```
GET /auth/google/callback?code=xxx
Response: 302 Redirect to /auth/callback?code=yyy
```

#### 3. Start LinkedIn OAuth
```
GET /auth/linkedin
Response: 302 Redirect to LinkedIn
```

#### 4. LinkedIn Callback
```
GET /auth/linkedin/callback?code=xxx
Response: 302 Redirect to /auth/callback?code=yyy
```

#### 5. Exchange Code for Token
```
POST /auth/oauth/exchange
Body: { "code": "xxx" }
Response: {
  "access_token": "jwt-token",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "role": "USER",
    "profileCompleted": false,
    "name": "John Doe",
    "avatar": "https://..."
  }
}
```

## Troubleshooting

### Issue: Redirect URI Mismatch
**Error:** `redirect_uri_mismatch` from OAuth provider

**Solution:**
1. Check OAuth provider console (Google/LinkedIn)
2. Ensure callback URLs are registered exactly
3. Check for trailing slashes
4. Verify HTTP vs HTTPS
5. Check localhost vs IP address

### Issue: "Failed to exchange code"
**Error:** `فشل في تبادل الرمز`

**Check:**
1. Backend API is running
2. NEXT_PUBLIC_API_URL is correct
3. Network tab shows POST to `/auth/oauth/exchange`
4. Backend logs for errors

### Issue: "Profile not completing"
**Error:** User stuck on `/complete-profile`

**Check:**
1. Backend `/auth/quicksign/complete-profile` endpoint
2. Console logs for validation errors
3. Username availability check
4. All required fields filled

### Issue: Token not persisting
**Error:** User logged out after refresh

**Check:**
1. localStorage in DevTools (Application tab)
2. `access_token` key exists
3. `user` key exists
4. Token expiry (7 days default)

## Network Tab Inspection

### Expected Requests Flow

1. **OAuth Start**
   ```
   GET http://192.168.0.162:3001/api/auth/google
   Status: 302 → Google OAuth page
   ```

2. **OAuth Callback (Backend)**
   ```
   GET http://192.168.0.162:3001/api/auth/google/callback?code=xxx
   Status: 302 → /auth/callback?code=yyy
   ```

3. **Code Exchange**
   ```
   POST http://192.168.0.162:3001/api/auth/oauth/exchange
   Body: { "code": "yyy" }
   Status: 200
   Response: { "access_token": "...", "user": {...} }
   ```

4. **Profile Completion (if needed)**
   ```
   POST http://192.168.0.162:3001/api/auth/quicksign/complete-profile
   Body: { "quickSignToken": "...", "name": "...", ... }
   Status: 200
   Response: { "access_token": "...", "user": {...} }
   ```

## Security Notes

1. **One-Time Codes:** Backend generates one-time codes to avoid exposing tokens in URL
2. **HTTPS in Production:** OAuth requires HTTPS in production
3. **Token Expiry:** JWT tokens expire after 7 days
4. **Secure Storage:** Tokens stored in localStorage (consider httpOnly cookies for production)

## Success Criteria

✅ OAuth flow completes without errors
✅ User data saved correctly
✅ Token persists across refreshes
✅ Profile completion works for new users
✅ Returning users skip profile completion
✅ Logout clears all data
✅ Error states handled gracefully

## Next Steps

After successful OAuth testing:

1. ✅ Implement refresh token mechanism
2. ✅ Add session timeout warnings
3. ✅ Implement "Remember Me" feature
4. ✅ Add OAuth account linking
5. ✅ Implement social profile import
6. ✅ Add two-factor authentication
7. ✅ Security audit

## Support

For issues or questions:
- Check browser console logs (with emoji prefixes)
- Check backend logs
- Verify environment variables
- Test with `/oauth-test` page
- Check OAuth provider dashboards
