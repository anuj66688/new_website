// ============================================================
//  firebase/services/analyticsService.js
//  MainCrafts Technology — Analytics & CTA Tracking Service
//  Tracks button clicks and custom events in Firestore
// ============================================================

import { db } from "../firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── Helpers ───────────────────────────────────────────────────

/** Generate a lightweight anonymous session ID (stored in sessionStorage). */
function getSessionId() {
  const KEY = "mc_session_id";
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = "sess_" + Math.random().toString(36).slice(2, 11) + "_" + Date.now();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

/** Collect basic browser/device metadata (privacy-safe — no PII). */
function getDeviceMeta() {
  return {
    userAgent:   navigator.userAgent,
    language:    navigator.language,
    screenW:     window.screen.width,
    screenH:     window.screen.height,
    referrer:    document.referrer || "direct",
    currentPage: window.location.pathname,
  };
}

// ── CTA Button Click Tracking ─────────────────────────────────

/**
 * Track a CTA button click in the "cta_clicks" Firestore collection.
 *
 * @param {{ buttonId: string, buttonText: string, section?: string }} clickData
 * @returns {Promise<{ success: boolean, id?: string, error?: string }>}
 *
 * @example
 *   await trackButtonClick({ buttonId: 'heroGetStarted', buttonText: 'Get Started', section: 'hero' });
 */
export async function trackButtonClick({ buttonId, buttonText, section = "unknown" }) {
  if (!buttonId) {
    console.warn("[AnalyticsService] trackButtonClick: buttonId is required.");
    return { success: false, error: "buttonId is required." };
  }

  const clickDoc = {
    buttonId,
    buttonText,
    section,
    sessionId:  getSessionId(),
    device:     getDeviceMeta(),
    clickedAt:  serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, "cta_clicks"), clickDoc);
    console.info(`[AnalyticsService] Button click tracked — ${buttonId} — ID: ${docRef.id}`);
    return { success: true, id: docRef.id };
  } catch (err) {
    console.error("[AnalyticsService] Failed to track click:", err);
    return { success: false, error: err.message };
  }
}

// ── Generic Analytics Event Logger ───────────────────────────

/**
 * Log any custom analytics event to the "analytics_events" collection.
 *
 * @param {{ eventName: string, eventData?: object }} eventPayload
 * @returns {Promise<{ success: boolean, id?: string, error?: string }>}
 *
 * @example
 *   await logAnalyticsEvent({ eventName: 'pricing_view', eventData: { plan: 'pro' } });
 */
export async function logAnalyticsEvent({ eventName, eventData = {} }) {
  if (!eventName) {
    console.warn("[AnalyticsService] logAnalyticsEvent: eventName is required.");
    return { success: false, error: "eventName is required." };
  }

  const eventDoc = {
    eventName,
    eventData,
    sessionId:   getSessionId(),
    device:      getDeviceMeta(),
    loggedAt:    serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, "analytics_events"), eventDoc);
    console.info(`[AnalyticsService] Event logged — ${eventName} — ID: ${docRef.id}`);
    return { success: true, id: docRef.id };
  } catch (err) {
    console.error("[AnalyticsService] Failed to log event:", err);
    return { success: false, error: err.message };
  }
}

// ── Page View Tracker ─────────────────────────────────────────

/**
 * Track a page / section view.
 * @param {string} pageName  e.g. "features", "pricing", "contact"
 * @returns {Promise<{ success: boolean }>}
 */
export async function trackPageView(pageName) {
  return logAnalyticsEvent({
    eventName: "page_view",
    eventData: { page: pageName },
  });
}

// ── Auto-attach CTA click tracking ───────────────────────────

/**
 * Call once on page load to automatically attach click tracking to
 * all elements that carry a [data-track-btn] attribute.
 *
 * Usage in HTML:
 *   <a data-track-btn="heroGetStarted" data-track-section="hero">Get Started</a>
 */
export function initAutoTracking() {
  document.querySelectorAll("[data-track-btn]").forEach((el) => {
    el.addEventListener("click", () => {
      trackButtonClick({
        buttonId:   el.dataset.trackBtn,
        buttonText: el.innerText.trim(),
        section:    el.dataset.trackSection || "unknown",
      });
    });
  });
  console.info("[AnalyticsService] Auto-tracking attached.");
}
