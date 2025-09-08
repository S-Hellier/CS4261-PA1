# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

CS4261-PA1: Band Setlist Creator - An AI-powered mobile app that helps bands create optimal setlists for different events. The app allows users to manage their song library and generate custom setlists based on event type, duration, and mood.

**Team:** Scott Hellier & Josh Robinson

## Architecture

This is a full-stack mobile application with the following architecture:

### Frontend (React Native + Expo)
- **Location:** `BandSetlistCreator/` directory
- **Framework:** React Native with Expo SDK 53
- **Navigation:** React Navigation v7 with Stack Navigator
- **Authentication:** Firebase Auth with custom AuthContext
- **Database:** Firebase Firestore (client-side)
- **API Communication:** Custom API service layer

### Backend (Node.js + Express)
- **Location:** `backend/` directory  
- **Server:** Express.js with CORS enabled
- **Authentication:** Firebase Admin SDK for token verification
- **Database:** Firebase Firestore (server-side admin)
- **Deployment:** Railway (production URL: https://setlist-creator-production.up.railway.app)

### Key Components

**App Structure:**
- `App.js` - Main navigation container with AuthProvider wrapper
- `src/contexts/AuthContext.js` - Firebase authentication context and hooks
- `src/services/api.js` - Centralized API service layer with token handling
- `src/screens/` - All React Native screens (Login, Home, AddSong, CreateSetlist, etc.)

**Backend Structure:**
- `server.js` - Express server with all API endpoints, Firebase Admin setup, and JWT middleware
- Authentication middleware (`verifyToken`) protects all API routes
- RESTful API endpoints for songs and setlists CRUD operations

## Common Development Commands

### Frontend (React Native + Expo)
```bash
# Navigate to frontend directory
cd BandSetlistCreator

# Install dependencies
npm install

# Start Expo development server
npm start

# Run on specific platforms
npm run ios        # iOS simulator
npm run android    # Android emulator  
npm run web        # Web browser
```

### Backend (Node.js)
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server with nodemon
npm run dev

# Start production server
npm start

# Test API health
curl http://localhost:3000/api/health
```

### Full Stack Development
```bash
# Start both frontend and backend simultaneously
# Terminal 1:
cd backend && npm run dev

# Terminal 2: 
cd BandSetlistCreator && npm start
```

## Environment Configuration

### Frontend Environment Variables
Create `.env` in `BandSetlistCreator/` directory:
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id  
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Backend Environment Variables
Create `.env` in `backend/` directory:
```
PORT=3000
FIREBASE_PROJECT_ID=setlist-creator-3d94e
FIREBASE_SERVICE_ACCOUNT_KEY={"type": "service_account", ...} # JSON string for production
```

For local development, place `serviceAccountKey.json` in `backend/` directory.

## API Endpoints

All endpoints require Firebase authentication token in Authorization header:
`Authorization: Bearer <firebase_id_token>`

- `GET /api/health` - Health check (public)
- `GET /api/songs` - Get user's songs
- `POST /api/songs` - Add new song
- `DELETE /api/songs/:id` - Delete song
- `POST /api/setlists/generate` - Generate AI setlist
- `GET /api/setlists` - Get user's saved setlists

## Key Development Notes

### Authentication Flow
1. Frontend uses Firebase Auth for user authentication
2. AuthContext provides authentication state and methods throughout the app
3. API service automatically attaches Firebase ID tokens to requests
4. Backend verifies tokens using Firebase Admin SDK

### Data Models
- **Songs:** title, artist, genre, duration, userId, createdAt
- **Setlists:** name, songs[], duration, eventType, notes, userId, createdAt
- All data is user-scoped and protected by authentication middleware

### Navigation Structure
Stack Navigator with screens: Login → Home → AddSong/CreateSetlist → SetlistScreen → MySetlists

### Firebase Configuration
- Frontend uses Firebase v9+ modular SDK
- Backend uses Firebase Admin SDK for server-side operations
- Firestore collections: `songs`, `setlists`
- Authentication managed through Firebase Auth

### API Service Pattern
The `src/services/api.js` centralizes all API calls with:
- Automatic token attachment
- Error handling
- Base URL configuration
- Consistent request/response handling

## Troubleshooting

### Common Issues
1. **Expo not starting:** Ensure Node.js version compatibility and try `npx expo install --fix`
2. **API connection errors:** Verify backend is running and Firebase configuration is correct
3. **Authentication failures:** Check Firebase project configuration and service account setup
4. **Build errors:** Clear Metro cache with `npx expo start --clear`

### Development Workflow
1. Ensure Firebase project is configured with proper authentication rules
2. Start backend server first to handle API requests
3. Start Expo development server
4. Test on device/simulator with proper network connectivity to backend
