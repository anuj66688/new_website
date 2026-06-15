/* ================================================================
   MainCrafts Technology — script.js
   Handles: Navbar scroll, hamburger, active links,
            particle system, scroll reveal, counter animation,
            contact form, and misc UX polish.
   ================================================================ */

'use strict';

/* ────────────────────────────────────────────
   1. NAVBAR — transparent ↔ scrolled state
   ──────────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function updateNavbar() {
    if (window.scrollY > 40) {
      navbar.classList.remove('transparent');
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.add('transparent');
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar(); // run on load
})();


/* ────────────────────────────────────────────
   2. HAMBURGER / MOBILE MENU
   ──────────────────────────────────────────── */
(function initHamburger() {
  const btn        = document.getElementById('hamburger');
  const menu       = document.getElementById('mobileMenu');
  const mobileLinks = menu ? menu.querySelectorAll('a') : [];
  if (!btn || !menu) return;

  function toggleMenu() {
    const isOpen = btn.classList.toggle('open');
    menu.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMenu() {
    btn.classList.remove('open');
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', toggleMenu);

  // Close when a mobile link is clicked
  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Close on outside click
  document.addEventListener('click', e => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) closeMenu();
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
})();


/* ────────────────────────────────────────────
   3. ACTIVE NAV LINK (on scroll)
   ──────────────────────────────────────────── */
(function initActiveLink() {
  const sections = document.querySelectorAll('main section[id], section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === '#' + entry.target.id;
            link.classList.toggle('active', isActive);
            if (isActive) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach(s => observer.observe(s));
})();


/* ────────────────────────────────────────────
   4. PARTICLE SYSTEM
   ──────────────────────────────────────────── */
(function initParticles() {
  const container = document.getElementById('particlesBg');
  if (!container) return;

  const colors = [
    'rgba(99,102,241,0.7)',
    'rgba(168,85,247,0.7)',
    'rgba(6,182,212,0.7)',
    'rgba(236,72,153,0.5)',
    'rgba(255,255,255,0.4)',
  ];

  const COUNT = window.innerWidth < 600 ? 18 : 32;

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size     = Math.random() * 5 + 2;
    const color    = colors[Math.floor(Math.random() * colors.length)];
    const duration = Math.random() * 20 + 12;
    const delay    = Math.random() * -25;
    const left     = Math.random() * 100;

    Object.assign(p.style, {
      width:                 size + 'px',
      height:                size + 'px',
      background:            color,
      left:                  left + '%',
      animationDuration:     duration + 's',
      animationDelay:        delay + 's',
      filter:                'blur(' + (Math.random() * 1.5) + 'px)',
    });

    container.appendChild(p);
  }
})();


/* ────────────────────────────────────────────
   5. SCROLL REVEAL ANIMATIONS
   ──────────────────────────────────────────── */
(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // trigger once
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();


/* ────────────────────────────────────────────
   6. COUNTER ANIMATION (hero stats)
   ──────────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  function animateCount(el, target, duration) {
    const start = performance.now();
    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const ease     = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(ease * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseInt(el.dataset.count, 10);
          animateCount(el, target, 1800);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
})();


/* ────────────────────────────────────────────
   7. CONTACT FORM
   ──────────────────────────────────────────── */
(function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('contactSubmit');
  if (!form || !success) return;

  // Simple email validation regex
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Show an inline error on a field
  function showError(input, message) {
    // Remove existing error
    const prev = input.parentElement.querySelector('.field-error');
    if (prev) prev.remove();

    const err = document.createElement('span');
    err.className = 'field-error';
    err.style.cssText = 'display:block;font-size:0.75rem;color:#f87171;margin-top:5px;';
    err.textContent = message;
    input.parentElement.appendChild(err);
    input.style.borderColor = '#f87171';
  }

  function clearError(input) {
    const err = input.parentElement.querySelector('.field-error');
    if (err) err.remove();
    input.style.borderColor = '';
  }

  // Live clearing of errors
  form.querySelectorAll('.form-control').forEach(field => {
    field.addEventListener('input', () => clearError(field));
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const firstName = form.querySelector('#firstName');
    const lastName  = form.querySelector('#lastName');
    const email     = form.querySelector('#emailInput');
    const subject   = form.querySelector('#subjectInput');
    const message   = form.querySelector('#messageInput');

    let valid = true;

    if (!firstName.value.trim()) { showError(firstName, 'First name is required.'); valid = false; }
    if (!lastName.value.trim())  { showError(lastName,  'Last name is required.');  valid = false; }
    if (!email.value.trim())     { showError(email,    'Email is required.');        valid = false; }
    else if (!isValidEmail(email.value.trim())) {
      showError(email, 'Please enter a valid email address.');
      valid = false;
    }
    if (!subject.value.trim())  { showError(subject, 'Subject is required.');  valid = false; }
    if (!message.value.trim())  { showError(message, 'Message cannot be empty.'); valid = false; }

    if (!valid) return;

    // Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';

    // Simulate async network request
    setTimeout(() => {
      form.style.display      = 'none';
      success.classList.add('show');
      submitBtn.disabled      = false;
      submitBtn.innerHTML     = '<i class="fa-solid fa-paper-plane"></i> Send Message';
    }, 1600);
  });
})();


/* ────────────────────────────────────────────
   8. FEATURE CARD TILT EFFECT (subtle 3-D)
   ──────────────────────────────────────────── */
(function initCardTilt() {
  const cards = document.querySelectorAll('.feature-card');
  const MAX   = 8; // degrees

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `
        translateY(-10px)
        scale(1.02)
        rotateX(${-y * MAX}deg)
        rotateY(${x * MAX}deg)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.6s cubic-bezier(0.4,0,0.2,1)';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });
  });
})();


/* ────────────────────────────────────────────
   9. SMOOTH SCROLL for anchor links
   ──────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


/* ────────────────────────────────────────────
   10. FOOTER year auto-update
   ──────────────────────────────────────────── */
(function initYear() {
  const yearEls = document.querySelectorAll('[data-year]');
  const year = new Date().getFullYear();
  yearEls.forEach(el => (el.textContent = year));
})();


/* ────────────────────────────────────────────
   11. CURSOR GLOW — subtle ambient effect
   ──────────────────────────────────────────── */
(function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip touch

  const glow = document.createElement('div');
  Object.assign(glow.style, {
    position:      'fixed',
    width:         '300px',
    height:        '300px',
    borderRadius:  '50%',
    background:    'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex:        '0',
    transform:     'translate(-50%,-50%)',
    transition:    'opacity 0.3s ease',
    top:           '0',
    left:          '0',
  });
  document.body.appendChild(glow);

  let mouseX = 0, mouseY = 0;
  let glowX  = 0, glowY  = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateGlow() {
    glowX += (mouseX - glowX) * 0.07;
    glowY += (mouseY - glowY) * 0.07;
    glow.style.left = glowX + 'px';
    glow.style.top  = glowY + 'px';
    requestAnimationFrame(animateGlow);
  }
  animateGlow();

  document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { glow.style.opacity = '1'; });
})();


/* ────────────────────────────────────────────
   12. DROPDOWN accessibility (keyboard nav)
   ──────────────────────────────────────────── */
(function initDropdownA11y() {
  const dropdown = document.querySelector('.nav-links .dropdown');
  const trigger  = document.getElementById('servicesDropdownTrigger');
  const menu     = dropdown ? dropdown.querySelector('.dropdown-menu') : null;
  if (!dropdown || !trigger || !menu) return;

  trigger.addEventListener('focus', () => {
    menu.style.opacity     = '1';
    menu.style.visibility  = 'visible';
    menu.style.pointerEvents = 'all';
    menu.style.transform   = 'translateX(-50%) translateY(0)';
    trigger.setAttribute('aria-expanded', 'true');
  });

  dropdown.addEventListener('focusout', e => {
    if (!dropdown.contains(e.relatedTarget)) {
      menu.style.opacity     = '';
      menu.style.visibility  = '';
      menu.style.pointerEvents = '';
      menu.style.transform   = '';
      trigger.setAttribute('aria-expanded', 'false');
    }
  });
})();


/* ────────────────────────────────────────────
   13. PRELOADER
   ──────────────────────────────────────────── */
(function initPreloader() {
  const loader = document.getElementById('preloader');
  if (!loader) return;

  function hide() {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
  }

  document.body.style.overflow = 'hidden';

  if (document.readyState === 'complete') {
    setTimeout(hide, 600);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 600));
  }

  // Safety fallback: force hide after 3s
  setTimeout(hide, 3000);
})();


/* ────────────────────────────────────────────
   14. THEME TOGGLE (dark ↔ light)
   ──────────────────────────────────────────── */
(function initThemeToggle() {
  const btn  = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  if (!btn || !icon) return;

  const PREF_KEY = 'mc-theme';

  function applyTheme(mode) {
    if (mode === 'light') {
      document.body.classList.add('light-mode');
      icon.className = 'fa-solid fa-sun';
    } else {
      document.body.classList.remove('light-mode');
      icon.className = 'fa-solid fa-moon';
    }
  }

  // Apply saved preference
  const saved = localStorage.getItem(PREF_KEY) || 'dark';
  applyTheme(saved);

  btn.addEventListener('click', () => {
    const isLight = document.body.classList.contains('light-mode');
    const next    = isLight ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem(PREF_KEY, next);
  });
})();


/* ────────────────────────────────────────────
   15. TESTIMONIALS SLIDER
   ──────────────────────────────────────────── */
(function initTestimonialsSlider() {
  const track    = document.getElementById('testimonialsTrack');
  const dotsWrap = document.getElementById('sliderDots');
  const prevBtn  = document.getElementById('sliderPrev');
  const nextBtn  = document.getElementById('sliderNext');
  if (!track || !dotsWrap || !prevBtn || !nextBtn) return;

  const cards     = track.querySelectorAll('.testimonial-card');
  const isMobile  = () => window.innerWidth <= 1024;
  let current     = 0;
  let autoTimer   = null;
  const INTERVAL  = 4000;

  function visibleCount() { return isMobile() ? 1 : 2; }

  function totalSlides() {
    return Math.ceil(cards.length / visibleCount());
  }

  // Build dots
  function buildDots() {
    dotsWrap.innerHTML = '';
    const count = totalSlides();
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    dotsWrap.querySelectorAll('.slider-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    const count  = visibleCount();
    const total  = totalSlides();
    current      = Math.max(0, Math.min(index, total - 1));
    const offset = current * count * (100 / count);
    track.style.transform = `translateX(-${offset}%)`;
    updateDots();
  }

  function next() { goTo(current + 1 < totalSlides() ? current + 1 : 0); }
  function prev() { goTo(current - 1 >= 0 ? current - 1 : totalSlides() - 1); }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, INTERVAL);
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  nextBtn.addEventListener('click', () => { next(); startAuto(); });
  prevBtn.addEventListener('click', () => { prev(); startAuto(); });

  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);

  // Touch / swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); startAuto(); }
  }, { passive: true });

  window.addEventListener('resize', () => { buildDots(); goTo(0); });

  buildDots();
  goTo(0);
  startAuto();
})();


/* ────────────────────────────────────────────
   16. PRICING BILLING TOGGLE (monthly ↔ yearly)
   ──────────────────────────────────────────── */
(function initPricingToggle() {
  const toggleBtn     = document.getElementById('billingToggle');
  const labelMonthly  = document.getElementById('labelMonthly');
  const labelYearly   = document.getElementById('labelYearly');
  const priceAmounts  = document.querySelectorAll('.price-amount');
  if (!toggleBtn) return;

  let isYearly = false;

  function updatePrices() {
    priceAmounts.forEach(el => {
      const monthly = el.dataset.monthly;
      const yearly  = el.dataset.yearly;
      el.textContent = isYearly ? yearly : monthly;
    });
    labelMonthly.style.opacity = isYearly ? '0.5' : '1';
    labelYearly.style.opacity  = isYearly ? '1'   : '0.5';
  }

  toggleBtn.addEventListener('click', () => {
    isYearly = !isYearly;
    toggleBtn.classList.toggle('active', isYearly);
    toggleBtn.setAttribute('aria-pressed', String(isYearly));
    updatePrices();
  });

  updatePrices(); // init
})();


/* ────────────────────────────────────────────
   17. FAQ ACCORDION
   ──────────────────────────────────────────── */
(function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all others
      items.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-answer')?.classList.remove('open');
          other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle this one
      item.classList.toggle('open', !isOpen);
      answer.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });
})();


/* ────────────────────────────────────────────
   18. BACK TO TOP BUTTON
   ──────────────────────────────────────────── */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ────────────────────────────────────────────
   19. COOKIE CONSENT BANNER
   ──────────────────────────────────────────── */
(function initCookieBanner() {
  const banner  = document.getElementById('cookieBanner');
  const accept  = document.getElementById('cookieAccept');
  const decline = document.getElementById('cookieDecline');
  if (!banner) return;

  const CONSENT_KEY = 'mc-cookie-consent';

  // Only show if no decision was made yet
  if (!localStorage.getItem(CONSENT_KEY)) {
    setTimeout(() => banner.classList.add('visible'), 1800);
  }

  function dismiss(choice) {
    banner.classList.remove('visible');
    localStorage.setItem(CONSENT_KEY, choice);
    setTimeout(() => banner.remove(), 600);
  }

  accept?.addEventListener('click',  () => dismiss('accepted'));
  decline?.addEventListener('click', () => dismiss('declined'));
})();
