# Firestore Web App with Node.js

A web application that connects to Firestore database using Node.js backend with Express server and vanilla HTML, CSS, JavaScript frontend.

## Features

- **RESTful API** with Express.js backend
- **Firestore database integration** using Firebase Admin SDK
- **CRUD operations**: Create, Read, Update, and Delete items
- **Responsive design** that works on desktop and mobile
- **Category management** with predefined categories
- **Modern UI** with smooth animations and transitions
- **Error handling** and validation
- **Environment-based configuration**

## Technologies Used

### Backend

- Node.js
- Express.js
- Firebase Admin SDK
- CORS middleware
- dotenv for environment variables

### Frontend

- HTML5
- CSS3 (Grid, Flexbox, Animations)
- Vanilla JavaScript (ES6+)
- Fetch API for HTTP requests

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Follow the setup wizard
4. Enable Firestore Database in test mode

### 2. Set up Firebase Admin SDK

1. In your Firebase project, go to Project Settings (gear icon)
2. Go to "Service accounts" tab
3. Click "Generate new private key"
4. Save the JSON file as `serviceAccountKey.json` in your project root
5. Copy the project ID from the Firebase console

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Edit `.env` and update the values:

```bash
FIREBASE_PROJECT_ID=your-actual-project-id
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
PORT=3000
```

Alternatively, you can edit the service account configuration directly in `server.js` (not recommended for production).

### 5. Run the Application

For development:

```bash
npm run dev
```

For production:

```bash
npm start
```

The application will be available at http://localhost:3000

## API Endpoints

The Node.js server provides the following REST API endpoints:

- `GET /api/items` - Get all items
- `POST /api/items` - Create a new item
- `GET /api/items/:id` - Get a single item by ID
- `PUT /api/items/:id` - Update an item by ID
- `DELETE /api/items/:id` - Delete an item by ID
- `GET /api/health` - Health check endpoint

## Project Structure

```
ERANIA WEB/
├── server.js              # Express server with API endpoints
├── app.js                 # Frontend JavaScript logic
├── index.html             # Main HTML structure
├── styles.css             # CSS styling and responsive design
├── package.json           # Node.js dependencies and scripts
├── .env.example           # Environment variables template
├── serviceAccountKey.json # Firebase service account (not included)
└── README.md              # This file
```

## Database Structure

The app creates an `items` collection in Firestore with documents containing:

```javascript
{
  name: "Item Name",
  description: "Item description",
  category: "electronics|books|clothing|food|other",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Features Explained

### Real-time Updates

The app uses Firestore's `onSnapshot()` method to listen for real-time changes. When any user adds, updates, or deletes an item, all connected clients see the changes immediately.

### CRUD Operations

- **Create**: Add new items using the form
- **Read**: View all items in real-time
- **Update**: Edit items using the modal dialog
- **Delete**: Remove items with confirmation

### Responsive Design

The app uses CSS Grid and Flexbox to provide a responsive layout that adapts to different screen sizes.

## Customization

### Adding New Categories

To add new categories, modify the `<select>` elements in both `index.html`:

- Main form (around line 35)
- Edit modal (around line 85)

### Styling

All styles are in `styles.css`. The app uses CSS custom properties for easy theme customization.

### Database Fields

To add new fields to items:

1. Update the HTML forms in `index.html`
2. Modify the JavaScript object creation in `app.js`
3. Update the display template in the `displayItems()` function

## Security Considerations

- The current setup uses test mode security rules for simplicity
- For production, implement Firebase Authentication
- Set up proper Firestore security rules
- Validate all user input on the client and server side
- Consider rate limiting and quota management

## Troubleshooting

### Firebase Not Loading

- Check that your Firebase configuration is correct
- Ensure you're serving the files through a web server (not file:// protocol)
- Check the browser console for error messages

### Data Not Appearing

- Verify your Firestore security rules allow read/write access
- Check the browser's Network tab for failed requests
- Ensure your internet connection is stable

### Module Import Errors

- Make sure you're using a modern browser that supports ES6 modules
- Serve the files through a web server (required for modules)

## License

This project is open source and available under the MIT License.
