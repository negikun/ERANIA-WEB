@echo off
echo Deploying ERANIA Web App to Firebase...

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Firebase CLI is not installed.
    echo Please install it with: npm install -g firebase-tools
    exit /b 1
)

REM Check if user is logged in
firebase projects:list >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Not logged in to Firebase.
    echo Please run: firebase login
    exit /b 1
)

REM Install function dependencies
echo Installing function dependencies...
cd functions
npm install
cd ..

REM Deploy to Firebase
echo Deploying to Firebase...
firebase deploy

if %errorlevel% eq 0 (
    echo.
    echo ✅ Deployment successful!
    echo Your app is now live on Firebase Hosting.
) else (
    echo.
    echo ❌ Deployment failed!
    echo Please check the error messages above.
)

pause