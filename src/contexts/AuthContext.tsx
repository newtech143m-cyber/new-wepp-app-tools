import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  sendPasswordResetEmail, 
  sendEmailVerification,
  signInWithPopup,
  GithubAuthProvider
} from 'firebase/auth';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  increment, 
  serverTimestamp, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

const githubProvider = new GithubAuthProvider();

interface UserData {
  credits: number;
  tier: 'free' | 'pro' | 'max';
  email: string;
  username: string;
  createdAt?: any;
  lastReset?: any;
  totalUsage?: number;
}

interface GenerationRecord {
  id: string;
  toolId: string;
  timestamp: any;
  result?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  consumeCredit: (toolId: string, result?: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  trialCount: number;
  generations: GenerationRecord[];
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

  const [generations, setGenerations] = useState<GenerationRecord[]>([]);

  useEffect(() => {
    localStorage.setItem('trialCount', trialCount.toString());
  }, [trialCount]);

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const verifyEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithGithub = async () => {
    await signInWithPopup(auth, githubProvider);
  };

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
            setLoading(false);
          } else {
            // New user initialization
            const initialData = {
              email: user.email || '',
              username: user.displayName || user.email?.split('@')[0] || 'User',
              credits: 5,
              tier: 'free',
              createdAt: serverTimestamp(),
              lastReset: serverTimestamp(),
              totalUsage: 0
            };
            
            setDoc(userDocRef, initialData)
              .catch(e => {
                handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
              });
          }
        });

        // Listen for generations (history)
        const generationsQuery = query(
          collection(db, 'generations'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(10)
        );

        const unsubscribeGenerations = onSnapshot(generationsQuery, (snapshot) => {
          const docs = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data(),
            timestamp: d.data().createdAt
          })) as GenerationRecord[];
          setGenerations(docs);
        });

        return () => {
          unsubscribeData();
          unsubscribeGenerations();
        };
      } else {
        setUserData(null);
        setGenerations([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const consumeCredit = async (toolId: string, result?: string) => {
    // Log the generation regardless
    if (user) {
      await addDoc(collection(db, 'generations'), {
        userId: user.uid,
        toolId,
        result: result || '',
        createdAt: serverTimestamp()
      });
    }
    return true;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      loading, 
      isAdmin, 
      consumeCredit, 
      resetPassword, 
      verifyEmail, 
      signInWithGoogle, 
      signInWithGithub,
      trialCount,
      generations
    }}>
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
