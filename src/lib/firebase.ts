import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase config object
const firebaseConfig = {
    apiKey: "AIzaSyDPsF-cYlznXAejjWtIvAnHrqHoQN-0RQc",
    authDomain: "bilstop-7c446.firebaseapp.com",
    projectId: "bilstop-7c446",
    storageBucket: "bilstop-7c446.firebasestorage.app",
    messagingSenderId: "110780794754",
    appId: "1:110780794754:web:dd0e74c55a687c8eda319b",
    measurementId: "G-J7E0V6G2L4"
};

// Initialize Firebase (Singleton pattern)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (typeof window !== 'undefined') {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        db = getFirestore(app);
    } catch (error) {
        console.warn("Firebase initialization failed (likely missing params during build):", error);
        app = {} as FirebaseApp;
        auth = {} as Auth;
        db = {} as Firestore;
    }
} else {
    // Mock for build environment if keys are missing
    console.warn("Firebase keys missing, skipping initialization (Build Mode)");
    app = {} as FirebaseApp;
    auth = {} as Auth;
    db = {} as Firestore;
}

const isInitialized = !!(app && app.name); // Real app has a name property

export { auth, db, isInitialized };
