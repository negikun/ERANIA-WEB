# ERANIA Web App - Vercel Deployment Guide

## 🚀 Deploy to Vercel (Free)

Your app is now ready for Vercel deployment!

### Step 1: Install Vercel CLI (if not installed)

```bash
npm install -g vercel
```

### Step 2: Deploy from this directory

```bash
cd "c:\Users\negui\OneDrive\Escritorio\ERANIA WEB"
vercel
```

### Step 3: Follow the prompts:

- Project name: `erania-web-app`
- Framework: `Other`
- Build command: (leave empty or press Enter)
- Output directory: (leave empty or press Enter)

### Step 4: Set up Firebase credentials

After deployment, you need to add your Firebase service account:

1. **Go to**: https://vercel.com/dashboard
2. **Select your project**
3. **Settings > Environment Variables**
4. **Add**: `FIREBASE_SERVICE_ACCOUNT`
5. **Value**: Your Firebase service account JSON (get from Firebase Console)

### Alternative: Quick Deploy via GitHub

1. **Push to GitHub**:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/erania-web.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to https://vercel.com
   - Click "New Project"
   - Import from GitHub
   - Select your repository
   - Deploy!

## 📁 Project Structure for Vercel

```
├── api/                    # Serverless functions
│   ├── _firebase.js       # Firebase initialization
│   ├── products.js        # Products API
│   ├── product.js         # Individual product operations
│   ├── users.js           # Users API
│   ├── user.js           # Individual user operations
│   ├── categories.js      # Categories API
│   ├── category.js       # Individual category operations
│   ├── clients.js         # Clients API
│   ├── client.js         # Individual client operations
│   ├── settings.js        # Settings API (/api/GlobalVariablesP/Global)
│   ├── tickets.js         # Tickets read-only API
│   ├── spendings.js       # Spendings read-only API
│   └── sales-statistics.js # Sales statistics read-only API
├── index.html             # Frontend
├── app.js                 # Frontend JavaScript
├── styles.css             # Styles
├── package.json           # Dependencies
└── vercel.json           # Vercel configuration
```

## 🌐 Features Ready

- ✅ **Products Management** - Full CRUD
- ✅ **Settings** - Global variables
- ✅ **Users Management** - Full CRUD
- ✅ **Categories** - Add/Delete
- ✅ **Clients** - Full CRUD
- ✅ **Tickets** - Read-only with PDF export
- ✅ **Spendings** - Read-only with PDF export
- ✅ **Sales Statistics** - Read-only with PDF export

## 🔗 API Endpoints

All endpoints are automatically available at your Vercel domain:

- `/api/products` - Products CRUD
- `/api/GlobalVariablesP/Global` - Settings (routes to `/api/settings`)
- `/api/users` - Users CRUD
- `/api/categories` - Categories CRUD
- `/api/clients` - Clients CRUD
- `/api/tickets` - Tickets data
- `/api/spendings` - Spendings data
- `/api/sales-statistics` - Sales statistics

## 💡 Benefits of Vercel

- ✅ **100% Free** for your use case
- ✅ **Global CDN** - Fast worldwide
- ✅ **Automatic HTTPS**
- ✅ **Custom domains** supported
- ✅ **Serverless functions** for API
- ✅ **Git deployment** - automatic updates
- ✅ **Environment variables** for Firebase credentials

Your app will work exactly the same as locally, but hosted for free on Vercel!
