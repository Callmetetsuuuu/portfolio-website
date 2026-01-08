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
      // If searching for projects, allow keyword matching to filter projects
      if (sectionId === 'projects') {
        closeModal();
        setTimeout(() => {
          scrollToSection('projects');
          searchProjects(term);
        }, 100);
        return;
      }

      closeModal();
      setTimeout(() => scrollToSection(sectionId), 100);
    } else {
      closeModal();
    }
  }

  // Search and filter project cards by keyword across tabs
  function searchProjects(term) {
    const q = term.trim().toLowerCase();
    if (!q) return;

    // Ensure Projects tab is visible by activating the 'latest' tab
    const defaultTab = document.querySelector('.tab-btn[data-tab="latest"]');
    if (defaultTab) defaultTab.click();

    const contentPanes = document.querySelectorAll('.tab-contents [data-content]');
    let anyMatch = false;

    contentPanes.forEach((pane) => {
      const cards = pane.querySelectorAll('article');
      let visibleCount = 0;
      cards.forEach((card) => {
        const titleEl = card.querySelector('h3');
        const descEl = card.querySelector('p');
        const title = titleEl ? titleEl.textContent.toLowerCase() : '';
        const desc = descEl ? descEl.textContent.toLowerCase() : '';
        const badge = card.querySelector('.project-badge');
        const badgeText = badge ? badge.textContent.toLowerCase() : '';

        // Match against title, description, badge, and term
        const matches = title.includes(q) || desc.includes(q) || badgeText.includes(q) || card.textContent.toLowerCase().includes(q);
        if (matches) {
          card.classList.remove('hidden');
          visibleCount++;
          anyMatch = true;
        } else {
          card.classList.add('hidden');
        }
      });

      // Hide pane if it has no visible cards
      if (visibleCount === 0) {
        pane.classList.add('hidden');
      } else {
        pane.classList.remove('hidden');
      }
    });

    // Show a no-results message inside projects section if nothing matched
    const projectsSection = document.getElementById('projects');
    if (!projectsSection) return;
    let noResults = projectsSection.querySelector('#projectSearchNoResults');
    if (!anyMatch) {
      if (!noResults) {
        noResults = document.createElement('div');
        noResults.id = 'projectSearchNoResults';
        noResults.className = 'mt-6 p-6 rounded-lg bg-hover text-text2 text-center';
        noResults.textContent = `No projects found for "${term}".`;
        projectsSection.appendChild(noResults);
      } else {
        noResults.textContent = `No projects found for "${term}".`;
        noResults.classList.remove('hidden');
      }
    } else if (noResults) {
      noResults.classList.add('hidden');
    }
  }

  // Render static suggestions (used when input is empty)
  function renderStaticSuggestions() {
    suggestionsEl.innerHTML = '';
    keywords.forEach((k) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = k;
      btn.className = 'px-3 py-1.5 mr-2 mb-2 rounded-full border border-border text-sm text-text2 hover:border-primary hover:text-primary transition-colors';
      btn.addEventListener('click', () => handleSelect(k));
      suggestionsEl.appendChild(btn);
    });
  }

  // Render dynamic suggestions based on the query: sections + projects
  function renderSuggestionsForQuery(q) {
    const query = q.trim().toLowerCase();
    suggestionsEl.innerHTML = '';
    if (!query) {
      renderStaticSuggestions();
      return;
    }

    const max = 8;
    const items = [];

    // Section suggestions (match keywords)
    keywords.forEach((k) => {
      if (k.toLowerCase().includes(query)) items.push({ kind: 'section', label: k, value: k });
    });

    // Project suggestions (match projectGalleries)
    if (typeof projectGalleries === 'object') {
      for (const [id, g] of Object.entries(projectGalleries)) {
        const title = (g.title || '').toLowerCase();
        const subtitle = (g.subtitle || '').toLowerCase();
        const desc = (g.description || '').toLowerCase();
        if (title.includes(query) || subtitle.includes(query) || desc.includes(query) || id.includes(query)) {
          items.push({ kind: 'project', id, label: g.title || id, subtitle: g.subtitle || '' });
        }
        if (items.length >= max) break;
      }
    }

    if (items.length === 0) {
      const none = document.createElement('div');
      none.className = 'text-sm text-text2';
      none.textContent = 'No suggestions';
      suggestionsEl.appendChild(none);
      return;
    }

    items.slice(0, max).forEach((it) => {
      if (it.kind === 'section') {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = it.label;
        btn.className = 'px-3 py-1.5 mr-2 mb-2 rounded-full border border-border text-sm text-text2 hover:border-primary hover:text-primary transition-colors';
        btn.addEventListener('click', () => handleSelect(it.value));
        suggestionsEl.appendChild(btn);
      } else if (it.kind === 'project') {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'flex items-start gap-3 p-2 mb-2 w-full rounded-lg hover:bg-hover';
        const thumb = document.createElement('img');
        thumb.src = projectGalleries[it.id].thumbnail || '';
        thumb.alt = it.label;
        thumb.className = 'w-10 h-10 object-cover rounded';
        const wrap = document.createElement('div');
        wrap.style.textAlign = 'left';
        const t = document.createElement('div');
        t.className = 'text-sm font-medium text-text';
        t.textContent = it.label;
        const s = document.createElement('div');
        s.className = 'text-xs text-text2';
        s.textContent = it.subtitle;
        wrap.appendChild(t);
        wrap.appendChild(s);
        item.appendChild(thumb);
        item.appendChild(wrap);
        item.addEventListener('click', () => {
          closeModal();
          setTimeout(() => openProjectGallery(it.id), 120);
        });
        suggestionsEl.appendChild(item);
      }
    });
  }

  // Initialize suggestions container
  if (suggestionsEl && !suggestionsEl.dataset.init) {
    renderStaticSuggestions();
    suggestionsEl.dataset.init = '1';
  }

  // Live update suggestions while typing
  input.addEventListener('input', (e) => {
    const v = e.target.value || '';
    renderSuggestionsForQuery(v);
  });

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

function wireCertificateClicks() {
  // Delegate clicks for any element that has data-cert-src
  document.addEventListener('click', (e) => {
    const el = e.target instanceof Element ? e.target.closest('[data-cert-src]') : null;
    if (!el) return;
    const src = el.getAttribute('data-cert-src');
    if (!src) return;
    // Prevent default link behaviour if inside an anchor
    e.preventDefault();
    // Use global showImageModal if available
    if (typeof window.showImageModal === 'function') {
      window.showImageModal(src);
    } else {
      // Fallback: open image in new tab
      window.open(src, '_blank');
    }
  });
}

function wireBioToggle() {
  const btn = document.getElementById('bio-toggle');
  const bio = document.getElementById('bio');
  if (!btn || !bio) return;
  btn.addEventListener('click', () => {
    const isCollapsed = bio.classList.contains('collapsed');
    bio.classList.toggle('collapsed', !isCollapsed);
    bio.classList.toggle('expanded', isCollapsed);
    btn.textContent = isCollapsed ? 'Show less' : 'Read more';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.initToggle) window.initToggle();
  if (window.initBanner) window.initBanner();
  if (window.initMetrics) window.initMetrics();

  wireSidebarNav();
  wireSearchModal();
  wireProjectsUI();
  wireCertificateClicks();
  initScrollSpy();

  // Wire bio read-more toggle if present
  if (typeof wireBioToggle === 'function') wireBioToggle();

  // Handle initial hash
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    setTimeout(() => scrollToSection(hash, false), 100);
  } else {
    // Default to about section
    setTimeout(() => scrollToSection('about', false), 100);
  }
});

// Floating downloads visibility: hide while scrolling, show when idle
document.addEventListener('DOMContentLoaded', function floatingDownloads() {
  const container = document.getElementById('floating-downloads');
  if (!container) return;
  let timeout = null;
  // ensure visible initially
  container.classList.remove('hidden');
  window.addEventListener('scroll', () => {
    container.classList.add('hidden');
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      container.classList.remove('hidden');
    }, 600);
  }, { passive: true });
});

// Project Gallery functionality
// Each project has its own folder: assets/images/projects/{project-id}/
// Place all gallery images for each project in their respective folders
const projectGalleries = {
  'wod': {
    title: 'World of Dungeon',
    subtitle: 'Unity • RPG Project',
    type: 'Game',
    status: 'ongoing',
    description: 'An RPG project for our software development track featuring dungeon exploration, character progression, and engaging gameplay mechanics.',
    strengths: 'Has executable file and working game mechanics',
    needsImprovement: 'Game mechanics and logic need adjustments',
    thumbnail: 'assets/images/WOD.png',
    images: [
      'assets/images/projects/wod/Screenshot 2026-01-09 012715.png',
      'assets/images/projects/wod/Screenshot 2026-01-09 012726.png',
      'assets/images/projects/wod/Screenshot 2026-01-09 012745.png',
      'assets/images/projects/wod/Screenshot 2026-01-09 012811.png',
      'assets/images/projects/wod/Screenshot 2026-01-09 012903.png',
      'assets/images/projects/wod/Screenshot 2026-01-09 012913.png',
      'assets/images/projects/wod/Screenshot 2026-01-09 012925.png',
      'assets/images/projects/wod/Screenshot 2026-01-09 012939.png',
      'assets/images/projects/wod/Screenshot 2026-01-09 012946.png',
      'assets/images/projects/wod/Screenshot 2026-01-09 013044.png',
      'assets/images/projects/wod/Screenshot 2026-01-09 013055.png',
      'assets/images/projects/wod/Screenshot 2026-01-09 013115.png',
      'assets/images/projects/wod/WODS.png'
    ]
  },
  'typing-warriors': {
    title: 'Typing Warriors',
    subtitle: 'Pygame • Educational Game',
    type: 'Game',
    status: 'ongoing',
    description: 'An educational game project for software development track that combines typing skills with engaging gameplay.',
    strengths: 'Almost complete and fully working',
    needsImprovement: 'Character game selection layout design needs adjustment',
    thumbnail: 'assets/images/PW.png',
    images: [
      'assets/images/projects/typing-warriors/Screenshot 2026-01-09 005508.png',
      'assets/images/projects/typing-warriors/Screenshot 2026-01-09 005517.png',
      'assets/images/projects/typing-warriors/Screenshot 2026-01-09 005525.png',
      'assets/images/projects/typing-warriors/Screenshot 2026-01-09 010357.png',
      'assets/images/projects/typing-warriors/Screenshot 2026-01-09 010418.png',
      'assets/images/projects/typing-warriors/Screenshot 2026-01-09 010505.png',
      'assets/images/projects/typing-warriors/Screenshot 2026-01-09 010521.png',
      'assets/images/projects/typing-warriors/Screenshot 2026-01-09 010537.png',
      'assets/images/projects/typing-warriors/Screenshot 2026-01-09 010552.png',
      'assets/images/projects/typing-warriors/Screenshot 2026-01-09 010608.png',
      'assets/images/projects/typing-warriors/Screenshot 2026-01-09 010628.png',
      'assets/images/projects/typing-warriors/Screenshot 2026-01-09 010639.png',
      'assets/images/projects/typing-warriors/Screenshot 2026-01-09 010847.png',
      'assets/images/projects/typing-warriors/Screenshot 2026-01-09 010906.png'
    ]
  },
  'essu-igp': {
    title: 'ESSU IGP',
    subtitle: 'School E-commerce Website',
    type: 'Web/App',
    status: 'finished',
    description: 'A comprehensive school e-commerce website with full database integration and admin control panel.',
    strengths: 'Working fully with database and admin control',
    needsImprovement: 'Backend frameworks and API need to use Laravel for better code organization and file structure',
    thumbnail: 'assets/images/IGP.png',
    images: [
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001152.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001212.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001227.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001237.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001309.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001322.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001340.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001409.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001420.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001434.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001443.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001457.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001508.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001517.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001545.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001658.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001711.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001722.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001729.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001736.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001743.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001751.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001759.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001807.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 001813.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 002056.png',
      'assets/images/projects/essu-igp/Screenshot 2026-01-09 002104.png'
    ]
  },
  'lakwatsa': {
    title: 'Lakwatsa',
    subtitle: 'Booking Website',
    type: 'Web/App',
    status: 'finished',
    description: 'A booking website platform for travel and accommodation reservations with database integration.',
    strengths: 'Working well with database',
    needsImprovement: 'Backend frameworks and API need to use Laravel for better code organization and file structure',
    thumbnail: 'assets/images/Lak.png',
    images: [
      'assets/images/projects/lakwatsa/Screenshot 2026-01-09 002204.png',
      'assets/images/projects/lakwatsa/Screenshot 2026-01-09 002212.png',
      'assets/images/projects/lakwatsa/Screenshot 2026-01-09 002220.png',
      'assets/images/projects/lakwatsa/Screenshot 2026-01-09 002226.png',
      'assets/images/projects/lakwatsa/Screenshot 2026-01-09 002235.png',
      'assets/images/projects/lakwatsa/Screenshot 2026-01-09 002246.png',
      'assets/images/projects/lakwatsa/Screenshot 2026-01-09 002253.png',
      'assets/images/projects/lakwatsa/Screenshot 2026-01-09 002259.png',
      'assets/images/projects/lakwatsa/Screenshot 2026-01-09 002306.png',
      'assets/images/projects/lakwatsa/Screenshot 2026-01-09 002316.png'
    ]
  },
  'essu-digital-archive': {
    title: 'ESSU Digital Archive',
    subtitle: 'School Digital Archive System',
    type: 'Web/App',
    status: 'finished',
    description: 'A software storage system for the school where students/instructors can deposit their work like thesis/projects and manage softcopy papers.',
    strengths: 'Working fully with database and admin control',
    needsImprovement: 'Backend frameworks and API need to use Laravel for better code organization and file structure',
    thumbnail: 'assets/images/EDA.png',
    images: [
      'assets/images/projects/essu-digital-archive/Screenshot 2026-01-09 002525.png',
      'assets/images/projects/essu-digital-archive/Screenshot 2026-01-09 002538.png',
      'assets/images/projects/essu-digital-archive/Screenshot 2026-01-09 002548.png',
      'assets/images/projects/essu-digital-archive/Screenshot 2026-01-09 002606.png',
      'assets/images/projects/essu-digital-archive/Screenshot 2026-01-09 002632.png',
      'assets/images/projects/essu-digital-archive/Screenshot 2026-01-09 002653.png',
      'assets/images/projects/essu-digital-archive/Screenshot 2026-01-09 002700.png',
      'assets/images/projects/essu-digital-archive/Screenshot 2026-01-09 002709.png',
      'assets/images/projects/essu-digital-archive/Screenshot 2026-01-09 002721.png',
      'assets/images/projects/essu-digital-archive/Screenshot 2026-01-09 002727.png',
      'assets/images/projects/essu-digital-archive/Screenshot 2026-01-09 002733.png',
      'assets/images/projects/essu-digital-archive/Screenshot 2026-01-09 002745.png'
    ]
  },
  'portfolio': {
    title: 'Personal Portfolio',
    subtitle: 'Portfolio Website',
    type: 'Web/App',
    status: 'finished',
    description: 'A responsive portfolio website showcasing projects, skills, and achievements with smooth navigation and modern design.',
    statusNote: 'Finished but needs to be updated yearly (monthly or whenever new credentials are added)',
    thumbnail: 'assets/images/banner.jpg',
    images: []
  },
  'midman-ai': {
    title: 'Midman AI',
    subtitle: 'AI Middle Man • Trading Platform',
    type: 'AI Dev',
    status: 'ongoing',
    description: 'An AI-powered trading platform that acts as a middleman between buyers and sellers, processing conditions and data automatically instead of hiring a human middleman.',
    statusNote: 'Ongoing - Currently working on frontend. Design completed on Figma, starting code implementation using React/TypeScript',
    thumbnail: 'assets/images/Mid.png',
    images: [
      'assets/images/projects/midman-ai/Screenshot 2026-01-09 003034.png',
      'assets/images/projects/midman-ai/Screenshot 2026-01-09 003041.png',
      'assets/images/projects/midman-ai/Screenshot 2026-01-09 003056.png'
    ]
  },
  'woogle': {
    title: 'Woogle',
    subtitle: 'Search Engine • AI Challenge',
    type: 'AI Dev',
    status: 'ongoing',
    description: 'A search engine project built as a challenge with an in-game friend. Features working search functionality with a dataset of around 1 million news articles (2011-2021).',
    statusNote: 'Not finished - Built as a challenge project but working with datasets of around 1 million news articles (2011-2021)',
    thumbnail: 'assets/images/woogle.png',
    images: []
  }
};

function openProjectGallery(projectId) {
  const gallery = projectGalleries[projectId];
  if (!gallery) {
    console.warn(`Gallery not found for project: ${projectId}`);
    return;
  }

  const modal = document.getElementById('projectGalleryModal');
  const title = document.getElementById('galleryTitle');
  const projectInfo = document.getElementById('projectInfo');
  const content = document.getElementById('galleryContent');

  if (!modal || !title || !projectInfo || !content) return;

  title.textContent = gallery.title;
  
  // Build project information HTML
  const badgeClass = gallery.status === 'finished' ? 'badge-finished' : 'badge-ongoing';
  let infoHTML = `
    <div class="bg-hover rounded-xl p-6 border border-border">
      <div class="flex flex-col md:flex-row gap-6">
        <div class="flex-shrink-0">
          <img src="${gallery.thumbnail}" alt="${gallery.title}" class="w-full md:w-64 h-48 object-cover rounded-lg" />
        </div>
        <div class="flex-1">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="text-2xl font-bold mb-1">${gallery.title}</h3>
              <p class="text-sm text-text2">${gallery.subtitle}</p>
            </div>
            <span class="project-badge ${badgeClass}">${gallery.type}</span>
          </div>
          <p class="text-sm text-text2 mb-4 leading-relaxed">${gallery.description}</p>
  `;

  if (gallery.statusNote) {
    infoHTML += `
          <div class="mb-4">
            <span class="font-semibold text-blue-600 text-sm">📊 Status:</span>
            <p class="text-sm text-text2 mt-1">${gallery.statusNote}</p>
          </div>
    `;
  } else if (gallery.strengths || gallery.needsImprovement) {
    infoHTML += '<div class="space-y-3 text-sm">';
    if (gallery.strengths) {
      infoHTML += `
        <div>
          <span class="font-semibold text-green-600">✓ Strengths:</span>
          <p class="text-text2 mt-1">${gallery.strengths}</p>
        </div>
      `;
    }
    if (gallery.needsImprovement) {
      infoHTML += `
        <div>
          <span class="font-semibold text-orange-600">⚠ Needs Improvement:</span>
          <p class="text-text2 mt-1">${gallery.needsImprovement}</p>
        </div>
      `;
    }
    infoHTML += '</div>';
  }

  infoHTML += `
        </div>
      </div>
    </div>
  `;

  projectInfo.innerHTML = infoHTML;
  
  // Only display images if they exist
  if (gallery.images && gallery.images.length > 0) {
    // expose current gallery images for the global image modal
    try { window._currentGalleryImages = gallery.images.slice(); } catch (e) { window._currentGalleryImages = gallery.images; }
    content.innerHTML = gallery.images.map((img, idx) => `
      <div class="aspect-video rounded-lg overflow-hidden cursor-pointer group" onclick="showImageModal('${img}')">
        <img src="${img}" alt="Gallery image ${idx + 1}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
    `).join('');
  } else {
    content.innerHTML = `
      <div class="col-span-full text-center py-12 text-text2">
        <i class="ph ph-images text-4xl mb-3 opacity-50"></i>
        <p>No gallery images available yet.</p>
        <p class="text-xs mt-2">Add images to <code class="bg-hover px-2 py-1 rounded">assets/images/projects/${projectId}/</code></p>
      </div>
    `;
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeProjectGallery() {
  const modal = document.getElementById('projectGalleryModal');
  if (!modal) return;

  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = '';
}

// Make functions globally available
window.openProjectGallery = openProjectGallery;
window.closeProjectGallery = closeProjectGallery;
