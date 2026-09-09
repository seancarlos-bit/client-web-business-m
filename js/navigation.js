/** Vanguard Studio - responsive and accessible navigation, smooth scroll, tracker rail & search modal controls. */
(function (global) {
  'use strict';

  function initNavigation() {
    const mobileButton = document.getElementById('mobileMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    const explore = document.getElementById('exploreMenu');
    const exploreButton = document.getElementById('exploreMenuButton');
    const searchModalBtn = document.getElementById('searchModalBtn');
    const searchModal = document.getElementById('siteSearchModal');
    const searchCloseBtn = document.getElementById('searchModalClose');
    const searchInput = document.getElementById('siteSearchInput');

    function setMobileMenu(open) {
      if (!mobileButton || !mobileMenu) return;
      mobileButton.setAttribute('aria-expanded', String(open));
      mobileButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      mobileMenu.classList.toggle('hidden', !open);
    }

    function setExploreMenu(open) {
      if (!explore || !exploreButton) return;
      explore.classList.toggle('is-open', open);
      exploreButton.setAttribute('aria-expanded', String(open));
    }

    function openSearchModal() {
      if (!searchModal) return;
      searchModal.classList.remove('hidden');
      searchModal.classList.add('flex');
      searchModal.setAttribute('aria-hidden', 'false');
      if (searchInput) {
        searchInput.value = '';
        window.setTimeout(() => searchInput.focus(), 50);
      }
    }

    function closeSearchModal() {
      if (!searchModal) return;
      searchModal.classList.add('hidden');
      searchModal.classList.remove('flex');
      searchModal.setAttribute('aria-hidden', 'true');
    }

    // Smooth scroll for internal anchor links
    document.addEventListener('click', (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (href === '#' || href === '') return;

      const targetEl = document.querySelector(href);
      if (targetEl) {
        event.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
        setMobileMenu(false);
        setExploreMenu(false);
        window.dispatchEvent(new Event('resize'));
      }
    });

    // Dynamic Dot Highlight for Scrolly Tracker Rail
    const trackerItems = document.querySelectorAll('.tracker-item');
    if (trackerItems.length > 0) {
      function updateActiveTracker() {
        const sections = Array.from(trackerItems).map(item => {
          const targetId = item.getAttribute('href');
          return targetId ? document.querySelector(targetId) : null;
        }).filter(Boolean);

        let activeIndex = 0;
        const scrollPos = window.scrollY + window.innerHeight * 0.35;

        sections.forEach((sec, idx) => {
          if (sec.offsetTop <= scrollPos) {
            activeIndex = idx;
          }
        });

        trackerItems.forEach((item, idx) => {
          item.classList.toggle('active', idx === activeIndex);
        });
      }

      window.addEventListener('scroll', updateActiveTracker, { passive: true });
      updateActiveTracker();
    }

    if (mobileButton && mobileMenu) {
      mobileButton.addEventListener('click', () => {
        setMobileMenu(mobileButton.getAttribute('aria-expanded') !== 'true');
      });

      mobileMenu.addEventListener('click', (event) => {
        if (event.target.closest('.mobile-nav-link') || event.target.closest('[data-open-livechat]')) {
          setMobileMenu(false);
        }
      });
    }

    if (explore && exploreButton) {
      exploreButton.addEventListener('click', () => {
        setExploreMenu(exploreButton.getAttribute('aria-expanded') !== 'true');
      });

      document.addEventListener('pointerdown', (event) => {
        if (!explore.contains(event.target)) setExploreMenu(false);
      });
    }

    if (searchModalBtn) {
      searchModalBtn.addEventListener('click', openSearchModal);
    }
    if (searchCloseBtn) {
      searchCloseBtn.addEventListener('click', closeSearchModal);
    }
    if (searchModal) {
      searchModal.addEventListener('click', (event) => {
        if (event.target === searchModal) closeSearchModal();
      });
    }

    document.querySelectorAll('[data-open-livechat]').forEach((button) => {
      button.addEventListener('click', () => {
        setExploreMenu(false);
        if (typeof window.openVanguardLiveChat === 'function') {
          window.openVanguardLiveChat();
        }
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
        event.preventDefault();
        openSearchModal();
        return;
      }

      if (event.key === 'Escape') {
        const wasExploreOpen = Boolean(explore && explore.classList.contains('is-open'));
        setMobileMenu(false);
        setExploreMenu(false);
        closeSearchModal();
        if (wasExploreOpen && exploreButton) exploreButton.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) setMobileMenu(false);
    }, { passive: true });

    global.openSearchModal = openSearchModal;
    global.closeSearchModal = closeSearchModal;
  }

  // --- THEME MANAGER LOGIC ---
  function applyTheme(theme) {
    const isLight = theme === 'light';
    document.documentElement.classList.toggle('light-mode', isLight);
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {}

    const toggleBtns = document.querySelectorAll('.theme-toggle-btn, #themeToggleBtn');
    toggleBtns.forEach(btn => {
      btn.setAttribute('aria-label', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
      btn.setAttribute('title', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
    });

    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  function initThemeManager() {
    let savedTheme = 'dark';
    try {
      savedTheme = localStorage.getItem('theme') || 'dark';
    } catch (e) {}
    applyTheme(savedTheme);

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.theme-toggle-btn, #themeToggleBtn');
      if (!btn) return;
      const currentTheme = document.documentElement.classList.contains('light-mode') ? 'light' : 'dark';
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(nextTheme);
    });
  }

  // Initialize theme immediately upon script parse
  initThemeManager();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation, { once: true });
  } else {
    initNavigation();
  }
})(typeof window !== 'undefined' ? window : this);

