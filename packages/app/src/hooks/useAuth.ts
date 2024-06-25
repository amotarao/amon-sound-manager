import { type User, onAuthStateChanged } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { auth } from "../libs/firebase";

export type UseAuth = {
  loading: boolean;
  user: User | null;
  signedIn: boolean;
};

export const useAuth = (): UseAuth => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const signedIn = useMemo(() => user !== null, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);
      setUser(user);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    loading,
    user,
    signedIn,
  };
};
