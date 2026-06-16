// ============================================================
//  firebase/services/index.js
//  MainCrafts Technology — Barrel export for all services
//  Import anything from this single entry point.
// ============================================================

export { submitContactForm }                                                                   from "./contactService.js";
export { subscribeNewsletter }                                                                 from "./newsletterService.js";
export { trackButtonClick, logAnalyticsEvent, trackPageView, initAutoTracking }                from "./analyticsService.js";
export { registerUser, loginUser, googleSignIn, logoutUser, resetPassword, onAuthChange, getCurrentUser } from "./authService.js";
