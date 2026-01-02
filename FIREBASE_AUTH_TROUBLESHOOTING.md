# Firebase Authentication Issue - Solutions

If you're still getting the authentication error, follow these steps:

## Option 1: Download Fresh Service Account Key

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project "erania-d9833"
3. Go to Project Settings (gear icon) > Service Accounts tab
4. Click "Generate new private key"
5. Save the downloaded JSON file as `erania-d9833-firebase-adminsdk-fbsvc-2a0f6126a1.json`
6. Replace the current service account file with the new one

## Option 2: Use Environment Variable Method

1. Download the service account JSON file (as above)
2. Set environment variable in your .env file:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./erania-d9833-firebase-adminsdk-fbsvc-2a0f6126a1.json
   ```

## Option 3: Check Firebase Project Status

1. Verify your Firebase project is active
2. Check that Firestore is enabled in the Firebase console
3. Verify the service account has the necessary permissions:
   - Firebase Admin SDK Administrator Service Agent
   - Cloud Datastore User

## Option 4: Update Firebase Admin SDK

Run this command to update to the latest version:

```bash
npm update firebase-admin
```

## Restart the Server

After making any changes, restart the server:

```bash
npm start
```
