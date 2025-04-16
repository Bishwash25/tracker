import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut, setPersistence, browserLocalPersistence, onAuthStateChanged } from "firebase/auth";

export default function AuthForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check for existing user data when component mounts
  useEffect(() => {
    // First set up auth persistence
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log("Firebase persistence enabled");
      })
      .catch((error) => {
        console.error("Error setting persistence:", error);
      });
    
    // Then check if user is already authenticated
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is already signed in
        console.log("User already signed in:", user.email);
        
        // Ensure user data exists in localStorage
        const userData = {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        };
        
        // Save to multiple storage methods to ensure persistence
        saveUserDataToAllStorages(userData);
        
        // Navigate to the appropriate screen
        const hasAcceptedTerms = localStorage.getItem('termsAccepted') === 'true';
        if (hasAcceptedTerms) {
          navigate("/tracking-choice");
        } else {
          navigate("/terms");
        }
      }
      
      setIsCheckingAuth(false);
    });
    
    return () => unsubscribe();
  }, [navigate]);

  const saveUserDataToAllStorages = (userData) => {
    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    
    try {
      // Also save to sessionStorage as backup
      sessionStorage.setItem('user', JSON.stringify(userData));
      
      // Set a cookie that works across same-domain origins (different ports)
      document.cookie = `userData=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=2592000; SameSite=Lax`;
      
      // Set a flag to indicate this device has been authenticated
      localStorage.setItem('device_authenticated', 'true');
    } catch (error) {
      console.error("Error saving user data to multiple storages:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        // Force account selection even if one account is available
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if the email domain is .com
      if (!user.email || !user.email.endsWith('.com')) {
        // Sign out the user as we don't allow non-.com domains
        await signOut(auth);
        
        toast({
          title: "Registration failed",
          description: "Only .com domain emails are allowed to register.",
          variant: "destructive",
        });
        return;
      }
      
      // Store user data in all available storages for redundancy
      const userData = {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      };
      saveUserDataToAllStorages(userData);
      
      toast({
        title: "Login successful",
        description: "Welcome to Her Health!",
      });
      
      // Check if user has already accepted terms
      const hasAcceptedTerms = localStorage.getItem('termsAccepted') === 'true';
      if (hasAcceptedTerms) {
        navigate("/tracking-choice");
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
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Remove only authentication data but keep tracking data
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      document.cookie = "userData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      localStorage.removeItem('device_authenticated');
      
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

  // Don't render the sign-in UI if we're still checking authentication
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
          Track your health journey with confidence
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
        >
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
        </Button>
      </motion.div>
      
      {/* Footer with copyright and Instagram logo */}
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
