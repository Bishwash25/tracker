import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { getFromStorage, saveToStorage } from "@/lib/storage-utils";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
});

// Custom event for notifying components about successful auth
export const USER_AUTHENTICATED_EVENT = "user_authenticated";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to fetch user data from Firestore
  const fetchUserDataFromFirestore = async (userId: string) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        console.log("Found user data in Firestore:", userId);
        
        // Dispatch custom event to notify components that user data is available
        const event = new CustomEvent(USER_AUTHENTICATED_EVENT, { 
          detail: { 
            userId,
            hasFirestoreData: true
          } 
        });
        window.dispatchEvent(event);
        
        return true;
      } else {
        console.log("No user document found in Firestore for:", userId);
        return false;
      }
    } catch (error) {
      console.error("Error fetching user data from Firestore:", error);
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
      }
    });
    
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, you would make an API call here
    // For this demo, we'll just simulate a successful login
    
    try {
      // Simple validation
      if (!email || !password) {
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
      
      return true;
    } catch (error) {
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
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default useAuth; 