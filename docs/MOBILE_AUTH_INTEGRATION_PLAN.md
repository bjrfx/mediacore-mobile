# Mobile Authentication Integration Plan

This document outlines the existing authentication system in the web application and provides a step-by-step plan to integrate it into a React Native (Expo) mobile app.

# This is how my api works for login:
1. To send this request in Postman:
https://mediacoreapi-sql.masakalirestrobar.ca/auth/login

2. Go to the "Headers" tab and add:
Key: Content-Type
Value: application/json

3. Go to the "Body" tab, select "raw", and choose "JSON" from the dropdown. Enter:
{
  "email": "admin@mediacore.com",
  "password": "your_admin_password"
}


## 1. Email & Password Authentication

### API Endpoints
API_URL=https://mediacoreapi-sql.masakalirestrobar.ca
All endpoints are relative to your API Base URL ( `https://mediacoreapi-sql.masakalirestrobar.ca` ).
REACT_APP_PUBLIC_API_KEY=mc_3f177f8a673446ba8ee152728d877

| Action | Endpoint | Method | Protected? | Description |
|--------|----------|--------|------------|-------------|
| **Signup** | `/auth/register` | POST | No | Creates a new user account. |
| **Login** | `/auth/login` | POST | No | Authenticates user and returns JWT tokens. |
| **Logout** | `/auth/logout` | POST | No | Invalidates the refresh token. |
| **Refresh** | `/auth/refresh` | POST | No | Uses a refresh token to get a new access token. |

### Signup
*   **Payload:**
    ```json
    {
      "email": "user@example.com",
      "password": "securePassword123",
      "displayName": "John Doe"
    }
    ```
*   **Response (Success - 201 Created):**
    ```json
    {
      "success": true,
      "message": "User registered successfully. Please verify your email.",
      "data": { "uid": "...", "email": "...", ... }
    }
    ```
    *Note: Signup does NOT return tokens. The user must log in after registering.*

### Login
*   **Payload:**
    ```json
    {
      "email": "user@example.com",
      "password": "securePassword123"
    }
    ```
*   **Response (Success - 200 OK):**
    ```json
    {
      "success": true,
      "message": "Login successful",
      "data": {
        "user": {
          "uid": "...",
          "email": "...",
          "displayName": "...",
          "photoURL": "...",
          "role": "user"
        },
        "accessToken": "ey...",
        "refreshToken": "ey..."
      }
    }
    ```

### Error Handling
*   **Format:**
    ```json
    {
      "success": false,
      "error": "Bad Request",
      "message": "Specific error message"
    }
    ```
*   **Status Codes:**
    *   `400`: Bad Request (Missing fields, invalid format).
    *   `401`: Unauthorized (Wrong password, invalid token).
    *   `403`: Forbidden (Account disabled).
    *   `409`: Conflict (Email already exists).
    *   `500`: Internal Server Error.

### Validation Rules
*   **Email:** Must match standard regex format.
*   **Password:** Validated on backend (likely length and complexity checks).

---

## 2. Authentication Tokens & Sessions

### Type
*   **Strategy:** JWT (JSON Web Tokens).
*   **Access Token:** Short-lived (15 minutes). Sent in HTTP Headers.
*   **Refresh Token:** Long-lived (7 days). Stored in database (`refresh_tokens` table) and client.

### Storage (Web vs. Mobile)
*   **Web:** Currently uses `localStorage`.
*   **Mobile (Recommended):** Use `Expo SecureStore` to store tokens securely. Do NOT use `AsyncStorage` for sensitive tokens.

### Token Flow
1.  **Request:** Client sends `Authorization: Bearer <accessToken>`.
2.  **Expiration:** If API returns `401 Unauthorized`, client must attempt refresh.
3.  **Refresh:**
    *   Call `POST /auth/refresh` with `{ refreshToken: "..." }`.
    *   If successful, receive new `accessToken` and `refreshToken`.
    *   Retry original request with new `accessToken`.
    *   If refresh fails, log user out locally.

---

## 3. Google Login
# Google OAuth Configuration
GOOGLE_CLIENT_ID=8159728878-udbotiht850dorm5boqkm9tbr8tejukm.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-u4GX_iVuL3k1QTf0hm7ySO0FE9

### Method
*   **Web:** Uses `@react-oauth/google` (Google Identity Services).
*   **Backend:** Uses `google-auth-library` to verify the `idToken` sent from client.

### Flow
1.  **Mobile Client:** User signs in with Google (using `expo-auth-session` or `@react-native-google-signin/google-signin`).
2.  **Token Exchange:** Mobile app receives an `idToken` from Google.
3.  **Backend Auth:** Mobile app sends this `idToken` to your backend:
    *   **Endpoint:** `POST /auth/google`
    *   **Payload:** `{ "googleToken": "<GOOGLE_ID_TOKEN>" }`
4.  **Session Creation:** Backend verifies token, creates/updates user in DB, and returns app-specific JWTs (`accessToken`, `refreshToken`).
5.  **Completion:** App stores JWTs and treats user as logged in.

### Requirements
*   **Google Console:** You need to create a new "iOS" and "Android" Client ID in Google Cloud Console.
*   **Web Client ID:** You may still need the Web Client ID for the backend to verify the token, depending on how you configure the mobile library.

---

## 4. User Data

### User Object
Returned in `data.user` field of Login/Google responses:
```json
{
  "uid": "uuid-string",
  "email": "user@example.com",
  "displayName": "John Doe",
  "photoURL": "https://...",
  "emailVerified": true/false,
  "role": "user" | "admin",
  "hasPassword": true/false, // For Google users
  "isNewUser": true/false // Only on Google Login
}
```

### Roles
*   Stored in `user_roles` table.
*   Frontend checks `user.role` or `isAdminUser` boolean in store.

---

## 5. Mobile Integration Readiness

### Reusable Components
*   **Backend:** 100% reusable. No changes needed to API code.
*   **Logic:** The authentication logic (login -> save token -> intercept requests -> refresh on 401) is identical.

### Required Adaptations for React Native
1.  **Storage:** Replace `localStorage` with `Expo SecureStore`.
2.  **Google Library:** Replace `@react-oauth/google` with `@react-native-google-signin/google-signin` (recommended for native experience) or `expo-auth-session`.
3.  **HTTP Client:** `axios` can be reused, but the interceptors need to read/write to `SecureStore` (which is async, unlike `localStorage`).
4.  **Navigation:** Replace React Router with React Navigation.
5.  **Environment:** `process.env` works differently in Expo; use `expo-constants` or `.env` files.

### Potential Pitfalls
*   **Network Access:** `localhost` on mobile refers to the phone itself. You must use your computer's local IP address (e.g., `http://192.168.1.5:5001`) or a tunneling service (like Ngrok) for the API URL.
*   **CORS:** Ensure your backend `cors` configuration allows requests from your mobile app (or allows all origins `*` for development).

---

## 6. Implementation Plan

### Step 1: Install Dependencies
In your Expo project:
```bash
npx expo install expo-secure-store axios zustand
npx expo install @react-native-google-signin/google-signin
```

### Step 2: Create Storage Utility
Create `utils/storage.js`:
```javascript
import * as SecureStore from 'expo-secure-store';

export const saveToken = async (key, value) => {
  await SecureStore.setItemAsync(key, value);
};

export const getToken = async (key) => {
  return await SecureStore.getItemAsync(key);
};

export const removeToken = async (key) => {
  await SecureStore.deleteItemAsync(key);
};
```

### Step 3: Setup API Client
Create `services/api.js`:
*   Configure `axios` base URL (use IP address!).
*   Add **Request Interceptor**: `await getToken('accessToken')` and add header.
*   Add **Response Interceptor**: Catch 401, call refresh endpoint, save new tokens, retry request.

### Step 4: Implement Auth Service
Create `services/auth.js`:
*   Mirror the web's `auth.js` but use the new axios instance.
*   Implement `login`, `register`, `googleLogin` (sending token to backend).

### Step 5: Google Auth Setup
1.  Configure Google Cloud Console for Android/iOS.
2.  Initialize Google Sign-In in your app entry point.
3.  On button press:
    ```javascript
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo.idToken;
    // Send idToken to your backend
    await authService.googleLogin(idToken);
    ```

### Step 6: State Management
*   Port `authStore.js` (Zustand) to React Native.
*   Use the async storage adapter for Zustand persistence if you want to persist user state across app restarts.

### Step 7: UI Implementation
*   Build Login/Signup screens using React Native components (`View`, `Text`, `TextInput`, `TouchableOpacity`).
*   Connect forms to `authStore` actions.
