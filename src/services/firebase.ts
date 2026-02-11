

import { initializeApp } from '@firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from '@firebase/auth';
import { getFirestore, serverTimestamp, deleteField } from '@firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCK4qfKKhCisTzhQ-hW3mbnWKff_5KIBNI",
  authDomain: "curriculosql.firebaseapp.com",
  projectId: "curriculosql",
  storageBucket: "curriculosql.appspot.com",
  messagingSenderId: "44367782607",
  appId: "1:44367782607:web:7928b0a1f07ecbfbef8dba",
  measurementId: "G-ZJQBSZ86JK"
};

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