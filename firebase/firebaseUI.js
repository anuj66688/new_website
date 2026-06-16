// ============================================================
//  firebase/firebaseUI.js
//  MainCrafts Technology — UI Integration Layer
//  Wires Firebase services to the landing page DOM.
//  Import this script AFTER script.js (or replace its placeholders).
// ============================================================

import {
  submitContactForm,
  subscribeNewsletter,
  trackButtonClick,
  logAnalyticsEvent,
  trackPageView,
  initAutoTracking,
} from "./services/index.js";

"use strict";

// ── Utility: Toast Notification ───────────────────────────────

function showToast(message, type = "success") {
  // Remove any existing toast
  document.querySelector(".mc-toast")?.remove();

  const toast = document.createElement("div");
  toast.className = `mc-toast mc-toast--${type}`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "polite");

  const icon = type === "success"
    ? '<i class="fa-solid fa-circle-check"></i>'
    : '<i class="fa-solid fa-circle-xmark"></i>';

  toast.innerHTML = `
    <div class="mc-toast__inner">
      ${icon}
      <span>${message}</span>
    </div>
  `;

  // Inline styles so toast works without extra CSS file
  Object.assign(toast.style, {
    position:       "fixed",
    bottom:         "2rem",
    right:          "2rem",
    zIndex:         "99999",
    minWidth:       "280px",
    maxWidth:       "420px",
    padding:        "1rem 1.4rem",
    borderRadius:   "12px",
    background:     type === "success"
                      ? "linear-gradient(135deg,#10b981,#059669)"
                      : "linear-gradient(135deg,#ef4444,#dc2626)",
    color:          "#fff",
    fontSize:       "0.9rem",
    fontFamily:     "Poppins, sans-serif",
    fontWeight:     "500",
    boxShadow:      "0 8px 32px rgba(0,0,0,0.35)",
    display:        "flex",
    alignItems:     "center",
    gap:            "0.6rem",
    opacity:        "0",
    transform:      "translateY(20px)",
    transition:     "all 0.4s cubic-bezier(0.4,0,0.2,1)",
    pointerEvents:  "none",
  });

  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity   = "1";
    toast.style.transform = "translateY(0)";
  });

  // Auto-remove after 4 s
  setTimeout(() => {
    toast.style.opacity   = "0";
    toast.style.transform = "translateY(20px)";
    setTimeout(() => toast.remove(), 450);
  }, 4000);
}

// ── Utility: Button loading state ────────────────────────────

function setButtonLoading(btn, loading, originalHTML) {
  if (loading) {
    btn.disabled   = true;
    btn.innerHTML  = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';
    btn.style.opacity = "0.7";
  } else {
    btn.disabled   = false;
    btn.innerHTML  = originalHTML;
    btn.style.opacity = "";
  }
}

// ── 1. CONTACT FORM ───────────────────────────────────────────

(function initFirebaseContactForm() {
  const form      = document.getElementById("contactForm");
  const submitBtn = document.getElementById("contactSubmit");
  const successEl = document.getElementById("formSuccess");
  if (!form || !submitBtn) return;

  const originalBtnHTML = submitBtn.innerHTML;

  // Clear field-level errors on input
  form.querySelectorAll(".form-control").forEach((field) => {
    field.addEventListener("input", () => {
      field.style.borderColor = "";
      field.parentElement.querySelector(".field-error")?.remove();
    });
  });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Collect values
    const firstName = (form.querySelector("#firstName")?.value || "").trim();
    const lastName  = (form.querySelector("#lastName")?.value  || "").trim();
    const email     = (form.querySelector("#emailInput")?.value || "").trim();
    const subject   = (form.querySelector("#subjectInput")?.value || "").trim();
    const message   = (form.querySelector("#messageInput")?.value || "").trim();

    const name = `${firstName} ${lastName}`.trim();

    // Loading state
    setButtonLoading(submitBtn, true, originalBtnHTML);

    // Call Firebase service
    const result = await submitContactForm({ name, email, message, subject });

    setButtonLoading(submitBtn, false, originalBtnHTML);

    if (result.success) {
      // Show success state
      if (successEl) {
        form.style.display = "none";
        successEl.classList.add("show");
      }
      showToast("✅ Message sent! We'll reply within 24 hours.", "success");

      // Track the submission event
      logAnalyticsEvent({ eventName: "contact_form_submit", eventData: { subject } });
    } else {
      // Show validation / network errors
      const errorMsg = result.errors
        ? result.errors.join(" ")
        : result.error || "Something went wrong. Please try again.";
      showToast(errorMsg, "error");
    }
  });
})();

// ── 2. NEWSLETTER SUBSCRIPTION ───────────────────────────────

(function initFirebaseNewsletter() {
  const form      = document.getElementById("newsletterForm");
  const submitBtn = document.getElementById("newsletterSubmit");
  if (!form || !submitBtn) return;

  const originalBtnHTML = submitBtn.innerHTML;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = (form.querySelector("#newsletterEmail")?.value || "").trim();
    const name  = (form.querySelector("#newsletterName")?.value  || "").trim();

    setButtonLoading(submitBtn, true, originalBtnHTML);

    const result = await subscribeNewsletter({ email, name });

    setButtonLoading(submitBtn, false, originalBtnHTML);

    if (result.success) {
      showToast("🎉 You're subscribed! Welcome to the MainCrafts community.", "success");
      form.reset();
      logAnalyticsEvent({ eventName: "newsletter_subscribe" });
    } else if (result.alreadySubscribed) {
      showToast("You're already subscribed. Thank you!", "success");
    } else {
      const errorMsg = result.errors
        ? result.errors.join(" ")
        : result.error || "Subscription failed. Please try again.";
      showToast(errorMsg, "error");
    }
  });
})();

// ── 3. CTA BUTTON TRACKING ───────────────────────────────────

(function initCTATracking() {
  const ctaButtons = [
    { id: "heroGetStarted",  section: "hero",    text: "Get Started"    },
    { id: "heroLearnMore",   section: "hero",    text: "Learn More"     },
    { id: "pricingStarter",  section: "pricing", text: "Starter Plan"   },
    { id: "pricingPro",      section: "pricing", text: "Pro Plan"       },
    { id: "pricingEnterprise", section: "pricing", text: "Enterprise"   },
  ];

  ctaButtons.forEach(({ id, section, text }) => {
    const el = document.getElementById(id);
    if (!el) return;

    // Attach to first anchor/button inside the card, or the element itself
    const target = el.tagName === "A" || el.tagName === "BUTTON"
      ? el
      : el.querySelector("a, button") || el;

    target.addEventListener("click", () => {
      trackButtonClick({ buttonId: id, buttonText: text, section });
    });
  });

  // Also handle the general [data-track-btn] attribute approach
  initAutoTracking();
})();

// ── 4. PAGE / SECTION VIEW TRACKING ─────────────────────────

(function initSectionViewTracking() {
  const sections = document.querySelectorAll("section[id]");
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          trackPageView(entry.target.id);
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((s) => observer.observe(s));
})();

// ── 5. INITIAL PAGE LOAD EVENT ────────────────────────────────

logAnalyticsEvent({
  eventName: "page_load",
  eventData: {
    title: document.title,
    url:   window.location.href,
  },
});

console.info("🔥 MainCrafts Firebase UI layer loaded.");
