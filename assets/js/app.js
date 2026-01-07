// app.js
// Scroll-based SPA navigation with scroll spy

function wireProjectsUI(root = document) {
  const tabs = root.querySelectorAll('.tab-btn');
  const contents = root.querySelectorAll('[data-content]');

  if (!tabs.length || !contents.length) return;

  const activateTab = (name) => {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.tab === name;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    contents.forEach((content) => {
      content.classList.toggle('hidden', content.dataset.content !== name);
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activateTab(tab.dataset.tab));
  });

  root.querySelectorAll('.tab-show-more').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      const content = root.querySelector('[data-content="' + target + '"]');
      if (!content) return;
      const hiddenItems = content.querySelectorAll('.extra');
      const isHidden = hiddenItems.length > 0 && hiddenItems[0].classList.contains('hidden');
      hiddenItems.forEach((el) => el.classList.toggle('hidden', !isHidden));
      btn.textContent = isHidden ? 'Show less' : 'Show more';
    });
  });
}

function scrollToSection(sectionId, updateHash = true) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const headerHeight = 64; // h-16 = 4rem = 64px
  const offset = section.offsetTop - headerHeight - 20; // 20px padding

  window.scrollTo({
    top: offset,
    behavior: 'smooth'
  });

  if (updateHash && history && history.replaceState) {
    history.replaceState(null, '', '#' + sectionId);
  }

  // Update active nav item
  const navItems = document.querySelectorAll('#sidebar .nav-item[data-page]');
  navItems.forEach((item) => {
    if (item.dataset.page === sectionId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Close mobile menu if open
  if (window.innerWidth < 1024) {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('backdrop');
    if (sidebar) sidebar.classList.add('-translate-x-full');
    if (backdrop) backdrop.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function wireSidebarNav() {
  const items = document.querySelectorAll('#sidebar .nav-item[data-page]');
  if (!items.length) return;

  items.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = item.dataset.page;
      if (!sectionId) return;
      scrollToSection(sectionId);
    });
  });
}

function initScrollSpy() {
  const sections = document.querySelectorAll('.section-content');
  const navItems = document.querySelectorAll('#sidebar .nav-item[data-page]');
  const headerHeight = 64;

  function updateActiveSection() {
    let current = '';
    const scrollPos = window.scrollY + headerHeight + 100;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.id;
      }
    });

    if (current) {
      navItems.forEach((item) => {
        if (item.dataset.page === current) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      if (history && history.replaceState) {
        history.replaceState(null, '', '#' + current);
      }
    }
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveSection();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Initial check
  updateActiveSection();
}

function wireSearchModal() {
  const modal = document.getElementById('searchModal');
  const input = document.getElementById('searchModalInput');
  const submit = document.getElementById('searchModalSubmit');
  const suggestionsEl = document.getElementById('searchSuggestions');
  const triggers = document.querySelectorAll('[data-search-trigger]');
  if (!modal || !input || !submit) return;

  const keywords = [
    'About',
    'Expertise',
    'Certificates',
    'Projects',
    'Games',
    'Web Apps',
    'AI Projects',
    'Contact',
    'Resume',
    'Portfolio'
  ];

  const sectionMap = {
    about: 'about',
    expertise: 'expertise',
    certificates: 'certificates',
    projects: 'projects',
    games: 'projects', // Games is now a tab in Projects
    'web apps': 'projects', // Web Apps is now a tab in Projects
    'ai projects': 'projects', // AI Projects is now a tab in Projects
    contact: 'about' // Contact is within About section
  };

  function openModal() {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => input.focus(), 50);
  }

  function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    input.value = '';
  }

  function handleSelect(term) {
    const key = term.toLowerCase();
    let sectionId = sectionMap[key];
    
    // Handle special cases
    if (key === 'contact') {
      sectionId = 'about'; // Contact is within about section
    } else if (!sectionId) {
      // Try to find by partial match
      for (const [keyword, id] of Object.entries(sectionMap)) {
        if (key.includes(keyword) || keyword.includes(key)) {
          sectionId = id;
          break;
        }
      }
    }

    if (sectionId) {
      closeModal();
      setTimeout(() => scrollToSection(sectionId), 100);
    } else {
      closeModal();
    }
  }

  if (suggestionsEl && !suggestionsEl.dataset.bound) {
    keywords.forEach((k) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = k;
      btn.className = 'px-3 py-1.5 rounded-full border border-border text-sm text-text2 hover:border-primary hover:text-primary transition-colors';
      btn.addEventListener('click', () => handleSelect(k));
      suggestionsEl.appendChild(btn);
    });
    suggestionsEl.dataset.bound = '1';
  }

  triggers.forEach((t) => {
    if (t.dataset.searchBound === '1') return;
    t.addEventListener('click', openModal);
    t.dataset.searchBound = '1';
  });

  modal.querySelectorAll('[data-search-close]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  submit.addEventListener('click', () => {
    if (input.value.trim()) handleSelect(input.value.trim());
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      e.preventDefault();
      handleSelect(input.value.trim());
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.initToggle) window.initToggle();
  if (window.initBanner) window.initBanner();
  if (window.initMetrics) window.initMetrics();

  wireSidebarNav();
  wireSearchModal();
  wireProjectsUI();
  initScrollSpy();

  // Handle initial hash
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    setTimeout(() => scrollToSection(hash, false), 100);
  } else {
    // Default to about section
    setTimeout(() => scrollToSection('about', false), 100);
  }
});
