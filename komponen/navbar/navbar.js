/* ==========================================================================
   Navbar interactions — SMAN 1 Singaraja
   Handles: scroll shrink, active-link highlight, mobile drawer (accordion),
   touch-friendly dropdowns, magnetic CTA hover + click ripple.
   ========================================================================== */
window.SmansaScroll = window.SmansaScroll || (() => {
  const callbacks = new Set();
  let frameId = null;

  const dispatch = () => {
    frameId = null;
    const scrollY = window.scrollY;
    callbacks.forEach((callback) => callback(scrollY));
  };

  const onScroll = () => {
    if (frameId === null) frameId = window.requestAnimationFrame(dispatch);
  };

  return {
    subscribe(callback) {
      callbacks.add(callback);
      if (callbacks.size === 1) window.addEventListener('scroll', onScroll, { passive: true });
      callback(window.scrollY);
      return () => {
        callbacks.delete(callback);
        if (!callbacks.size) {
          window.removeEventListener('scroll', onScroll);
          if (frameId !== null) window.cancelAnimationFrame(frameId);
          frameId = null;
        }
      };
    }
  };
})();

(() => {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  function ensureMobileNavigation() {
    const links = navbar.querySelector('.navbar__links');
    if (!links || navbar.querySelector('.navbar__menu-toggle') || navbar.querySelector('.navbar__drawer')) return;

    const list = links.cloneNode(true);
    list.classList.remove('navbar__links');
    list.querySelectorAll(':scope > li.dropdown').forEach((item) => {
      const trigger = item.querySelector(':scope > .dropbtn');
      const submenu = item.querySelector(':scope > .dropdown-content');
      if (!trigger || !submenu) return;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'drawer-toggle';
      button.setAttribute('aria-expanded', 'false');
      button.append(document.createTextNode(trigger.textContent.trim()));
      const chevron = document.createElement('span');
      chevron.className = 'drawer-chevron';
      chevron.setAttribute('aria-hidden', 'true');
      button.append(chevron);
      trigger.replaceWith(button);
      submenu.classList.replace('dropdown-content', 'drawer-submenu');
    });

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'navbar__menu-toggle';
    toggle.setAttribute('aria-label', 'Buka menu navigasi');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'navbar-mobile-drawer');
    toggle.innerHTML = '<span class="bar"></span><span class="bar"></span><span class="bar"></span>';

    const drawer = document.createElement('nav');
    drawer.id = 'navbar-mobile-drawer';
    drawer.className = 'navbar__drawer';
    drawer.setAttribute('aria-label', 'Navigasi utama');
    drawer.append(list);
    navbar.append(toggle, drawer);
  }

  ensureMobileNavigation();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileNavigation = window.matchMedia('(max-width: 1024px)');
  const languageSwitcher = navbar.querySelector('.language-switch');

  if (languageSwitcher) {
    languageSwitcher.classList.add('gtranslate_wrapper');
    languageSwitcher.replaceChildren();
    languageSwitcher.setAttribute('aria-label', 'Pilih bahasa');

    const stopInvalidPrefetch = (event) => event.stopImmediatePropagation();
    languageSwitcher.addEventListener('pointerenter', stopInvalidPrefetch);
    languageSwitcher.addEventListener('focusin', stopInvalidPrefetch);

    window.gtranslateSettings = {
      default_language: 'id',
      languages: ['id', 'en', 'zh-CN', 'ja'],
      wrapper_selector: '.gtranslate_wrapper',
      alt_flags: { en: 'usa' },
      switcher_horizontal_position: 'inline',
      switcher_vertical_position: 'bottom',
      float_switcher_open_direction: 'bottom'
    };

    const translateWidget = document.createElement('script');
    translateWidget.src = 'https://cdn.gtranslate.net/widgets/latest/float.js';
    translateWidget.defer = true;
    translateWidget.addEventListener('error', () => {
      console.error('Widget GTranslate gagal dimuat.');
    }, { once: true });
    document.head.append(translateWidget);
  }

  /* ---------------------------------------------------------------------
     1. Direction-aware collapse — the logo remains as a compact launcher
  --------------------------------------------------------------------- */
  const SCROLL_THRESHOLD = 4;
  const DIRECTION_DISTANCE = 2;
  let lastScrollY = window.scrollY;
  let collapsedState = false;

  function setCollapsed(isCollapsed) {
    if (collapsedState === isCollapsed) return;
    collapsedState = isCollapsed;
    navbar.classList.toggle('is-collapsed', isCollapsed);
  }

  function updateScrollState(currentScrollY) {
    const scrollDelta = currentScrollY - lastScrollY;
    navbar.classList.toggle('scrolled', currentScrollY > SCROLL_THRESHOLD);

    if (mobileNavigation.matches || currentScrollY <= SCROLL_THRESHOLD) {
      setCollapsed(false);
    } else if (scrollDelta > DIRECTION_DISTANCE) {
      setCollapsed(true);
    } else if (scrollDelta < -DIRECTION_DISTANCE) {
      setCollapsed(false);
    }

    lastScrollY = currentScrollY;
  }

  window.SmansaScroll.subscribe(updateScrollState);
  mobileNavigation.addEventListener('change', () => updateScrollState(window.scrollY));

  /* ---------------------------------------------------------------------
     2. Active link — matches current path, falls back to body[data-page]
  --------------------------------------------------------------------- */
  function markActiveLinks() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const page = document.body.dataset.page;

    document.querySelectorAll('.navbar__links a, .navbar__drawer a').forEach((link) => {
      const href = link.getAttribute('href') || '';
      const linkFile = href.split('/').pop();
      const isMatch = linkFile === currentPath || (page && link.dataset.page === page);
      link.classList.toggle('is-active', Boolean(isMatch));
    });
  }

  markActiveLinks();

  /* ---------------------------------------------------------------------
     3. Touch-friendly dropdowns (desktop) — tap toggles, outside tap closes
  --------------------------------------------------------------------- */
  const dropdowns = document.querySelectorAll('.navbar__links .dropdown, .lang-switcher');
  const dropdownCloseDelay = 350;
  const closeTimers = new Map();

  function scheduleDropdownClose(dropdown) {
    clearTimeout(closeTimers.get(dropdown));
    closeTimers.set(dropdown, setTimeout(() => {
      dropdown.classList.remove('open');
      const trigger = dropdown.querySelector(':scope > .dropbtn, :scope > .navbar__lang, :scope > .switchbtn');
      trigger?.setAttribute('aria-expanded', 'false');
    }, dropdownCloseDelay));
  }

  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector(':scope > .dropbtn, :scope > .navbar__lang, :scope > .switchbtn');
    if (!trigger) return;

    dropdown.addEventListener('mouseenter', () => clearTimeout(closeTimers.get(dropdown)));
    dropdown.addEventListener('mouseleave', () => {
      if (window.matchMedia('(hover: hover)').matches) scheduleDropdownClose(dropdown);
    });

    trigger.addEventListener('click', (e) => {
      // Only intercept on coarse-pointer / touch devices; mouse users get :hover
      if (window.matchMedia('(hover: hover)').matches) return;
      e.preventDefault();
      const isOpen = dropdown.classList.contains('open');
      dropdowns.forEach((d) => d.classList.remove('open'));
      dropdown.classList.toggle('open', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar__links .dropdown, .lang-switcher')) {
      dropdowns.forEach((d) => {
        clearTimeout(closeTimers.get(d));
        d.classList.remove('open');
      });
    }
  });

  /* ---------------------------------------------------------------------
     4. Mobile drawer — open/close + accordion sub-menus
  --------------------------------------------------------------------- */
  const menuToggle = document.querySelector('.navbar__menu-toggle');
  const drawer = document.querySelector('.navbar__drawer');

  if (menuToggle && drawer) {
    const closeDrawer = () => {
      drawer.classList.remove('open');
      menuToggle.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Buka menu navigasi');
      drawer.querySelectorAll('.drawer-toggle').forEach((toggle) => toggle.setAttribute('aria-expanded', 'false'));
      drawer.querySelectorAll('li.open').forEach((item) => item.classList.remove('open'));
      document.body.style.overflow = '';
    };

    menuToggle.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('open');
      menuToggle.classList.toggle('is-open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    drawer.querySelectorAll('.drawer-toggle').forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const item = toggle.closest('li');
        const wasOpen = item.classList.contains('open');
        item.parentElement.querySelectorAll(':scope > li.open').forEach((li) => li.classList.remove('open'));
        item.classList.toggle('open', !wasOpen);
        toggle.setAttribute('aria-expanded', String(!wasOpen));
      });
    });

    document.addEventListener('click', (event) => {
      if (drawer.classList.contains('open') && !navbar.contains(event.target)) closeDrawer();
    });

    mobileNavigation.addEventListener('change', () => {
      if (!mobileNavigation.matches) closeDrawer();
    });

    // Close drawer when a real link is tapped
    drawer.querySelectorAll('a[href]').forEach((link) => {
      link.addEventListener('click', closeDrawer);
    });

    // Close drawer on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    });
  }

  /* ---------------------------------------------------------------------
     5. Magnetic CTA hover
  --------------------------------------------------------------------- */
  const cta = document.querySelector('.navbar__cta');

  if (cta && !prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    const strength = 0.25;

    cta.addEventListener('mousemove', (e) => {
      const rect = cta.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * strength;
      const y = (e.clientY - rect.top - rect.height / 2) * strength;
      cta.style.transform = `translate(${x}px, ${y}px)`;
    });

    cta.addEventListener('mouseleave', () => {
      cta.style.transform = '';
    });
  }

  /* ---------------------------------------------------------------------
     6. Click ripple on CTA
  --------------------------------------------------------------------- */
  if (cta) {
    cta.addEventListener('click', (e) => {
      if (prefersReducedMotion) return;

      const rect = cta.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);

      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      cta.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  }

  /* ---------------------------------------------------------------------
     7. Viewport Animation Observer (Hanya jalankan animasi saat terlihat)
  --------------------------------------------------------------------- */
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const animSelector = '.uni-slider, .tilt-card, .vision-card, .kt-hero, .kt-map__frame, .kt-status, .sp-status, .kt-footer__map, .sp-footer__map, .divider';
    const animObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-animating', entry.isIntersecting);
      });
    }, { threshold: 0.05 });

    const observeAnimTargets = (root = document) => {
      if (root instanceof Element && root.matches(animSelector)) animObserver.observe(root);
      root.querySelectorAll?.(animSelector).forEach((el) => animObserver.observe(el));
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', observeAnimTargets, { once: true });
    } else {
      observeAnimTargets();
    }

    const dynamicTargetsObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) observeAnimTargets(node);
        });
      });
    });
    dynamicTargetsObserver.observe(document.body, { childList: true, subtree: true });
  }

  /* ---------------------------------------------------------------------
     8. Lazy-load Chatbot (Muat hanya saat browser idle agar tidak menghambat LCP)
  --------------------------------------------------------------------- */
  const loadChatbotLazy = () => {
    const chatModuleUrl = document.currentScript?.src
      ? new URL('../../komponen/ai assistant/ai-chat.js?v=visual-5', document.currentScript.src)
      : new URL('/komponen/ai assistant/ai-chat.js?v=visual-5', window.location.href);

    import(chatModuleUrl.href).catch((error) => console.error('Chatbot gagal dimuat:', error));
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => loadChatbotLazy(), { timeout: 3000 });
  } else {
    window.addEventListener('load', () => setTimeout(loadChatbotLazy, 1800), { once: true });
  }
})();
