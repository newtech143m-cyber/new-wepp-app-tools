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
    stack: error instanceof Error ? error.stack : undefined,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      providerData: auth.currentUser?.providerData.map(p => ({ providerId: p.providerId, email: p.email }))
    },
    operationType,
    path
  };
  console.group('Firestore Error Details');
  console.error('Message:', errInfo.error);
  console.error('Operation:', errInfo.operationType);
  console.error('Path:', errInfo.path);
  console.debug('Full Metadata:', JSON.stringify(errInfo, null, 2));
  console.groupEnd();
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
    if (isAdmin) return true; 

    if (!user) {
      if (trialCount < 2) {
        setTrialCount(prev => prev + 1);
        return true;
      }
      return false;
    }

    // Give new users a moment to initialize or handle missing doc
    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      // If we don't have userData yet, it might be a newly logged in user
      // We can try to get the doc directly or wait for the snapshot
      if (userData) {
        if (userData.credits > 0) {
          await updateDoc(userDocRef, {
            credits: increment(-1),
            totalUsage: increment(1)
          });
          return true;
        }
      } else {
        // Fallback for extremely quick first actions
        // This is rare but possible. We allow it if the create/onSnapshot loop is still running
        // Or we can just wait 500ms
        await new Promise(resolve => setTimeout(resolve, 500));
        if (userData && userData.credits > 0) {
          await updateDoc(userDocRef, {
            credits: increment(-1),
            totalUsage: increment(1)
          });
          return true;
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
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
