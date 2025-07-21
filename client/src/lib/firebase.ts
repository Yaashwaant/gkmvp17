import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult, signOut, onAuthStateChanged, User } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC0zznZ-puvNPQJEtBi2iP09nphzySlI38",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "greenkarma-f0739"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "greenkarma-f0739",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "greenkarma-f0739"}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1037347999472:web:6fc1d8a3ac8db0c5603c35",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Auth functions
export const signInWithGoogle = () => {
  return signInWithRedirect(auth, googleProvider);
};

export const handleGoogleRedirect = () => {
  return getRedirectResult(auth);
};

export const logoutUser = () => {
  return signOut(auth);
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Check if Firebase is configured
export const isFirebaseConfigured = () => {
  const hasConfig = !!(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID
  );
  
  console.log('Firebase config check:', {
    hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
    hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
    hasAppId: !!import.meta.env.VITE_FIREBASE_APP_ID,
    configured: hasConfig
  });
  
  return hasConfig;
};