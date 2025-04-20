import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { saveToStorage, getFromStorage } from './storage-utils';

const firebaseConfig = {
  apiKey: "AIzaSyAt8O4oL7XvCGZ8wUy41JyeJIMa50hXo-s",
  authDomain: "herhealth-bc7c8.firebaseapp.com",
  projectId: "herhealth-bc7c8",
  storageBucket: "herhealth-bc7c8.firebasestorage.app",
  messagingSenderId: "855945213148",
  appId: "1:855945213148:web:f13467793c85bf49503019",
  measurementId: "G-6C6TZENH2B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Export auth for use throughout the app
export { auth };

// Enable persistent auth state across browser sessions and page reloads
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Firebase persistence initialized");
    
    // Set up listener for auth state changes to sync with localStorage
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // Store basic user info for cross-device retrieval
        const userData = {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          lastLogin: new Date().toISOString()
        };
        
        saveToStorage("user", userData);
        saveToStorage("device_authenticated", true);
      }
    });
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
    
    // Fallback to localStorage-only persistence if Firebase persistence fails
    const storedUser = getFromStorage("user", null);
    if (storedUser) {
      console.log("Using stored user from localStorage as fallback");
    }
  });

// Prevent localStorage from being cleared between sessions
if (typeof window !== 'undefined') {
  // Check if this is a first visit or a refresh
  if (!sessionStorage.getItem('app_initialized')) {
    // Mark that app has been initialized this session
    sessionStorage.setItem('app_initialized', 'true');
    
    // Check if we have user data from a previous session
    const storedUser = getFromStorage("user", null);
    if (storedUser) {
      console.log('Previous user session found');
    }
    
    console.log('App initialized with persistent storage');
  } else {
    console.log('App refreshed with persistent storage maintained');
  }
}

export default app; 