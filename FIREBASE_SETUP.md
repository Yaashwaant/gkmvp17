# Firebase Authentication Setup

## Current Status
Firebase is configured but needs authorized domain setup for Google authentication to work.

## Required Steps to Fix Authentication

### 1. Add Authorized Domains
Go to your Firebase Console → Authentication → Settings → Authorized domains

Add these domains:
- `your-replit-url.repl.co` (your current development URL)
- `localhost` (for local development)
- Any custom domain you plan to use

### 2. Current Firebase Configuration
- Project ID: `greenkarma-f0739`
- App ID: `1:1037347999472:web:6fc1d8a3ac8db0c5603c35`
- API Key: Configured in environment variables

### 3. Environment Variables Set
✅ `VITE_FIREBASE_API_KEY=AIzaSyC0zznZ-puvNPQJEtBi2iP09nphzySlI38`
✅ `VITE_FIREBASE_PROJECT_ID=greenkarma-f0739`  
✅ `VITE_FIREBASE_APP_ID=1:1037347999472:web:6fc1d8a3ac8db0c5603c35`

### 4. Authentication Features Implemented
- ✅ Username/Password authentication
- ✅ Google Firebase authentication  
- ✅ User registration with vehicle validation
- ✅ Session management with 30-day tokens
- ✅ Password hashing and security
- ✅ Protected routes and auth guards

### 5. To Test Authentication
1. Add your Replit URL to Firebase authorized domains
2. Try Google sign-in (will work after domain is added)
3. Test username/password registration and login (works now)
4. Verify session persistence across page refreshes

### 6. Authentication Routes Available
- `/auth/login` - Username/password login
- `/auth/register` - New user registration  
- `/auth/firebase` - Complete Google sign-in with vehicle info
- Protected routes redirect to login automatically

## What Works Now
- Username/password authentication is fully functional
- User registration with validation
- Session management and logout
- Protected route access

## What Needs Firebase Domain Setup
- Google sign-in button (currently shows domain error)
- Firebase redirect authentication flow

The core authentication system is complete and working. Once you add the authorized domain to Firebase, Google authentication will work seamlessly.