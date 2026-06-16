// ============================================================
//  firebase/services/authService.js
//  MainCrafts Technology — Firebase Authentication Service
//  Handles: register, login, Google sign-in, logout, auth state
// ============================================================

import { auth } from "../firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ── Google Provider ───────────────────────────────────────────
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// ── Validation ────────────────────────────────────────────────
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validateRegister({ name, email, password, confirm }) {
  const errors = [];
  if (!name || name.trim().length < 2)
    errors.push("Full name must be at least 2 characters.");
  if (!email || !isValidEmail(email))
    errors.push("A valid email address is required.");
  if (!password || password.length < 6)
    errors.push("Password must be at least 6 characters.");
  if (password !== confirm)
    errors.push("Passwords do not match.");
  return { valid: errors.length === 0, errors };
}

function validateLogin({ email, password }) {
  const errors = [];
  if (!email || !isValidEmail(email))
    errors.push("A valid email address is required.");
  if (!password || password.length < 1)
    errors.push("Password is required.");
  return { valid: errors.length === 0, errors };
}

// ── Firebase error → human-readable message ───────────────────
function parseFirebaseError(code) {
  const map = {
    "auth/email-already-in-use":    "This email is already registered. Try logging in.",
    "auth/invalid-email":           "The email address is not valid.",
    "auth/weak-password":           "Password is too weak. Use at least 6 characters.",
    "auth/user-not-found":          "No account found with this email.",
    "auth/wrong-password":          "Incorrect password. Please try again.",
    "auth/too-many-requests":       "Too many failed attempts. Please wait a moment.",
    "auth/network-request-failed":  "Network error. Check your connection.",
    "auth/popup-closed-by-user":    "Sign-in popup was closed. Please try again.",
    "auth/cancelled-popup-request": "Only one popup can be open at a time.",
    "auth/invalid-credential":      "Incorrect email or password. Please try again.",
  };
  return map[code] || "An unexpected error occurred. Please try again.";
}

// ── Register with Email & Password ────────────────────────────
/**
 * @param {{ name: string, email: string, password: string, confirm: string }} data
 * @returns {Promise<{ success: boolean, user?: object, errors?: string[], error?: string }>}
 */
export async function registerUser({ name, email, password, confirm }) {
  const { valid, errors } = validateRegister({ name, email, password, confirm });
  if (!valid) return { success: false, errors };

  try {
    const credential = await createUserWithEmailAndPassword(
      auth, email.trim(), password
    );
    // Set display name
    await updateProfile(credential.user, { displayName: name.trim() });
    console.info("[AuthService] User registered:", credential.user.uid);
    return { success: true, user: credential.user };
  } catch (err) {
    console.error("[AuthService] Register failed:", err);
    return { success: false, error: parseFirebaseError(err.code) };
  }
}

// ── Login with Email & Password ───────────────────────────────
/**
 * @param {{ email: string, password: string }} data
 * @returns {Promise<{ success: boolean, user?: object, errors?: string[], error?: string }>}
 */
export async function loginUser({ email, password }) {
  const { valid, errors } = validateLogin({ email, password });
  if (!valid) return { success: false, errors };

  try {
    const credential = await signInWithEmailAndPassword(
      auth, email.trim(), password
    );
    console.info("[AuthService] User logged in:", credential.user.uid);
    return { success: true, user: credential.user };
  } catch (err) {
    console.error("[AuthService] Login failed:", err);
    return { success: false, error: parseFirebaseError(err.code) };
  }
}

// ── Google Sign-In ────────────────────────────────────────────
/**
 * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
 */
export async function googleSignIn() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.info("[AuthService] Google sign-in:", result.user.uid);
    return { success: true, user: result.user };
  } catch (err) {
    console.error("[AuthService] Google sign-in failed:", err);
    return { success: false, error: parseFirebaseError(err.code) };
  }
}

// ── Logout ────────────────────────────────────────────────────
/**
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function logoutUser() {
  try {
    await signOut(auth);
    console.info("[AuthService] User signed out.");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── Password Reset ────────────────────────────────────────────
/**
 * @param {string} email
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function resetPassword(email) {
  if (!email || !isValidEmail(email))
    return { success: false, error: "Please enter a valid email address." };
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return { success: true };
  } catch (err) {
    return { success: false, error: parseFirebaseError(err.code) };
  }
}

// ── Auth State Observer ───────────────────────────────────────
/**
 * Subscribe to authentication state changes.
 * @param {(user: object|null) => void} callback
 * @returns {function} unsubscribe function
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// ── Get Current User ──────────────────────────────────────────
export function getCurrentUser() {
  return auth.currentUser;
}
