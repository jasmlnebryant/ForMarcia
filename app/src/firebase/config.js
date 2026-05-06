// Firebase configuration for ForMarcia
// Note: Firebase web API keys are safe to commit — security is handled
// by Firestore rules, not by keeping this key secret.

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBV5CEQupe_r6KPt6BA6wtge_6kSwwW96o",
  authDomain: "formarcia.firebaseapp.com",
  projectId: "formarcia",
  storageBucket: "formarcia.firebasestorage.app",
  messagingSenderId: "864531778593",
  appId: "1:864531778593:web:4560247750f650125e2760",
  measurementId: "G-QN28JC63S0",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
