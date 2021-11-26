import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createContext, useContext, useState } from "react";
import { auth, db } from "./firebase";


const AuthContext = createContext({
  currentUser: null,
  signInWighGoogle: () => Promise,
});

export const useAuth = () => useContext(AuthContext);

const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  auth.onAuthStateChanged((user) => {
    setCurrentUser(user);
  });

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    auth.useDeviceLanguage();
    try {
      const result = await signInWithPopup(auth, provider);
      setCurrentUser(result.user);
      try {
        const dbUser = await getDoc(doc(db, "users", result.user.uid));
        if (!dbUser.exists()) {
          // user is new and we need to create their elo score etc
          await setDoc(doc(db, "users", result.user.uid), {
            currentELO: 0,
            lastUpdatedELO: 0,
            username: result.user.displayName
          });
        }
      } catch (e) {
        console.error("Error initializing user in db ", e);
      }
    } catch (error) {
      // TODO: Remove console.log
      console.log("Error signing in user", error);
    }
  }

  const value = { currentUser, signInWithGoogle };
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContextProvider;
