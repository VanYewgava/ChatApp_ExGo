import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, collection, addDoc, serverTimestamp, 
  query, orderBy, onSnapshot 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCuMIWmYqMzvSQx4m1WUaG8vMPAMgB4FWg",
  authDomain: "chatapp-f24e8.firebaseapp.com",
  projectId: "chatapp-f24e8",
  storageBucket: "chatapp-f24e8.firebasestorage.app",
  messagingSenderId: "775347054796",
  appId: "1:775347054796:web:9a0947ca74985a8947ba69",
  measurementId: "G-R7F64EHGTT"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const messagesCollection = collection(db, "messages");

export { 
  auth, db, messagesCollection, 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged,
  addDoc, serverTimestamp, query, orderBy, onSnapshot 
};