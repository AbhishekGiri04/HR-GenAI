// Firebase client configuration
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAxRcIstVk5L8m2plxxhA5j9U9H_aHQl9s",
  authDomain: "hrgenai.firebaseapp.com",
  projectId: "hrgenai",
  storageBucket: "hrgenai.firebasestorage.app",
  messagingSenderId: "851589665032",
  appId: "1:851589665032:web:1c32240f8ea49913025cbd",
  measurementId: "G-BL76DFP620"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;