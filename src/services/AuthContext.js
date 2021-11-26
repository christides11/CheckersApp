import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { auth, db } from "./firebase";


const AuthContext = createContext({
  currentUser: null,
  signInWighGoogle: () => Promise,
});

export const useAuth = () => useContext(AuthContext);

const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const setGlobalUser =
    useCallback(async (user) => {
      let userObj = { authData: user };
      try {
        const dbUser = await getDoc(doc(db, "users", userObj.authData.uid));
        if (!dbUser.exists()) {
          // user is new and we need to create their elo score etc
          const newUserData = {
            currentELO: 0,
            lastUpdatedELO: 0,
            username: userObj.authData.displayName
          };
          await setDoc(doc(db, "users", userObj.authData.uid), newUserData);
          userObj = {
            ...newUserData,
            ...userObj
          };
        } else {
          userObj = {
            ...dbUser.data(),
            ...userObj
          };
        }
        setCurrentUser(userObj);
      } catch (e) {
        console.error("Error initializing user in db ", e);
      }
    });

  // empty dependency list is intentional as this should only be defined once 
  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      await setGlobalUser(user);
    });
  }, []);


  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    auth.useDeviceLanguage();
    try {
      const result = await signInWithPopup(auth, provider);
      await setGlobalUser(result.user);
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
