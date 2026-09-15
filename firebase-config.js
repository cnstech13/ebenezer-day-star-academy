// ============================================================
// FIREBASE CONFIGURATION — Ebenezer Day Star Academy
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyDbjBx6m3ZzCpxYtNHyua7mda1agjvVFWo",
  authDomain: "ebenezer-day-star-academy.firebaseapp.com",
  projectId: "ebenezer-day-star-academy",
  storageBucket: "ebenezer-day-star-academy.firebasestorage.app",
  messagingSenderId: "708085701563",
  appId: "1:708085701563:web:2180231f5334d7aafe029e",
  measurementId: "G-NSZ2NMDYVQ"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
