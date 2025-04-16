import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getFromStorage, saveToStorage } from "@/lib/storage-utils";

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
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
      } else {
        // Check localStorage for existing user on mount
        const storedUser = getFromStorage("user", null);
        if (storedUser) {
          setUser(storedUser as unknown as User);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    });
    
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, you would make an API call here
    // For this demo, we'll just simulate a successful login
    
    // Simple validation
    if (!email || !password) {
      return false;
    }

    // Create a mock user (in a real app, this would come from your API)
    const newUser = {
      name: email.split('@')[0], // Simple way to get a name from email
      email,
    };

    // Save to state and localStorage
    setUser(newUser as unknown as User);
    setIsAuthenticated(true);
    saveToStorage("user", newUser);
    
    return true;
  };

  const logout = () => {
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