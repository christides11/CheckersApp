import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { createContext, useContext, useState } from "react";
import { auth } from "./firebase";


const AuthContext = createContext({
  currentUSer: null,
  signInWighGoogle: () => Promise,
});

export const useAuth = () => useContext(AuthContext);

const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurentUser] = useState(null);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    auth.useDeviceLanguage();
    try {
      const result = await signInWithPopup(auth, provider);
      setCurentUser(result.user);
    } catch (error) {
      // TODO: Remove console.log
      console.log(error);
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
