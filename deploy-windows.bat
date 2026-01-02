@echo off
REM ERANIA Web App - Production Deployment Script for Windows
REM This script deploys the application to Firebase

echo 🚀 Starting ERANIA Web App deployment...

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Firebase CLI is not installed. Please install it first:
    echo    npm install -g firebase-tools
    exit /b 1
)

REM Check if user is logged in to Firebase
firebase projects:list >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ You are not logged in to Firebase. Please login first:
    echo    firebase login
    exit /b 1
)

REM Install dependencies for Cloud Functions
echo 📦 Installing Firebase Functions dependencies...
cd functions
npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install functions dependencies
    exit /b 1
)
cd ..

REM Deploy Firestore rules first
echo 🔒 Deploying Firestore security rules...
firebase deploy --only firestore:rules
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to deploy Firestore rules
    exit /b 1
)

REM Deploy everything
echo 🌐 Deploying hosting and functions...
firebase deploy
if %ERRORLEVEL% neq 0 (
    echo ❌ Deployment failed
    exit /b 1
)

echo ✅ Deployment completed successfully!
echo 🌍 Your app is now live at: https://erania-d9833.web.app
echo.
echo Next steps:
echo 1. Test all functionality on the live site
echo 2. Set up proper authentication if needed
echo 3. Review and tighten Firestore security rules
echo 4. Set up monitoring and analytics

pause