// ============================================================
//  firebase/services/newsletterService.js
//  MainCrafts Technology — Newsletter Subscription Service
//  Saves subscriber to Firestore "newsletter_subscribers" collection
// ============================================================

import { db } from "../firebase.js";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── Validation ────────────────────────────────────────────────

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validateSubscriberData({ email, name = "" }) {
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push("A valid email address is required.");
  }

  return { valid: errors.length === 0, errors };
}

// ── Duplicate check ───────────────────────────────────────────

/**
 * Returns true if the email already exists in the subscribers collection.
 * @param {string} email
 * @returns {Promise<boolean>}
 */
async function isAlreadySubscribed(email) {
  try {
    const q = query(
      collection(db, "newsletter_subscribers"),
      where("email", "==", email.trim().toLowerCase())
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch {
    return false; // Let the write attempt and Firestore rules handle it
  }
}

// ── Service function ──────────────────────────────────────────

/**
 * Subscribe an email address to the newsletter.
 *
 * @param {{ email: string, name?: string }} subscriberData
 * @returns {Promise<{ success: boolean, id?: string, alreadySubscribed?: boolean, errors?: string[], error?: string }>}
 *
 * @example
 *   const result = await subscribeNewsletter({ email });
 *   if (result.success) { showThankYouMessage(); }
 */
export async function subscribeNewsletter({ email, name = "" }) {
  // 1. Validate
  const { valid, errors } = validateSubscriberData({ email, name });
  if (!valid) {
    return { success: false, errors };
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 2. Duplicate check
  const duplicate = await isAlreadySubscribed(normalizedEmail);
  if (duplicate) {
    return {
      success: false,
      alreadySubscribed: true,
      errors: ["This email is already subscribed."],
    };
  }

  // 3. Build document payload
  const subscriberDoc = {
    email:        normalizedEmail,
    name:         name.trim(),
    subscribedAt: serverTimestamp(),
    source:       "landing_page",
    status:       "active",       // active | unsubscribed
    preferences: {
      marketing: true,
      updates:   true,
      news:      true,
    },
  };

  // 4. Save to Firestore
  try {
    const docRef = await addDoc(
      collection(db, "newsletter_subscribers"),
      subscriberDoc
    );
    console.info("[NewsletterService] Subscriber saved — ID:", docRef.id);
    return { success: true, id: docRef.id };
  } catch (err) {
    console.error("[NewsletterService] Firestore write failed:", err);
    return {
      success: false,
      error: "Subscription failed. Please try again later.",
      raw: err.message,
    };
  }
}
