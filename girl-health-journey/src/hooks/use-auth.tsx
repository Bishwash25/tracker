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
  loadingUserData: boolean;
  profileLoaded: boolean;
  isNewUser: boolean | null;
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

export const USER_AUTHENTICATED_EVENT = "user_authenticated";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const fetchUserDataFromFirestore = async (userId: string) => {
    setLoadingUserData(true);
    setProfileLoaded(false);
    const start = Date.now();
    try {
      console.log("Fetching user data from Firestore for:", userId);
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        console.log("Found user data in Firestore:", userId);
        const firestoreData = userDoc.data();

        const existingUserData = getFromStorage("user", null);

        const mergedUserData = {
          ...existingUserData,
          ...firestoreData,
          uid: userId,
          lastSynced: new Date().toISOString(),
        };

        saveToStorage("user", mergedUserData);
        console.log("Synced Firestore data to localStorage", mergedUserData);

        await syncUserCollections(userId);

        const completed = Boolean(
          firestoreData.profileCompleted ||
            firestoreData.periodStartDate ||
            localStorage.getItem("periodStartDate")
        );
        setIsNewUser(!completed);
        setProfileLoaded(true);

        const event = new CustomEvent(USER_AUTHENTICATED_EVENT, {
          detail: {
            userId,
            hasFirestoreData: true,
          },
        });
        window.dispatchEvent(event);

        const elapsed = Date.now() - start;
        await new Promise((res) => setTimeout(res, Math.max(500 - elapsed, 0)));
        setLoadingUserData(false);
        return true;
      } else {
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

  const syncUserCollections = async (userId: string) => {
    try {
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

      const historyRef = collection(db, "users", userId, "periodHistory");
      const historySnapshot = await getDocs(historyRef);
      if (!historySnapshot.empty) {
        const historyData = historySnapshot.docs.map((doc) => doc.data());
        localStorage.setItem("periodHistory", JSON.stringify(historyData));
        console.log("Synced period history from Firestore to localStorage");
      }

      const moodsRef = collection(db, "users", userId, "moods");
      const moodsSnapshot = await getDocs(moodsRef);
      if (!moodsSnapshot.empty) {
        const moodRecords = moodsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        localStorage.setItem(
          "moodTrackingComprehensive",
          JSON.stringify(moodRecords)
        );
        console.log("Synced mood records from Firestore to localStorage");
      }

      const flowRef = collection(db, "users", userId, "periodFlow");
      const flowSnapshot = await getDocs(flowRef);
      if (!flowSnapshot.empty) {
        const flowRecords = flowSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        localStorage.setItem(
          "periodFlowTracking",
          JSON.stringify(flowRecords)
        );
        console.log("Synced flow records from Firestore to localStorage");
      }

      const weightRef = collection(db, "users", userId, "periodWeight");
      const weightSnapshot = await getDocs(weightRef);
      if (!weightSnapshot.empty) {
        const weightRecords = weightSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        localStorage.setItem(
          "periodWeightRecords",
          JSON.stringify(weightRecords)
        );
        console.log("Synced weight records from Firestore to localStorage");
      }

      return true;
    } catch (error) {
      console.error("Error syncing user collections:", error);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAuthenticated(true);

        const userData = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        };
        saveToStorage("user", userData);

        fetchUserDataFromFirestore(firebaseUser.uid).then((success) => {
          if (success) {
            console.log(
              "Successfully retrieved user data from Firestore on auth state change"
            );
          }
        });
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setProfileLoaded(false);
        setIsNewUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoadingUserData(true);
    const start = Date.now();
    try {
      if (!email || !password) {
        setLoadingUserData(false);
        return false;
      }

      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        if (userCredential.user && userCredential.user.uid) {
          await fetchUserDataFromFirestore(userCredential.user.uid);
        }

        const elapsed = Date.now() - start;
        await new Promise((res) => setTimeout(res, Math.max(500 - elapsed, 0)));
        setLoadingUserData(false);
        return true;
      } catch (error) {
        console.error("Firebase auth error:", error);
      }

      const newUser = {
        uid: `user-${Date.now()}`,
        name: email.split("@")[0],
        email,
        photoURL: null,
      };

      setUser(newUser as unknown as User);
      setIsAuthenticated(true);
      saveToStorage("user", newUser);

      const elapsed = Date.now() - start;
      await new Promise((res) => setTimeout(res, Math.max(500 - elapsed, 0)));
      setLoadingUserData(false);
      return true;
    } catch (error) {
      setLoadingUserData(false);
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    auth.signOut().catch((error) => {
      console.error("Error signing out:", error);
    });

    setUser(null);
    setIsAuthenticated(false);
    setProfileLoaded(false);
    setIsNewUser(null);
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        loadingUserData,
        profileLoaded,
        isNewUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);