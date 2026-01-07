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

// Project Gallery functionality
// Each project has its own folder: assets/images/projects/{project-id}/
// Place all gallery images for each project in their respective folders
const projectGalleries = {
  'wod': {
    title: 'World of Dungeon - Gallery',
    images: [
      // Add your gallery images here, e.g.:
      // 'assets/images/projects/wod/image1.jpg',
      // 'assets/images/projects/wod/image2.jpg',
      // 'assets/images/projects/wod/image3.jpg'
    ]
  },
  'typing-warriors': {
    title: 'Typing Warriors - Gallery',
    images: [
      // Add your gallery images here, e.g.:
      // 'assets/images/projects/typing-warriors/image1.jpg',
      // 'assets/images/projects/typing-warriors/image2.jpg'
    ]
  },
  'essu-igp': {
    title: 'ESSU IGP - Gallery',
    images: [
      // Add your gallery images here, e.g.:
      // 'assets/images/projects/essu-igp/image1.jpg',
      // 'assets/images/projects/essu-igp/image2.jpg'
    ]
  },
  'lakwatsa': {
    title: 'Lakwatsa - Gallery',
    images: [
      // Add your gallery images here, e.g.:
      // 'assets/images/projects/lakwatsa/image1.jpg',
      // 'assets/images/projects/lakwatsa/image2.jpg'
    ]
  },
  'essu-digital-archive': {
    title: 'ESSU Digital Archive - Gallery',
    images: [
      // Add your gallery images here, e.g.:
      // 'assets/images/projects/essu-digital-archive/image1.jpg',
      // 'assets/images/projects/essu-digital-archive/image2.jpg'
    ]
  },
  'portfolio': {
    title: 'Personal Portfolio - Gallery',
    images: [
      // Add your gallery images here, e.g.:
      // 'assets/images/projects/portfolio/image1.jpg',
      // 'assets/images/projects/portfolio/image2.jpg'
    ]
  },
  'midman-ai': {
    title: 'Midman AI - Gallery',
    images: [
      // Add your gallery images here, e.g.:
      // 'assets/images/projects/midman-ai/image1.jpg',
      // 'assets/images/projects/midman-ai/image2.jpg'
    ]
  },
  'woogle': {
    title: 'Woogle Search Engine - Gallery',
    images: [
      // Add your gallery images here, e.g.:
      // 'assets/images/projects/woogle/image1.jpg',
      // 'assets/images/projects/woogle/image2.jpg'
    ]
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
  const content = document.getElementById('galleryContent');

  if (!modal || !title || !content) return;

  title.textContent = gallery.title;
  
  // Only display images if they exist
  if (gallery.images && gallery.images.length > 0) {
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
