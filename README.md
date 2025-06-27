# Goal Tracker App

A modern goal tracking application with Firebase authentication and MongoDB data storage.

## Features

- 🔐 Firebase Authentication (Email/Password & Google OAuth)
- 📊 Goal tracking with time logging
- 📅 Calendar view for date selection
- 📈 Performance analytics and graphs
- 💾 MongoDB data storage with local fallback
- 🎨 Modern UI with animations and responsive design

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB instance
- Firebase project with authentication enabled

## Setup Instructions

### 1. Frontend Setup

```bash
cd GoalTracker/project
npm install
```

### 2. Backend Setup

```bash
cd server
npm install
```

### 3. Environment Configuration

Make sure the following environment files are configured:

**Frontend (.env):**
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_MONGODB_URI=your_mongodb_connection_string
```

**Backend (server/.env):**
```env
MONGODB_URI=mongodb+srv://sahilaps2k12:sdf8bQFxKaeSTUB7@cluster0.clvp4at.mongodb.net/
PORT=3001
```

### 4. Running the Application

**Start the backend server:**
```bash
cd server
npm run dev
```

**Start the frontend development server:**
```bash
cd .. # Go back to project root
npm run dev
```

The application will be available at `http://localhost:5173`

## MongoDB Collections

The app uses the following MongoDB collections:

- `goalTrackerUsers` - User profiles (stored in Firestore)
- `goals` - Individual goals with time tracking
- `dayData` - Daily aggregated data for analytics

## Authentication

### Supported Methods:
- Email/Password registration and login
- Google OAuth login
- Automatic user profile creation
- Secure logout functionality

### User Data:
- Display name and email
- Profile photo (from Google OAuth)
- Goal statistics and progress tracking

## Goal Management

### Features:
- Create, edit, and delete goals
- Set start and end dates for goals
- Log time spent on goals
- Mark goals as completed
- View goals by date

### Time Tracking:
- Add time entries for specific dates
- View total logged hours per goal
- Daily and overall statistics

## Analytics

### Available Metrics:
- Total goals created
- Goals completed vs incomplete
- Time logged per day/week/month
- Goal completion trends
- Performance graphs and visualizations

## Data Storage

### Hybrid Approach:
- **Primary**: MongoDB for persistent cloud storage
- **Fallback**: localStorage for offline functionality
- **User-specific**: All data is isolated per authenticated user

### Data Sync:
- Automatic sync with MongoDB on actions
- Graceful fallback to localStorage if MongoDB is unavailable
- User-specific data isolation

## Development

### Tech Stack:
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **Authentication**: Firebase Auth
- **Database**: MongoDB + Firestore
- **Backend**: Node.js + Express

### Project Structure:
```
GoalTracker/project/
├── src/
│   ├── components/     # React components
│   ├── config/        # Firebase configuration
│   ├── services/      # MongoDB service layer
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── server/            # Backend API server
└── public/            # Static assets
```

## Deployment

### Frontend:
- Build with `npm run build`
- Deploy to Vercel, Netlify, or similar platform
- Configure environment variables in deployment platform

### Backend:
- Deploy to Heroku, Railway, or similar Node.js hosting
- Set environment variables for MongoDB connection
- Ensure CORS is configured for your frontend domain

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 