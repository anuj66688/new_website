// ============================================================
//  firebase/services/contactService.js
//  MainCrafts Technology — Contact Form Service
//  Validates, saves to Firestore "contacts" collection
// ============================================================

import { db } from "../firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── Validation helpers ────────────────────────────────────────

/**
 * Returns true if the email passes a standard RFC-5322-like regex.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validates all required contact-form fields.
 * Returns { valid: boolean, errors: string[] }
 * @param {{ name: string, email: string, message: string }} data
 */
function validateContactData({ name, email, message }) {
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters.");
  }
  if (!email || !isValidEmail(email)) {
    errors.push("A valid email address is required.");
  }
  if (!message || message.trim().length < 10) {
    errors.push("Message must be at least 10 characters.");
  }

  return { valid: errors.length === 0, errors };
}

// ── Service function ──────────────────────────────────────────

/**
 * Validates and saves a contact form submission to Firestore.
 *
 * @param {{ name: string, email: string, message: string, subject?: string }} formData
 * @returns {Promise<{ success: boolean, id?: string, errors?: string[], error?: string }>}
 *
 * @example
 *   const result = await submitContactForm({ name, email, message });
 *   if (result.success) { showSuccessUI(); }
 */
export async function submitContactForm({ name, email, message, subject = "" }) {
  // 1. Validate
  const { valid, errors } = validateContactData({ name, email, message });
  if (!valid) {
    return { success: false, errors };
  }

  // 2. Build document payload
  const contactDoc = {
    name:      name.trim(),
    email:     email.trim().toLowerCase(),
    message:   message.trim(),
    subject:   subject.trim(),
    createdAt: serverTimestamp(),
    source:    "landing_page",
    status:    "new",            // new | read | replied
  };

  // 3. Save to Firestore
  try {
    const docRef = await addDoc(collection(db, "contacts"), contactDoc);
    console.info("[ContactService] Contact saved — ID:", docRef.id);
    return { success: true, id: docRef.id };
  } catch (err) {
    console.error("[ContactService] Firestore write failed:", err);
    return {
      success: false,
      error: "Failed to send your message. Please try again later.",
      raw: err.message,
    };
  }
}
