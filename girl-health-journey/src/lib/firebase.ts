import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

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

// Enable persistent auth state across browser sessions and page reloads
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Firebase persistence initialized");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

export { auth };
export default app; 