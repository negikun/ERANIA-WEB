# ERANIA Web App - Production Deployment Guide

## Firebase Hosting Setup

This app is configured for Firebase Hosting with Cloud Functions backend.

### Prerequisites

1. Install Firebase CLI:

   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

### Configuration

1. Update `.firebaserc` with your Firebase project ID:

   ```json
   {
     "projects": {
       "default": "your-actual-firebase-project-id"
     }
   }
   ```

2. Ensure your Firebase project has:
   - Firestore Database enabled
   - Cloud Functions enabled
   - Firebase Hosting enabled

### Deployment

1. Deploy everything:

   ```bash
   firebase deploy
   ```

2. Deploy only hosting:

   ```bash
   firebase deploy --only hosting
   ```

3. Deploy only functions:
   ```bash
   firebase deploy --only functions
   ```

### Project Structure

```
├── public/                 # Static files for hosting
│   ├── index.html         # Main HTML file
│   ├── app.js            # Frontend JavaScript (production)
│   └── styles.css        # Styles
├── functions/             # Cloud Functions
│   ├── index.js          # API endpoints
│   └── package.json      # Functions dependencies
├── firebase.json         # Firebase configuration
└── .firebaserc          # Project configuration
```

### Features

- **Products Management**: CRUD operations for inventory
- **Settings**: Global variables and configuration
- **Users Management**: User accounts and permissions
- **Categories**: Product categories management
- **Clients**: Customer information management
- **Tickets**: Read-only ticket viewing with PDF export
- **Spendings**: Read-only spending reports with PDF export
- **Sales Statistics**: Read-only sales analytics with PDF export

### API Endpoints

All API endpoints are available at `/api/*`:

- `/api/products` - Products CRUD
- `/api/GlobalVariablesP/Global` - Settings
- `/api/users` - Users management
- `/api/categories` - Categories management
- `/api/clients` - Clients management
- `/api/tickets` - Tickets data
- `/api/spendings` - Spendings data
- `/api/sales-statistics` - Sales statistics

### Database Collections

- `Products` - Inventory items
- `GlobalVariablesP` - Global settings
- `Users` - User accounts
- `Categories` - Product categories
- `Clients` - Customer data
- `Tickets` - Transaction records
- `SpendingsG` - Spending records
- `SalesStatistics` - Sales analytics

### Production Features

- No debug logging
- Optimized for performance
- Responsive design
- PDF export capabilities
- Spanish localization
- Production-ready Firebase configuration
