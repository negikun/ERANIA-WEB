#!/bin/bash

# ERANIA Web App - Production Deployment Script
# This script deploys the application to Firebase

echo "🚀 Starting ERANIA Web App deployment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ You are not logged in to Firebase. Please login first:"
    echo "   firebase login"
    exit 1
fi

# Install dependencies for Cloud Functions
echo "📦 Installing Firebase Functions dependencies..."
cd functions
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install functions dependencies"
    exit 1
fi
cd ..

# Deploy Firestore rules first
echo "🔒 Deploying Firestore security rules..."
firebase deploy --only firestore:rules
if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy Firestore rules"
    exit 1
fi

# Deploy everything
echo "🌐 Deploying hosting and functions..."
firebase deploy
if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo "✅ Deployment completed successfully!"
echo "🌍 Your app is now live at: https://erania-d9833.web.app"
echo ""
echo "Next steps:"
echo "1. Test all functionality on the live site"
echo "2. Set up proper authentication if needed"
echo "3. Review and tighten Firestore security rules"
echo "4. Set up monitoring and analytics"