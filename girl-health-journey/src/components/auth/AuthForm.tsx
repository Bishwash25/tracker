import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  User
} from "firebase/auth";

import { doc, setDoc } from "firebase/firestore";
// 
interface UserData {
  name: string | null;
  email: string | null;
  photoURL: string | null;
  uid: string;
}

export default function AuthForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Only setup persistence but don't automatically redirect users
    const setupAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        console.log("Firebase persistence enabled");
        
        // Always sign out existing users to force them to log in again
        if (auth.currentUser) {
          console.log("Signing out existing user to enforce login");
          await signOut(auth);
        }
        
      } catch (error) {
        console.error("Error setting persistence:", error);
      }
      
      // Simply mark auth check as complete without auto-redirecting
      setIsCheckingAuth(false);
      
      // Return a dummy function for cleanup
      return () => {};
    };

    const cleanupPromise = setupAuth();
    return () => {
      cleanupPromise.then(cleanup => {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      }).catch(err => {
        console.error("Error in auth cleanup:", err);
      });
    };
  }, [navigate]);

  const saveUserDataToAllStorages = (userData: UserData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    try {
      sessionStorage.setItem("user", JSON.stringify(userData));
      document.cookie = `userData=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=2592000; SameSite=Lax`;
      localStorage.setItem("device_authenticated", "true");
    } catch (error) {
      console.error("Error saving user data to multiple storages:", error);
    }
  };

  const saveUserToFirestore = async (user: User) => {
    if (!user?.uid) return;

    const userRef = doc(db, "users", user.uid);

    try {
      await setDoc(userRef, {
        name: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }, { merge: true });

      console.log("User saved to Firestore");
    } catch (error) {
      console.error("Error saving user to Firestore:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoggingIn(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email) {
        await signOut(auth);
        toast({
          title: "Login failed",
          description: "Failed to get email from Google account.",
          variant: "destructive",
        });
        return;
      }

      const userData: UserData = {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid
      };

      saveUserDataToAllStorages(userData);
      await saveUserToFirestore(user);

      toast({
        title: "Login successful",
        description: "Welcome to Her Health!",
      });

      const hasAcceptedTerms = localStorage.getItem("termsAccepted") === "true";
      if (hasAcceptedTerms) {
        // If user has period data, go directly to period dashboard
        if (localStorage.getItem("periodStartDate")) {
          navigate("/period-dashboard");
        } else {
          navigate("/period-start");
        }
      } else {
        navigate("/terms");
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast({
        title: "Sign-in failed",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      document.cookie = "userData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      localStorage.removeItem("device_authenticated");

      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      });
    } catch (error: any) {
      console.error("Sign-out error:", error);
      toast({
        title: "Sign-out failed",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-pulse text-purple-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-lavender mb-2">
          Welcome to Her Health
        </h1>
        <p className="text-muted-foreground">
          Sign in to track your health journey
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center"
      >
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2 py-6"
          onClick={handleGoogleSignIn}
          disabled={isLoggingIn}
        >
          {!isLoggingIn ? (
            <>
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </>
          ) : (
            "Signing in..."
          )}
        </Button>
      </motion.div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          By signing in, you agree to our <a href="#" className="text-lavender hover:underline">Privacy Policy</a> and <a href="#" className="text-lavender hover:underline">Terms of Service</a>.
        </p>
      </div>

      <footer className="mt-24 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-xs text-purple-600">
            &copy; {new Date().getFullYear()} Her Health. All rights reserved.
          </p>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800 transition-colors"
            aria-label="Instagram"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
