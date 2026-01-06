// app.js
// Bootstraps page behaviors and loads section pages dynamically.

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

async function loadPage(page) {
  const container = document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = '<p class="text-text2 py-4">Loading...</p>';

  try {
    const res = await fetch('pages/' + page + '.html');
    if (!res.ok) throw new Error('Failed to load: ' + page);
    const html = await res.text();
    container.innerHTML = html;

    if (window.initBanner) window.initBanner();
    if (window.initMetrics) window.initMetrics(container);
    wireProjectsUI(container);
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p class="text-red-500 py-4">Failed to load this section.</p>';
  }
}

function wireSidebarNav() {
  const items = document.querySelectorAll('#sidebar .nav-item[data-page]');
  if (!items.length) return;

  items.forEach((item) => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      if (!page) return;

      items.forEach((el) => el.classList.remove('active'));
      item.classList.add('active');

      loadPage(page);
      if (window.innerWidth < 1024) {
        document.body.classList.remove('collapsed');
      }
      if (history && history.replaceState) {
        history.replaceState(null, '', '#' + page);
      }
    });
  });
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
    'Projects',
    'Skills',
    'Eligibility',
    'Games',
    'Web Apps',
    'AI Projects',
    'Contact',
    'Resume',
    'Portfolio'
  ];

  const pageMap = {
    about: 'about',
    projects: 'projects',
    skills: 'skills',
    eligibility: 'eligibility',
    games: 'games',
    'web apps': 'web-apps',
    'ai projects': 'ai-projects'
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
    input.value = term;
    const key = term.toLowerCase();
    const page = pageMap[key];
    if (page) {
      const targetItem = document.querySelector('#sidebar .nav-item[data-page="' + page + '"]');
      document.querySelectorAll('#sidebar .nav-item[data-page]').forEach((el) => {
        el.classList.toggle('active', el === targetItem);
      });
      loadPage(page);
    }
    closeModal();
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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.initToggle) window.initToggle();

  wireSidebarNav();
  wireSearchModal();

  const hash = window.location.hash.replace('#', '');
  const initialPage = hash || 'about';

  const targetItem = document.querySelector(
    '#sidebar .nav-item[data-page="' + initialPage + '"]'
  );
  document.querySelectorAll('#sidebar .nav-item[data-page]').forEach((el) => {
    el.classList.toggle('active', el === targetItem);
  });

  loadPage(initialPage);
});


