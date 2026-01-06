// toggle.js
// Handles sidebar toggle, mobile menu open/close, and main content margin adjustments.
// Safe: checks for elements before acting.

// toggle.js
// Exposes `window.initToggle()` to initialize sidebar/menu behavior after the structure is injected.

window.initToggle = function initToggle(root = document) {
  const menuToggle = root.getElementById ? root.getElementById('menuToggle') : document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('backdrop');
  const mainContent = document.querySelector('main');

  if (!sidebar || !mainContent) {
    return;
  }

  const DESKTOP_BREAK = 1024; // px
  const EXPANDED_WIDTH = '240px';
  const COLLAPSED_WIDTH = '84px';

  function setMainMarginForState() {
    if (window.innerWidth >= DESKTOP_BREAK) {
      if (document.body.classList.contains('collapsed')) {
        mainContent.style.marginLeft = COLLAPSED_WIDTH;
      } else {
        mainContent.style.marginLeft = EXPANDED_WIDTH;
      }
    } else {
      mainContent.style.marginLeft = '';
    }
  }

  function openMenu() {
    requestAnimationFrame(() => {
      sidebar.classList.remove('-translate-x-full');
      if (backdrop) backdrop.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });
  }

  function closeMenu() {
    requestAnimationFrame(() => {
      sidebar.classList.add('-translate-x-full');
      if (backdrop) backdrop.classList.add('hidden');
      document.body.style.overflow = '';
    });
  }

  if (menuToggle) {
    // avoid binding twice
    if (menuToggle.dataset.bound !== '1') {
      menuToggle.addEventListener('click', () => {
        if (window.innerWidth >= DESKTOP_BREAK) {
          document.body.classList.toggle('collapsed');
          setMainMarginForState();
        } else {
          if (sidebar.classList.contains('-translate-x-full')) openMenu(); else closeMenu();
        }
      });
      menuToggle.dataset.bound = '1';
    }
  }

  if (backdrop && backdrop.dataset.bound !== '1') {
    backdrop.addEventListener('click', closeMenu);
    backdrop.dataset.bound = '1';
  }

  // Resize handling (idempotent)
  if (!window._toggleResizeBound) {
    window.addEventListener('resize', () => {
      if (window.innerWidth >= DESKTOP_BREAK) {
        if (!sidebar.classList.contains('-translate-x-full')) {
          sidebar.classList.add('-translate-x-full');
        }
        setMainMarginForState();
      } else {
        if (document.body.classList.contains('collapsed')) document.body.classList.remove('collapsed');
        mainContent.style.marginLeft = '';
      }
    });
    window._toggleResizeBound = true;
  }

  // Initialize margin and tooltip wiring
  setMainMarginForState();
  document.querySelectorAll('#sidebar .nav-item').forEach(item => {
    if (item.dataset.tooltipBound === '1') return;
    item.addEventListener('mouseenter', () => {
      if (document.body.classList.contains('collapsed')) {
        const labelEl = item.querySelector('.label');
        if (labelEl) item.setAttribute('title', labelEl.textContent.trim());
      } else {
        item.removeAttribute('title');
      }
    });
    item.dataset.tooltipBound = '1';
  });
};
