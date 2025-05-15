import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { getFromStorage, saveToStorage } from "@/lib/storage-utils";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loadingUserData: boolean; // Add loading state to context
  profileLoaded: boolean; // New: true if user profile (Firestore) has been loaded
  isNewUser: boolean | null; // New: null=unknown, true=new, false=existing
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  loadingUserData: false,
  profileLoaded: false,
  isNewUser: null,
});

// Custom event for notifying components about successful auth
export const USER_AUTHENTICATED_EVENT = "user_authenticated";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(false); // Add loading state
  const [profileLoaded, setProfileLoaded] = useState(false); // New
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null); // New

  // Function to fetch user data from Firestore and sync to localStorage
  const fetchUserDataFromFirestore = async (userId: string) => {
    setLoadingUserData(true); // Start loading
    setProfileLoaded(false); // Reset profileLoaded
    const start = Date.now();
    try {
      console.log("Fetching user data from Firestore for:", userId);
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        console.log("Found user data in Firestore:", userId);
        const firestoreData = userDoc.data();
        
        // Get existing user data from localStorage
        const existingUserData = getFromStorage("user", null);
        
        // Merge Firestore data with existing user data
        const mergedUserData = {
          ...existingUserData,
          ...firestoreData,
          uid: userId, // Ensure UID is always set correctly
          lastSynced: new Date().toISOString()
        };
        
        // Save merged data back to localStorage
        saveToStorage("user", mergedUserData);
        console.log("Synced Firestore data to localStorage", mergedUserData);
        
        // Fetch additional user-specific collections
        await syncUserCollections(userId);
        
        // New: check for onboarding/profile flag
        const completed = Boolean(firestoreData.profileCompleted || firestoreData.periodStartDate || localStorage.getItem("periodStartDate"));
        setIsNewUser(!completed);
        setProfileLoaded(true);

        // Dispatch custom event to notify components that user data is available
        const event = new CustomEvent(USER_AUTHENTICATED_EVENT, { 
          detail: { 
            userId,
            hasFirestoreData: true
          } 
        });
        window.dispatchEvent(event);
        
        // Ensure loading spinner is visible for at least 500ms, max 1s
        const elapsed = Date.now() - start;
        await new Promise(res => setTimeout(res, Math.max(500 - elapsed, 0)));
        setLoadingUserData(false);
        return true;
      } else {
        // No user doc: treat as new user
        setIsNewUser(true);
        setProfileLoaded(true);
        setLoadingUserData(false);
        console.log("No user document found in Firestore for:", userId);
        return false;
      }
    } catch (error) {
      setIsNewUser(null);
      setProfileLoaded(true);
      setLoadingUserData(false);
      console.error("Error fetching user data from Firestore:", error);
      return false;
    }
  };
  
  // Function to sync user collections from Firestore to localStorage
  const syncUserCollections = async (userId: string) => {
    try {
      // Sync period data
      const periodDataRef = doc(db, "users", userId, "periodData", "current");
      const periodDoc = await getDoc(periodDataRef);
      if (periodDoc.exists()) {
        const periodData = periodDoc.data();
        if (periodData.periodStartDate) {
          localStorage.setItem("periodStartDate", periodData.periodStartDate);
        }
        if (periodData.periodEndDate) {
          localStorage.setItem("periodEndDate", periodData.periodEndDate);
        }
        if (periodData.cycleLength) {
          localStorage.setItem("cycleLength", periodData.cycleLength.toString());
        }
        if (periodData.periodLength) {
          localStorage.setItem("periodLength", periodData.periodLength.toString());
        }
        console.log("Synced period data from Firestore to localStorage");
      }

      // Sync period history
      const historyRef = collection(db, "users", userId, "periodHistory");
      const historySnapshot = await getDocs(historyRef);
      if (!historySnapshot.empty) {
        const historyData = historySnapshot.docs.map(doc => doc.data());
        localStorage.setItem("periodHistory", JSON.stringify(historyData));
        console.log("Synced period history from Firestore to localStorage");
      }

      // Sync mood records
      const moodsRef = collection(db, "users", userId, "moods");
      const moodsSnapshot = await getDocs(moodsRef);
      if (!moodsSnapshot.empty) {
        const moodRecords = moodsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        localStorage.setItem("moodTrackingComprehensive", JSON.stringify(moodRecords));
        console.log("Synced mood records from Firestore to localStorage");
      }

      // Sync flow records
      const flowRef = collection(db, "users", userId, "periodFlow");
      const flowSnapshot = await getDocs(flowRef);
      if (!flowSnapshot.empty) {
        const flowRecords = flowSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        localStorage.setItem("periodFlowTracking", JSON.stringify(flowRecords));
        console.log("Synced flow records from Firestore to localStorage");
      }

      // Sync weight records
      const weightRef = collection(db, "users", userId, "periodWeight");
      const weightSnapshot = await getDocs(weightRef);
      if (!weightSnapshot.empty) {
        const weightRecords = weightSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        localStorage.setItem("periodWeightRecords", JSON.stringify(weightRecords));
        console.log("Synced weight records from Firestore to localStorage");
      }

      return true;
    } catch (error) {
      console.error("Error syncing user collections:", error);
      return false;
    }
  };

  useEffect(() => {
    // Check localStorage for existing user on mount first
    const storedUser = getFromStorage("user", null);
    if (storedUser) {
      setUser(storedUser as unknown as User);
      setIsAuthenticated(true);
      
      // If we have a user from localStorage, try to fetch their Firestore data
      if (storedUser.uid) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fetchUserDataFromFirestore(storedUser.uid)
          .then(success => {
            if (success) {
              console.log("Successfully retrieved user data from Firestore on init");
            }
          });
      }
    }

    // Set up Firebase Auth state listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAuthenticated(true);
        
        // Store the user in localStorage for persistence
        const userData = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL
        };
        saveToStorage("user", userData);
        
        // When a user authenticates, fetch their data from Firestore
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fetchUserDataFromFirestore(firebaseUser.uid)
          .then(success => {
            if (success) {
              console.log("Successfully retrieved user data from Firestore on auth state change");
            }
          });
      } else if (!storedUser) {
        // Only clear if we don't have a stored user
        setUser(null);
        setIsAuthenticated(false);
        setProfileLoaded(false);
        setIsNewUser(null);
      }
    });
    
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoadingUserData(true); // Start loading
    const start = Date.now();
    try {
      // Simple validation
      if (!email || !password) {
        setLoadingUserData(false);
        return false;
      }

      // Attempt to sign in with Firebase auth
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Firebase auth state listener will handle the rest
        
        // If login is successful, try to fetch user data from Firestore
        if (userCredential.user && userCredential.user.uid) {
          await fetchUserDataFromFirestore(userCredential.user.uid);
        }
        
        // Ensure loading spinner is visible for at least 500ms, max 1s
        const elapsed = Date.now() - start;
        await new Promise(res => setTimeout(res, Math.max(500 - elapsed, 0)));
        setLoadingUserData(false);
        return true;
      } catch (error) {
        console.error("Firebase auth error:", error);
        // Fallback to mock user if Firebase auth fails
      }

      // Create a mock user (in a real app, this would come from your API)
      const newUser = {
        uid: `user-${Date.now()}`,
        name: email.split('@')[0], // Simple way to get a name from email
        email,
        photoURL: null,
      };

      // Save to state and localStorage
      setUser(newUser as unknown as User);
      setIsAuthenticated(true);
      saveToStorage("user", newUser);
      
      // Ensure loading spinner is visible for at least 500ms, max 1s
      const elapsed = Date.now() - start;
      await new Promise(res => setTimeout(res, Math.max(500 - elapsed, 0)));
      setLoadingUserData(false);
      return true;
    } catch (error) {
      setLoadingUserData(false);
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    // Sign out from Firebase auth
    auth.signOut().catch(error => {
      console.error("Error signing out:", error);
    });

    // Don't actually remove the user data from localStorage
    // This way, the user's tracking data will be preserved
    
    // Just update the authentication state
    setUser(null);
    setIsAuthenticated(false);
    setProfileLoaded(false);
    setIsNewUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loadingUserData, profileLoaded, isNewUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);