

import { initializeApp } from '@firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from '@firebase/auth';
import { getFirestore, serverTimestamp, deleteField } from '@firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

if (!firebaseConfig.apiKey) {
  throw new Error("Firebase configuration is missing. Make sure you have set the VITE_FIREBASE_* environment variables.");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services and export them
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
// Request permission to create files in the user's Google Drive.
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

const signOut = () => firebaseSignOut(auth);

export { auth, db, signInWithGoogle, signOut, deleteField, serverTimestamp };