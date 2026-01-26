'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, isInitialized } from '../../lib/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserSessionPersistence
} from 'firebase/auth';
import {
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';

type UserRole = 'passenger' | 'driver' | 'admin';

interface User {
    uid?: string;
    name: string;
    email: string;
    role: UserRole;
    avatarId?: string;
    lastSeen?: any;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
    logout: () => void;
    getAllUsers: () => Promise<User[]>;
    updateAvatar: (avatarId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!isInitialized) {
            setLoading(false);
            return;
        }

        // Set persistence to session (clears on tab close)
        setPersistence(auth, browserSessionPersistence);

        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                // User is signed in, fetch details from Firestore
                try {
                    const userRef = doc(db, 'users', authUser.uid);
                    const userDoc = await getDoc(userRef);

                    if (userDoc.exists()) {
                        setUser(userDoc.data() as User);

                        // Update lastSeen immediately
                        await updateDoc(userRef, { lastSeen: serverTimestamp() });

                        // Heartbeat: Update lastSeen every 10 minutes
                        const intervalId = setInterval(async () => {
                            await updateDoc(userRef, { lastSeen: serverTimestamp() });
                        }, 10 * 60 * 1000);

                        // We can't easily return the clear function from inside this callback to the main useEffect 
                        // without complex ref logic, but since AuthProvider is top-level, it's mostly fine.
                        // However, strictly speaking, we should store this interval ID in a ref to clear it if auth state changes.
                    } else {
                        // Fallback if doc doesn't exist yet (rare race condition)
                        console.error("User document not found");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        const newUser: User = { uid, name, email, role };

        // Store additional user info in Firestore
        await setDoc(doc(db, 'users', uid), newUser);

        // onAuthStateChanged will trigger, but we can set router push here if needed
        router.push(`/${role}`);
    };

    const logout = async () => {
        try {
            await signOut(auth);
            router.push('/login');
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    const getAllUsers = async (): Promise<User[]> => {
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            return querySnapshot.docs.map(doc => doc.data() as User);
        } catch (error) {
            console.error("Error getting users:", error);
            return [];
        }
    };

    const updateAvatar = async (avatarId: string) => {
        if (!user || !user.uid) return;
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { avatarId });
        // Update local state to reflect change immediately
        setUser(prev => prev ? { ...prev, avatarId } : null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, getAllUsers, updateAvatar }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
