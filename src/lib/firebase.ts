import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId,
);

// Keep public pages available if a host has not been configured yet. Firebase
// operations are then disabled by the callers instead of crashing the entire
// React application during module initialisation.
const fallbackConfig = {
  apiKey: "deployment-configuration-required",
  authDomain: "deployment-configuration-required.firebaseapp.com",
  projectId: "deployment-configuration-required",
  storageBucket: "deployment-configuration-required.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:deployment-configuration-required",
};

const app = getApps().length ? getApp() : initializeApp(isFirebaseConfigured ? firebaseConfig : fallbackConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
