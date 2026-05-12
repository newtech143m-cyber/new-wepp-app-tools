import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserData {
  credits: number;
  tier: 'free' | 'pro' | 'max';
  email: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  consumeCredit: () => Promise<boolean>;
  trialCount: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [trialCount, setTrialCount] = useState<number>(() => {
    const saved = localStorage.getItem('trialCount');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('trialCount', trialCount.toString());
  }, [trialCount]);

  const ADMIN_EMAIL = 'newtech143m@gmail.com';
  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        
        // Listen for user data changes
        const unsubscribeData = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData);
          } else {
            // New user initialization
            const initialData = {
              email: user.email!,
              credits: 5,
              tier: 'free',
              createdAt: serverTimestamp(),
              totalUsage: 0
            };
            setDoc(userDocRef, initialData).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`));
          }
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          setLoading(false);
        });

        return () => unsubscribeData();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const consumeCredit = async () => {
    // Unlimited for admin
    if (isAdmin) return true; 

    if (!user) {
      // Trial logic for logged out users
      if (trialCount < 2) {
        setTrialCount(prev => prev + 1);
        return true;
      }
      return false;
    }

    if (userData && userData.credits > 0) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          credits: increment(-1),
          totalUsage: increment(1)
        });
        return true;
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
        return false;
      }
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, isAdmin, consumeCredit, trialCount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
