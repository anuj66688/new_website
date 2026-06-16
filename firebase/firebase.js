// ============================================================
//  firebase/firebase.js
//  MainCrafts Technology — Firebase App Initialisation
//  SDK v9 Modular Syntax (CDN — no bundler needed)
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAnalytics }  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

// ── Your Firebase project config ─────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyAlNO0VK5fsyLupsW3rUGsO4Wen0KSzt_c",
  authDomain:        "maincraft-9a7b9.firebaseapp.com",
  projectId:         "maincraft-9a7b9",
  storageBucket:     "maincraft-9a7b9.firebasestorage.app",
  messagingSenderId: "66131104452",
  appId:             "1:66131104452:web:0d2ad68f03f7d87dc8af91",
};

// ── Initialise Firebase ───────────────────────────────────────
const app       = initializeApp(firebaseConfig);
const db        = getFirestore(app);
const analytics = getAnalytics(app);

export { app, db, analytics };
